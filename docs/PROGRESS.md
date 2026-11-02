# Veyntro — progress

DATE/TIME (UTC): 2026-10-30T23:53:42.973341+00:00
PHASE / MILESTONE: DAO creation verified; Phase 1 DAO-to-contract call remains unfinished
STATUS: IN_PROGRESS
LAST VERIFIED COMMIT: None recorded. November 1 hold has passed; GitHub repository 0xaje/Veyntro exists and was verified empty.
NETWORK / CONTRACT IDS: testnet; council wallet aje-veyntro.testnet verified. DAO veyntro.sputnikv2.testnet creation VERIFIED. Product contract/verifier/beneficiary/operator NOT CONFIGURED.

## Verified changes

- Read AGENTS.md, full docs/MASTER_PLAN.md, prior progress, blockers and decisions before proceeding.
- Installed Rust 1.99.1 and Cargo 1.99.1; installed wasm32-unknown-unknown build target.
- Installed and checked NEAR CLI 0.30.1 and cargo-near 0.22.0.
- Added scripts/preflight.py using Python standard library only. It makes actual read-only RPC requests, rejects wrong network/syncing/RPC errors, captures a final block and can read a selected DAO's account/policy at that same block.
- Tools and testnet reads passed in evidence/preflight.json. DAO absence remains explicit; phase_0_complete remains false.
- Inspected upstream SputnikDAO FunctionCall schema and exact proposal bond requirement; documented in docs/SETUP.md. No selected deployment/source match is claimed.
- Confirmed candidate factory sputnikv2.testnet exists with deployed code via actual final-block account query; recorded in evidence/factory-discovery.json. It is not a Veyntro DAO and has not been selected or modified.

## Commands and results

- Official rustup installer with minimal stable profile: exit 0. rustc/cargo --version verified 1.99.1.
- rustup target add wasm32-unknown-unknown: exit 0; target list confirms installation.
- Official NEAR release installers: binaries verified by near --version and cargo-near --version.
- python -m py_compile scripts/preflight.py: exit 0.
- PATH="$HOME/.cargo/bin:$PATH" python scripts/preflight.py --output evidence/preflight.json: exit 0, read_checks_passed=true, dao_configured=false, phase_0_complete=false.
- Invalid-network DAO check: see evidence/preflight-invalid-network.json and continuation note below. No transaction was signed.

## Implementation status

Environment tooling and live preflight utility are available. Product contracts, wallet UI, verifier and operator are NOT implemented. No governance proposal, deployed Veyntro contract, payment or end-to-end product test exists. Installed tools do not prove SDK build compatibility. No Git repository, commits or remote have been created.

## Remaining gates and next action

1. Establish a public NEAR testnet council wallet ID and whether to reuse an existing SputnikDAO or create a new one. Never request seed phrases or private keys in chat.
2. Confirm signer access, funding and actual DAO code/policy/bond. Factory account discovery alone is insufficient.
3. Finish Phase 0 source/version compatibility and competitor verification. Nigeria-specific eligibility/KYC confirmation remains outstanding.
4. When repository creation opens, initialize the agreed source location and preserve all current files/evidence.
5. After Phase 0 is verified, implement the Phase 1 minimal Rust receiver, build it, and execute the real DAO-approved payable call. Capture final receipts, predecessor and attached deposit before advancing.

## Tests and limits

No fake data, application redesign, paid infrastructure or signed transactions. Product security/accounting tests NOT RUN because the product contract is not implemented. The read-only script is operational tooling, not the product. Its get_policy schema check does not authenticate code provenance or account control. Four installed quality/design skills remain subordinate to the master plan; no UI exists to redesign and Python setup tooling is outside Code Slop's stated TS/PHP stack scope.

## Files changed

scripts/preflight.py; docs/SETUP.md; docs/PROGRESS.md; docs/PROGRESS_INITIAL_INSPECTION.md; docs/BLOCKERS.md; docs/DECISIONS.md; evidence/preflight*.json; evidence/factory-discovery.json; evidence/ENVIRONMENT.md.

Invalid-network check verified: `--dao invalid.near` exited 1 and recorded the explicit testnet-account validation error. This is a local input-validation result, not an onchain rejection.

## Account setup verified — 2026-11-02T20:03:00.888461+00:00

aje-veyntro.testnet exists on testnet with 10 test NEAR at block 275946140. The supplied public key matches its FullAccess key at block 275946154. Creation transaction 9RxhXs7RGefrFNutB9qLrydhom8YAV4dkZZesNmh1z3n is FINAL with SuccessValue and successful receipt outcomes. No contract is deployed to this account. This is the user-controlled development/council wallet, not yet a DAO. Evidence: evidence/ACCOUNT_SETUP.json. Next: configure a separate SputnikDAO and verify its deployed code, governance policy and proposal bond. Repository 0xaje/Veyntro was verified public and empty in the preceding GitHub inspection; old repository-hold notes above are historical. Private keys remain on the user computer.

## DAO creation preparation — 2026-11-02T20:06:03.013420+00:00

Verified live council wallet balance: 10 test NEAR; target veyntro.sputnikv2.testnet returned UNKNOWN_ACCOUNT. Factory sputnikv2.testnet code hash: 77dkUJRCHKRxJxo6UtYgBtRP6hsEX2v4vXjmFuY7dktb. Factory default DAO code hash: AA4nA45vauiac3jdVwJTzSdUP3oj2r1fDaPAb2mHdgcH. Retrieved default DAO WASM: 539647 bytes, SHA256 880bae9a58c99ec1efe8b10cf834b3f0c0ebc7a05d71206f3c1202c4280952da. Factory metadata reports version [3,31] and source commit 7764926cfd3c47f62b5fcde231c251f3c3892887; metadata is not independent proof of reproducible build provenance. Inspected this revision's factory manager and policy schema instead of assuming upstream main matches deployment.

Prepared scripts/create-testnet-dao.sh with default policy council array [aje-veyntro.testnet], 150 Tgas and 7 test NEAR attached. Chosen deposit is funding, not a claimed measured minimum. bash -n passed. Signing must run on user computer where the key resides. No transaction has been sent, no DAO created, no proposal submitted. Next: obtain creation tx, verify final receipt outcomes and DAO get_config/get_policy/code hash.

Environment refresh: /root/.cargo/bin/near is no longer present in this execution environment. Earlier installed-tool evidence remains historical; do not claim those binaries are currently available without reinstalling and checking. Attempted npx near-cli-rs@0.30.1 --version exited 1 without version output; local runtime CLI validation is unresolved. User's previously successful unpinned npx command is used for their machine.

## DAO creation independently verified — 2026-11-02T20:09:18.306668+00:00

Transaction 6oV4Y8DX7hxXK2FB2hietaongMPtKzZzbaWazMAyP8JX is FINAL and successful, with no failing returned receipts. DAO code hash matches factory default. Council [aje-veyntro.testnet], bond 1 NEAR, voting period 7 days, total DAO balance 7 test NEAR at block 275946755. See evidence/DAO_INTEGRATION.md and raw JSON. Phase 1 is NOT complete: receiver deployment and authentic governance-approved payable call are next. Do not repeat DAO creation. Earlier setup notes are historical.
