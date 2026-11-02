# Veyntro

Every commitment accounted for.

Veyntro is being built to help DAOs and communities set money aside for approved work without promising the same funds twice. The Commitment Firewall will enforce backed commitments, limited payments and the return of unused money on NEAR.

## Current status

Development is in progress. The public application is not implemented yet. The Commitment Firewall is implemented and tested locally; its testnet deployment and financial lifecycle remain pending.

Verified on NEAR testnet:

- Council: aje-veyntro.testnet.
- SputnikDAO: veyntro.sputnikv2.testnet.
- [DAO creation transaction](https://explorer.testnet.near.org/transactions/6oV4Y8DX7hxXK2FB2hietaongMPtKzZzbaWazMAyP8JX) — final and successful.

The separate DAO-only receiver passes 9 local SDK unit tests, Clippy and WASM compilation. Phase 1 is now verified on NEAR testnet: receiver deployment, DAO proposal 0 and approval, an actual 0.01 NEAR DAO-to-receiver call, and rejection of direct council funding with unchanged records. [Execution evidence](evidence/DAO_FUNDING_EXECUTION.json) and [permission rejection](evidence/DAO_PERMISSION_REJECTION.json) are independently inspectable. The Commitment Firewall now passes 56 local tests, Clippy and WASM compilation; it is not deployed or live-verified yet. The public application remains unimplemented.

## Build the Commitment Firewall

Requires the same pinned Rust toolchain. Run:

```bash
bash scripts/build-firewall.sh
```

This checks all 56 firewall tests and 9 receiver tests, formatting, Clippy and the locked WASM build. Read the [accounting design](docs/FIREWALL_ACCOUNTING.md) and [contract API](docs/FIREWALL_API.md). Storage/gas reserves and up to 32 prepaid payment attempts per commitment are enforced. Test inputs are local checks, not GitHub attestations or blockchain activity. The real GitHub verifier and wallet application remain pending. [Current build evidence](evidence/FIREWALL_BUILD.json) records exact local results.

## Build the receiver

Requires rustup, Python 3, Node/npm, and C build tools. The checked-in toolchain pins Rust 1.95.0; the SDK is exactly 5.30.0. From the repository root:

```bash
bash scripts/build-receiver.sh
```

[DAO receiver deployment walkthrough](docs/DAO_RECEIVER.md) explains the separate user-signed stages and exact live exit gate. The receiver accepts at most 0.01 test NEAR and has no withdrawals; it is not the product treasury.

## Development records

Read [AGENTS.md](AGENTS.md), [master plan](docs/MASTER_PLAN.md) and [current progress](docs/PROGRESS.md) before changes. [Build evidence](evidence/RECEIVER_BUILD.json) and [DAO evidence](evidence/DAO_INTEGRATION.md) distinguish local checks from real transactions. Never commit private keys or recovery phrases.

Primary hackathon track: Social Money.
