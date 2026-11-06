import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { requireAttestationKey } from '../src/restricted-key.ts';

const contract = 'firewall-aje-veyntro.testnet';
test('only an exact method-scoped key is accepted', () => {
  assert.doesNotThrow(() => requireAttestationKey({ FunctionCall: { receiver_id: contract,
    method_names: ['submit_attestation'], allowance: null } }, contract));
  for (const permission of ['FullAccess',
    { FunctionCall: { receiver_id: 'other.testnet', method_names: ['submit_attestation'] } },
    { FunctionCall: { receiver_id: contract, method_names: [] } },
    { FunctionCall: { receiver_id: contract, method_names: ['submit_attestation', 'withdraw_available'] } },
  ]) assert.throws(() => requireAttestationKey(permission, contract));
});
