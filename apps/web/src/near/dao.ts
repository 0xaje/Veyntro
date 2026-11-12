import { RPC_URL } from "./rpc";
export { amountToYocto } from "./amount";

export interface DaoRole {
  name: string;
  kind: "Everyone" | { Group: string[] };
  permissions: string[];
}

export interface DaoPolicy {
  roles: DaoRole[];
  proposal_bond: string;
  proposal_period: string;
  bounty_bond: string;
  bounty_forgiveness_period: string;
}

export interface DaoProposal {
  id: number;
  proposer: string;
  description: string;
  kind: Record<string, unknown>;
  status: "InProgress" | "Approved" | "Rejected" | "Failed" | "Removed" | "Expired";
  vote_counts: Record<string, [number, number, number]>;
  votes: Record<string, "Approve" | "Reject" | "Remove">;
  submission_time: string;
}

export interface DaoSnapshot {
  accountId: string;
  policy: DaoPolicy;
  proposals: DaoProposal[];
  featuredRejection?: DaoProposal;
  blockHash: string;
  blockHeight: number;
}

interface RpcResponse {
  result?: { result?: number[]; block_hash?: string; block_height?: number };
  error?: { name?: string; cause?: { name?: string; info?: Record<string, unknown> }; data?: string };
}

async function callDaoView<T>(accountId: string, method: string, args: Record<string, unknown>, blockHash?: string): Promise<{ value: T; blockHash: string; blockHeight: number }> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(RPC_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `veyntro-dao-${method}`,
        method: "query",
        params: {
          request_type: "call_function",
          ...(blockHash ? { block_id: blockHash } : { finality: "final" }),
          account_id: accountId,
          method_name: method,
          args_base64: btoa(JSON.stringify(args)),
        },
      }),
    });
    if (!response.ok) throw new Error(`NEAR testnet RPC returned HTTP ${response.status}.`);
    const payload = (await response.json()) as RpcResponse;
    if (payload.error) {
      const reason = payload.error.data ?? payload.error.cause?.name ?? payload.error.name ?? "RPC error";
      throw new Error(`NEAR testnet could not read DAO ${method}: ${String(reason)}`);
    }
    const result = payload.result;
    if (!result || !Array.isArray(result.result)) throw new Error(`NEAR testnet returned no result for DAO ${method}.`);
    const text = new TextDecoder().decode(new Uint8Array(result.result));
    return {
      value: JSON.parse(text) as T,
      blockHash: result.block_hash ?? "",
      blockHeight: result.block_height ?? 0,
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function readDao(accountId: string): Promise<DaoSnapshot> {
  const policyRes = await callDaoView<DaoPolicy>(accountId, "get_policy", {});
  if (!policyRes.blockHash) throw new Error("NEAR testnet did not return a final DAO block.");
  const lastIdRes = await callDaoView<number>(accountId, "get_last_proposal_id", {}, policyRes.blockHash);
  if (!Number.isSafeInteger(lastIdRes.value) || lastIdRes.value < 0) throw new Error("The DAO returned an invalid proposal count.");
  const proposalsRes = await callDaoView<DaoProposal[]>(accountId, "get_proposals", {
    from_index: Math.max(0, lastIdRes.value - 50), limit: 50,
  }, policyRes.blockHash);
  if (proposalsRes.blockHash && proposalsRes.blockHash !== policyRes.blockHash) throw new Error("DAO reads returned different blocks. Refresh and try again.");
  if (!Array.isArray(proposalsRes.value)) throw new Error("The DAO returned an invalid proposal list.");
  // The deployed DAO returns only its newest page even when asked for 50.
  // Keep the verified overcommitment example visible without changing the live list.
  let featuredRejection: DaoProposal | undefined;
  if (accountId === "veyntro.sputnikv2.testnet" && !proposalsRes.value.some((proposal) => proposal.id === 4)) {
    try {
      const past = await callDaoView<DaoProposal>(accountId, "get_proposal", { id: 4 }, policyRes.blockHash);
      if (past.blockHash === policyRes.blockHash && past.value.id === 4 && past.value.status === "Failed") featuredRejection = past.value;
    } catch {
      // An unavailable past request must not prevent current governance reads.
    }
  }
  return {
    accountId,
    policy: policyRes.value,
    proposals: proposalsRes.value.reverse(),
    featuredRejection,
    blockHash: policyRes.blockHash,
    blockHeight: policyRes.blockHeight,
  };
}

export async function readDaoVoteTarget(accountId: string, id: number): Promise<{ policy: DaoPolicy; proposal: DaoProposal }> {
  if (!Number.isSafeInteger(id) || id < 0) throw new Error("The proposal number is not valid.");
  const policy = await callDaoView<DaoPolicy>(accountId, "get_policy", {});
  if (!policy.blockHash) throw new Error("NEAR testnet did not return a final DAO block.");
  const proposal = await callDaoView<DaoProposal>(accountId, "get_proposal", { id }, policy.blockHash);
  if (proposal.blockHash && proposal.blockHash !== policy.blockHash) throw new Error("DAO reads returned different blocks. Refresh and try again.");
  return { policy: policy.value, proposal: proposal.value };
}

export function accountCanUsePermission(policy: DaoPolicy, accountId: string, kind: string, action: string): boolean {
  for (const role of policy.roles) {
    let matchesRole = false;
    if (role.kind === "Everyone") {
      matchesRole = true;
    } else if (typeof role.kind === "object" && "Group" in role.kind) {
      matchesRole = role.kind.Group.includes(accountId);
    }
    if (matchesRole) {
      const hasPerm = role.permissions.some((p) => {
        if (p === "*:*" || p === `*:${action}` || p === `${kind}:*` || p === `${kind}:${action}`) return true;
        return false;
      });
      if (hasPerm) return true;
    }
  }
  return false;
}

export function proposalKindName(proposal: DaoProposal): string {
  if (typeof proposal.kind === "object" && proposal.kind !== null) {
    const keys = Object.keys(proposal.kind);
    if (keys.length > 0) return keys[0];
  }
  return "Unknown";
}

export function validateAccountId(accountId: string): boolean {
  return /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/.test(accountId) && accountId.length >= 2 && accountId.length <= 64;
}

export function encodeBase64Json(obj: unknown): string {
  return btoa(JSON.stringify(obj));
}

export function decodeFunctionResult(successValue?: string): string | null {
  if (!successValue) return null;
  try {
    const decoded = atob(successValue);
    const parsed = JSON.parse(decoded);
    return String(parsed);
  } catch {
    return null;
  }
}
