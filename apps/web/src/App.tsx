import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "./wallet/WalletProvider";
import CommitmentActions from "./CommitmentActions";
import GovernancePanel from "./GovernancePanel";
import ActivityPanel from "./ActivityPanel";
import DocsPanel from "./DocsPanel";
import { readDao, type DaoSnapshot } from "./near/dao";
import {
  explorerAccountUrl,
  FIREWALL_CONTRACT_ID,
  formatDeadline,
  formatNear,
  readTreasury,
  readReservationPage,
  readReservation,
  readOperationPage,
  type TreasurySnapshot,
  type OperationsPage,
  type Reservation,
} from "./near/rpc";

function Amount({ value }: { value: string }) {
  return <>{formatNear(value)} <span className="amount-unit">NEAR</span></>;
}

type AppView = "overview" | "commitments" | "governance" | "activity" | "docs";

function viewFromLocation(hash: string, path: string): AppView {
  if (hash === "#commitments" || hash.startsWith("#commitment-")) return "commitments";
  if (hash === "#governance") return "governance";
  if (hash === "#activity") return "activity";
  if (hash === "#docs") return "docs";
  if (path === "/commitments" || path.startsWith("/commitments/")) return "commitments";
  if (path === "/governance") return "governance";
  if (path === "/activity") return "activity";
  if (path === "/docs") return "docs";
  return "overview";
}

const VIEW_COPY: Record<AppView, { title: string; description: string }> = {
  overview: {
    title: "Every commitment accounted for.",
    description: "See what the treasury holds, what is set aside for work, and what can still be used.",
  },
  commitments: {
    title: "Commitments",
    description: "See what the DAO has set aside, who is doing the work, and when it is due.",
  },
  governance: {
    title: "DAO approval",
    description: "Review proposals and ask the DAO to approve a treasury action.",
  },
  activity: {
    title: "Payments and withdrawals",
    description: "Review the payment and withdrawal records available from the contract.",
  },
  docs: {
    title: "How Veyntro works",
    description: "See who approves money, how work is checked, and what the app can show today.",
  },
};

function CommitmentCard({ row, onRefresh, detail = false }: { row: Reservation; onRefresh: () => Promise<void>; detail?: boolean }) {
  const status = row.is_expired && row.status === "Active" ? "Expired" : row.status;
  const statusLabel = status === "Active" ? "In progress" : status;
  const evidenceLabel = row.evidence?.usable ? "GitHub check accepted" : "GitHub check needed";
  return (
    <article className="commitment-card" id={`commitment-${row.id}`}>
      <div className="commitment-heading">
        <div>
          <h3>{row.beneficiary}</h3>
          <p className="record-label">Commitment {row.id}</p>
        </div>
        <span className={`status status-${status.toLowerCase()}`}>{statusLabel}</span>
      </div>
      <div className="commitment-details">
        <div><span>Approved</span><strong><Amount value={row.approved_amount} /></strong></div>
        <div><span>Still set aside</span><strong><Amount value={row.remaining_liability} /></strong></div>
        <div><span>Deadline</span><strong>{formatDeadline(row.expires_at_ns)}</strong></div>
        <div><span>Work check</span><strong>{evidenceLabel}</strong></div>
      </div>
      {detail ? (
        <div className="commitment-details-extra">
          <p><strong>Payment account:</strong> {row.payout_recipient}</p>
          <p><strong>Work-check rule hash:</strong> <code>{row.evidence_policy_hash}</code></p>
          {row.evidence && <p><strong>Checked commit:</strong> <code>{row.evidence.commit_sha}</code></p>}
          {row.evidence && <p><strong>Work check ends:</strong> {formatDeadline(row.evidence.valid_until_ns)}</p>}
          <p><a href="/activity">See available payment records</a></p>
        </div>
      ) : <a className="commitment-detail-link" href={`/commitments/${encodeURIComponent(row.id)}`}>View commitment details</a>}
      {row.pending_amount !== "0" && (
        <p className="pending-note">A payment is being processed: <Amount value={row.pending_amount} />.</p>
      )}
      {row.is_expired && row.status === "Active" && (
        <p className="pending-note">This commitment has expired. Its unused money can be returned by an onchain action.</p>
      )}
      <CommitmentActions row={row} onRefresh={onRefresh} />
    </article>
  );
}

export default function App() {
  const { account, connect, disconnect, error: walletError, initializing: walletInitializing, ready, retry: retryWallet } = useWallet();
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("veyntro-theme") ?? localStorage.getItem("veyntro-theme-mode");
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      // Keep the app usable when browser storage is unavailable.
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveTheme);
    try {
      localStorage.setItem("veyntro-theme", effectiveTheme);
    } catch {
      // The theme still applies for this visit if storage is unavailable.
    }
  }, [effectiveTheme]);

  const toggleTheme = () => setEffectiveTheme((current) => current === "dark" ? "light" : "dark");
  const [activeView, setActiveView] = useState<AppView>(() => viewFromLocation(window.location.hash, window.location.pathname));

  useEffect(() => {
    const syncView = () => {
      const hash = window.location.hash;
      setActiveView(viewFromLocation(hash, window.location.pathname));
      if (hash.startsWith("#commitment-")) {
        window.setTimeout(() => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: "start" }), 0);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("hashchange", syncView);
    return () => window.removeEventListener("hashchange", syncView);
  }, []);

  const [snapshot, setSnapshot] = useState<TreasurySnapshot | null>(null);
  const [dao, setDao] = useState<DaoSnapshot | null>(null);
  const [operationsPage, setOperationsPage] = useState<OperationsPage | null>(null);
  const [daoError, setDaoError] = useState<string | null>(null);
  const [daoLoading, setDaoLoading] = useState(true);
  const [operationsLoading, setOperationsLoading] = useState(true);
  const [operationsError, setOperationsError] = useState<string | null>(null);
  const [loadingOlderOperations, setLoadingOlderOperations] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const hasSnapshot = useRef(false);
  const latestBlockHash = useRef<string | null>(null);
  const refreshPromise = useRef<Promise<void> | null>(null);

  const refresh = useCallback(() => {
    if (refreshPromise.current) return refreshPromise.current;
    const task = (async () => {
      if (hasSnapshot.current) setRefreshing(true);
      else setLoading(true);
      setDaoLoading(true);
      try {
        const next = await readTreasury();
        hasSnapshot.current = true;
        latestBlockHash.current = next.blockHash;
        setSnapshot(next);
        setLoadError(null);
        try {
          const nextOperations = await readOperationPage(next.state.next_operation_id, next.blockHash);
          setOperationsPage(nextOperations);
          setOperationsError(null);
        } catch (error) {
          setOperationsPage(null);
          setOperationsError(error instanceof Error ? error.message : "Money activity could not be loaded.");
        }
        try {
          const nextDao = await readDao(next.state.dao_account_id);
          setDao(nextDao);
          setDaoError(null);
        } catch (error) {
          setDao(null);
          setDaoError(error instanceof Error ? error.message : "DAO proposals could not be loaded.");
        }
      } catch (error) {
        setDao(null);
        setDaoError("Live treasury data could not be read, so DAO actions are paused.");
        setOperationsPage(null);
        setOperationsError("Live treasury data could not be read.");
        setLoadError(error instanceof Error ? error.message : "Treasury data could not be loaded.");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setDaoLoading(false);
        setOperationsLoading(false);
        refreshPromise.current = null;
      }
    })();
    refreshPromise.current = task;
    return task;
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 20_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const state = snapshot?.state;
  const detailId = /^\/commitments\/(\d+)$/.exec(window.location.pathname)?.[1] ?? null;
  const [detailRow, setDetailRow] = useState<Reservation | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!detailId || !snapshot?.blockHash) return;
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);
    void readReservation(detailId, snapshot.blockHash).then((row) => {
      if (!cancelled) setDetailRow(row);
    }).catch((error: unknown) => {
      if (!cancelled) setDetailError(error instanceof Error ? error.message : "The commitment could not be loaded.");
    }).finally(() => {
      if (!cancelled) setDetailLoading(false);
    });
    return () => { cancelled = true; };
  }, [detailId, snapshot?.blockHash]);
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

  const loadOlderOperations = async () => {
    if (!snapshot || !operationsPage || BigInt(operationsPage.nextFromIndex) === 0n || loadingOlderOperations) return;
    if (operationsPage.blockHash !== snapshot.blockHash) {
      setOperationsError("Activity changed. Refresh before loading older records.");
      return;
    }
    setLoadingOlderOperations(true);
    setOperationsError(null);
    try {
      const older = await readOperationPage(operationsPage.nextFromIndex, snapshot.blockHash);
      if (latestBlockHash.current !== snapshot.blockHash) {
        throw new Error("The treasury changed while activity was loading. Refresh and try again.");
      }
      setOperationsPage((current) => current && current.blockHash === older.blockHash ? {
        operations: [...older.operations, ...current.operations],
        nextFromIndex: older.nextFromIndex,
        blockHash: older.blockHash,
      } : current);
    } catch (error) {
      setOperationsError(error instanceof Error ? error.message : "Older activity could not be loaded.");
    } finally {
      setLoadingOlderOperations(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/#overview" aria-label="Veyntro overview">
          <span className="brand-mark" aria-hidden="true">V</span>
          <span>Veyntro</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="/#overview" aria-current={activeView === "overview" ? "page" : undefined}>Overview</a>
          <a href="/commitments" aria-current={activeView === "commitments" ? "page" : undefined}>Commitments</a>
          <a href="/governance" aria-current={activeView === "governance" ? "page" : undefined}>DAO approval</a>
          <a href="/activity" aria-current={activeView === "activity" ? "page" : undefined}>Activity</a>
          <a href="/docs" aria-current={activeView === "docs" ? "page" : undefined}>How it works</a>
        </nav>
        <div className="topbar-controls">
          <button
            type="button"
            className="theme-dot-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
          >
            <span className="theme-dot" aria-hidden="true" />
          </button>
          <div className="wallet-area">
            <span className="network-pill">NEAR testnet</span>
            {account ? (
              <button className="wallet-button connected" onClick={() => void disconnect()} title="Disconnect wallet">
                <span className="wallet-dot" />{account.accountId}<span className="disconnect-word">Disconnect</span>
              </button>
            ) : (
              <button
                className="wallet-button"
                onClick={walletError ? retryWallet : () => void connect()}
                disabled={walletInitializing || (!ready && !walletError)}
                title={walletError ? "Try wallet again" : ready ? "Connect wallet" : "Loading wallet…"}
              >
                {walletError ? "Try wallet again" : ready ? "Connect wallet" : "Loading wallet…"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="top">
        <section className="intro" aria-labelledby="page-title">
          <div className="intro-copy">
            <h1 id="page-title">{VIEW_COPY[activeView].title}</h1>
            <p className="intro-text">{VIEW_COPY[activeView].description}</p>
          </div>
          <a className="contract-link" href={explorerAccountUrl(FIREWALL_CONTRACT_ID)} target="_blank" rel="noreferrer">
            <span className="contract-label">Live contract</span>
            <span>{FIREWALL_CONTRACT_ID}</span>
          </a>
        </section>

        {walletError && <p className="visually-hidden" role="alert">{walletError}</p>}
        {loadError && (
          <div className="inline-alert error-alert" role="alert">
            <span>{snapshot ? `Could not refresh live data. Showing the last final view from block ${snapshot.blockHeight}. ${loadError}` : loadError}</span>
            <button onClick={() => void refresh()}>Try again</button>
          </div>
        )}

        {activeView === "overview" && state && <section className="firewall-summary" aria-labelledby="firewall-summary-title">
          <div className="firewall-copy">
            <p className="section-kicker">Commitment Firewall</p>
            <h2 id="firewall-summary-title">New promises leave room for existing work.</h2>
            <p>Before money is set aside, the contract checks current commitments, pending payments, and its safety reserve.</p>
          </div>
          <div className="firewall-status" aria-label="Live contract checks">
            <span className={state.ledger_solvent ? "check-ok" : "check-fail"}>
              Commitment coverage: {state.ledger_solvent ? "Covered" : "Needs attention"}
            </span>
            <span className={state.physical_backing_check ? "check-ok" : "check-fail"}>
              Contract funds: {state.physical_backing_check ? "Enough for current obligations" : "Below current obligations"}
            </span>
            <small>Live check at final block {snapshot?.blockHeight.toLocaleString("en-US")}</small>
          </div>
        </section>}

        {activeView === "overview" && <section className="treasury-section" id="treasury" aria-labelledby="treasury-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Treasury overview</p>
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
        </section>}

        {activeView === "overview" && <nav className="overview-shortcuts" aria-label="More treasury pages">
          <a href="/commitments"><strong>Commitments</strong><span>See money set aside for work</span></a>
          <a href="/governance"><strong>DAO approval</strong><span>Review and request treasury actions</span></a>
          <a href="/activity"><strong>Activity</strong><span>See recorded payments and withdrawals</span></a>
        </nav>}

        <div className="view-preserved" hidden={activeView !== "commitments"}>
        <section className="commitments-section" id="commitments" aria-labelledby="commitments-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Onchain records</p>
              <h2 id="commitments-title">Commitments</h2>
            </div>
          {!detailId && commitmentSummary && <span className="count-label">{commitmentSummary} commitments</span>}
          </div>

          {detailId && <a className="commitment-detail-link" href="/commitments">← All commitments</a>}

          {detailId ? detailLoading || (loading && !snapshot) ? (
            <div className="loading-panel compact" role="status">Loading commitment {detailId}…</div>
          ) : detailError ? (
            <div className="inline-alert error-alert" role="alert">{detailError}</div>
          ) : detailRow ? (
            <CommitmentCard row={detailRow} onRefresh={refresh} detail />
          ) : snapshot ? (
            <div className="empty-panel">Commitment {detailId} was not found at the latest final block.</div>
          ) : null : loading && !snapshot ? (
            <div className="loading-panel compact" role="status">Loading commitments…</div>
          ) : snapshot?.reservations.length ? (
            <div className="commitment-list">
                {snapshot.reservations.map((row) => <CommitmentCard key={row.id} row={row} onRefresh={refresh} />)}
            </div>
          ) : snapshot ? (
            <div className="empty-panel">
              <h3>No commitments yet</h3>
              <p>When the DAO sets money aside for approved work, each commitment will appear here.</p>
            </div>
          ) : (
            <div className="empty-panel">Commitments will appear after live treasury data loads.</div>
          )}
          {!detailId && pageError && <div className="inline-alert error-alert" role="alert">{pageError}</div>}
          {!detailId && hasMore && (
            <div className="load-more-wrap"><button className="load-more-button" onClick={() => void loadMore()} disabled={loadingMore}>{loadingMore ? "Loading…" : "Show more commitments"}</button></div>
          )}
        </section>
        </div>

        <div className="view-preserved" hidden={activeView !== "governance"}>
          <GovernancePanel dao={dao} treasury={snapshot} loading={daoLoading} error={daoError} onRefresh={refresh} />
        </div>

        <div className="view-preserved" hidden={activeView !== "activity"}>
        <ActivityPanel
          page={operationsPage}
          loading={operationsLoading}
          error={operationsError}
          loadingOlder={loadingOlderOperations}
          currentBlockHash={snapshot?.blockHash ?? null}
          currentBlockHeight={snapshot?.blockHeight ?? null}
          onLoadOlder={() => void loadOlderOperations()}
        />
        </div>

        {activeView === "docs" && <DocsPanel state={state ?? null} />}

        <section className="trust-note" aria-label="About this page">
          <span className="trust-icon" aria-hidden="true">✓</span>
          <div><strong>Read from NEAR testnet</strong><p>This page reads the contract directly. You do not need a wallet to view it. Connecting a wallet is only needed for actions that require a signature.</p></div>
        </section>
      </main>

      <footer className="footer">
        <span>Veyntro. Every commitment accounted for.</span>
        <a href={explorerAccountUrl(state?.dao_account_id ?? "veyntro.sputnikv2.testnet")} target="_blank" rel="noreferrer">
          DAO account{state ? `: ${state.dao_account_id}` : ""}
        </a>
      </footer>
    </div>
  );
}
