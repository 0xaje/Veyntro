# DAO-only receiving contract

## Purpose and current limits

This is the separate Phase 1 integration contract. It verifies that a real SputnikDAO-approved payable call reaches a contract with the DAO as predecessor. It is not the Commitment Firewall, and cannot create commitments or pay beneficiaries.

Target account: receiver.aje-veyntro.testnet. DAO: veyntro.sputnikv2.testnet. Council: aje-veyntro.testnet. None of the commands below has been signed or executed by this assistant.

Only the receiver account can initialize the contract. Only the configured DAO can call fund_treasury; the transaction's original signer does not grant access. The contract records only deposits accepted by that method. Deployment funding and unexpected direct transfers are excluded from total_received. Total method funding is capped at 0.01 NEAR.

There is no withdrawal method. Use only the 0.01 test NEAR integration payment. The receiver's full-access key remains user-controlled and permits code replacement; this contract does not establish production custody or a trustless treasury. It must not be deployed as the final Commitment Firewall.

## Prerequisites

- User computer with Node/npm, Python 3, Git, C build tools and rustup.
- Testnet keys already saved locally for aje-veyntro.testnet.
- Rust 1.95.0, pinned in rust-toolchain.toml; rustup installs the target/components.
- near-sdk exactly 5.30.0 and the checked-in Cargo.lock. SDK requires Rust 1.95 and testnet protocol 88.
- No recovery phrase or private key should be copied into this repository or chat.

If Rust is missing, install it from https://rustup.rs/ . On Ubuntu, a missing linker needs the distribution's build-essential package. The NEAR CLI is invoked through the same npx near-cli-rs route already used successfully on the user's machine.

## Build and verify locally

From the repository root:

```bash
source "$HOME/.cargo/env"
bash scripts/build-receiver.sh
```

This runs formatting checks, nine SDK unit tests, Clippy with warnings denied, and a locked WASM release build with --cfg near. Unit tests use the SDK's local execution harness. They are development checks, not real transactions and not evidence of live integration. Test constants and identities are test inputs only. Exact results and WASM digest are in evidence/RECEIVER_BUILD.json and evidence/receiver-build.log. This local build is not an independently reproducible container build.

## Sign one stage at a time on your computer

1. `bash scripts/receiver-integration.sh create-account` creates receiver.aje-veyntro.testnet with **1.5 test NEAR** from your council wallet, plus fees. This backs deployed code/storage; it is separate from the later 0.01 NEAR DAO payment. The measured WASM is 129393 bytes; the deploy script refuses sizes above 140000 bytes rather than assume the same budget still works.
2. Return the transaction hash. Verify the final account creation before deployment. Do not repeat creation after success.
3. `bash scripts/receiver-integration.sh deploy` deploys the local WASM and initializes it in the same transaction, signed by the receiver account. Do not run it against an existing initialized contract; no automatic migration is implemented.
4. Return the deployment hash. Verify final receipts, code hash against the local WASM, and get_funding_state (configured DAO, zero funding, zero count).
5. `bash scripts/receiver-integration.sh propose` reads actual receiver code/state and DAO policy at a final block before preparing a 0.01 NEAR FunctionCall proposal. It attaches the live policy's proposal bond (currently 1 test NEAR). The CLI result supplies the real proposal ID; do not guess it.
6. `bash scripts/receiver-integration.sh approve ACTUAL_PROPOSAL_ID` checks the selected proposal's proposer, status, description, receiver, action, deposit, gas, code hash and expiry before signing. With one council member, this vote also initiates execution. Approval status alone is not final payment proof.
7. Return vote transaction hash and actual proposal ID. Independently verify all final receipt outcomes, receiver funded event, proposal status and get_funding_state showing total_received=10000000000000000000000 and funding_count=1.

All network calls use testnet. The preparation helper never signs or reads keys. Permission checks live in the contract, independently of these scripts. The DAO currently allows factory auto-updates; reverify deployed code/policy before each milestone.

## Phase 1 exit gate

A passing build or creation of the DAO is not enough. Exit requires the receiver deployment, real proposal and vote, a successful payable DAO-to-receiver receipt, rejected direct council funding, and verified state and explorer links. All live outcomes remain PENDING until actually observed. Do not proceed to full financial accounting based only on these local tests.
