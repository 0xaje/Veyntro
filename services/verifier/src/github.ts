import { record, requireValue } from './policy.ts';
import type { Policy } from './policy.ts';

export async function githubGet(path: string): Promise<unknown> {
  const response = await fetch('https://api.github.com' + path, {
    redirect: 'error', signal: AbortSignal.timeout(20_000),
    headers: {
      Accept: 'application/vnd.github+json', 'User-Agent': 'Veyntro-verifier/0.1.0',
      'X-GitHub-Api-Version': '2026-03-10',
      ...(process.env.GITHUB_TOKEN ? { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN } : {}),
    },
  });
  // Never log response bodies or authorization headers on failure.
  requireValue(response.ok, `GitHub request failed (${response.status}); no evidence was approved`);
  return response.json();
}

export interface VerifiedRun {
  run_id: number; run_attempt: number; repository_id: number; repository: string;
  commit_sha: string; workflow_id: number; workflow_path: string; event: string;
  branch: string; conclusion: 'success'; created_at: string; updated_at: string;
  html_url: string; evidence_expires_at_ns: string;
}

export function validateRun(policy: Policy, runId: number, input: unknown, nowNs: bigint): VerifiedRun {
  const r = record(input), repo = record(r.repository), head = record(r.head_repository);
  const commit = record(r.head_commit);
  requireValue(r.id === runId && Number.isSafeInteger(runId) && runId > 0, 'Workflow run ID does not match');
  requireValue(repo.full_name === policy.repository && head.full_name === policy.repository &&
    repo.id === head.id && repo.fork === false && head.fork === false, 'Repository or fork does not match');
  requireValue(Number.isSafeInteger(repo.id) && Number(repo.id) > 0, 'Missing repository identity');
  requireValue(r.head_sha === policy.commit_sha && commit.id === policy.commit_sha, 'Commit SHA does not match');
  requireValue(r.workflow_id === policy.workflow_id && r.path === policy.workflow_path, 'Workflow does not match');
  requireValue(r.event === policy.event && r.head_branch === policy.branch, 'Workflow event or branch does not match');
  requireValue(r.status === 'completed' && r.conclusion === 'success', 'Workflow has not completed successfully');
  requireValue(Number.isSafeInteger(r.run_attempt) && Number(r.run_attempt) > 0, 'Missing run attempt');
  const url = `https://github.com/${policy.repository}/actions/runs/${runId}`;
  requireValue(r.html_url === url, 'Workflow source URL does not match');
  requireValue(typeof r.created_at === 'string' && typeof r.updated_at === 'string', 'Missing workflow times');
  const createdMs = Date.parse(r.created_at), updatedMs = Date.parse(r.updated_at);
  requireValue(Number.isFinite(createdMs) && Number.isFinite(updatedMs) && updatedMs >= createdMs, 'Invalid workflow times');
  const created = BigInt(createdMs) * 1_000_000n, updated = BigInt(updatedMs) * 1_000_000n;
  requireValue(created <= nowNs && updated <= nowNs, 'Workflow time is in the future');
  const expires = created + BigInt(policy.max_run_age_seconds) * 1_000_000_000n;
  requireValue(nowNs < expires, 'Workflow evidence is too old');
  return {
    run_id: runId, run_attempt: Number(r.run_attempt), repository_id: Number(repo.id),
    repository: policy.repository, commit_sha: policy.commit_sha, workflow_id: policy.workflow_id,
    workflow_path: policy.workflow_path, event: policy.event, branch: policy.branch,
    conclusion: 'success', created_at: r.created_at, updated_at: r.updated_at, html_url: url,
    evidence_expires_at_ns: expires.toString(),
  };
}

export async function checkGitHub(policy: Policy, runId: number, nowNs: bigint): Promise<VerifiedRun> {
  const repo = policy.repository.split('/').map(encodeURIComponent).join('/');
  return validateRun(policy, runId, await githubGet(`/repos/${repo}/actions/runs/${runId}`), nowNs);
}
