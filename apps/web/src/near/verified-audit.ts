import type { Reservation, TreasuryOperation } from "./rpc";
const AUDITED_FIREWALL = "firewall-aje-veyntro.testnet";

// Independently checked testnet receipts. Match the onchain record before
// showing a curated link; future operations need their own verified entry.
export function verifiedPaymentTransaction(operation: TreasuryOperation, firewall = AUDITED_FIREWALL): string | null {
  if (firewall !== AUDITED_FIREWALL) return null;
  if (operation.id === "6" && operation.kind === "Payout" &&
      operation.reservation_id === "4" && operation.amount === "50000000000000000000000" &&
      operation.recipient === "aje.testnet" && operation.status === "Succeeded") {
    return "4WDbT9xDxNgJVgGcgeSwcTex7GGrmT2U3tsLPH94jKex";
  }
  return null;
}

export function verifiedWorkCheck(row: Reservation, firewall = AUDITED_FIREWALL): { run: string; submission: string } | null {
  if (firewall !== AUDITED_FIREWALL) return null;
  if (row.id === "4" && row.beneficiary === "aje.testnet" &&
      row.payout_recipient === "aje.testnet" &&
      row.evidence_policy_hash === "1fdae61d1021131076f964a6083bf99f4fc033ba02a4436812c48e9f9f78b959" &&
      row.evidence?.commit_sha === "ed4c4a664a0c0f0a40b8f5dced81290858881a63") {
    return {
      run: "https://github.com/0xaje/Veyntro/actions/runs/42136893325",
      submission: "https://explorer.testnet.near.org/transactions/23i8gXtwRgN7oqMF3HT1xHgn8PaewqrvDqWh2UuGG2Br",
    };
  }
  return null;
}
