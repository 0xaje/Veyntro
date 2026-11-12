import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { digest, parseWorkPolicy, prepareWorkCheck, validateRun } from "../src/near/browser-evidence.ts";

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`../../../evidence/${name}`, import.meta.url), "utf8"));
}

test("browser work-check code matches the existing verifier's DAO-approved hash", async () => {
  const policy = parseWorkPolicy(fixture("FIRST_COMMITMENT_POLICY.json"));
  assert.equal(await digest(policy), "22941ad52c55ba33751c7e27e8738948dc0bf08fae6e708d21b6b661ccc09048");
});

test("a wrong workflow or repository cannot produce a signed work-check request", () => {
  const policy = parseWorkPolicy(fixture("FIRST_COMMITMENT_POLICY.json"));
  const run = fixture("GITHUB_RUN_API.json") as Record<string, unknown>;
  const now = BigInt(Date.parse("2026-11-02T21:12:00Z")) * 1_000_000n;
  assert.equal(validateRun(policy, 41525421351, run, now).commit_sha, policy.commit_sha);
  assert.throws(() => validateRun(policy, 41525421351, { ...run, workflow_id: 1 }, now));
  assert.throws(() => validateRun(policy, 41525421351, { ...run, head_repository: { id: 1, full_name: "other/repo", fork: true } }, now));
});

test("only the chosen checker can prepare evidence for the approved commitment", async () => {
  const policy = parseWorkPolicy(fixture("FIRST_COMMITMENT_POLICY.json"));
  const raw = fixture("VERIFIER_CONTEXT.json") as Record<string, unknown>;
  const context = {
    blockHash: raw.block_hash as string, timestampNs: raw.block_timestamp_ns as string,
    contract: raw.contract_account_id as string, treasury: raw.treasury as Record<string, unknown>,
    commitment: raw.reservation as Record<string, unknown>,
  };
  const now = BigInt(Date.parse("2026-11-02T21:46:10Z")) * 1_000_000n;
  const run = validateRun(policy, 41525421351, fixture("GITHUB_RUN_API.json"), now);
  const preparedAt = BigInt(Date.parse("2026-11-02T21:46:14.861Z")) * 1_000_000n;
  const prepared = await prepareWorkCheck(policy, run, context, "verifier-aje-veyntro.testnet", preparedAt);
  const old = fixture("FIRST_ATTESTATION_PREPARED.json") as { transaction: { args: unknown } };
  assert.deepEqual(prepared.args, old.transaction.args);
  await assert.rejects(prepareWorkCheck(policy, run, context, "other.testnet", now));
  await assert.rejects(prepareWorkCheck(policy, run, { ...context, commitment: { ...context.commitment, evidence_policy_hash: "0".repeat(64) } },
    "verifier-aje-veyntro.testnet", now));
  const expired = { ...context, commitment: { ...context.commitment, evidence: { nonce: "1", usable: false } } };
  assert.equal((await prepareWorkCheck(policy, run, expired, "verifier-aje-veyntro.testnet", preparedAt)).args.nonce, "2");
  await assert.rejects(prepareWorkCheck(policy, run, { ...context, commitment: { ...context.commitment, evidence: { nonce: "1", usable: true } } },
    "verifier-aje-veyntro.testnet", preparedAt));
});
