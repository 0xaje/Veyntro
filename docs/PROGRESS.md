# Veyntro — current progress

DATE/TIME (UTC): 2026-11-02T20:17:19.855858+00:00
PHASE / MILESTONE: Phase 1 — DAO-only receiver built and tested locally; deployment pending
STATUS: IN_PROGRESS
LAST VERIFIED COMMIT: bcb518ea38a1a4786f1b4d243e578f23335eb771 (GitHub source baseline before receiver work).
REPOSITORY: https://github.com/0xaje/Veyntro
NETWORK / CONTRACT IDS: NEAR testnet; council aje-veyntro.testnet; DAO veyntro.sputnikv2.testnet. Receiver account receiver.aje-veyntro.testnet is CREATED; code is NOT DEPLOYED.

## Completed and verified

- DAO creation and actual council/policy verified previously. Creation tx: 6oV4Y8DX7hxXK2FB2hietaongMPtKzZzbaWazMAyP8JX. Live proposal bond was 1 NEAR; voting period 7 days.
- Implemented contracts/dao-receiver. Account-only initialization; DAO-predecessor authorization; positive deposits; checked totals/counter; JSON funded events; public get_funding_state. Total recorded funding capped at 0.01 test NEAR. No withdrawals.
- Pin Rust 1.95.0, near-sdk 5.30.0 and Cargo.lock. Verified SDK upstream requires Rust 1.95 and protocol 88. Earlier Rust 1.93 attempt failed with MSRV errors; final toolchain resolves them.
- scripts/build-receiver.sh passes formatting, 9 SDK unit tests, Clippy warnings-as-errors and locked WASM release build with --cfg near.
- WASM: 129393 bytes; SHA256 738b22839e7ec0a17ae6dcfea48ab0af9e9525ec7f154dbea9e5d38e0194b723.
- Added user-signed deployment/governance scripts. Python helper checks deployed WASM hash, receiver state and actual policy. Approval preparation validates the selected real proposal before signing. Shell/Python syntax and hash-conversion checks passed. Invalid proposal ID rejected locally.

## Exact commands / evidence

PATH="$HOME/.cargo/bin:$PATH" bash scripts/build-receiver.sh — exit 0.
python -m py_compile scripts/receiver-governance.py scripts/preflight.py — passed.
bash -n scripts/receiver-integration.sh scripts/build-receiver.sh — passed.
Local SDK harness tests are development tests, NOT transactions or live payment proof. See evidence/RECEIVER_BUILD.json, evidence/receiver-build.log, evidence/DAO_INTEGRATION.md and docs/DAO_RECEIVER.md.

## Current boundaries

The receiver is a separate integration contract, not the Commitment Firewall. It does not create commitments or pay beneficiaries. No receiver account, deployment, proposal or vote has been executed by the assistant. The user controls signing keys. Receiver code replacement remains possible through its user-controlled full-access key; no trustless custody claim. DAO factory auto_update is true.

Product wallet UI, verifier, operator and full financial accounting remain NOT IMPLEMENTED. No redesign or fake activity. Installed third-party skills were not found in this refreshed environment, so no skill-based review is claimed. Manual review covered authorization, checked arithmetic, bounded test funding and signing boundaries.

## Next exact action

1. User obtains current repository source and runs bash scripts/build-receiver.sh. Toolchain components install through rustup; install rustup first if missing.
2. User runs bash scripts/receiver-integration.sh create-account. It creates receiver.aje-veyntro.testnet using 1.5 test NEAR from council wallet, plus fees. Return actual tx hash; verify final account creation.
3. Run deploy stage only after account creation is verified, then verify final receipts, deployed code hash and initial zero funding state.
4. Run propose stage; obtain actual proposal ID. Run approve ACTUAL_ID only after matching proposal checks; capture final vote execution and funded event.
5. Verify receiver recorded exactly 0.01 NEAR once, check all receipts, and demonstrate rejected direct council funding. Only then mark Phase 1 VERIFIED and continue to the Commitment Firewall.

## Open issues

Receiver/CLI stages require user computer keys and remain unexecuted. SDK/WASM runtime compatibility remains unverified until actual deployment/call. Phase 0 competitor coverage and Nigeria-specific prize eligibility/KYC are not fully verified and remain tracked, without blocking this bounded testnet integration preparation. Public hosted product not available yet.

## Files changed

Cargo.toml; Cargo.lock; rust-toolchain.toml; contracts/dao-receiver/*; scripts/build-receiver.sh; scripts/receiver-integration.sh; scripts/receiver-governance.py; docs/DAO_RECEIVER.md; docs/PROGRESS.md; docs/PROGRESS_HISTORY.md; docs/BLOCKERS.md; docs/DECISIONS.md; evidence/RECEIVER_BUILD.json; evidence/receiver-build.log; README.md.

Earlier inspection details are preserved in docs/PROGRESS_HISTORY.md. Old missing-tool, missing-repository and uncreated-DAO notes there are historical.

## Receiver account creation verified — 2026-11-02

User reproduced all 9 local tests and the WASM release build. User-reported local WASM SHA256: 970db1c72542dbd325c37228188f013b0b1e2eb6bb2714b9de8ae1fd1206c1d4. This differs from the assistant's local artifact; builds are not claimed independently reproducible. Do not rebuild or replace the user's WASM between deployment and deployed-code hash verification.

Creation transaction bW9JVbuFEFRpc5oz3Q4honvwkeZ7AUoNAtCosDqcDUV independently verified FINAL with SuccessValue and no failing returned receipts. receiver.aje-veyntro.testnet has 1.5 test NEAR, public key ed25519:2gTwxY1r3ZtLPtcALErwZjYV9sSsAw72S9UXx7psxx8j, and no deployed contract at block 275949108. The preliminary CLI validation error did not prevent the creation transaction succeeding. Do not repeat account creation.

Next action: user runs `bash scripts/receiver-integration.sh deploy` from the same built checkout. Then verify final deploy/init receipts, onchain code against user's actual WASM hash, configured DAO, funding_count=0 and total_received=0 before proposing funding. Evidence: evidence/RECEIVER_ACCOUNT_CREATION.json. No deployment or governance-funded call is claimed yet.
