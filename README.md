# Veyntro

**Every commitment accounted for.**

Veyntro helps a DAO set money aside for work without promising the same funds twice. A SputnikDAO vote authorizes an action; the NEAR Commitment Firewall checks whether the treasury can actually cover it. [Open the live testnet app](https://veyntro-web.onrender.com/) · [Follow the one-minute judge path](JUDGES.md).

**NEAR Hackathon 2026 · Social Money.** This release shows one configured DAO on NEAR testnet. Public pages work without a wallet. Authorized council and beneficiary actions use real wallet signatures.

**Demo post:** Not published yet. The hackathon submission requires a public X post with a video or screenshots as well as this public repository. Add the actual post link here after publication.

## The problem and the difference

A DAO can hold 10 NEAR but already owe 8 NEAR for approved work. It cannot safely promise another 4 NEAR. A vote alone does not protect the money left for existing work.

Veyntro keeps a contract-level account of confirmed funds, money set aside, pending transfers and an operating reserve. It refuses a new commitment that cannot be backed. When work meets the DAO's chosen GitHub check, the beneficiary can request a bounded payment; the final callback records whether the transfer succeeded. Unused money can be released after expiry.

The real testnet example is [request 4 on the DAO page](https://veyntro-web.onrender.com/governance): the DAO voted to set aside **1 NEAR** when only **0.27188 NEAR** was available at that time. The Firewall [refused the call](https://testnet.nearblocks.io/txns/HnMJXawR3zD6onxcQe6n27wrYVQ1X591U7r4miPrnEtt); [the recorded before-and-after check](evidence/OVERCOMMITMENT_REJECTION.json) shows no new commitment. Those are historical amounts, not today's balance.

## Try the live flow — do this, see that

No wallet or testnet funds are needed to inspect these completed transactions.

| Do this | See this |
| --- | --- |
| Open [DAO approval](https://veyntro-web.onrender.com/governance), then **See why a request failed**. Expand request 4's contract action. | **Failed during execution** and “Not enough money available for this commitment.” The vote happened; the proposed commitment did not. |
| On the same page, inspect request **14**. | **Approved**: a `create_reservation` action set aside **0.05 testnet NEAR**. This is not a payment. |
| Open [commitment 4](https://veyntro-web.onrender.com/commitments/4). | Completed work, the payment account, the checked commit and links to the [GitHub result](https://github.com/0xaje/Veyntro/actions/runs/42136893325) and [work-check transaction](https://explorer.testnet.near.org/transactions/23i8gXtwRgN7oqMF3HT1xHgn8PaewqrvDqWh2UuGG2Br). |
| Follow **See available payment records** to [Activity](https://veyntro-web.onrender.com/activity). | Payment **6** is Completed: **0.05 testnet NEAR** sent to `aje.testnet`. Open its [transfer transaction](https://testnet.nearblocks.io/txns/4WDbT9xDxNgJVgGcgeSwcTex7GGrmT2U3tsLPH94jKex) or [payment audit](docs/PAYMENT_6_AUDIT.md). |
| Open [Overview](https://veyntro-web.onrender.com/#overview). | Live finalized-block amounts for money available, money set aside and coverage. Values change; they are not fixed demo data. |

[JUDGES.md](JUDGES.md) has the short receipt trail; [the recording guide](docs/DEMO_SCRIPT.md) follows the same path. Other recorded cases include [DAO funding](https://explorer.testnet.near.org/transactions/BwjKrwuyGq1k5kYjZHQTBaof8DbGeT3UyczuWRAWPE5y), [failed payout and retry](evidence/FAILED_PAYOUT_CALLBACK.json), and [expiry release](https://explorer.testnet.near.org/transactions/3bWgBZGtCJEHxdgo4Kcm995fXPXzskbfXbpKSG5enMv1). These are testnet tokens, not mainnet value.

## How it works

1. The DAO approves funding and commitment actions through [SputnikDAO](https://explorer.testnet.near.org/accounts/veyntro.sputnikv2.testnet).
2. The [Firewall contract](https://explorer.testnet.near.org/accounts/firewall-aje-veyntro.testnet) enforces the available-money check and records the approved beneficiary, payment account, amount, deadline and work-check rule.
3. A manually started [GitHub Actions verifier run](https://github.com/0xaje/Veyntro/actions/runs/42275081154) checks the configured GitHub run and submits an attestation using a restricted function-call key. Passing CI means the agreed checks passed; it does not independently prove the work's quality or value.
4. The beneficiary signs a payment request. The contract checks the authority, limit, evidence and expiry, then reconciles the actual transfer result in its callback. Public pages read finalized NEAR testnet state.

See [accounting rules](docs/FIREWALL_ACCOUNTING.md), [contract API](docs/FIREWALL_API.md) and [verifier action](docs/VERIFIER_ACTION.md) for technical details.

The stack is Rust with near-sdk for the contracts, React/Vite/TypeScript and NEAR Wallet Selector for the web app, and Node.js/TypeScript with the GitHub API for the verifier. Source lives in [contracts/](contracts/), [apps/web/](apps/web/) and [services/verifier/](services/verifier/); recorded testnet checks live in [evidence/](evidence/).

## Run it locally

Requires Node.js **24.12+ within major version 24**; `.nvmrc` selects **24.22.1**. The app uses the deployed testnet contract by default.

```bash
npm --prefix apps/web ci
npm --prefix apps/web run check
npm --prefix apps/web run test
npm --prefix apps/web run build
npm --prefix apps/web run dev -- --host 127.0.0.1
```

Open the local URL printed by Vite and repeat the guest path above. `VITE_NEAR_RPC_URL` and `VITE_FIREWALL_CONTRACT_ID` optionally override the testnet RPC and Firewall account. For contract checks and a release WASM build, use the pinned Rust toolchain and `bash scripts/build-firewall.sh`; `bash scripts/build-receiver.sh` builds the DAO receiver. These scripts build artifacts; they do not deploy or sign transactions. See [setup](docs/SETUP.md) and [deployment notes](docs/DEPLOY_WEB.md).

## Scope, trust and operation

- The hosted app is configured for **one testnet DAO**. `aje.testnet` is its sole current council voter and is also the recipient in the showcased payment. This is a working testnet flow, not evidence of independent customer adoption.
- Another organization cannot set up its own DAO through this site today. A separate community needs its own deployment and verifier operation; self-service onboarding is future work.
- The verifier is trusted and operator-run, not a public or trustless evidence service. Its restricted key can call `submit_attestation` on the Firewall; it cannot vote or withdraw treasury money with that key. The verifier account pays transaction gas. Its long-term funding and recovery procedure are not yet established.
- Anyone can inspect public records without a wallet. Authorized actions need a connected testnet wallet and onchain permission. A completed commitment cannot simply be paid again. The frontend does not replace contract checks.
- A limited outside source review is **not** a full security audit. There is no mainnet deployment or revenue model. Mainnet use needs an independent security review, operational key procedures and further testing.

The complete [master plan](docs/MASTER_PLAN.md) and [progress history](docs/PROGRESS.md) explain the build and unresolved gates. Never put seed phrases, private keys or GitHub secrets in this repository or the web app.
