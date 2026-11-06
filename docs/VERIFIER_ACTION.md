# Submit checked work from GitHub Actions

This is a first step toward removing the repeated Ubuntu signing command. A repository maintainer can manually start the free GitHub Actions job. It is **not** a public evidence-request service or an automatic payment. The contract still decides if the verifier may record evidence; the beneficiary must separately sign an eligible payout.

The job reads a policy file committed on `main`, a commitment number, and a GitHub workflow run ID. It checks the real GitHub API and final NEAR testnet state, refuses an already recorded attestation, checks the signing key's onchain permission, sends exactly one zero-deposit `submit_attestation` call, and reads the final commitment state. The workflow runs only on `main`, with read-only repository access and a serial job queue.

## One-time key setup (account owner)

1. Review this draft workflow and its source. After the reviewed change is merged to `main`, create the new key **locally on your Ubuntu machine**:

   ```bash
   cd ~/Veyntro-build
   git switch main
   git pull --ff-only origin main
   npm --prefix services/verifier ci --ignore-scripts --no-audit --no-fund
   npm --prefix services/verifier run create:restricted-key
   ```

   The command prints **only the public key** and stores the private key outside the repository in `~/.near-credentials/veyntro-github-verifier/restricted-key.txt` with owner-only permissions. It refuses to replace an existing key. Do not paste the private key or recovery key into chat or a terminal screenshot. This key has no onchain rights until you add its public half to the verifier account.

2. With your existing locally authorized verifier account, grant the new **public key** exactly one function-call permission:

   ```bash
   npx near-cli-rs account add-key verifier-aje-veyntro.testnet \
     grant-function-call-access \
       --allowance '0.1 NEAR' \
       --contract-account-id firewall-aje-veyntro.testnet \
       --function-names 'submit_attestation' \
     use-manually-provided-public-key "$(cat ~/.near-credentials/veyntro-github-verifier/public-key.txt)" \
     network-config testnet sign-with-legacy-keychain send
   ```

   Review the unsigned transaction before signing. It adds a key to the **verifier account**, not to your `aje.testnet` wallet or the treasury. If your installed CLI uses a different signer option, run `npx near-cli-rs account add-key --help` and select the locally saved verifier account; never provide a private key as a command argument. Confirm the new public key has `FunctionCall` permission for only `firewall-aje-veyntro.testnet` / `submit_attestation` before installing its private half in GitHub.
3. In the GitHub repository's **Settings → Environments**, create `verifier-testnet` and restrict deployment branches to `main`. Where available, require a trusted reviewer. In that environment's **Secrets**, set `VERIFIER_FUNCTION_CALL_KEY` to the exact single-line private key from the local file. Enter it directly in GitHub's secret form; do not put it in a repository file, chat, issue, workflow input, or command line. Use an environment secret, not a repository-wide secret. Only trusted maintainers should be able to change workflows on `main`.
4. If the new key is compromised, revoke its public key onchain and remove the environment secret. The DAO can rotate the trusted verifier account through governance if necessary. Keep the existing recovery/full-access key private and separate.

## Each work check

1. Approve a new commitment through the DAO with an evidence policy hash matching a committed `evidence/*_POLICY.json` file. The policy must name a **fresh** real GitHub run and immutable commit, and the beneficiary and amount must be correct. The older commitment 3 is completed and its previous run must not be reused as new work.
2. In GitHub **Actions → Submit checked work evidence → Run workflow**, select `main` and enter the commitment number, GitHub run ID, and committed policy path. Review the fields before starting. The inputs are public in workflow metadata; never enter a key in them.
3. Wait for the job. A successful job prints a transaction hash and evidence digest, then confirms the final onchain commitment matches. If it fails or times out, inspect the onchain commitment before any retry. A missing log is not proof that no transaction was sent.
4. The beneficiary can then use the website to request a payment if the recorded work check is still usable.

## Limits

This job has no secret configured yet and no live attestation has been sent by it. It is an owner-operated bridge, not the master plan's public `/verify` flow. A public self-service request needs wallet-authenticated requests, durable job tracking, rate limits, a policy registry, and status that survives restarts. Do not show a public evidence button until those controls and a live end-to-end run exist. Standard GitHub-hosted runners for a public repository are free under GitHub's current terms; check usage and terms before relying on this for sustained service.
