import { decimal, record, requireValue } from './policy.ts';

export async function rpc(method: string, params: unknown): Promise<Record<string, unknown>> {
  const response = await fetch('https://rpc.testnet.near.org', {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20_000),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 'veyntro-verifier', method, params }),
  });
  requireValue(response.ok, `Testnet request failed (${response.status})`);
  const body = record(await response.json());
  requireValue(!body.error, 'Testnet request failed; no evidence was approved');
  return record(body.result);
}

async function view(account: string, method: string, args: unknown, blockHash: string): Promise<unknown> {
  const result = await rpc('query', {
    request_type: 'call_function', account_id: account, method_name: method,
    args_base64: Buffer.from(JSON.stringify(args)).toString('base64'), block_id: blockHash,
  });
  requireValue(Array.isArray(result.result) && result.result.every(x => Number.isInteger(x) && x >= 0 && x <= 255), 'Invalid view response');
  return JSON.parse(Buffer.from(result.result).toString('utf8'));
}

export interface Context {
  block_hash: string; block_timestamp_ns: string; contract_account_id: string;
  treasury: Record<string, unknown>; reservation: Record<string, unknown>;
}

export async function readContext(contract: string, id: string): Promise<Context> {
  decimal(id);
  const block = await rpc('block', { finality: 'final' });
  const header = record(block.header);
  requireValue(typeof header.hash === 'string', 'Missing final block hash');
  const timestamp = decimal(header.timestamp_nanosec);
  const [treasury, reservation] = await Promise.all([
    view(contract, 'get_treasury_state', {}, header.hash),
    view(contract, 'get_reservation', { id }, header.hash),
  ]);
  requireValue(reservation !== null, 'Commitment was not found');
  requireValue(record(reservation).id === id, 'Commitment ID does not match');
  return { block_hash: header.hash, block_timestamp_ns: timestamp, contract_account_id: contract,
    treasury: record(treasury), reservation: record(reservation) };
}
