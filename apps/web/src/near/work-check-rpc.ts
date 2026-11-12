import { RPC_URL } from "./rpc";
import { validateRun, type WorkContext, type WorkPolicy, type CheckedRun } from "./browser-evidence";

async function rpc(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
  const response = await fetch(RPC_URL, {
    method: "POST", headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({ jsonrpc: "2.0", id: "veyntro-work-check", method, params }),
  });
  if (!response.ok) throw new Error(`NEAR testnet could not be reached (${response.status}).`);
  const payload = await response.json() as { result?: Record<string, unknown>; error?: unknown };
  if (payload.error || !payload.result) throw new Error("NEAR testnet could not check the commitment.");
  return payload.result;
}

async function view(account: string, method: string, args: Record<string, unknown>, blockHash: string): Promise<Record<string, unknown>> {
  const result = await rpc("query", {
    request_type: "call_function", account_id: account, method_name: method,
    args_base64: btoa(JSON.stringify(args)), block_id: blockHash,
  });
  if (result.block_hash !== blockHash || !Array.isArray(result.result) ||
      !result.result.every(byte => Number.isInteger(byte) && byte >= 0 && byte <= 255)) {
    throw new Error("The work check returned inconsistent testnet data.");
  }
  const parsed: unknown = JSON.parse(new TextDecoder().decode(new Uint8Array(result.result)));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The commitment or treasury could not be read.");
  }
  return parsed as Record<string, unknown>;
}

export async function readWorkContext(contract: string, id: string): Promise<WorkContext> {
  if (!/^(0|[1-9][0-9]*)$/.test(id)) throw new Error("Enter a valid commitment number.");
  const block = await rpc("block", { finality: "final" });
  const header = block.header as { hash?: unknown; timestamp_nanosec?: unknown } | undefined;
  if (typeof header?.hash !== "string" || typeof header.timestamp_nanosec !== "string") {
    throw new Error("No final NEAR testnet block was returned.");
  }
  const [treasury, commitment] = await Promise.all([
    view(contract, "get_treasury_state", {}, header.hash),
    view(contract, "get_reservation", { id }, header.hash),
  ]);
  if (commitment.id !== id) throw new Error("The commitment number does not match.");
  return { blockHash: header.hash, timestampNs: header.timestamp_nanosec,
    contract, treasury, commitment };
}

export async function fetchWorkRun(policy: WorkPolicy, runId: number): Promise<CheckedRun> {
  if (!Number.isSafeInteger(runId) || runId < 1) throw new Error("Enter a valid GitHub run number.");
  const repo = policy.repository.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`https://api.github.com/repos/${repo}/actions/runs/${runId}`, {
    headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2026-03-10" },
    signal: AbortSignal.timeout(20_000), redirect: "error", cache: "no-store",
  });
  if (!response.ok) throw new Error(`GitHub could not return that run (${response.status}). No work was approved.`);
  return validateRun(policy, runId, await response.json() as unknown, BigInt(Date.now()) * 1_000_000n);
}
