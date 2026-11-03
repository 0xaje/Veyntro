# Veyntro

**Every commitment accounted for.**

Veyntro helps DAOs and communities set money aside for approved work without promising the same funds twice. The Commitment Firewall checks each new commitment against the treasury's existing obligations and pending payments.

**The problem:** a treasury can show 10 NEAR while 8 NEAR is already promised to ongoing work. Another 4 NEAR promise would overbook the same money. Veyntro shows only 2 NEAR available and rejects the extra promise in the contract. A DAO approves the work, a fixed amount is set aside, a chosen work check is recorded, and the beneficiary can request a payment within that limit. Unused money becomes available again after expiry.

**Try it:** [Open the live testnet app](https://veyntro-web.onrender.com/), read the public treasury without connecting, review the [DAO requests](https://veyntro-web.onrender.com/governance), then inspect [a completed commitment](https://veyntro-web.onrender.com/commitments/3). The recorded testnet actions are linked below. The public evidence submission step is not available yet; see Trust and limits.

## Current status — 3 November 2026

Veyntro's NEAR testnet contract has been used for real DAO funding, commitments, an overcommitment rejection, GitHub evidence checks, payments, failed-transfer recovery and expiry release. The verifier is a local command-line tool that prepares an unsigned attestation; it is not a public signing service.

The React, Vite and TypeScript app reads live testnet state. Browser wallet connection, DAO proposal and vote, commitment creation, and beneficiary payout were exercised locally with real NEAR testnet actions. The web app is hosted at [veyntro-web.onrender.com](https://veyntro-web.onrender.com/) on a free Render Static Site. Public guest reads of live treasury data, DAO proposals, and a direct commitment page were verified on the hosted URL; see [deployment and checks](docs/DEPLOY_WEB.md) and [progress](docs/PROGRESS.md). Hosted wallet connection and signed actions, mobile checks, and public evidence submission still need verification or implementation. Evidence submission still requires a verifier key on Ubuntu.

The contract's first-pass static review is not a security audit. Independent testing and release hardening remain open.

## Testnet accounts

- DAO: [veyntro.sputnikv2.testnet](https://explorer.testnet.near.org/accounts/veyntro.sputnikv2.testnet)
- Commitment Firewall: [firewall-aje-veyntro.testnet](https://explorer.testnet.near.org/accounts/firewall-aje-veyntro.testnet)
- Council: `aje.testnet` (sole current council voter; the former CLI voter was removed by DAO proposal 12)
- Evidence verifier: `verifier-aje-veyntro.testnet`

## Verified evidence

- [DAO creation](https://explorer.testnet.near.org/transactions/6oV4Y8DX7hxXK2FB2hietaongMPtKzZzbaWazMAyP8JX)
- [DAO funding of the Firewall](https://explorer.testnet.near.org/transactions/BwjKrwuyGq1k5kYjZHQTBaof8DbGeT3UyczuWRAWPE5y)
- [Rejected overcommitment](https://explorer.testnet.near.org/transactions/HnMJXawR3zD6onxcQe6n27wrYVQ1X591U7r4miPrnEtt)
- [GitHub-checked payment](https://explorer.testnet.near.org/transactions/673VxeaAwfGbJ8pres4mJHxifLwYQbjJ1VdpCoRcf5bn)
- [Permissionless expiry release](https://explorer.testnet.near.org/transactions/3bWgBZGtCJEHxdgo4Kcm995fXPXzskbfXbpKSG5enMv1)
- [Failed payout callback](https://explorer.testnet.near.org/transactions/5hXiJWVF6T5Yy5CCwLHe1YwzSZv5LgyhkDagrBMTq28t)
- [Successful retry](https://explorer.testnet.near.org/transactions/4mugR4TmcxwQ62164DiGFZWinfvKzbvjuqxWK4Po1ukk)

The saved records are under [evidence/](evidence/). Read [docs/PROGRESS.md](docs/PROGRESS.md) for the full development history and current blockers.

## Run the web app

Use Node.js 24.12 or newer within major version 24.

```bash
npm --prefix apps/web ci
npm --prefix apps/web run check
npm --prefix apps/web run build
npm --prefix apps/web run dev -- --host 127.0.0.1
```

The app reads NEAR testnet by default. Optional settings:

- `VITE_NEAR_RPC_URL` — a NEAR testnet RPC endpoint.
- `VITE_FIREWALL_CONTRACT_ID` — Firewall contract account; defaults to the testnet account above.

Guest pages read public contract and DAO data. A wallet is needed for signed actions. **Never put a seed phrase or private key in the app, a repository, or a chat.** Testnet money has no mainnet value.

## Build the contracts

With the pinned Rust toolchain and required WASM target:

```bash
bash scripts/build-firewall.sh
bash scripts/build-receiver.sh
```

See [the Firewall accounting rules](docs/FIREWALL_ACCOUNTING.md), [contract methods](docs/FIREWALL_API.md), and [DAO receiver walkthrough](docs/DAO_RECEIVER.md).

## Trust and limits

- SputnikDAO authorizes treasury funding and changes to commitments.
- The contract enforces its money limits and payment rules.
- The GitHub verifier checks a specific workflow run, then signs an onchain attestation using its own account. The DAO controls which verifier account is trusted. This verifier is not trustless; protect and rotate its key if needed.
- The operator cannot spend treasury funds. Expired money can be released by any caller, but a caller still has to send the transaction.
- The public app's Activity page currently shows recorded payments and withdrawals only. It does not yet index every funding and commitment change or link each stored operation to its exact transaction.

## Project documents

Read [AGENTS.md](AGENTS.md), [docs/MASTER_PLAN.md](docs/MASTER_PLAN.md), and [docs/PROGRESS.md](docs/PROGRESS.md) before changing the product. Do not mark a feature complete without local checks and real integration evidence.
