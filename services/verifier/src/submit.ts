import { readFile } from 'node:fs/promises';
import { Account, JsonRpcProvider, KeyPair, type KeyPairString } from 'near-api-js';
import { parsePolicy, decimal, record, requireValue } from './policy.ts';
import { readContext } from './near.ts';
import { checkGitHub } from './github.ts';
import { prepareAttestation } from './prepare.ts';
import { normalizeRestrictedSecret, requireAttestationKey } from './restricted-key.ts';
import { requireRecordedEvidence } from './recorded-evidence.ts';

// Run only from the protected, manually dispatched workflow on main.
// Never print the secret or the SDK error object, which may carry request details.
let stage = 'input validation';
try {
  requireValue(process.env.GITHUB_REF === 'refs/heads/main' && process.env.GITHUB_EVENT_NAME === 'workflow_dispatch',
    'Only a manual run on main may submit evidence');
  const id = decimal(process.env.RESERVATION_ID);
  const runId = Number(decimal(process.env.WORKFLOW_RUN_ID));
  requireValue(Number.isSafeInteger(runId) && runId > 0, 'Invalid workflow run ID');
  const policyFile = process.env.POLICY_FILE;
  requireValue(typeof policyFile === 'string' && /^evidence\/[A-Z0-9_]+_POLICY\.json$/.test(policyFile),
    'Choose a committed evidence policy file');
  const policy = parsePolicy(JSON.parse(await readFile(policyFile, 'utf8')));
  const secret = normalizeRestrictedSecret(process.env.VERIFIER_FUNCTION_CALL_KEY);
  stage = 'initial onchain read';
  const context = await readContext(policy.contract_account_id, id);
  const signerId = context.treasury.verifier_account_id;
  requireValue(typeof signerId === 'string' && signerId.endsWith('.testnet'), 'Invalid onchain verifier');
  stage = 'GitHub run check';
  const run = await checkGitHub(policy, runId, BigInt(Date.now()) * 1_000_000n);
  prepareAttestation(policy, run, context, signerId, BigInt(Date.now()) * 1_000_000n);

  stage = 'restricted key permission check';
  const keyPair = KeyPair.fromString(secret as KeyPairString);
  const account = new Account(signerId, new JsonRpcProvider({ url: 'https://rpc.testnet.near.org' }), secret as KeyPairString);
  const accessKey = await account.getAccessKey(keyPair.getPublicKey().toString());
  requireAttestationKey(accessKey.permission, policy.contract_account_id);

  // Re-read onchain state immediately before signing; the contract also rejects stale/duplicate attestations.
  stage = 'final onchain recheck';
  const fresh = await readContext(policy.contract_account_id, id);
  requireValue(fresh.reservation.evidence === null && fresh.reservation.status === 'Active' &&
    fresh.treasury.verifier_epoch === context.treasury.verifier_epoch,
    'Commitment or verifier changed; no transaction sent');
  const prepared = prepareAttestation(policy, run, fresh, signerId, BigInt(Date.now()) * 1_000_000n);
  stage = 'attestation transaction';
  const outcome = await account.callFunctionRaw({
    contractId: policy.contract_account_id, methodName: 'submit_attestation',
    args: prepared.transaction.args, gas: 30_000_000_000_000n, deposit: 0n,
    waitUntil: 'FINAL',
  });
  const status = record(outcome.status);
  requireValue(typeof status.SuccessValue === 'string', 'Attestation transaction did not finish successfully');
  stage = 'final evidence confirmation';
  const final = await readContext(policy.contract_account_id, id);
  requireRecordedEvidence(final.reservation, prepared.transaction.args, decimal(fresh.treasury.verifier_epoch));
  const evidence = record(final.reservation.evidence);
  console.log(JSON.stringify({ status: 'verified_onchain', reservation_id: id, run_id: runId,
    transaction_hash: outcome.transaction.hash, evidence_digest: evidence.evidence_digest,
    evidence_usable: evidence.usable }));
} catch {
  console.error(`Evidence submission stopped at ${stage}. Inspect the onchain commitment before retrying. No key or error details were logged.`);
  process.exitCode = 1;
}
