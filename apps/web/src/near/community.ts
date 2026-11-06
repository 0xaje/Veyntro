import { RPC_URL } from "./rpc";
import { validateAccountId } from "./dao";

export const DEFAULT_FIREWALL = import.meta.env.VITE_FIREWALL_CONTRACT_ID ?? "firewall-aje-veyntro.testnet";
export const DEFAULT_DAO = "veyntro.sputnikv2.testnet";

export function selectedFirewall(): string {
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
  const code = (result as unknown as { code_hash?: unknown }).code_hash;
  if (typeof code !== "string" || code === "11111111111111111111111111111111") {
    throw new Error(`${account} has no compatible contract.`);
  }
  return code;
}

async function view(account: string, method: string, blockHash: string): Promise<Record<string, unknown>> {
  const args = btoa("{}");
  const result = await rpc("query", {
    request_type: "call_function", account_id: account, method_name: method,
    args_base64: args, block_id: blockHash,
  });
  if (result.block_hash !== blockHash || !Array.isArray(result.result)) throw new Error("The contract returned an inconsistent block.");
  const value: unknown = JSON.parse(new TextDecoder().decode(new Uint8Array(result.result)));
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("The contract returned invalid information.");
  return value as Record<string, unknown>;
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
  if (await accountCode(firewall, blockHash) !== trustedFirewallCode) {
    throw new Error("This Firewall does not match the Veyntro contract on testnet.");
  }
  const state = await view(firewall, "get_treasury_state", blockHash);
  const dao = state.dao_account_id;
  const verifier = state.verifier_account_id;
  if (typeof dao !== "string" || !validateAccountId(dao) || !dao.endsWith(".testnet") ||
      typeof verifier !== "string" || !validateAccountId(verifier) || verifier === dao || verifier === firewall) {
    throw new Error("The Firewall has invalid DAO or work-check accounts.");
  }
  const trustedDaoCode = await accountCode(DEFAULT_DAO, blockHash);
  if (await accountCode(dao, blockHash) !== trustedDaoCode) throw new Error("This DAO does not match the tested SputnikDAO contract.");
  const policy = await view(dao, "get_policy", blockHash);
  if (!Array.isArray(policy.roles) || typeof policy.proposal_bond !== "string") {
    throw new Error("The DAO policy could not be read.");
  }
  return { dao, verifier };
}
