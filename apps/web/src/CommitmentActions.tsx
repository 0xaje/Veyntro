import { useState } from "react";
import { Action, FunctionCall } from "@near-js/transactions";
import { useWallet } from "./wallet/WalletProvider";
import { FIREWALL_CONTRACT_ID, EXPLORER_URL, formatNear, type Reservation } from "./near/rpc";
import { amountToYocto, decodeFunctionResult } from "./near/dao";

interface CommitmentActionsProps {
  row: Reservation;
  onRefresh: () => Promise<void>;
}

type FinalOutcome = {
  status: unknown;
  transaction?: { hash?: string };
};

function getFinalValue(outcome: FinalOutcome | void): string | null {
  if (!outcome || !outcome.status || typeof outcome.status !== "object") return null;
  const status = outcome.status as Record<string, unknown>;
  if ("Failure" in status) throw new Error("The contract rejected this request. Check the transaction details.");
  if (typeof status.SuccessValue !== "string") return null;
  return decodeFunctionResult(status.SuccessValue);
}

export default function CommitmentActions({ row, onRefresh }: CommitmentActionsProps) {
  const { account, selector } = useWallet();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [payoutAmount, setPayoutAmount] = useState("");

  const isBeneficiary = account?.accountId === row.beneficiary;
  const canRelease = row.is_expired && row.status === "Active";
  const canRequestPayout = isBeneficiary && row.status === "Active" && row.evidence?.usable && !row.is_expired;

  async function handleReleaseExpiry() {
    if (!selector || !account) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    setTxHash(null);
    try {
      const wallet = await selector.wallet();
      const outcome = await wallet.signAndSendTransaction({
        signerId: account.accountId,
        receiverId: FIREWALL_CONTRACT_ID,
        actions: [new Action({
          functionCall: new FunctionCall({
            methodName: "release_expired",
            args: new TextEncoder().encode(JSON.stringify({ id: row.id })),
            gas: 50_000_000_000_000n,
            deposit: 0n,
          }),
        })],
      });
      if (outcome?.transaction?.hash) setTxHash(outcome.transaction.hash);
      const released = getFinalValue(outcome);
      if (released === null) {
        setMessage("The wallet did not return a final result. Refresh the commitment before trying again.");
      } else if (BigInt(released) > 0n) {
        setMessage(`${formatNear(released)} NEAR is available again. No money left the contract.`);
      } else {
        setMessage("The commitment was already closed. No money was released.");
      }
      await onRefresh().catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The funds could not be returned.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestPayout(e: React.FormEvent) {
    e.preventDefault();
    if (!selector || !account) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    setTxHash(null);
    try {
      const yocto = amountToYocto(payoutAmount);
      if (BigInt(yocto) <= 0n) throw new Error("Enter an amount above zero.");
      if (BigInt(yocto) > BigInt(row.remaining_liability)) {
        throw new Error("The amount is more than the money still set aside.");
      }
      const operationNonce = (BigInt(row.last_drawdown_nonce) + 1n).toString();
      const wallet = await selector.wallet();
      const outcome = await wallet.signAndSendTransaction({
        signerId: account.accountId,
        receiverId: FIREWALL_CONTRACT_ID,
        actions: [new Action({
          functionCall: new FunctionCall({
            methodName: "request_drawdown",
            args: new TextEncoder().encode(JSON.stringify({ id: row.id, amount: yocto, operation_nonce: operationNonce })),
            gas: 100_000_000_000_000n,
            deposit: 0n,
          }),
        })],
      });
      if (outcome?.transaction?.hash) setTxHash(outcome.transaction.hash);
      const result = getFinalValue(outcome);
      if (result === "Succeeded") {
        setMessage("Payment completed.");
        setPayoutAmount("");
      } else if (result === "Failed") {
        setMessage("The transfer did not go through. Check the payment record before trying again.");
      } else {
        setMessage("The wallet did not return a final result. Check Payment History before trying again.");
      }
      await onRefresh().catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The payment could not be requested.");
    } finally {
      setBusy(false);
    }
  }

  if (!canRelease && !canRequestPayout && !txHash && !error && !message) return null;

  return (
    <div className="commitment-actions">
      {canRelease && (
        <button className="button-secondary" onClick={() => void handleReleaseExpiry()} disabled={busy || !account}>
          {busy ? "Returning money…" : "Return unused money"}
        </button>
      )}
      {canRequestPayout && (
        <form className="payout-form" onSubmit={(e) => void handleRequestPayout(e)}>
          <label>
            Amount (up to {formatNear(row.remaining_liability)} NEAR)
            <input type="text" inputMode="decimal" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} placeholder="0.00" required />
          </label>
          <button className="button-primary" type="submit" disabled={busy || !account}>
            {busy ? "Waiting for wallet…" : "Request payment"}
          </button>
        </form>
      )}
      {error && <div className="inline-alert error-alert" role="alert">{error}</div>}
      {message && <div className="action-result" role="status">{message}</div>}
      {txHash && (
        <div className="action-result">
          <a href={`${EXPLORER_URL}/transactions/${encodeURIComponent(txHash)}`} target="_blank" rel="noreferrer">
            View transaction on NEAR Explorer ↗
          </a>
        </div>
      )}
    </div>
  );
}
