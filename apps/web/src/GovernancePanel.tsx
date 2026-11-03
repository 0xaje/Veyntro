import { useState } from "react";
import { Action, FunctionCall } from "@near-js/transactions";
import { FIREWALL_CONTRACT_ID, EXPLORER_URL, formatNear } from "./near/rpc";
import {
  accountCanUsePermission,
  amountToYocto,
  decodeFunctionResult,
  encodeBase64Json,
  proposalKindName,
  readDaoVoteTarget,
  validateAccountId,
  type DaoProposal,
  type DaoSnapshot,
} from "./near/dao";
import type { TreasurySnapshot } from "./near/rpc";
import { useWallet } from "./wallet/WalletProvider";

interface GovernancePanelProps {
  dao: DaoSnapshot | null;
  treasury: TreasurySnapshot | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
}

interface SentAction {
  transactionId: string;
  proposalId: string | null;
  hadFailedReceipt: boolean;
}

type RequestKind = "commitment" | "funding" | "withdrawal";

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    InProgress: "Waiting for votes",
    Approved: "Approved",
    Rejected: "Rejected",
    Failed: "Failed during execution",
    Removed: "Removed",
    Expired: "Expired",
  };
  return labels[status] ?? status;
}

function actionLabel(method: string | undefined): string {
  const labels: Record<string, string> = {
    fund_treasury: "Add money to Veyntro",
    create_reservation: "Set money aside",
    withdraw_available: "Withdraw available money",
    cancel_reservation: "Cancel commitment",
    set_verifier: "Change work checker",
  };
  return method ? labels[method] ?? "Other contract action" : "DAO request";
}

function hasFailedReceipt(outcome: { receipts_outcome: Array<{ outcome: { status: unknown } }> }): boolean {
  return outcome.receipts_outcome.some(({ outcome: receipt }) =>
    Boolean(receipt.status && typeof receipt.status === "object" && "Failure" in receipt.status),
  );
}

function ProposalRow({ proposal, daoPolicy, accountId, busy, onVote }: {
  proposal: DaoProposal;
  daoPolicy: DaoSnapshot["policy"];
  accountId: string | null;
  busy: boolean;
  onVote: (id: number, action: "VoteApprove" | "VoteReject") => void;
}) {
  const kind = proposalKindName(proposal);
  const functionCall = proposal.kind.FunctionCall as { receiver_id?: string; actions?: Array<{ method_name?: string; deposit?: string; gas?: string; args?: string }> } | undefined;
  const firstAction = functionCall?.actions?.[0]?.method_name;
  const fundingAction = functionCall?.receiver_id === FIREWALL_CONTRACT_ID && functionCall.actions?.length === 1 && firstAction === "fund_treasury"
    ? functionCall.actions?.[0] : null;
  const fundingAmount = fundingAction?.deposit && /^\d+$/.test(fundingAction.deposit)
    ? formatNear(fundingAction.deposit) : null;
  const alreadyVoted = Boolean(accountId && proposal.votes?.[accountId]);
  const canApprove = Boolean(accountId && accountCanUsePermission(daoPolicy, accountId, kind, "VoteApprove"));
  const canReject = Boolean(accountId && accountCanUsePermission(daoPolicy, accountId, kind, "VoteReject"));
  return (
    <article className="proposal-card">
      <div className="proposal-heading">
        <div>
          <h3>{proposal.description}</h3>
          <p className="record-label">Request {proposal.id}</p>
        </div>
        <span className={`status status-${proposal.status.toLowerCase()}`}>{statusLabel(proposal.status)}</span>
      </div>
      <p className="proposal-meta">Asked by {proposal.proposer}. {kind === "FunctionCall" ? actionLabel(firstAction) : "DAO policy change"}</p>
      {functionCall && (
        <div className="proposal-review">
          <p><strong>Contract:</strong> {functionCall.receiver_id ?? "Not shown"}</p>
          {fundingAmount && <p><strong>Money to add if approved:</strong> {fundingAmount} NEAR from the DAO</p>}
          <details>
            <summary>Review every contract action</summary>
            {functionCall.actions?.map((action, index) => (
              <div className="proposal-review-action" key={index}>
                <p><strong>Action {index + 1}:</strong> {action.method_name ?? "Unknown"}</p>
                <p><strong>NEAR sent by DAO:</strong> {action.deposit && /^\d+$/.test(action.deposit) ? formatNear(action.deposit) : "Unknown"} NEAR</p>
                <p><strong>Gas:</strong> {action.gas ?? "Unknown"}</p>
                <p><strong>Arguments:</strong> <code>{action.args ?? "None shown"}</code></p>
              </div>
            ))}
          </details>
        </div>
      )}
      {!functionCall && (
        <details className="proposal-review">
          <summary>Review the DAO change</summary>
          <pre><code>{JSON.stringify(proposal.kind, null, 2)}</code></pre>
        </details>
      )}
      {proposal.status === "InProgress" && (
        <div className="proposal-actions">
          {canApprove && !alreadyVoted && <button className="button-primary" disabled={busy} onClick={() => onVote(proposal.id, "VoteApprove")}>Approve</button>}
          {canReject && !alreadyVoted && <button className="button-secondary" disabled={busy} onClick={() => onVote(proposal.id, "VoteReject")}>Reject</button>}
          {alreadyVoted && <span className="proposal-meta">Your DAO account has already voted.</span>}
          {!canApprove && !canReject && !alreadyVoted && <span className="proposal-meta">This wallet cannot vote under the DAO’s current policy.</span>}
        </div>
      )}
    </article>
  );
}

export default function GovernancePanel({ dao, treasury, loading, error, onRefresh }: GovernancePanelProps) {
  const { account, selector } = useWallet();
  const [description, setDescription] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [policyHash, setPolicyHash] = useState("");
  const [requestKind, setRequestKind] = useState<RequestKind>("commitment");
  const [busy, setBusy] = useState(false);
  const [busyProposalId, setBusyProposalId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sentAction, setSentAction] = useState<SentAction | null>(null);
  const [failedReceipt, setFailedReceipt] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);

  const canAddProposal = Boolean(dao && account && accountCanUsePermission(dao.policy, account.accountId, "FunctionCall", "AddProposal"));
  async function sendDaoCall(methodName: string, args: Record<string, unknown>, depositYocto: string) {
    if (!selector || !account || !dao) throw new Error("Connect a NEAR testnet wallet first.");
    const wallet = await selector.wallet();
    const outcome = await wallet.signAndSendTransaction({
      signerId: account.accountId,
      receiverId: dao.accountId,
      actions: [new Action({ functionCall: new FunctionCall({
        methodName,
        args: new TextEncoder().encode(JSON.stringify(args)),
        gas: 80_000_000_000_000n,
        deposit: BigInt(depositYocto),
      }) })],
    });
    if (!outcome) throw new Error("The wallet returned no final result. Check the DAO before trying again.");
    const status = outcome.status;
    if (status && typeof status === "object" && "Failure" in status) {
      const failure = status.Failure;
      const message = failure && typeof failure === "object" && "error_message" in failure
        ? String(failure.error_message)
        : "The DAO transaction failed.";
      throw new Error(message);
    }
    const transactionId = outcome.transaction?.hash;
    if (typeof transactionId !== "string" || !transactionId) {
      throw new Error("The wallet returned no transaction ID. Check the DAO before trying again.");
    }
    return { outcome, transactionId, hadFailedReceipt: hasFailedReceipt(outcome) };
  }

  async function submitCommitment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    setSentAction(null);
    setFailedReceipt(false);
    setStatusChecked(false);
    if (!dao || !canAddProposal) {
      setActionError("This wallet cannot add proposals under the DAO’s current policy.");
      return;
    }
    if (description.trim().length < 6 || description.trim().length > 280) {
      setActionError("Enter a note with 6 to 280 characters.");
      return;
    }

    setBusy(true);
    try {
      const amountYocto = amountToYocto(amount);
      let methodName: string;
      let args: string;
      let actionDeposit = "0";
      let actionGas = "30000000000000";

      if (requestKind === "funding") {
        methodName = "fund_treasury";
        args = "e30=";
        actionDeposit = amountYocto;
      } else if (requestKind === "withdrawal") {
        if (!validateAccountId(recipient)) {
          throw new Error("Enter a valid NEAR account for the withdrawal.");
        }
        if (BigInt(amountYocto) > BigInt(treasury?.state.money_available ?? "0")) {
          throw new Error("The withdrawal cannot be more than the current money available. The contract checks again when approved.");
        }
        methodName = "withdraw_available";
        actionGas = "100000000000000";
        args = encodeBase64Json({
          amount: amountYocto,
          recipient,
          operation_nonce: (BigInt(treasury?.state.last_withdrawal_nonce ?? "0") + 1n).toString(),
        });
      } else {
        if (!validateAccountId(beneficiary) || !validateAccountId(recipient)) {
          throw new Error("Enter valid NEAR account IDs for the person doing the work and the payment account.");
        }
        if (!/^[0-9a-fA-F]{64}$/.test(policyHash) || /^0{64}$/.test(policyHash)) {
          throw new Error("Enter the 64-character work-check code approved for this work.");
        }
        const deadlineMs = new Date(deadline).getTime();
        if (!Number.isFinite(deadlineMs) || deadlineMs <= Date.now()) {
          throw new Error("Choose a deadline in the future.");
        }
        const terms = {
          beneficiary,
          payout_recipient: recipient,
          amount: amountYocto,
          expires_at_ns: (BigInt(deadlineMs) * 1_000_000n).toString(),
          evidence_policy_hash: policyHash.toLowerCase(),
        };
        methodName = "create_reservation";
        args = encodeBase64Json(terms);
      }
      const proposal = {
        description: description.trim(),
        kind: {
          FunctionCall: {
            receiver_id: FIREWALL_CONTRACT_ID,
            actions: [{
              method_name: methodName,
              args,
              deposit: actionDeposit,
              gas: actionGas,
            }],
          },
        },
      };
      const result = await sendDaoCall("add_proposal", { proposal }, dao.policy.proposal_bond);
      const proposalId = decodeFunctionResult(result.outcome.status && typeof result.outcome.status === "object" ? result.outcome.status.SuccessValue : undefined);
      setSentAction({ transactionId: result.transactionId, proposalId, hadFailedReceipt: result.hadFailedReceipt });
      setFailedReceipt(result.hadFailedReceipt);
      await onRefresh();
      setStatusChecked(true);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "The proposal could not be sent.");
    } finally {
      setBusy(false);
    }
  }

  async function vote(proposalId: number, action: "VoteApprove" | "VoteReject") {
    setActionError(null);
    setSentAction(null);
    setFailedReceipt(false);
    setStatusChecked(false);
    setBusyProposalId(proposalId);
    try {
      if (!dao || !account) throw new Error("Connect a NEAR testnet wallet and refresh the DAO first.");
      const displayed = dao.proposals.find((proposal) => proposal.id === proposalId);
      if (!displayed) throw new Error("This proposal is no longer in the list. Refresh before voting.");
      const latest = await readDaoVoteTarget(dao.accountId, proposalId);
      const kind = proposalKindName(latest.proposal);
      if (latest.proposal.status !== "InProgress" || latest.proposal.votes?.[account.accountId]) {
        throw new Error("This proposal is closed or your account has already voted. Refresh the DAO view.");
      }
      if (displayed.description !== latest.proposal.description || JSON.stringify(displayed.kind) !== JSON.stringify(latest.proposal.kind)) {
        throw new Error("The proposal details changed. Refresh and review them before voting.");
      }
      if (!accountCanUsePermission(latest.policy, account.accountId, kind, action)) {
        throw new Error("This wallet cannot vote under the DAO’s current policy.");
      }
      const result = await sendDaoCall("act_proposal", { id: proposalId, action, memo: null }, "0");
      setSentAction({ transactionId: result.transactionId, proposalId: String(proposalId), hadFailedReceipt: result.hadFailedReceipt });
      setFailedReceipt(result.hadFailedReceipt);
      await onRefresh();
      setStatusChecked(true);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "The vote could not be sent.");
    } finally {
      setBusyProposalId(null);
    }
  }

  const currentMoneyAvailable = treasury?.state.money_available;
  const transactionUrl = sentAction ? `${EXPLORER_URL}/transactions/${encodeURIComponent(sentAction.transactionId)}` : null;
  const refreshedProposal = sentAction?.proposalId
    ? dao?.proposals.find((proposal) => String(proposal.id) === sentAction.proposalId)
    : undefined;

  return (
    <section className="governance-section" id="governance" aria-labelledby="governance-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">DAO decisions</p>
          <h2 id="governance-title">DAO approval</h2>
        </div>
        {dao && <a className="dao-link" href={`${EXPLORER_URL}/accounts/${encodeURIComponent(dao.accountId)}`} target="_blank" rel="noreferrer">DAO account: {dao.accountId}</a>}
      </div>

      {error && <div className="inline-alert error-alert" role="alert">Could not load current DAO proposals: {error}</div>}
      {actionError && <div className="inline-alert error-alert" role="alert">{actionError}</div>}
      {sentAction && transactionUrl && (
        <div className="inline-alert" role="status">
          <span>
            Transaction included in NEAR testnet. {sentAction.proposalId ? `Proposal ${sentAction.proposalId}. ` : ""}
            {!statusChecked ? "Checking the current DAO status…" : refreshedProposal ? `Current DAO status: ${statusLabel(refreshedProposal.status)}.` : "Proposal not found in the recent list. Refresh the DAO view before acting again."}
            {failedReceipt ? " A called contract receipt failed; read the proposal status before treating the action as complete." : ""}
          </span>
          <a href={transactionUrl} target="_blank" rel="noreferrer">View transaction</a>
        </div>
      )}

      <div className="governance-grid">
        <div className="proposal-list-panel">
          <h3>Recent proposals</h3>
          {loading && !dao ? <div className="loading-panel compact" role="status">Loading DAO proposals…</div> : null}
          {!loading && !dao && !error ? <div className="empty-panel">DAO proposals are not available yet.</div> : null}
          {dao?.proposals.length ? (
            <div className="proposal-list">
              {dao.proposals.map((proposal) => (
                <ProposalRow
                  key={proposal.id}
                  proposal={proposal}
                  daoPolicy={dao.policy}
                  accountId={account?.accountId ?? null}
                  busy={loading || busyProposalId === proposal.id}
                  onVote={(id, action) => void vote(id, action)}
                />
              ))}
            </div>
          ) : dao && !loading ? (
            <div className="empty-panel">No DAO proposals yet.</div>
          ) : null}
          {dao && <p className="small-note">Read from final DAO block {dao.blockHeight.toLocaleString("en-US")}.</p>}
        </div>

        <div className="commitment-form-panel">
          <h3>{requestKind === "funding" ? "Add money to the treasury" : requestKind === "withdrawal" ? "Ask the DAO to withdraw money" : "Ask the DAO to set money aside"}</h3>
          {dao ? (
            <>
              <p className="form-intro">This creates a real DAO proposal. It only takes effect if the DAO approves it and the contract call succeeds.</p>
              {requestKind === "commitment" && currentMoneyAvailable && <p className="money-check">Current money available: <strong>{formatNear(currentMoneyAvailable)} NEAR</strong>. Approval may happen later, so the contract checks again then.</p>}
              {requestKind === "funding" && <p className="money-check">If approved, the NEAR amount below will be sent from the DAO to the firewall.</p>}
              {requestKind === "withdrawal" && <p className="money-check">If approved, the firewall sends this amount to the account below. The contract checks available money again when the DAO approves. If another withdrawal is approved first, submit this request again.</p>}
              <p className="bond-note">This DAO requires a deposit of <strong>{formatNear(dao.policy.proposal_bond)} NEAR</strong> to send a request. Your wallet will ask you to approve it.</p>
              {!account && <p className="small-note">Connect a NEAR testnet wallet to create or vote on proposals.</p>}
              {account && !canAddProposal && <p className="small-note">This wallet cannot add proposals under the DAO’s current policy.</p>}
              <form className="commitment-form" onSubmit={(event) => void submitCommitment(event)}>
                <label>What do you want the DAO to do?
                  <select value={requestKind} onChange={(event) => setRequestKind(event.target.value as RequestKind)}>
                    <option value="commitment">Set money aside for approved work</option>
                    <option value="funding">Add money to Veyntro</option>
                    <option value="withdrawal">Withdraw available money</option>
                  </select>
                </label>
                <label>Request note
                  <input value={description} onChange={(event) => setDescription(event.target.value)} minLength={6} maxLength={280} required placeholder={requestKind === "funding" ? "Why is the treasury adding money?" : requestKind === "withdrawal" ? "Why is money being withdrawn?" : "Describe the approved work"} />
                </label>
                {requestKind === "commitment" && <>
                  <div className="form-two-column">
                    <label>Person doing the work
                      <input value={beneficiary} onChange={(event) => setBeneficiary(event.target.value)} required autoCapitalize="none" autoCorrect="off" placeholder="name.near" />
                    </label>
                    <label>Payment account
                      <input value={recipient} onChange={(event) => setRecipient(event.target.value)} required autoCapitalize="none" autoCorrect="off" placeholder="name.near" />
                    </label>
                  </div>
                  <div className="form-two-column">
                    <label>Amount in NEAR
                      <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} required placeholder="0.00" />
                    </label>
                    <label>Deadline
                      <input type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} required />
                    </label>
                  </div>
                  <label>Work check code
                    <input className="hash-input" value={policyHash} onChange={(event) => setPolicyHash(event.target.value)} required autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="64-character hash" />
                    <span className="small-note">This code must match the work-check rules approved for this work.</span>
                  </label>
                </>}
                {requestKind === "funding" && <label>Amount in NEAR
                  <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} required placeholder="0.00" />
                </label>}
                {requestKind === "withdrawal" && <div className="form-two-column">
                  <label>Amount in NEAR
                    <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} required placeholder="0.00" />
                  </label>
                  <label>Send to NEAR account
                    <input value={recipient} onChange={(event) => setRecipient(event.target.value)} required autoCapitalize="none" autoCorrect="off" placeholder="name.near" />
                  </label>
                </div>}
                <button className="button-primary form-submit" type="submit" disabled={busy || loading || !account || !canAddProposal || !dao}>
                  {busy ? "Waiting for wallet…" : "Ask for approval"}
                </button>
              </form>
            </>
          ) : (
            <div className="empty-panel">The form will be ready after the live DAO policy loads.</div>
          )}
        </div>
      </div>
    </section>
  );
}
