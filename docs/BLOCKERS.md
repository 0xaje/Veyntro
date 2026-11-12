# Veyntro — blockers

## Current release gates — 12 November 2026

- The public X demo post and official submission form are not recorded as complete. The video or screenshots, repository link and demo-post link must be checked before the deadline.
- An independent mobile and fresh-wallet walkthrough and an external security review have not been completed. These limits must remain visible; they are not reasons to invent test results.
- The GitHub evidence checker needs a manually started protected workflow. It is not a general public evidence service.
- Independent organization setup was removed from this submission. The site currently serves the tested Veyntro DAO only.

The entries below are historical blockers and updates. Many were resolved by the linked evidence in `docs/PROGRESS.md`; do not treat their old “next action” text as the current release plan.

## Historical development blockers

## B-001 — Existing repository unavailable

Evidence: workspace initially contained only two uploaded Markdown files. `git rev-parse --show-toplevel` exited 128. No source manifests, contracts, frontend, tests or deployment records were present.
Action: user supplies repository URL or accessible path and intended branch; then inspect actual project instructions and progress. Do not invent implementation status or create a replacement implementation.

## B-002 — Contract build tools missing

Evidence: executable checks found no rustc, cargo, rustup, near or cargo-near on PATH.
Action: after locating the actual development repository/environment, install compatible tools from official sources, record exact versions, compile and test there. Registry discovery alone does not establish compatibility.

## B-003 — Accounts and governance not identified

Evidence: no confirmed DAO/contract/beneficiary/verifier/operator IDs or deployment evidence in the available workspace.
Action: establish public account IDs and authorized signing access; inspect real DAO code/policy/bond and balances. Do not copy private keys into chat or documentation.

## B-004 — Phase 0 research incomplete

Evidence: official guide and product sources checked, but Nigeria-specific prize eligibility/KYC terms and exact competitor implementation coverage remain unverified.
Action: resolve through hackathon-specific official terms/organizer clarification and targeted source inspection. The unrelated near.org “Fork that” promotion rules are not hackathon eligibility evidence.

## 2026-10-31 update

B-001 clarified: user has no repository ready and asked to wait until November 1 to create it. Continue preparation in this workspace; do not repeatedly request a nonexistent repository.
B-002 partially resolved: Rust/Cargo 1.99.1, wasm target, NEAR CLI 0.30.1 and cargo-near 0.22.0 installed and version-checked. SDK compilation compatibility remains unverified.
B-003 remains: no selected council wallet/DAO or authorized signer. Candidate factory account existence is verified, but it is not the team's DAO.
B-004 remains partially unresolved; current official rules/tracks have been reviewed in conversation. Nigeria/KYC and exact competitor coverage are still unverified.

## Receiver milestone update — 2026-11-02

Repository and DAO blockers are resolved: source is on GitHub and DAO creation is verified. Rust 1.95 and WASM target are installed for this run. Local receiver tests/build passed. Active next blocker: receiver account creation and deployment need the user's locally stored signing key. Do not request/export that key. Use docs/DAO_RECEIVER.md stage commands. No live receiver outcome is claimed.

## Phase 2 update — 2026-11-02

Phase 1 is verified and supersedes earlier receiver blockers. Firewall local build/56 tests passed. Active next gate: create a separate full-contract account via free testnet faucet, then verifier/beneficiary accounts, actual funding and live lifecycle verification. Callback gas/ABI/rollback/runtime outcomes are not certified by SDK unit tests. Product frontend/verifier service are still absent.


## Live firewall / verifier update — 2026-11-02

Account creation, deployment, DAO funding, two commitments, onchain overcommitment rejection and missing-evidence rejection are now independently verified; earlier account gates are superseded. GitHub verifier core/CLI checks real API/state and passes 28 tests, but onchain attestation, actual payout, failed/retried transfer callback and expiry release remain pending. Hosted authenticated beneficiary requests and verifier scoped key/signing custody are not implemented. Keep Phase2 IN_PROGRESS. CLI prepares unsigned output only, with user-local signing as the next gate. See current docs/PROGRESS.md and services/verifier/README.md.

