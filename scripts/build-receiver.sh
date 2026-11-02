#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
cargo fmt --all -- --check
cargo test --locked -p veyntro-dao-receiver
cargo clippy --locked -p veyntro-dao-receiver --all-targets -- -D warnings
RUSTFLAGS='--cfg near' cargo build --locked -p veyntro-dao-receiver \
  --target wasm32-unknown-unknown --release
sha256sum target/wasm32-unknown-unknown/release/veyntro_dao_receiver.wasm
