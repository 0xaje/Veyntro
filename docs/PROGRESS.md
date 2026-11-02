# Veyntro — current progress

DATE/TIME (UTC): 2026-11-02T21:05:47.503182+00:00
PHASE / MILESTONE: Phase 2 — Commitment Firewall implemented and tested locally; live lifecycle pending
STATUS: IN_PROGRESS
LAST VERIFIED COMMIT: 3c18cad4f81b949f3e264961da61c97d5613964e (firewall source and local checks; not a deployed contract).
REPOSITORY: https://github.com/0xaje/Veyntro
NETWORK / CONTRACT IDS: testnet; DAO veyntro.sputnikv2.testnet; council aje-veyntro.testnet; receiver receiver.aje-veyntro.testnet verified. Firewall account firewall-aje-veyntro.testnet CREATED with 10 test NEAR; contract DEPLOYED and initialized; final transaction/code hash/initial views verified. Verifier verifier-aje-veyntro.testnet and beneficiary worker-aje-veyntro.testnet CREATED and verified; each has 10 test NEAR.

## Source of truth and completed milestones

Read master plan version 1.2, AGENTS.md and authoritative GitHub progress before coding. Phase 1 is independently VERIFIED: creation, proposal 0, council approval, actual 0.01 NEAR receipt from DAO to receiver and rejected direct council call with unchanged ledger. Full previous progress is preserved in docs/PHASE_1_PROGRESS.md and real receipt files remain in evidence/. Do not repeat Phase 1 writes or replace its receiver.

## Phase 2 work completed locally

- New contracts/commitment-firewall, separate from the deployed receiver. DAO-only funding/reservation/cancellation/withdrawal/verifier rotation; beneficiary-only payouts to immutable recipients; permissionless expiry.
- Checked accounting: DAO accountable funds, storage/gas reserve, remaining liabilities INCLUDING pending payouts, pending uncommitted withdrawals, conservative actual-balance cap. Deployment/direct-transfer balances are not free accountable funds.
- Pending transfer operations, private typed callbacks, exactly one bounded native-transfer result, exactly-once settlement, failure recovery and cancellation/expiry interleavings. Missing/failed callbacks stay encumbered; no invented reconciliation success.
- Drawdown and DAO withdrawal nonces prevent replay. A failed transfer consumes its nonce; retries use a new nonce.
- Fixed evidence slots; verifier-only expiring policy-matched attestations with nonce/epoch checks. Rotation invalidates unspent old attestations. Real GitHub API service is NOT implemented here.
- Future operation storage reserved up front: 32 attempts per commitment, 1024 bytes each, actual growth checked. Unused allowance released on close. See docs/FIREWALL_ACCOUNTING.md for costs/limits and docs/FIREWALL_API.md for parameters.
- Paginated public views and actual-state events. No UI redesign, frontend, fake balances or hosted product was added.

## Verification commands and actual results

PATH="$HOME/.cargo/bin:$PATH" bash scripts/build-firewall.sh — exit 0. Formatting passed; 56 firewall tests and 9 receiver tests passed; Clippy with -D warnings passed; locked WASM release build passed using --cfg near.

Rust 1.95.0; near-sdk 5.30.0; existing lockfile updated only for the new workspace member. WASM 219782 bytes, SHA256 a850073c270245b74668bf692f3fcc9a763ed791f94b4786427cbb39dfc4862a. This local build is not claimed independently reproducible. The user's deployed receiver hash remains separately recorded.

CI workflow added with immutable checkout revision, read-only contents permission and pinned project Rust toolchain. CI has NOT been claimed passed; check the actual run after publication. Third-party quality/design skill files were not found in the refreshed local skill locations; no skill-specific audit is claimed. Manual review identified and fixed prepaid payment storage and withdrawal replay issues.

Evidence: evidence/FIREWALL_BUILD.json; evidence/firewall-build.log; evidence/FIREWALL_CHECK_ATTEMPTS.md. Local SDK harness tests are development checks, not real blockchain or GitHub activity.

## Remaining live gates / risks

- New full-contract account, separate verifier and beneficiary accounts; funding plan using actual testnet balances and free faucet only. Candidate names firewall-aje-veyntro.testnet, verifier-aje-veyntro.testnet, worker-aje-veyntro.testnet returned UNKNOWN_ACCOUNT at block 275952357 (availability observation only). No keys generated in this workspace.
- Deployment and generated ABI guard checks; real DAO funding and two commitments; rejected overcommitment; real evidence-backed payout; failed/retried transfer; expiry release; callbacks/final receipts and public numerical reconciliation. None is verified yet for the firewall.
- Full-access deployment key authority and callback liveness/recovery need review. A stuck callback remains pending rather than releasing funds. No security-audit or trustless-custody claim.
- Storage reserve is conservative and includes future operation slots. Pending refunds/settlement may temporarily pause new actions. Withdrawing the exact displayed capacity can need extra operation storage margin.
- GitHub verifier service, wallet frontend, hosting, indexing and operator remain unimplemented. Phase 0 detailed competitor coverage and Nigeria/prize/KYC confirmation remain open; do not claim those resolved.

## Next exact action

1. Publish this verified source and evidence, then user pulls main in ~/Veyntro-build and runs bash scripts/build-firewall.sh. Record user's actual artifact hash.
2. User creates NEW firewall-aje-veyntro.testnet through the free CLI faucet, keeping keys locally. Verify creation/final receipts and balance; do not deploy over the receiver.
3. Establish separate actual verifier and beneficiary accounts, review contract/key authority and live funding amounts, then prepare initialization and DAO funding proposals from real state.
4. Keep Phase 2 IN_PROGRESS until its entire real testnet financial lifecycle and final evidence gate pass. No more receiver writes are needed.

FILES CHANGED: contracts/commitment-firewall/*; Cargo.toml/Cargo.lock; scripts/build-firewall.sh; docs/FIREWALL_ACCOUNTING.md; docs/FIREWALL_API.md; docs/PROGRESS.md; docs/PHASE_1_PROGRESS.md; docs/DECISIONS.md; docs/BLOCKERS.md; .github/workflows/contracts.yml; README.md; evidence/FIREWALL_BUILD.json; evidence/FIREWALL_CHECK_ATTEMPTS.md; evidence/firewall-build.log.

## Publication

Firewall source and all 21 changed files verified present on GitHub at commit 3c18cad4f81b949f3e264961da61c97d5613964e. Contract checks workflow run 41525421351 started and was in_progress when checked: https://github.com/0xaje/Veyntro/actions/runs/41525421351 . No CI success is claimed yet. User can pull main and run scripts/build-firewall.sh, then create the new free testnet firewall account and return its actual creation hash. Phase 2 remains IN_PROGRESS.

## User build, CI and firewall account verified — 2026-11-02

User terminal output independently reproduced 56 firewall and 9 receiver tests, Clippy and release WASM build. User's actual artifact SHA256 is d7b3563dbea090da6f18bdc67c2dc0f128d4c43ac43efba49c92c8ac5a5f2f6e. It differs from assistant build; no independent reproducibility claim. Deploy and verify against the user's actual artifact, not the assistant's hash.

Creation tx SqyY9uq5NnNn87ty7odKxLoWqj7rVwEyBinqUp9YNc4 independently verified FINAL with successful receipts. firewall-aje-veyntro.testnet has 10 test NEAR, key ed25519:HvgBUbiC7632EQsHZ9qidVUfHHxuNzwqo9b8ZFuB2yAc and no deployed contract at block 275953410. Do not repeat account creation. Evidence: evidence/FIREWALL_ACCOUNT_CREATION.json.

GitHub Contract checks run 41525421351 is completed/success for source commit 3c18cad4f81b949f3e264961da61c97d5613964e: https://github.com/0xaje/Veyntro/actions/runs/41525421351 . Evidence: evidence/FIREWALL_CI.json. This supersedes earlier in-progress CI notes; it is not live contract/payment proof.

Next: user creates separate verifier-aje-veyntro.testnet and worker-aje-veyntro.testnet accounts with free faucet and keys stored locally. Verify public keys, balances and final creation receipts before initializing the new firewall contract. Phase 2 remains IN_PROGRESS; no firewall deployment or financial lifecycle is claimed.

## Verifier and beneficiary accounts verified — 2026-11-02

Both creation transactions independently verified FINAL with successful returned receipts. Verifier verifier-aje-veyntro.testnet: tx 44qThHMJUfVgDZ88KSuHAQDA4HVxGg6GN5fTxoDi4cW4, public key ed25519:5ZVYRESN7v58XtjLnFupZqXEKG21MTvibvh1cRn99xh8. Beneficiary worker-aje-veyntro.testnet: tx 2xzu5dURGr3sZGBFPJVjQnKNSGzkrT4XfWod8QuBk22c, public key ed25519:C7LrgzYBnmy714xGC8C4r5jjLG5NbN6tn35gBhiouar1. Each has 10 test NEAR and no code at block 275953940. Matching FullAccess keys verified; private keys remain on the user's machine. Worker is the beneficiary account, not a privileged automation operator.

Firewall account independently rechecked at block 275953965: 10 test NEAR and no code. Evidence: evidence/FIREWALL_ROLE_ACCOUNTS.json. Earlier account-creation next steps above are completed; do not repeat them.

NEXT EXACT ACTION: user deploys target/wasm32-unknown-unknown/release/veyntro_commitment_firewall.wasm to firewall-aje-veyntro.testnet with atomic new call: dao_account_id=veyntro.sputnikv2.testnet, verifier_account_id=verifier-aje-veyntro.testnet, operating_reserve=100000000000000000000000 (0.1 NEAR configured floor; actual storage reserve can be higher). Check local artifact SHA256 d7b3563dbea090da6f18bdc67c2dc0f128d4c43ac43efba49c92c8ac5a5f2f6e first. Return deployment tx hash, then independently verify final receipts, deployed code hash and initial treasury view before DAO funding. Initial accountable funds and available money must be zero; faucet balance is not DAO funding. Phase 2 remains IN_PROGRESS. Deployment key remains FullAccess: reviewed custody/upgrade policy is still required before production. Real GitHub verifier, hosted frontend and automated operator are not implemented.

## Firewall deployment verified — 2026-11-02

Transaction HMvHPLdXViS6fXigmbCD2aXCPJuMyvo1UEMyWjyniZ3B independently verified FINAL; all returned receipts succeeded. Onchain code hash FX1GAZo5W3HHSP3ZChPHRAE59zzujnW9SYJ4nAi75uMw matches user's WASM SHA256 d7b3563dbea090da6f18bdc67c2dc0f128d4c43ac43efba49c92c8ac5a5f2f6e. Initialization DAO/verifier/configured reserve match approved arguments. Evidence: evidence/FIREWALL_DEPLOYMENT.json.

Initial view: confirmed_accountable_funds=0, reservation_liabilities=0, pending_payouts=0, pending_withdrawals=0, money_available=0; epoch/operation/reservation counters zero. Runtime operating reserve 2.26474 NEAR; configured floor 0.1 NEAR. Actual firewall balance 9.9982260476962562 NEAR, storage_usage=220450 at block 275954172. Faucet funds are NOT credited as DAO accountable funding. ledger_solvent=false because accountable funding is zero and the reserve is not funded in that ledger; physical_backing_check=true. No commitments or payments exist yet.

DAO balance at block 275954171 is 6.99 NEAR, storage_usage=540657 (~5.40657 NEAR storage at the current 10^19 yoctoNEAR/byte protocol cost), leaving ~1.58343 NEAR above storage. It cannot fund the planned 4 NEAR call yet.

NEXT EXACT ACTION: user transfers 4 test NEAR from verifier-aje-veyntro.testnet (10 NEAR verified at role creation) to veyntro.sputnikv2.testnet. This is one-time test funding, not a verifier treasury permission. Verify final transfer and fresh balances, then construct and validate a real DAO FunctionCall proposal attaching 4 NEAR to firewall fund_treasury. Do not count a direct transfer as firewall ledger funding. Return proposal's actual ID and verify before voting. Phase 2 remains IN_PROGRESS: commitments, overcommitment rejection, evidence-backed payment, failed/retried transfer and expiry release remain pending. Previous deployment/account-creation next steps are superseded.
