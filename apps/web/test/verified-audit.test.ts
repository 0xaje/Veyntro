import assert from "node:assert/strict";
import { test } from "node:test";
import { verifiedPaymentTransaction, verifiedWorkCheck } from "../src/near/verified-audit.ts";
import type { Reservation, TreasuryOperation } from "../src/near/rpc.ts";

test("only the exact settled payment gets the checked transaction link", () => {
  const payment = {
    id: "6", kind: "Payout", reservation_id: "4", amount: "50000000000000000000000",
    recipient: "aje.testnet", status: "Succeeded", created_at_ns: "0", completed_at_ns: "0",
  } satisfies TreasuryOperation;
  assert.equal(verifiedPaymentTransaction(payment), "4WDbT9xDxNgJVgGcgeSwcTex7GGrmT2U3tsLPH94jKex");
  assert.equal(verifiedPaymentTransaction({ ...payment, status: "Pending" }), null);
  assert.equal(verifiedPaymentTransaction({ ...payment, amount: "100000000000000000000000" }), null);
  assert.equal(verifiedPaymentTransaction({ ...payment, recipient: "someone.testnet" }), null);
  assert.equal(verifiedPaymentTransaction(payment, "another-firewall.testnet"), null);
});

test("work-check links require the approved policy and matching checked commit", () => {
  const row = {
    id: "4", beneficiary: "aje.testnet", payout_recipient: "aje.testnet",
    evidence_policy_hash: "1fdae61d1021131076f964a6083bf99f4fc033ba02a4436812c48e9f9f78b959",
    evidence: { usable: false, commit_sha: "ed4c4a664a0c0f0a40b8f5dced81290858881a63", valid_until_ns: "0" },
  } as Reservation;
  assert.equal(verifiedWorkCheck(row)?.run, "https://github.com/0xaje/Veyntro/actions/runs/42136893325");
  assert.equal(verifiedWorkCheck({ ...row, evidence_policy_hash: "wrong" }), null);
  assert.equal(verifiedWorkCheck({ ...row, evidence: null }), null);
  assert.equal(verifiedWorkCheck(row, "another-firewall.testnet"), null);
});
