import { decimal, digest, requireValue } from './policy.ts';
import type { Policy } from './policy.ts';
import type { VerifiedRun } from './github.ts';
import type { Context } from './near.ts';

export function prepareAttestation(policy: Policy, run: VerifiedRun, context: Context, signer: string, nowNs: bigint) {
  const r = context.reservation, t = context.treasury;
  const chainNow = BigInt(decimal(context.block_timestamp_ns));
  requireValue(chainNow <= nowNs + 60_000_000_000n && nowNs <= chainNow + 60_000_000_000n, 'Local clock and testnet clock differ; check clock and retry');
  requireValue(context.contract_account_id === policy.contract_account_id, 'Policy is for a different contract');
  requireValue(signer === t.verifier_account_id, 'Signing account is not the onchain verifier');
  const policyHash = digest(policy);
  requireValue(r.evidence_policy_hash === policyHash, 'Policy hash does not match DAO-approved terms');
  requireValue(r.status === 'Active' && BigInt(decimal(r.expires_at_ns)) > nowNs && BigInt(decimal(r.expires_at_ns)) > chainNow, 'Commitment is closed or expired');
  requireValue(r.evidence === null, 'Evidence is already recorded; do not submit a duplicate attestation');
  requireValue(r.pending_amount === '0', 'Wait for the pending payment to finish');
  requireValue(run.commit_sha === policy.commit_sha && run.repository === policy.repository && run.workflow_id === policy.workflow_id, 'Evidence and policy do not match');
  const deadline = [BigInt(decimal(r.expires_at_ns)), BigInt(decimal(run.evidence_expires_at_ns)), nowNs + 1_800_000_000_000n].reduce((a, b) => a < b ? a : b);
  requireValue(deadline > nowNs + 60_000_000_000n && deadline > chainNow, 'Evidence expires too soon; no attestation prepared');
  const binding = {
    schema: 'veyntro.attestation.v1', verifier_version: '0.1.0', network: policy.network,
    contract_account_id: policy.contract_account_id, reservation_id: decimal(r.id),
    beneficiary: r.beneficiary, payout_recipient: r.payout_recipient, approved_amount: r.approved_amount,
    commitment_expires_at_ns: r.expires_at_ns, policy_hash: policyHash,
    verifier_account_id: signer, verifier_epoch: decimal(t.verifier_epoch),
    nonce: '1', valid_until_ns: deadline.toString(), github: run,
  };
  const args = { id: binding.reservation_id, evidence_digest: digest(binding), policy_hash: policyHash,
    commit_sha: policy.commit_sha, nonce: binding.nonce, valid_until_ns: binding.valid_until_ns };
  return {
    status: 'prepared_unsigned', signed_or_sent: false,
    checked_at_utc: new Date(Number(nowNs / 1_000_000n)).toISOString(),
    source_block_hash: context.block_hash, policy, binding,
    transaction: { signer_id: signer, receiver_id: policy.contract_account_id,
      method_name: 'submit_attestation', gas: '30000000000000', deposit: '0', args },
  };
}
