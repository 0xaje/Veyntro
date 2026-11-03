import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "./wallet/WalletProvider";
import {
  explorerAccountUrl,
  FIREWALL_CONTRACT_ID,
  formatDeadline,
  formatNear,
  readTreasury,
  readReservationPage,
  type TreasurySnapshot,
} from "./near/rpc";

function Amount({ value }: { value: string }) {
  return <>{formatNear(value)} <span className="amount-unit">NEAR</span></>;
}

function CommitmentCard({ row }: { row: TreasurySnapshot["reservations"][number] }) {
  const status = row.is_expired && row.status === "Active" ? "Expired" : row.status;
  const statusLabel = status === "Active" ? "In progress" : status;
  const evidenceLabel = row.evidence?.usable ? "GitHub check accepted" : "GitHub check needed";
  return (
    <article className="commitment-card">
      <div className="commitment-heading">
        <div>
          <p className="eyebrow">Commitment {row.id}</p>
          <h3>{row.beneficiary}</h3>
        </div>
        <span className={`status status-${status.toLowerCase()}`}>{statusLabel}</span>
      </div>
      <div className="commitment-details">
        <div><span>Approved</span><strong><Amount value={row.approved_amount} /></strong></div>
        <div><span>Still set aside</span><strong><Amount value={row.remaining_liability} /></strong></div>
        <div><span>Deadline</span><strong>{formatDeadline(row.expires_at_ns)}</strong></div>
        <div><span>Work check</span><strong>{evidenceLabel}</strong></div>
      </div>
      {row.pending_amount !== "0" && (
        <p className="pending-note">A payment is being processed: <Amount value={row.pending_amount} />.</p>
      )}
      {row.is_expired && row.status === "Active" && (
        <p className="pending-note">This commitment has expired. Its unused money can be returned by an onchain action.</p>
      )}
    </article>
  );
}

export default function App() {
  const { account, connect, disconnect, error: walletError, ready } = useWallet();
  const [snapshot, setSnapshot] = useState<TreasurySnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const hasSnapshot = useRef(false);
  const latestBlockHash = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (hasSnapshot.current) setRefreshing(true);
    else setLoading(true);
    try {
      const next = await readTreasury();
      hasSnapshot.current = true;
      latestBlockHash.current = next.blockHash;
      setSnapshot(next);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Treasury data could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 20_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const state = snapshot?.state;
  const commitmentSummary = snapshot ? `Showing ${snapshot.reservations.length}` : null;

  const hasMore = Boolean(snapshot && BigInt(snapshot.state.next_reservation_id) > BigInt(snapshot.nextFromIndex));
  const loadMore = async () => {
    if (!snapshot || !hasMore || loadingMore) return;
    setLoadingMore(true);
    setPageError(null);
    try {
      const rows = await readReservationPage(snapshot.nextFromIndex, snapshot.blockHash);
      if (latestBlockHash.current !== snapshot.blockHash) {
        throw new Error("The treasury changed while commitments were loading. Refresh and try again.");
      }
      setSnapshot((current) => current ? {
        ...current,
        reservations: [...current.reservations, ...rows],
        nextFromIndex: current.nextFromIndex + 50,
      } : current);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "More commitments could not be loaded.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Veyntro home">
          <span className="brand-mark" aria-hidden="true">V</span>
          <span>Veyntro</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#treasury">Your money</a>
          <a href="#commitments">Commitments</a>
        </nav>
        <div className="wallet-area">
          <span className="network-pill"><span className="network-dot" />NEAR TESTNET</span>
          {account ? (
            <button className="wallet-button connected" onClick={() => void disconnect()} title="Disconnect wallet">
              <span className="wallet-dot" />{account.accountId}<span className="disconnect-word">Disconnect</span>
            </button>
          ) : (
            <button className="wallet-button" onClick={connect} disabled={!ready}>
              {ready ? "Connect wallet" : "Loading wallet…"}
            </button>
          )}
        </div>
      </header>

      <main id="top">
        <section className="intro" aria-labelledby="page-title">
          <div className="intro-copy">
            <p className="eyebrow">Shared money, clearly accounted for</p>
            <h1 id="page-title">Every commitment accounted for.</h1>
            <p className="intro-text">See what the treasury holds, what is set aside for work, and what can still be used.</p>
          </div>
          <a className="contract-link" href={explorerAccountUrl(FIREWALL_CONTRACT_ID)} target="_blank" rel="noreferrer">
            <span className="contract-label">Live contract</span>
            <span>{FIREWALL_CONTRACT_ID}</span>
            <span aria-hidden="true">↗</span>
          </a>
        </section>

        {walletError && <div className="inline-alert" role="status">{walletError}</div>}
        {loadError && (
          <div className="inline-alert error-alert" role="alert">
            <span>{snapshot ? `Could not refresh live data. Showing the last final view from block ${snapshot.blockHeight}. ${loadError}` : loadError}</span>
            <button onClick={() => void refresh()}>Try again</button>
          </div>
        )}

        <section className="treasury-section" id="treasury" aria-labelledby="treasury-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Treasury overview</p>
              <h2 id="treasury-title">Your money</h2>
            </div>
            <div className="freshness">
              <span className={loadError ? "freshness-dot stale" : "freshness-dot"} />
              <span>{loading ? "Reading NEAR testnet…" : `Final block ${snapshot?.blockHeight.toLocaleString("en-US")}`}</span>
              <button className="refresh-button" onClick={() => void refresh()} disabled={loading || refreshing} aria-label="Refresh treasury data">
                {refreshing ? "Updating…" : "Refresh"}
              </button>
            </div>
          </div>

          {loading && !snapshot ? (
            <div className="loading-panel" role="status">Reading live treasury data from NEAR testnet…</div>
          ) : !state ? (
            <div className="empty-panel">Treasury data is not available yet. Try again in a moment.</div>
          ) : (
            <>
              <div className="money-grid">
                <article className="money-card available-card">
                  <span className="money-label">Money available</span>
                  <strong className="money-value"><Amount value={state.money_available} /></strong>
                  <span className="money-caption">Free to be set aside or withdrawn through DAO approval.</span>
                </article>
                <article className="money-card">
                  <span className="money-label">Money set aside</span>
                  <strong className="money-value"><Amount value={state.reservation_liabilities} /></strong>
                  <span className="money-caption">Backs active work commitments, including pending payments.</span>
                </article>
                <article className="money-card">
                  <span className="money-label">Accounted treasury</span>
                  <strong className="money-value"><Amount value={state.confirmed_accountable_funds} /></strong>
                  <span className="money-caption">Money added through an approved DAO action.</span>
                </article>
                <article className="money-card reserve-card">
                  <span className="money-label">Safety reserve</span>
                  <strong className="money-value"><Amount value={state.operating_reserve} /></strong>
                  <span className="money-caption">Kept for contract storage and safe operation.</span>
                </article>
              </div>
              <details className="accounting-details">
                <summary>How these numbers are checked</summary>
                <p>The contract counts pending payments and its operating reserve before showing money as available. A transfer sent directly to the contract is not counted as treasury money unless the DAO adds it through an approved action.</p>
                <div className="checks-row">
                  <span className={state.ledger_solvent ? "check-ok" : "check-fail"}>Treasury coverage: {state.ledger_solvent ? "OK" : "Needs attention"}</span>
                  <span className={state.physical_backing_check ? "check-ok" : "check-fail"}>Money held by contract: {state.physical_backing_check ? "Enough for current obligations" : "Below current obligations"}</span>
                </div>
                <p className="small-note">The contract holds <Amount value={state.actual_balance} /> in total. This can include money that is not counted as available.</p>
              </details>
            </>
          )}
        </section>

        <section className="commitments-section" id="commitments" aria-labelledby="commitments-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Onchain records</p>
              <h2 id="commitments-title">Commitments</h2>
            </div>
          {commitmentSummary && <span className="count-label">{commitmentSummary} commitments</span>}
          </div>

          {loading && !snapshot ? (
            <div className="loading-panel compact" role="status">Loading commitments…</div>
          ) : snapshot?.reservations.length ? (
            <div className="commitment-list">
              {snapshot.reservations.map((row) => <CommitmentCard key={row.id} row={row} />)}
            </div>
          ) : snapshot ? (
            <div className="empty-panel">
              <h3>No commitments yet</h3>
              <p>When the DAO sets money aside for approved work, each commitment will appear here.</p>
            </div>
          ) : (
            <div className="empty-panel">Commitments will appear after live treasury data loads.</div>
          )}
          {pageError && <div className="inline-alert error-alert" role="alert">{pageError}</div>}
          {hasMore && (
            <div className="load-more-wrap"><button className="load-more-button" onClick={() => void loadMore()} disabled={loadingMore}>{loadingMore ? "Loading…" : "Show more commitments"}</button></div>
          )}
        </section>

        <section className="trust-note" aria-label="About this page">
          <span className="trust-icon" aria-hidden="true">✓</span>
          <div><strong>Read from NEAR testnet</strong><p>This page reads the contract directly. You do not need a wallet to view it. Connecting a wallet is only needed for actions that require a signature.</p></div>
        </section>
      </main>

      <footer className="footer">
        <span>Veyntro · Every commitment accounted for.</span>
        <a href={explorerAccountUrl(state?.dao_account_id ?? "veyntro.sputnikv2.testnet")} target="_blank" rel="noreferrer">
          DAO account{state ? ` · ${state.dao_account_id}` : ""} ↗
        </a>
      </footer>
    </div>
  );
}
