import {
  EXPLORER_URL,
  FIREWALL_CONTRACT_ID,
  formatDeadline,
  formatNear,
  type OperationsPage,
  type TreasuryOperation,
} from "./near/rpc";
import type { DaoSnapshot } from "./near/dao";
import { verifiedPaymentTransaction } from "./near/verified-audit";

interface ActivityPanelProps {
  page: OperationsPage | null;
  loading: boolean;
  error: string | null;
  loadingOlder: boolean;
  currentBlockHash: string | null;
  currentBlockHeight: number | null;
  onLoadOlder: () => void;
  dao: DaoSnapshot | null;
  daoError: string | null;
  daoLoading: boolean;
}

function actionName(operation: TreasuryOperation): string {
  return operation.kind === "Payout" ? "Payment" : "Withdrawal";
}

function statusName(status: TreasuryOperation["status"]): string {
  if (status === "Pending") return "Being sent";
  if (status === "Succeeded") return "Completed";
  return "Failed";
}

export default function ActivityPanel({ page, loading, error, loadingOlder, currentBlockHash, currentBlockHeight, onLoadOlder, dao, daoError, daoLoading }: ActivityPanelProps) {
  return (
    <section className="activity-section" id="activity" aria-labelledby="activity-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Onchain records</p>
          <h2 id="activity-title">Payments and withdrawals</h2>
        </div>
        <a className="dao-link" href={`${EXPLORER_URL}/accounts/${encodeURIComponent(FIREWALL_CONTRACT_ID)}`} target="_blank" rel="noreferrer">View Veyntro on NEAR Explorer</a>
      </div>
      <p className="activity-note">These payment results come from the contract. A transaction link appears when we have checked its final transfer and matched it to the payment record. Other records can be explored from Veyntro’s account.</p>
      {page && <p className="activity-note">{page.blockHash === currentBlockHash ? `Read from final block ${currentBlockHeight?.toLocaleString("en-US") ?? ""}.` : "Updating activity to the latest final block…"}</p>}
      {error && <div className="inline-alert error-alert" role="alert">Could not load money activity: {error}</div>}
      {loading && !page ? <div className="loading-panel compact" role="status">Loading payments and withdrawals…</div> : null}
      {page?.operations.length ? (
        <div className="activity-list">
          {[...page.operations].reverse().map((operation) => (
            <article className="activity-row" key={operation.id}>
              <div className="activity-main">
                <div>
                  <p className="record-label">{actionName(operation)} {operation.id}</p>
                  <strong>{formatNear(operation.amount)} NEAR</strong>
                </div>
                <span className={`status status-${operation.status.toLowerCase()}`}>{statusName(operation.status)}</span>
              </div>
              <p className="activity-meta">{operation.status === "Succeeded" ? "Sent" : operation.status === "Failed" ? "Attempted" : "Sending"} to {operation.recipient} on {formatDeadline(operation.created_at_ns)}</p>
              {operation.reservation_id !== null && (
                <p className="activity-meta">
                  <a href={`/commitments/${encodeURIComponent(operation.reservation_id)}`}>View commitment {operation.reservation_id} and its work check</a>
                </p>
              )}
              {verifiedPaymentTransaction(operation) && (
                <p className="activity-meta"><a href={`${EXPLORER_URL}/transactions/${verifiedPaymentTransaction(operation)}`} target="_blank" rel="noreferrer">View checked payment transaction ↗</a></p>
              )}
              {operation.completed_at_ns !== "0" && <p className="activity-meta">Finished {formatDeadline(operation.completed_at_ns)}</p>}
            </article>
          ))}
        </div>
      ) : page && !error ? (
        <div className="empty-panel">No payments or withdrawals have been recorded yet.</div>
      ) : null}
      {page && page.blockHash === currentBlockHash && BigInt(page.nextFromIndex) > 0n && (
        <div className="load-more-wrap">
          <button className="load-more-button" onClick={onLoadOlder} disabled={loadingOlder}>
            {loadingOlder ? "Loading…" : "Show older activity"}
          </button>
        </div>
      )}
      <div className="section-heading activity-dao-heading">
        <div>
          <p className="section-kicker">DAO records</p>
          <h2>Approval requests</h2>
        </div>
        <a className="dao-link" href="/governance">Review full requests</a>
      </div>
      <p className="activity-note">These are the newest requests read from the DAO. An approved vote is not a payment receipt. Check the treasury and payment records to see what happened to the money.</p>
      {dao && <p className="activity-note">Read from final DAO block {dao.blockHeight.toLocaleString("en-US")}. Showing up to 10 of the newest 50 requests.</p>}
      {daoError && <div className="inline-alert error-alert" role="alert">Could not load DAO requests: {daoError}</div>}
      {daoLoading && !dao && <div className="loading-panel compact" role="status">Loading DAO requests…</div>}
      {dao?.proposals.length ? (
        <div className="activity-list">
          {dao.proposals.slice(0, 10).map((proposal) => (
            <article className="activity-row" key={proposal.id}>
              <div className="activity-main">
                <div>
                  <p className="record-label">Request {proposal.id}</p>
                  <strong>{proposal.description}</strong>
                </div>
                <span className={`status status-${proposal.status.toLowerCase()}`}>
                  {proposal.status === "InProgress" ? "Waiting for votes" : proposal.status === "Failed" ? "Failed during execution" : proposal.status}
                </span>
              </div>
              <p className="activity-meta">Asked by {proposal.proposer} on {formatDeadline(proposal.submission_time)}</p>
            </article>
          ))}
        </div>
      ) : dao && !daoError ? <div className="empty-panel">No DAO requests were found in the newest 50.</div> : null}
    </section>
  );
}
