# Development setup

Veyntro is a working, single-DAO application on NEAR testnet. The public web app is at https://veyntro-web.onrender.com/ and the repository's README contains the shortest judge walkthrough. This page covers local development; it does not create a second DAO or deploy to mainnet.

## Web app

Use Node.js 24.12+ within major version 24. The root .nvmrc selects 24.22.1.

```bash
npm --prefix apps/web ci
npm --prefix apps/web run check
npm --prefix apps/web run test
npm --prefix apps/web run build
npm --prefix apps/web run dev -- --host 127.0.0.1
```

Open the Vite URL printed by the last command. Public treasury pages use the deployed NEAR testnet accounts by default. A wallet is needed only for signed actions; the contract enforces permissions. See the README and JUDGES.md for the current accounts and transaction evidence.

## Contracts and verifier

`bash scripts/build-firewall.sh` and `bash scripts/build-receiver.sh` run the pinned Rust checks and build WASM artifacts. They do not deploy contracts or sign transactions. Read docs/FIREWALL_API.md and docs/FIREWALL_ACCOUNTING.md before changing any accounting or permissions.

The GitHub evidence flow is an operator-started Actions workflow with a restricted function-call key. It is not a public self-service verifier. See docs/VERIFIER_ACTION.md for its configuration and trust limits. Never put a seed phrase, private key, or GitHub Actions secret in the frontend or repository.

The older preflight and Phase 0 reports in evidence/ record earlier setup checks. They are historical; current deployment and testnet receipts are summarized in README.md, JUDGES.md, and docs/PROGRESS.md.
