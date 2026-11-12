import { useState } from "react";
import { Action, FunctionCall } from "@near-js/transactions";
import { useWallet } from "./wallet/WalletProvider";
import { FIREWALL_CONTRACT_ID, EXPLORER_URL } from "./near/rpc";
import { digest, parseWorkPolicy, prepareWorkCheck, requireRecordedWork, type WorkPolicy, type CheckedRun, type WorkContext } from "./near/browser-evidence";
import { fetchWorkRun, readWorkContext } from "./near/work-check-rpc";

type Prepared = Awaited<ReturnType<typeof prepareWorkCheck>>;

export default function WorkCheckPanel({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const { account, selector } = useWallet();
  const [repository, setRepository] = useState("");
  const [commit, setCommit] = useState("");
  const [workflowId, setWorkflowId] = useState("");
  const [workflowPath, setWorkflowPath] = useState("");
  const [event, setEvent] = useState<"push" | "pull_request">("push");
  const [branch, setBranch] = useState("");
  const [commitmentId, setCommitmentId] = useState("");
  const [runId, setRunId] = useState("");
  const [code, setCode] = useState("");
  const [review, setReview] = useState<{ policy: WorkPolicy; run: CheckedRun; context: WorkContext; prepared: Prepared } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [tx, setTx] = useState("");

  function formPolicy(): WorkPolicy {
    return parseWorkPolicy({
      schema: "veyntro.github-ci.v1", network: "testnet", contract_account_id: FIREWALL_CONTRACT_ID,
      repository: repository.trim(), commit_sha: commit.trim().toLowerCase(),
      workflow_id: Number(workflowId), workflow_path: workflowPath.trim(), event,
      branch: branch.trim(), conclusion: "success", allow_forks: false, max_run_age_seconds: 604800,
    });
  }

  async function showCode() {
    setBusy(true); setMessage(""); setReview(null); setCode("");
    try { setCode(await digest(formPolicy())); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not calculate the work-check code."); }
    finally { setBusy(false); }
  }

  async function checkRun() {
    setBusy(true); setMessage(""); setReview(null); setTx("");
    try {
      if (!account || !selector) throw new Error("Connect your group's work-check wallet first.");
      const policy = formPolicy();
      const hash = await digest(policy);
      if (code !== hash) throw new Error("The work-check details changed. Show the code again before continuing.");
      const number = Number(runId);
      if (!/^\d+$/.test(runId) || !Number.isSafeInteger(number) || number < 1) throw new Error("Enter the GitHub run number.");
      const context = await readWorkContext(FIREWALL_CONTRACT_ID, commitmentId.trim());
      const run = await fetchWorkRun(policy, number);
      const prepared = await prepareWorkCheck(policy, run, context, account.accountId, BigInt(Date.now()) * 1_000_000n);
      setReview({ policy, run, context, prepared });
      setMessage("The GitHub run matches this commitment's approved work check. Review it before signing.");
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not check this GitHub run."); }
    finally { setBusy(false); }
  }

  async function signCheck() {
    if (!review) return;
    setBusy(true); setMessage(""); setTx("");
    try {
      if (!account || !selector || account.accountId !== review.context.treasury.verifier_account_id) {
        throw new Error("Connect the chosen work-check wallet and check this run again.");
      }
      if (await digest(formPolicy()) !== await digest(review.policy) ||
          Number(runId) !== review.run.run_id || commitmentId.trim() !== review.prepared.args.id) {
        throw new Error("The form changed. Check the GitHub run again before signing.");
      }
      const [fresh, freshRun] = await Promise.all([
        readWorkContext(FIREWALL_CONTRACT_ID, review.prepared.args.id),
        fetchWorkRun(review.policy, review.run.run_id),
      ]);
      if (JSON.stringify(freshRun) !== JSON.stringify(review.run) ||
          fresh.treasury.verifier_epoch !== review.context.treasury.verifier_epoch ||
          JSON.stringify(fresh.commitment.evidence) !== JSON.stringify(review.context.commitment.evidence) ||
          fresh.commitment.status !== "Active" ||
          fresh.commitment.pending_amount !== "0" ||
          fresh.commitment.evidence_policy_hash !== review.prepared.args.policy_hash ||
          fresh.commitment.beneficiary !== review.context.commitment.beneficiary ||
          fresh.commitment.payout_recipient !== review.context.commitment.payout_recipient ||
          fresh.commitment.approved_amount !== review.context.commitment.approved_amount ||
          fresh.commitment.expires_at_ns !== review.context.commitment.expires_at_ns ||
          BigInt(review.prepared.args.valid_until_ns) <= BigInt(fresh.timestampNs) + 60_000_000_000n) {
        throw new Error("The work or commitment changed or is too close to expiry. Check it again.");
      }
      const wallet = await selector.wallet();
      const outcome = await wallet.signAndSendTransaction({
        signerId: account.accountId, receiverId: FIREWALL_CONTRACT_ID,
        actions: [new Action({ functionCall: new FunctionCall({
          methodName: "submit_attestation",
          args: new TextEncoder().encode(JSON.stringify(review.prepared.args)),
          gas: 30_000_000_000_000n, deposit: 0n,
        }) })],
      });
      if (!outcome?.transaction?.hash) throw new Error("The wallet did not return a final transaction. Check the commitment before trying again.");
      setTx(outcome.transaction.hash);
      if (typeof outcome.status === "object" && "Failure" in outcome.status ||
          outcome.receipts_outcome.some(row => typeof row.outcome.status === "object" && "Failure" in row.outcome.status)) {
        throw new Error("The work-check transaction failed. Review its testnet record.");
      }
      const final = await readWorkContext(FIREWALL_CONTRACT_ID, review.prepared.args.id);
      requireRecordedWork(final, review.prepared.args, String(review.context.treasury.verifier_epoch));
      setReview(null);
      setMessage("The work check was recorded on NEAR testnet. The person doing the work can now request an eligible payment.");
      await onRefresh().catch(() => undefined);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "The final work check could not be confirmed. Refresh before trying again."); }
    finally { setBusy(false); }
  }

  return <section className="work-check-section" aria-label="Check completed work">
    <h2>Agree on the work check</h2>
    <p>Choose one GitHub workflow and a full commit. Copy the code below into the DAO's “Set money aside” request. The DAO must approve that exact code before you can check the work.</p>
    <div className="work-check-form">
      <label>GitHub owner/repository<input value={repository} onChange={e => { setRepository(e.target.value); setReview(null); }} placeholder="group/project" /></label>
      <label>Full commit ID<input value={commit} onChange={e => { setCommit(e.target.value); setReview(null); }} placeholder="40 characters from GitHub" /></label>
      <label>Workflow number<input inputMode="numeric" value={workflowId} onChange={e => { setWorkflowId(e.target.value); setReview(null); }} placeholder="Number from GitHub" /></label>
      <label>Workflow file<input value={workflowPath} onChange={e => { setWorkflowPath(e.target.value); setReview(null); }} placeholder=".github/workflows/checks.yml" /></label>
      <label>GitHub event<select value={event} onChange={e => { setEvent(e.target.value as "push" | "pull_request"); setReview(null); }}><option value="push">Push</option><option value="pull_request">Pull request</option></select></label>
      <label>Branch<input value={branch} onChange={e => { setBranch(e.target.value); setReview(null); }} placeholder="main" /></label>
      <button type="button" disabled={busy} onClick={() => void showCode()}>Show work-check code</button>
    </div>
    {code && <p>DAO work-check code: <code className="work-check-code">{code}</code></p>}
    <h2>Check completed work</h2>
    <p>Only your group's chosen work-check wallet can sign this step. GitHub must report that the agreed run passed. Passing checks does not by itself prove the work was wanted or complete; your DAO decides that.</p>
    <div className="work-check-form">
      <label>Commitment number<input inputMode="numeric" value={commitmentId} onChange={e => { setCommitmentId(e.target.value); setReview(null); }} /></label>
      <label>GitHub run number<input inputMode="numeric" value={runId} onChange={e => { setRunId(e.target.value); setReview(null); }} /></label>
      <button type="button" disabled={busy || !code || !account} onClick={() => void checkRun()}>Check GitHub run</button>
    </div>
    {review && <div className="proposal-review">
      <p><strong>GitHub result:</strong> <a href={review.run.html_url} target="_blank" rel="noopener noreferrer">Passed run {review.run.run_id}</a></p>
      <p><strong>Commit:</strong> <code>{review.run.commit_sha}</code></p>
      <p><strong>Commitment:</strong> {review.prepared.args.id}. <strong>Work-check wallet:</strong> {account?.accountId}.</p>
      <p><strong>Work check valid until:</strong> {new Date(Number(BigInt(review.prepared.args.valid_until_ns) / 1_000_000n)).toLocaleString()}</p>
      <button type="button" disabled={busy} onClick={() => void signCheck()}>Record checked work in my wallet</button>
    </div>}
    {message && <p role="status">{message}</p>}
    {tx && <p><a href={`${EXPLORER_URL}/transactions/${encodeURIComponent(tx)}`} target="_blank" rel="noopener noreferrer">View work-check transaction</a></p>}
  </section>;
}
