import {
  EXPLORER_URL,
  FIREWALL_CONTRACT_ID,
  formatDeadline,
  formatNear,
  type OperationsPage,
  type TreasuryOperation,
} from "./near/rpc";

interface ActivityPanelProps {
  page: OperationsPage | null;
  loading: boolean;
  error: string | null;
  loadingOlder: boolean;
  currentBlockHash: string | null;
  currentBlockHeight: number | null;
  onLoadOlder: () => void;
}

function actionName(operation: TreasuryOperation): string {
  return operation.kind === "Payout" ? "Payment" : "Withdrawal";
}

function statusName(status: TreasuryOperation["status"]): string {
  if (status === "Pending") return "Being sent";
  if (status === "Succeeded") return "Completed";
  return "Failed";
}

export default function ActivityPanel({ page, loading, error, loadingOlder, currentBlockHash, currentBlockHeight, onLoadOlder }: ActivityPanelProps) {
  return (
    <section className="activity-section" id="activity" aria-labelledby="activity-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Onchain records</p>
          <h2 id="activity-title">Payments and withdrawals</h2>
        </div>
        <a className="dao-link" href={`${EXPLORER_URL}/accounts/${encodeURIComponent(FIREWALL_CONTRACT_ID)}`} target="_blank" rel="noreferrer">View Veyntro on NEAR Explorer</a>
      </div>
      <p className="activity-note">This list shows recorded payments and withdrawals. It does not include funding or commitment changes. The saved records do not include transaction links, so the explorer link opens Veyntro’s account.</p>
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
    </section>
  );
}
