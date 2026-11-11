import { RPC_URL } from "./rpc";
import { validateAccountId } from "./dao";

export const DEFAULT_FIREWALL = import.meta.env.VITE_FIREWALL_CONTRACT_ID ?? "firewall-aje-veyntro.testnet";
export const DEFAULT_DAO = "veyntro.sputnikv2.testnet";
// Pinned from the reviewed Contract checks build at commit 215fbd5. Keep
// these hashes in sync with the exact factory and child WASM deployed onchain.
export const SETUP_FACTORY = "setup.aje-veyntro.testnet";
const FACTORY_CODE_HASH = "GsfwHxUS54grQJtZpkdutNSp2g5jijcTGCGtqknP2qyy";
const FACTORY_FIREWALL_CODE_HASH = "L9h18N5bxszmvdNUoFxqyyYygYFxf11XaV5Lr5Tuwyb";

export function selectedFirewall(): string {
  // Setup signs against the trusted DAO factory. A link to /setup must never
  // let an unverified `firewall=` query set the wallet modal's contract.
  if (window.location.pathname === "/setup") return DEFAULT_FIREWALL;
  const requested = new URLSearchParams(window.location.search).get("firewall");
  return requested ?? DEFAULT_FIREWALL;
}

export function communityHref(path: string): string {
  const selected = selectedFirewall();
  if (selected === DEFAULT_FIREWALL) return path;
  const url = new URL(path, window.location.origin);
  url.searchParams.set("firewall", selected);
  return `${url.pathname}${url.search}${url.hash}`;
}

async function rpc(method: string, params: Record<string, unknown>): Promise<{ result: unknown; block_hash?: string }> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(RPC_URL, {
      method: "POST", headers: { "content-type": "application/json" }, signal: controller.signal,
      body: JSON.stringify({ jsonrpc: "2.0", id: "community-check", method, params }),
    });
    if (!response.ok) throw new Error("NEAR testnet could not be reached.");
    const payload = await response.json() as { result?: { result?: unknown; block_hash?: string }; error?: unknown };
    if (payload.error || !payload.result) throw new Error("This account could not be checked on NEAR testnet.");
    return payload.result as { result: unknown; block_hash?: string };
  } finally {
    window.clearTimeout(timeout);
  }
}

async function accountCode(account: string, blockHash: string): Promise<string> {
  const result = await rpc("query", { request_type: "view_account", account_id: account, block_id: blockHash });
  if (result.block_hash !== blockHash) throw new Error("The account check returned an inconsistent block.");
  const code = (result as unknown as { code_hash?: unknown }).code_hash;
  if (typeof code !== "string" || code === "11111111111111111111111111111111") {
    throw new Error(`${account} has no compatible contract.`);
  }
  return code;
}

export async function verifyDaoCode(dao: string): Promise<void> {
  if (!validateAccountId(dao) || !dao.endsWith(".sputnikv2.testnet")) {
    throw new Error("Enter a SputnikDAO testnet account.");
  }
  const block = await rpc("block", { finality: "final" });
  const hash = (block as unknown as { header?: { hash?: string } }).header?.hash;
  if (!hash) throw new Error("No final NEAR testnet block was returned.");
  if (await accountCode(dao, hash) !== await accountCode(DEFAULT_DAO, hash)) {
    throw new Error("This DAO does not match the tested SputnikDAO contract.");
  }
}

async function view(account: string, method: string, blockHash: string, args: Record<string, unknown> = {}): Promise<unknown> {
  const result = await rpc("query", {
    request_type: "call_function", account_id: account, method_name: method,
    args_base64: btoa(JSON.stringify(args)), block_id: blockHash,
  });
  if (result.block_hash !== blockHash || !Array.isArray(result.result)) throw new Error("The contract returned an inconsistent block.");
  return JSON.parse(new TextDecoder().decode(new Uint8Array(result.result))) as unknown;
}

export interface FactoryQuote {
  firewall: string;
  depositYocto: string;
  status: number | null;
}

// Read-only setup preview. No wallet action may use this quote until the
// factory's deployed code is checked against the reviewed CI build.
export async function readFactoryQuote(dao: string, operatingReserveYocto: string): Promise<FactoryQuote> {
  const slug = dao.endsWith(".sputnikv2.testnet") ? dao.slice(0, -".sputnikv2.testnet".length) : "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 28 ||
      !/^\d+$/.test(operatingReserveYocto)) {
    throw new Error("Enter a valid DAO name and reserve before checking setup.");
  }
  const block = await rpc("block", { finality: "final" });
  const blockHash = (block as unknown as { header?: { hash?: string } }).header?.hash;
  if (!blockHash) throw new Error("No final NEAR testnet block was returned.");
  if (await accountCode(SETUP_FACTORY, blockHash) !== FACTORY_CODE_HASH) {
    throw new Error("The setup service does not match the reviewed contract.");
  }
  const [firewall, deposit, status] = await Promise.all([
    view(SETUP_FACTORY, "firewall_for", blockHash, { dao }),
    view(SETUP_FACTORY, "required_deposit", blockHash, { operating_reserve: operatingReserveYocto }),
    view(SETUP_FACTORY, "get_status", blockHash, { dao }),
  ]);
  if (typeof firewall !== "string" || firewall !== `${slug}.${SETUP_FACTORY}` || typeof deposit !== "string" ||
      !/^\d+$/.test(deposit) || BigInt(deposit) < BigInt(operatingReserveYocto) ||
      (status !== null && (typeof status !== "number" || ![1, 2, 3, 4, 5].includes(status)))) {
    throw new Error("The setup service returned invalid information.");
  }
  return { firewall, depositYocto: deposit, status };
}

// Exact deployed WASM matches protect wallet writes from an untrusted account
// that merely imitates Veyntro's view method. This is testnet compatibility,
// not a claim that the contracts have received an external audit.
export async function verifyCommunity(firewall: string): Promise<{ dao: string; verifier: string }> {
  if (!validateAccountId(firewall) || !firewall.endsWith(".testnet")) throw new Error("Enter a valid NEAR testnet Firewall account.");
  const block = await rpc("block", { finality: "final" });
  const blockHash = (block as unknown as { header?: { hash?: string } }).header?.hash;
  if (!blockHash) throw new Error("No final NEAR testnet block was returned.");
  const trustedFirewallCode = await accountCode(DEFAULT_FIREWALL, blockHash);
  const code = await accountCode(firewall, blockHash);
  const factoryChild = code === FACTORY_FIREWALL_CODE_HASH && firewall.endsWith(`.${SETUP_FACTORY}`);
  if (code !== trustedFirewallCode && !factoryChild) {
    throw new Error("This Firewall does not match the Veyntro contract on testnet.");
  }
  const state = await view(firewall, "get_treasury_state", blockHash);
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw new Error("The Firewall returned invalid information.");
  }
  const treasury = state as Record<string, unknown>;
  const dao = treasury.dao_account_id;
  const verifier = treasury.verifier_account_id;
  if (typeof dao !== "string" || !validateAccountId(dao) || !dao.endsWith(".testnet") ||
      typeof verifier !== "string" || !validateAccountId(verifier) || verifier === dao || verifier === firewall) {
    throw new Error("The Firewall has invalid DAO or work-check accounts.");
  }
  if (treasury.ledger_solvent !== true || treasury.physical_backing_check !== true) {
    throw new Error("This Firewall did not pass its final treasury safety checks.");
  }
  if (factoryChild) {
    if (await accountCode(SETUP_FACTORY, blockHash) !== FACTORY_CODE_HASH ||
        await view(SETUP_FACTORY, "firewall_for", blockHash, { dao }) !== firewall ||
        await view(SETUP_FACTORY, "get_status", blockHash, { dao }) !== 2) {
      throw new Error("This group’s Firewall setup has not been confirmed by the reviewed factory.");
    }
  }
  const trustedDaoCode = await accountCode(DEFAULT_DAO, blockHash);
  if (await accountCode(dao, blockHash) !== trustedDaoCode) throw new Error("This DAO does not match the tested SputnikDAO contract.");
  const policy = await view(dao, "get_policy", blockHash);
  if (!policy || typeof policy !== "object" || Array.isArray(policy)) {
    throw new Error("The DAO policy could not be read.");
  }
  const daoPolicy = policy as Record<string, unknown>;
  if (!Array.isArray(daoPolicy.roles) || typeof daoPolicy.proposal_bond !== "string") {
    throw new Error("The DAO policy could not be read.");
  }
  return { dao, verifier };
}
