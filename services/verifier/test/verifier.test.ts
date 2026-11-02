import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parsePolicy, digest, canonical } from '../src/policy.ts';
import { validateRun } from '../src/github.ts';
import { prepareAttestation } from '../src/prepare.ts';
import type { Context } from '../src/near.ts';

// These are saved public API/RPC responses, not substitutes for the live integration check.
const read = (path: string) => JSON.parse(readFileSync(new URL('../../../evidence/' + path, import.meta.url), 'utf8'));
const policy = parsePolicy(read('FIRST_COMMITMENT_POLICY.json'));
const original = read('GITHUB_RUN_API.json');
const context: Context = read('VERIFIER_CONTEXT.json');
const now = BigInt(context.block_timestamp_ns) + 1_000_000_000n;
const signer = 'verifier-aje-veyntro.testnet';
const run = () => validateRun(policy, 41525421351, structuredClone(original), now);

test('policy digest matches the exact DAO-approved onchain hash', () => {
  assert.equal(digest(policy), '22941ad52c55ba33751c7e27e8738948dc0bf08fae6e708d21b6b661ccc09048');
  assert.equal(canonical(policy), canonical(JSON.parse(canonical(policy))));
});

test('saved genuine run prepares an unsigned commitment-bound attestation', () => {
  const result = prepareAttestation(policy, run(), context, signer, now);
  assert.equal(result.status, 'prepared_unsigned');
  assert.equal(result.signed_or_sent, false);
  assert.equal(result.transaction.args.id, '0');
  assert.equal(result.transaction.args.nonce, '1');
  assert.equal(result.transaction.signer_id, signer);
  assert.equal(result.transaction.receiver_id, policy.contract_account_id);
  assert.equal(result.transaction.args.evidence_digest, digest(result.binding));
  assert.ok(BigInt(result.transaction.args.valid_until_ns) <= BigInt(run().evidence_expires_at_ns));
});

const invalidRuns: [string, (r: typeof original) => void][] = [
  ['wrong repository', r => { r.repository.full_name = 'another/project'; }],
  ['fork source', r => { r.head_repository.fork = true; }],
  ['different head repository', r => { r.head_repository.id++; }],
  ['wrong SHA', r => { r.head_sha = 'a'.repeat(40); }],
  ['mismatched commit', r => { r.head_commit.id = 'a'.repeat(40); }],
  ['wrong workflow', r => { r.workflow_id++; }],
  ['wrong workflow path', r => { r.path = '.github/workflows/other.yml'; }],
  ['wrong branch', r => { r.head_branch = 'other'; }],
  ['pull request event', r => { r.event = 'pull_request'; }],
  ['failed CI', r => { r.conclusion = 'failure'; }],
  ['pending run', r => { r.status = 'in_progress'; }],
  ['forged passed flag', r => { r.conclusion = 'failure'; r.passed = true; }],
  ['wrong run ID', r => { r.id++; }],
  ['source URL mismatch', r => { r.html_url = 'https://example.com'; }],
  ['future run', r => { r.updated_at = '2099-01-01T00:00:00Z'; }],
  ['stale run', r => { r.created_at = '2020-01-01T00:00:00Z'; }],
];
for (const [name, change] of invalidRuns) test('rejects ' + name, () => {
  const copy = structuredClone(original); change(copy);
  assert.throws(() => validateRun(policy, 41525421351, copy, now));
});

const invalidContexts: [string, (c: Context) => void][] = [
  ['policy mismatch', c => { c.reservation.evidence_policy_hash = 'a'.repeat(64); }],
  ['other contract', c => { c.contract_account_id = 'other.testnet'; }],
  ['wrong verifier', c => { c.treasury.verifier_account_id = 'other.testnet'; }],
  ['expired commitment', c => { c.reservation.expires_at_ns = '1'; }],
  ['cancelled commitment', c => { c.reservation.status = 'Cancelled'; }],
  ['duplicate attestation', c => { c.reservation.evidence = { nonce: '1' }; }],
  ['pending payment', c => { c.reservation.pending_amount = '1'; }],
  ['stale chain snapshot', c => { c.block_timestamp_ns = '1'; }],
];
for (const [name, change] of invalidContexts) test('rejects ' + name, () => {
  const copy = structuredClone(context); change(copy);
  assert.throws(() => prepareAttestation(policy, run(), copy, signer, now));
});

test('digest changes across reservation IDs and verifier epochs', () => {
  const first = prepareAttestation(policy, run(), context, signer, now);
  const other = structuredClone(context); other.reservation.id = '1';
  assert.notEqual(prepareAttestation(policy, run(), other, signer, now).transaction.args.evidence_digest,
    first.transaction.args.evidence_digest);
  other.reservation.id = '0'; other.treasury.verifier_epoch = '1';
  assert.notEqual(prepareAttestation(policy, run(), other, signer, now).transaction.args.evidence_digest,
    first.transaction.args.evidence_digest);
});

test('rejects unknown policy fields and client-supplied pass flags', () => {
  assert.throws(() => parsePolicy({ ...policy, passed: true }));
  assert.throws(() => parsePolicy({ ...policy, allow_forks: true }));
});
