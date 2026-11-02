import { readFile, writeFile, unlink } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { parsePolicy, decimal, requireValue } from './policy.ts';
import { readContext } from './near.ts';
import { checkGitHub } from './github.ts';
import { prepareAttestation } from './prepare.ts';

try {
  const { values } = parseArgs({ options: {
    policy: { type: 'string' }, reservation: { type: 'string' }, run: { type: 'string' },
    signer: { type: 'string' }, out: { type: 'string' },
  }, strict: true, allowPositionals: false });
  requireValue(values.policy && values.reservation && values.run && values.signer && values.out,
    'Use --policy FILE --reservation ID --run ID --signer ACCOUNT --out FILE');
  const [major, minor] = process.versions.node.split('.').map(Number);
  requireValue(major === 24 && minor !== undefined && minor >= 12, 'Use Node.js 24 LTS, version 24.12 or newer');
  const policy = parsePolicy(JSON.parse(await readFile(values.policy, 'utf8')));
  const runId = Number(decimal(values.run));
  requireValue(Number.isSafeInteger(runId) && runId > 0, 'Invalid workflow run ID');
  // Reserve the output path before network checks. Never overwrite a prior prepared/signed record.
  await writeFile(values.out, '', { flag: 'wx', mode: 0o600 });
  try {
    const context = await readContext(policy.contract_account_id, decimal(values.reservation));
    const run = await checkGitHub(policy, runId, BigInt(Date.now()) * 1_000_000n);
    const prepared = prepareAttestation(policy, run, context, values.signer, BigInt(Date.now()) * 1_000_000n);
    await writeFile(values.out, JSON.stringify(prepared, null, 2) + '\n');
    console.log(JSON.stringify({ status: prepared.status, signed_or_sent: false, output_file: values.out,
      evidence_digest: prepared.transaction.args.evidence_digest, valid_until_ns: prepared.transaction.args.valid_until_ns }));
  } catch (error) {
    await unlink(values.out);
    throw error;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Verification failed');
  process.exitCode = 1;
}
