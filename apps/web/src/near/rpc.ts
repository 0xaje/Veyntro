export const NETWORK_ID = "testnet";
export const RPC_URL = import.meta.env.VITE_NEAR_RPC_URL ?? "https://test.rpc.fastnear.com";
import { selectedFirewall } from "./community";
export const FIREWALL_CONTRACT_ID = selectedFirewall();
export const EXPLORER_URL = "https://explorer.testnet.near.org";

export interface TreasuryState {
  dao_account_id: string;
  verifier_account_id: string;
  confirmed_accountable_funds: string;
  operating_reserve: string;
  configured_reserve: string;
  reservation_liabilities: string;
  pending_payouts: string;
  pending_withdrawals: string;
  money_available: string;
  actual_balance: string;
  ledger_solvent: boolean;
  physical_backing_check: boolean;
  next_reservation_id: string;
  next_operation_id: string;
  last_withdrawal_nonce: string;
}

export interface Reservation {
  id: string;
  beneficiary: string;
  payout_recipient: string;
  approved_amount: string;
  remaining_liability: string;
  pending_amount: string;
  expires_at_ns: string;
  evidence_policy_hash: string;
  evidence: { usable: boolean; commit_sha: string; valid_until_ns: string } | null;
  last_drawdown_nonce: string;
  status: "Active" | "Cancelled" | "Expired" | "Completed";
  is_expired: boolean;
}

export interface TreasurySnapshot {
  blockHash: string;
  blockHeight: number;
  state: TreasuryState;
  reservations: Reservation[];
  nextFromIndex: number;
}

interface RpcResponse {
  result?: { result?: number[]; block_hash?: string; block_height?: number };
  error?: { name?: string; cause?: { name?: string; info?: Record<string, unknown> }; data?: string };
}

function decodeResult<T>(value: unknown, method: string): T {
  if (typeof value !== "string") throw new Error(`The ${method} view returned an unexpected result.`);
  return JSON.parse(value) as T;
}

async function callView<T>(method: string, args: Record<string, unknown>, blockHash?: string): Promise<{ value: T; blockHash: string; blockHeight: number }> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(RPC_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `veyntro-${method}`,
        method: "query",
        params: {
          request_type: "call_function",
          ...(blockHash ? { block_id: blockHash } : { finality: "final" }),
          account_id: FIREWALL_CONTRACT_ID,
          method_name: method,
          args_base64: btoa(JSON.stringify(args)),
        },
      }),
    });
    if (!response.ok) throw new Error(`NEAR testnet RPC returned HTTP ${response.status}.`);
    const payload = (await response.json()) as RpcResponse;
    if (payload.error) {
      const reason = payload.error.data ?? payload.error.cause?.name ?? payload.error.name ?? "RPC error";
      throw new Error(`NEAR testnet could not read ${method}: ${String(reason)}`);
    }
    const result = payload.result;
    if (!result || !Array.isArray(result.result)) throw new Error(`NEAR testnet returned no final result for ${method}.`);
    const text = new TextDecoder().decode(new Uint8Array(result.result));
    return {
      value: decodeResult<T>(text, method),
      blockHash: result.block_hash ?? "",
      blockHeight: result.block_height ?? 0,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The testnet read took too long. Try again.");
    }
    if (error instanceof TypeError) throw new Error("Could not reach NEAR testnet. Check your connection and try again.");
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function isTreasuryState(value: unknown): value is TreasuryState {
  if (!value || typeof value !== "object") return false;
  const state = value as Record<string, unknown>;
  return [
    "confirmed_accountable_funds", "operating_reserve", "reservation_liabilities",
    "pending_payouts", "pending_withdrawals", "money_available", "actual_balance",
    "next_reservation_id", "next_operation_id",
  ].every((key) => typeof state[key] === "string") &&
    typeof state.ledger_solvent === "boolean" && typeof state.physical_backing_check === "boolean";
}

function isReservation(value: unknown): value is Reservation {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && typeof row.beneficiary === "string" &&
    typeof row.approved_amount === "string" && typeof row.remaining_liability === "string" &&
    typeof row.pending_amount === "string" && typeof row.expires_at_ns === "string" &&
    typeof row.status === "string" && typeof row.is_expired === "boolean" &&
    typeof row.last_drawdown_nonce === "string";
}

export async function readTreasury(): Promise<TreasurySnapshot> {
  const stateResult = await callView<unknown>("get_treasury_state", {});
  if (!isTreasuryState(stateResult.value)) throw new Error("The firewall returned incomplete treasury data.");
  if (!stateResult.blockHash) throw new Error("NEAR testnet did not return a final block for this treasury view.");
  const reservations = await readReservationPage(0, stateResult.blockHash);
  return {
    blockHash: stateResult.blockHash,
    blockHeight: stateResult.blockHeight,
    state: stateResult.value,
    reservations,
    nextFromIndex: 50,
  };
}

export async function readReservationPage(fromIndex: number, blockHash: string): Promise<Reservation[]> {
  const result = await callView<unknown>("list_reservations", { from_index: String(fromIndex), limit: 50 }, blockHash);
  if (result.blockHash && result.blockHash !== blockHash) throw new Error("NEAR testnet returned a different block. Refresh before loading more.");
  if (!Array.isArray(result.value) || !result.value.every(isReservation)) {
    throw new Error("The firewall returned an unexpected commitment list.");
  }
  return result.value;
}

export async function readReservation(id: string, blockHash: string): Promise<Reservation | null> {
  if (!/^\d+$/.test(id)) throw new Error("The commitment number is not valid.");
  const result = await callView<unknown>("get_reservation", { id }, blockHash);
  if (result.blockHash && result.blockHash !== blockHash) throw new Error("NEAR testnet returned a different block. Refresh and try again.");
  if (result.value === null) return null;
  if (!isReservation(result.value)) throw new Error("The firewall returned an unexpected commitment.");
  return result.value;
}

export function formatNear(yocto: string): string {
  if (!/^\d+$/.test(yocto)) throw new Error("NEAR amount is not a valid integer.");
  const amount = BigInt(yocto);
  const scale = 10n ** 24n;
  const whole = amount / scale;
  const fraction = (amount % scale).toString().padStart(24, "0").slice(0, 6).replace(/0+$/, "");
  const groupedWhole = whole.toLocaleString("en-US");
  if (amount > 0n && whole === 0n && !fraction) return "<0.000001";
  return fraction ? `${groupedWhole}.${fraction}` : groupedWhole;
}

export function formatDeadline(timestampNs: string): string {
  if (!/^\d+$/.test(timestampNs)) return "Date unavailable";
  const date = new Date(Number(BigInt(timestampNs) / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date) + " UTC";
}

export function explorerAccountUrl(accountId: string): string {
  return `${EXPLORER_URL}/accounts/${encodeURIComponent(accountId)}`;
}

export interface TreasuryOperation {
  id: string;
  kind: "Payout" | "Withdrawal";
  reservation_id: string | null;
  amount: string;
  recipient: string;
  status: "Pending" | "Succeeded" | "Failed";
  created_at_ns: string;
  completed_at_ns: string;
}

export interface OperationsPage {
  operations: TreasuryOperation[];
  nextFromIndex: string;
  blockHash: string;
}

export async function readOperationPage(fromIndex: string, blockHash: string): Promise<OperationsPage> {
  const count = 20;
  const currentMax = BigInt(fromIndex);
  if (currentMax === 0n) {
    return { operations: [], nextFromIndex: "0", blockHash };
  }

  const idsToFetch: string[] = [];
  const start = currentMax > BigInt(count) ? currentMax - BigInt(count) : 0n;
  for (let i = start; i < currentMax; i++) {
    idsToFetch.push(i.toString());
  }

  const results: (TreasuryOperation | null)[] = [];
  for (let offset = 0; offset < idsToFetch.length; offset += 4) {
    const batch = await Promise.all(idsToFetch.slice(offset, offset + 4).map(async (id) => {
      const res = await callView<TreasuryOperation | null>("get_operation", { id }, blockHash);
      if (res.blockHash && res.blockHash !== blockHash) throw new Error("NEAR testnet returned a different activity block. Refresh and try again.");
      if (res.value && (res.value.id !== id || !["Payout", "Withdrawal"].includes(res.value.kind) ||
        !["Pending", "Succeeded", "Failed"].includes(res.value.status))) {
        throw new Error("The firewall returned an unexpected payment record.");
      }
      return res.value;
    }));
    results.push(...batch);
  }
  const ops = results.filter((operation): operation is TreasuryOperation => operation !== null);

  return {
    operations: ops,
    nextFromIndex: start.toString(),
    blockHash,
  };
}
