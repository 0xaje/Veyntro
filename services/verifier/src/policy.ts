import { createHash } from 'node:crypto';

export function requireValue(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function record(value: unknown): Record<string, unknown> {
  requireValue(value !== null && typeof value === 'object' && !Array.isArray(value), 'Expected an object');
  return value as Record<string, unknown>;
}

export function decimal(value: unknown): string {
  requireValue(typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value), 'Expected an integer string');
  requireValue(BigInt(value) <= 18_446_744_073_709_551_615n, 'Integer exceeds u64');
  return value;
}

export function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object') {
    const object = record(value);
    return '{' + Object.keys(object).sort().map(key => JSON.stringify(key) + ':' + canonical(object[key])).join(',') + '}';
  }
  requireValue(value === null || ['string', 'boolean'].includes(typeof value) ||
    (typeof value === 'number' && Number.isSafeInteger(value)), 'Unsupported digest value');
  return JSON.stringify(value);
}

export function digest(value: unknown): string {
  return createHash('sha256').update(canonical(value)).digest('hex');
}

export interface Policy {
  schema: 'veyntro.github-ci.v1'; network: 'testnet'; contract_account_id: string;
  repository: string; commit_sha: string; workflow_id: number; workflow_path: string;
  event: 'push'; branch: string; conclusion: 'success'; allow_forks: false;
  max_run_age_seconds: number;
}

const keys = ['schema', 'network', 'contract_account_id', 'repository', 'commit_sha',
  'workflow_id', 'workflow_path', 'event', 'branch', 'conclusion', 'allow_forks', 'max_run_age_seconds'];

export function parsePolicy(value: unknown): Policy {
  const p = record(value);
  requireValue(Object.keys(p).sort().join(',') === [...keys].sort().join(','), 'Unsupported policy fields');
  requireValue(p.schema === 'veyntro.github-ci.v1' && p.network === 'testnet', 'Unsupported policy version or network');
  requireValue(typeof p.contract_account_id === 'string' && /^[a-z0-9_-]+(?:\.[a-z0-9_-]+)*\.testnet$/.test(p.contract_account_id), 'Invalid testnet contract');
  requireValue(typeof p.repository === 'string' && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(p.repository), 'Invalid repository');
  requireValue(typeof p.commit_sha === 'string' && /^[0-9a-f]{40}$/.test(p.commit_sha) && !/^0+$/.test(p.commit_sha), 'Use a full commit SHA');
  requireValue(Number.isSafeInteger(p.workflow_id) && Number(p.workflow_id) > 0, 'Invalid workflow ID');
  requireValue(typeof p.workflow_path === 'string' && /^\.github\/workflows\/[A-Za-z0-9_.-]+\.ya?ml$/.test(p.workflow_path), 'Invalid workflow path');
  requireValue(p.event === 'push' && p.conclusion === 'success' && p.allow_forks === false, 'Unsupported evidence rules');
  requireValue(typeof p.branch === 'string' && p.branch.length > 0 && p.branch.length <= 255, 'Invalid branch');
  requireValue(Number.isSafeInteger(p.max_run_age_seconds) && Number(p.max_run_age_seconds) > 0 && Number(p.max_run_age_seconds) <= 604800, 'Evidence age must be at most seven days');
  return p as unknown as Policy;
}
