# Veyntro

Every commitment accounted for.

Veyntro is being built to help DAOs and communities set money aside for approved work without promising the same funds twice. The Commitment Firewall will enforce backed commitments, limited payments and the return of unused money on NEAR.

## Current status

Development is in progress. The public application and Commitment Firewall are not implemented yet.

Verified on NEAR testnet:

- Council: aje-veyntro.testnet.
- SputnikDAO: veyntro.sputnikv2.testnet.
- [DAO creation transaction](https://explorer.testnet.near.org/transactions/6oV4Y8DX7hxXK2FB2hietaongMPtKzZzbaWazMAyP8JX) — final and successful.

The separate DAO-only receiver passes 9 local SDK unit tests, Clippy and WASM compilation. Phase 1 is now verified on NEAR testnet: receiver deployment, DAO proposal 0 and approval, an actual 0.01 NEAR DAO-to-receiver call, and rejection of direct council funding with unchanged records. [Execution evidence](evidence/DAO_FUNDING_EXECUTION.json) and [permission rejection](evidence/DAO_PERMISSION_REJECTION.json) are independently inspectable. The Commitment Firewall and public application remain unimplemented.

## Build the receiver

Requires rustup, Python 3, Node/npm, and C build tools. The checked-in toolchain pins Rust 1.95.0; the SDK is exactly 5.30.0. From the repository root:

```bash
bash scripts/build-receiver.sh
```

[DAO receiver deployment walkthrough](docs/DAO_RECEIVER.md) explains the separate user-signed stages and exact live exit gate. The receiver accepts at most 0.01 test NEAR and has no withdrawals; it is not the product treasury.

## Development records

Read [AGENTS.md](AGENTS.md), [master plan](docs/MASTER_PLAN.md) and [current progress](docs/PROGRESS.md) before changes. [Build evidence](evidence/RECEIVER_BUILD.json) and [DAO evidence](evidence/DAO_INTEGRATION.md) distinguish local checks from real transactions. Never commit private keys or recovery phrases.

Primary hackathon track: Social Money.
