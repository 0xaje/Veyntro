# Veyntro — blockers

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
