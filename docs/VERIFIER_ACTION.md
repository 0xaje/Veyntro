# Submit checked work from GitHub Actions

This is a first step toward removing the repeated Ubuntu signing command. A repository maintainer can manually start the free GitHub Actions job. It is **not** a public evidence-request service or an automatic payment. The contract still decides if the verifier may record evidence; the beneficiary must separately sign an eligible payout.

The job reads a policy file committed on `main`, a commitment number, and a GitHub workflow run ID. It checks the real GitHub API and final NEAR testnet state, refuses an already recorded attestation, checks the signing key's onchain permission, sends exactly one zero-deposit `submit_attestation` call, and reads the final commitment state. The workflow runs only on `main`, with read-only repository access and a serial job queue.

## One-time key setup (account owner)

1. Generate a **new** NEAR testnet key pair privately. Add its public key to `verifier-aje-veyntro.testnet` as a **FunctionCall** key restricted to receiver `firewall-aje-veyntro.testnet` and exactly the method `submit_attestation`. Allow enough testnet NEAR for its gas. Keep the existing account recovery/full-access key private and separate. Do not paste either key into a chat, web app, repository file, or action input.
2. In the GitHub repository's **Settings → Environments**, create `verifier-testnet` and restrict deployment branches to `main`. Where available, require a trusted reviewer. In that environment's **Secrets**, set `VERIFIER_FUNCTION_CALL_KEY` to the new restricted key. Do not use a repository-wide secret or the existing full-access key. Only trusted maintainers should be able to change workflows on `main`.
3. Review the workflow and source on `main` before adding the secret. If the account/key is compromised, revoke this exact access key onchain and remove the environment secret. The DAO can rotate the trusted verifier account through governance if necessary.

## Each work check

1. Approve a new commitment through the DAO with an evidence policy hash matching a committed `evidence/*_POLICY.json` file. The policy must name a **fresh** real GitHub run and immutable commit, and the beneficiary and amount must be correct. The older commitment 3 is completed and its previous run must not be reused as new work.
2. In GitHub **Actions → Submit checked work evidence → Run workflow**, select `main` and enter the commitment number, GitHub run ID, and committed policy path. Review the fields before starting. The inputs are public in workflow metadata; never enter a key in them.
3. Wait for the job. A successful job prints a transaction hash and evidence digest, then confirms the final onchain commitment matches. If it fails or times out, inspect the onchain commitment before any retry. A missing log is not proof that no transaction was sent.
4. The beneficiary can then use the website to request a payment if the recorded work check is still usable.

## Limits

This job has no secret configured yet and no live attestation has been sent by it. It is an owner-operated bridge, not the master plan's public `/verify` flow. A public self-service request needs wallet-authenticated requests, durable job tracking, rate limits, a policy registry, and status that survives restarts. Do not show a public evidence button until those controls and a live end-to-end run exist. Standard GitHub-hosted runners for a public repository are free under GitHub's current terms; check usage and terms before relying on this for sustained service.
