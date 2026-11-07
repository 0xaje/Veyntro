#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
cargo fmt --all -- --check
cargo test --workspace --locked
cargo clippy --workspace --all-targets --locked -- -D warnings
RUSTFLAGS='--cfg near' cargo build --locked -p veyntro-commitment-firewall \
  --target wasm32-unknown-unknown --release
sha256sum target/wasm32-unknown-unknown/release/veyntro_commitment_firewall.wasm
RUSTFLAGS='--cfg near' cargo build --locked -p veyntro-community-factory \
  --target wasm32-unknown-unknown --release
sha256sum target/wasm32-unknown-unknown/release/veyntro_community_factory.wasm
