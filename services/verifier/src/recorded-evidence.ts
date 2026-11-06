import { decimal, record, requireValue } from './policy.ts';

export function requireRecordedEvidence(
  reservation: Record<string, unknown>,
  expected: { evidence_digest: string; commit_sha: string; nonce: string; valid_until_ns: string },
  verifierEpoch: string,
): void {
  const evidence = record(reservation.evidence);
  requireValue(
    evidence.evidence_digest === expected.evidence_digest &&
    evidence.commit_sha === expected.commit_sha &&
    evidence.nonce === expected.nonce &&
    evidence.valid_until_ns === expected.valid_until_ns &&
    decimal(evidence.verifier_epoch) === verifierEpoch &&
    evidence.usable === true,
    'Final onchain evidence is missing, changed, or no longer usable',
  );
}
