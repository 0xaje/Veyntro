import { useState } from "react";
import { Action, FunctionCall } from "@near-js/transactions";
import { useWallet } from "./wallet/WalletProvider";
import { FIREWALL_CONTRACT_ID, EXPLORER_URL, formatNear, type Reservation } from "./near/rpc";
import { amountToYocto } from "./near/dao";

interface CommitmentActionsProps {
  row: Reservation;
  onRefresh: () => Promise<void>;
}

export default function CommitmentActions({ row, onRefresh }: CommitmentActionsProps) {
  const { account, selector } = useWallet();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [payoutAmount, setPayoutAmount] = useState("");

  const isBeneficiary = account?.accountId === row.beneficiary;
  const canRelease = row.is_expired && row.status === "Active";
  const canRequestPayout = isBeneficiary && row.status === "Active" && row.evidence?.usable && !row.is_expired;

  async function handleReleaseExpiry() {
    if (!selector || !account) return;
    setBusy(true);
    setError(null);
    setTxHash(null);
    try {
      const wallet = await selector.wallet();
      const outcome = await wallet.signAndSendTransaction({
        signerId: account.accountId,
        receiverId: FIREWALL_CONTRACT_ID,
        actions: [new Action({
          functionCall: new FunctionCall({
            methodName: "release_expired_reservation",
            args: new TextEncoder().encode(JSON.stringify({ id: row.id })),
            gas: 50_000_000_000_000n,
            deposit: 0n,
          }),
        })],
      });
      if (outcome?.transaction?.hash) {
        setTxHash(outcome.transaction.hash);
      }
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Release transaction failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestPayout(e: React.FormEvent) {
    e.preventDefault();
    if (!selector || !account) return;
    setBusy(true);
    setError(null);
    setTxHash(null);
    try {
      const yocto = amountToYocto(payoutAmount);
      const wallet = await selector.wallet();
      const outcome = await wallet.signAndSendTransaction({
        signerId: account.accountId,
        receiverId: FIREWALL_CONTRACT_ID,
        actions: [new Action({
          functionCall: new FunctionCall({
            methodName: "request_drawdown",
            args: new TextEncoder().encode(JSON.stringify({ id: row.id, amount: yocto })),
            gas: 100_000_000_000_000n,
            deposit: 0n,
          }),
        })],
      });
      if (outcome?.transaction?.hash) {
        setTxHash(outcome.transaction.hash);
      }
      setPayoutAmount("");
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payout request failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!canRelease && !canRequestPayout && !txHash && !error) {
    return null;
  }

  return (
    <div className="commitment-actions">
      {canRelease && (
        <button
          className="button-secondary"
          onClick={() => void handleReleaseExpiry()}
          disabled={busy || !account}
        >
          {busy ? "Releasing..." : "Return expired funds to treasury"}
        </button>
      )}

      {canRequestPayout && (
        <form className="payout-form" onSubmit={(e) => void handleRequestPayout(e)}>
          <label>
            Payout amount (max {formatNear(row.remaining_liability)} NEAR)
            <input
              type="text"
              inputMode="decimal"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </label>
          <button className="button-primary" type="submit" disabled={busy || !account}>
            {busy ? "Submitting..." : "Claim payment"}
          </button>
        </form>
      )}

      {error && <div className="inline-alert error-alert">{error}</div>}
      {txHash && (
        <div className="action-result">
          <span>Transaction sent: </span>
          <a href={`${EXPLORER_URL}/transactions/${encodeURIComponent(txHash)}`} target="_blank" rel="noreferrer">
            View on NEAR Explorer ↗
          </a>
        </div>
      )}
    </div>
  );
}
