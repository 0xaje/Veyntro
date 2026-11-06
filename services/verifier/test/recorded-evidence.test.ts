import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { requireRecordedEvidence } from '../src/recorded-evidence.ts';

const expected = { evidence_digest: 'ab', commit_sha: 'cd', nonce: '1', valid_until_ns: '123' };
const evidence = { ...expected, verifier_epoch: '0', usable: true };

test('requires a usable final record from the same verifier epoch', () => {
  assert.doesNotThrow(() => requireRecordedEvidence({ evidence }, expected, '0'));
  for (const changed of [
    { ...evidence, evidence_digest: 'other' },
    { ...evidence, valid_until_ns: '124' },
    { ...evidence, verifier_epoch: '1' },
    { ...evidence, usable: false },
  ]) assert.throws(() => requireRecordedEvidence({ evidence: changed }, expected, '0'));
});
