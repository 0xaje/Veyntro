# GitHub evidence verifier

This command checks a real public GitHub Actions run and prepares an unsigned NEAR testnet attestation. It reads no NEAR credentials and cannot sign or send transactions. The configured verifier account signs locally through NEAR CLI. No public HTTP endpoint or automatic signing is implemented yet.

Use Node.js 24 LTS (24.12 or newer). Runtime uses Node's built-in TypeScript support; type checking uses the pinned development dependencies and lockfile.

From the repository root:

```bash
npm --prefix services/verifier ci --ignore-scripts --no-audit --no-fund
npm --prefix services/verifier run check
npm --prefix services/verifier test
node services/verifier/src/cli.ts \
  --policy evidence/FIRST_COMMITMENT_POLICY.json \
  --reservation 0 --run 41525421351 \
  --signer verifier-aje-veyntro.testnet \
  --out /tmp/veyntro-attestation-$(date +%s).json
```

The output file must not already exist. Preparation fails closed on RPC/API errors, mismatched evidence, an incorrect policy digest, a closed/expired commitment, a different verifier, existing evidence or stale local/chain clocks. Preparation does not claim onchain success. Regenerate if its deadline passes. Never sign the historical prepared example stored in evidence/.

## What is checked

- The policy's SHA256 matches the immutable onchain policy hash. Canonical encoding recursively sorts object keys with compact JSON, without a trailing newline. Version 1 policy values are flat strings, safe integers and booleans.
- The actual GitHub API response matches repository and repository identity, no fork, full commit SHA, workflow ID/path, push event, branch, completed/success state, run ID/attempt, source URL and evidence age. A submitted `passed=true` is never an input.
- State views come from the same final NEAR block. An attestation digest binds network, contract, commitment ID, beneficiary, fixed recipient, approved amount, policy, verifier/epoch, nonce, deadline and checked GitHub metadata.
- Evidence is valid for at most 30 minutes and never beyond the commitment or original run's policy age. Run age uses created_at so rerunning old work cannot reset its age.
- The first attestation uses nonce 1. Existing attestations are refused rather than silently renewed. Onchain nonce checks reject duplicate submissions; payment nonces remain separate.

GitHub REST API version 2026-03-10 was checked against official docs and the live endpoint. Public runs need no token. Optional GITHUB_TOKEN can raise free API rate limits; it is sent only to api.github.com, redirects are refused, and failure responses are not logged.

## Signing and trust

Inspect the prepared file's transaction signer, receiver and args. Only sign it with the configured verifier's locally saved key. Use submit_attestation with 30 Tgas and zero attached NEAR. Afterwards independently verify final receipts, evidence_checked event and get_reservation before requesting payment. Merely preparing or sending an attestation is not evidence of its acceptance.

The DAO trusts the verifier key and can replace it through set_verifier. GitHub repository owners control their workflows; successful CI is not independent proof of useful work or business quality. The verifier validates the DAO-approved narrow CI condition, not arbitrary descriptions. FullAccess account keys and contract upgrade custody are still testnet trust assumptions. The preparation command neither creates scoped keys nor makes custody trustless.

## Remaining product work

Hosted request authentication, beneficiary request authorization, rate limiting, durable request records, verifier key custody/scoped signing and public submission UI remain unfinished. Do not expose this CLI as an unauthenticated signing service. A future server must validate policy independently, preserve the same checks and bind authenticated requests to their onchain beneficiary. No database may replace onchain financial state.

Tests use saved real public API/RPC responses and deliberately changed copies for adversarial checks. Those tests are distinct from live API verification and never represent invented blockchain transactions.

Sources: https://docs.github.com/en/rest/actions/workflow-runs#get-a-workflow-run and https://nodejs.org/docs/latest-v24.x/api/typescript.html.
