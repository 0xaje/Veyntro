import { record, requireValue } from './policy.ts';

export function requireAttestationKey(permission: unknown, contract: string): void {
  const value = record(permission);
  const call = record(value.FunctionCall);
  requireValue(call.receiver_id === contract && Array.isArray(call.method_names) &&
    call.method_names.length === 1 && call.method_names[0] === 'submit_attestation',
    'Verifier key must only call submit_attestation on the configured contract');
}
