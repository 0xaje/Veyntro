// The browser signs with the group's chosen NEAR verifier wallet. GitHub CI
// is a DAO-approved work condition, not a guarantee of the work's quality.
export interface WorkPolicy {
  schema: "veyntro.github-ci.v1";
  network: "testnet";
  contract_account_id: string;
  repository: string;
  commit_sha: string;
  workflow_id: number;
  workflow_path: string;
  event: "push" | "pull_request";
  branch: string;
  conclusion: "success";
  allow_forks: false;
  max_run_age_seconds: number;
}

export interface CheckedRun {
  run_id: number; run_attempt: number; repository_id: number; repository: string;
  commit_sha: string; workflow_id: number; workflow_path: string; event: string;
  branch: string; conclusion: "success"; created_at: string; updated_at: string;
  html_url: string; evidence_expires_at_ns: string;
}

export interface WorkContext {
  blockHash: string;
  timestampNs: string;
  contract: string;
  treasury: Record<string, unknown>;
  commitment: Record<string, unknown>;
}

function requireValue(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

function record(value: unknown): Record<string, unknown> {
  requireValue(value !== null && typeof value === "object" && !Array.isArray(value), "The work check returned invalid data.");
  return value as Record<string, unknown>;
}

function decimal(value: unknown): string {
  requireValue(typeof value === "string" && /^(0|[1-9][0-9]*)$/.test(value) &&
    BigInt(value) <= 18_446_744_073_709_551_615n, "An onchain number was not valid.");
  return value;
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const source = record(value);
    return `{${Object.keys(source).sort().map(key => `${JSON.stringify(key)}:${canonical(source[key])}`).join(",")}}`;
  }
  requireValue(value === null || ["string", "boolean"].includes(typeof value) ||
    typeof value === "number" && Number.isSafeInteger(value), "The work check contains an unsupported value.");
  return JSON.stringify(value);
}

export async function digest(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(canonical(value));
  const result = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return Array.from(result, byte => byte.toString(16).padStart(2, "0")).join("");
}

const POLICY_KEYS = ["schema", "network", "contract_account_id", "repository", "commit_sha",
  "workflow_id", "workflow_path", "event", "branch", "conclusion", "allow_forks", "max_run_age_seconds"].sort().join(",");

export function parseWorkPolicy(value: unknown): WorkPolicy {
  const p = record(value);
  requireValue(Object.keys(p).sort().join(",") === POLICY_KEYS, "Unsupported work-check fields.");
  requireValue(p.schema === "veyntro.github-ci.v1" && p.network === "testnet", "Unsupported work-check version or network.");
  requireValue(typeof p.contract_account_id === "string" && /^[a-z0-9_-]+(?:\.[a-z0-9_-]+)*\.testnet$/.test(p.contract_account_id), "Invalid Firewall account.");
  requireValue(typeof p.repository === "string" && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(p.repository), "Enter a GitHub owner/repository.");
  requireValue(typeof p.commit_sha === "string" && /^[0-9a-f]{40}$/.test(p.commit_sha) && !/^0+$/.test(p.commit_sha), "Enter the full GitHub commit SHA.");
  requireValue(Number.isSafeInteger(p.workflow_id) && Number(p.workflow_id) > 0, "Enter the numeric workflow ID.");
  requireValue(typeof p.workflow_path === "string" && /^\.github\/workflows\/[A-Za-z0-9_.-]+\.ya?ml$/.test(p.workflow_path), "Enter the workflow file path.");
  requireValue((p.event === "push" || p.event === "pull_request") && p.conclusion === "success" && p.allow_forks === false, "Unsupported GitHub rules.");
  requireValue(typeof p.branch === "string" && p.branch.length > 0 && p.branch.length <= 255, "Enter the expected branch.");
  requireValue(Number.isSafeInteger(p.max_run_age_seconds) && Number(p.max_run_age_seconds) > 0 && Number(p.max_run_age_seconds) <= 604_800, "Work checks must expire within seven days.");
  return p as unknown as WorkPolicy;
}

export function validateRun(policy: WorkPolicy, runId: number, value: unknown, nowNs: bigint): CheckedRun {
  const r = record(value), repo = record(r.repository), head = record(r.head_repository), commit = record(r.head_commit);
  requireValue(Number.isSafeInteger(runId) && runId > 0 && r.id === runId, "The GitHub run number does not match.");
  requireValue(repo.full_name === policy.repository && head.full_name === policy.repository &&
    repo.id === head.id && repo.fork === false && head.fork === false, "The repository or fork does not match the approved work.");
  requireValue(Number.isSafeInteger(repo.id) && Number(repo.id) > 0, "GitHub did not return a repository ID.");
  requireValue(r.head_sha === policy.commit_sha && commit.id === policy.commit_sha, "The commit does not match the approved work.");
  requireValue(r.workflow_id === policy.workflow_id && r.path === policy.workflow_path, "The GitHub workflow does not match.");
  requireValue(r.event === policy.event && r.head_branch === policy.branch, "The GitHub event or branch does not match.");
  requireValue(r.status === "completed" && r.conclusion === "success", "The GitHub checks have not passed.");
  requireValue(Number.isSafeInteger(r.run_attempt) && Number(r.run_attempt) > 0, "GitHub did not return a valid run attempt.");
  const url = `https://github.com/${policy.repository}/actions/runs/${runId}`;
  requireValue(r.html_url === url, "The GitHub run link does not match.");
  requireValue(typeof r.created_at === "string" && typeof r.updated_at === "string", "GitHub did not return the run times.");
  const createdMs = Date.parse(r.created_at), updatedMs = Date.parse(r.updated_at);
  requireValue(Number.isFinite(createdMs) && Number.isFinite(updatedMs) && updatedMs >= createdMs, "The GitHub run times are invalid.");
  const created = BigInt(createdMs) * 1_000_000n, updated = BigInt(updatedMs) * 1_000_000n;
  requireValue(created <= nowNs && updated <= nowNs, "The GitHub run time is in the future.");
  const expires = created + BigInt(policy.max_run_age_seconds) * 1_000_000_000n;
  requireValue(nowNs < expires, "The GitHub run is too old.");
  return { run_id: runId, run_attempt: Number(r.run_attempt), repository_id: Number(repo.id),
    repository: policy.repository, commit_sha: policy.commit_sha, workflow_id: policy.workflow_id,
    workflow_path: policy.workflow_path, event: policy.event, branch: policy.branch,
    conclusion: "success", created_at: r.created_at, updated_at: r.updated_at,
    html_url: url, evidence_expires_at_ns: expires.toString() };
}

export async function prepareWorkCheck(policy: WorkPolicy, run: CheckedRun, context: WorkContext, signer: string, nowNs: bigint) {
  const r = context.commitment, t = context.treasury, chainNow = BigInt(decimal(context.timestampNs));
  requireValue(chainNow <= nowNs + 60_000_000_000n && nowNs <= chainNow + 60_000_000_000n, "Your clock and testnet clock differ. Check your clock and try again.");
  requireValue(context.contract === policy.contract_account_id && signer === t.verifier_account_id, "This wallet is not the chosen work checker for this Firewall.");
  const hash = await digest(policy);
  requireValue(r.evidence_policy_hash === hash, "The work-check code does not match the DAO-approved commitment.");
  requireValue(r.status === "Active" && BigInt(decimal(r.expires_at_ns)) > nowNs && BigInt(decimal(r.expires_at_ns)) > chainNow, "This commitment is closed or expired.");
  requireValue(r.evidence === null && r.pending_amount === "0", "Evidence is already recorded or a payment is pending.");
  requireValue(run.commit_sha === policy.commit_sha && run.repository === policy.repository && run.workflow_id === policy.workflow_id, "The GitHub run does not match the approved policy.");
  const deadline = [BigInt(decimal(r.expires_at_ns)), BigInt(decimal(run.evidence_expires_at_ns)), nowNs + 1_800_000_000_000n].reduce((a, b) => a < b ? a : b);
  requireValue(deadline > nowNs + 60_000_000_000n && deadline > chainNow, "The work check expires too soon. Choose newer evidence.");
  const binding = {
    schema: "veyntro.attestation.v1", verifier_version: "0.1.0", network: policy.network,
    contract_account_id: policy.contract_account_id, reservation_id: decimal(r.id),
    beneficiary: r.beneficiary, payout_recipient: r.payout_recipient, approved_amount: r.approved_amount,
    commitment_expires_at_ns: r.expires_at_ns, policy_hash: hash, verifier_account_id: signer,
    verifier_epoch: decimal(t.verifier_epoch), nonce: "1", valid_until_ns: deadline.toString(), github: run,
  };
  const args = { id: binding.reservation_id, evidence_digest: await digest(binding), policy_hash: hash,
    commit_sha: policy.commit_sha, nonce: "1", valid_until_ns: binding.valid_until_ns };
  return { args, binding };
}

export function requireRecordedWork(context: WorkContext,
  args: { evidence_digest: string; commit_sha: string; nonce: string; valid_until_ns: string }, epoch: string): void {
  const evidence = record(context.commitment.evidence);
  requireValue(evidence.evidence_digest === args.evidence_digest && evidence.commit_sha === args.commit_sha &&
    evidence.nonce === args.nonce && evidence.valid_until_ns === args.valid_until_ns &&
    decimal(evidence.verifier_epoch) === epoch && evidence.usable === true,
  "The final work check is missing, changed, or no longer usable.");
}
