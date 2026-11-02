#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

receiver='receiver.aje-veyntro.testnet'
dao='veyntro.sputnikv2.testnet'
wasm='target/wasm32-unknown-unknown/release/veyntro_dao_receiver.wasm'

case "${1:-}" in
  create-account)
    printf '%s\n' "Create $receiver with 1.5 test NEAR from aje-veyntro.testnet (plus fees)."
    npx near-cli-rs account create-account fund-myself "$receiver" '1.5 NEAR' \
      autogenerate-new-keypair save-to-legacy-keychain sign-as aje-veyntro.testnet \
      network-config testnet sign-with-legacy-keychain send
    ;;
  deploy)
    if [[ ! -f "$wasm" ]]; then
      printf '%s\n' 'Build first: bash scripts/build-receiver.sh' >&2
      exit 1
    fi
    # Leave storage margin within the 1.5 NEAR account funding.
    if (( $(wc -c < "$wasm") > 140000 )); then
      printf '%s\n' 'WASM is larger than the deployment storage budget. Stop and review funding.' >&2
      exit 1
    fi
    printf '%s\n' "Deploy and initialize $receiver. This account remains user-controlled."
    npx near-cli-rs contract deploy "$receiver" use-file "$wasm" \
      with-init-call new json-args '{"dao_account_id":"veyntro.sputnikv2.testnet"}' \
      prepaid-gas '30 Tgas' attached-deposit '0 NEAR' \
      network-config testnet sign-with-legacy-keychain send
    ;;
  propose)
    checked="$(python3 scripts/receiver-governance.py --output evidence/funding-proposal.json)"
    printf '%s\n' "$checked"
    bond="$(printf '%s' "$checked" | python3 -c 'import json,sys; print(json.load(sys.stdin)["proposal_bond_yoctonear"])')"
    printf '%s\n' 'Submit the 0.01 test NEAR funding proposal. The proposal bond is additional and set by live DAO policy.'
    npx near-cli-rs contract call-function as-transaction "$dao" add_proposal \
      json-args "$(cat evidence/funding-proposal.json)" prepaid-gas '80 Tgas' \
      attached-deposit "$bond yoctonear" sign-as aje-veyntro.testnet \
      network-config testnet sign-with-legacy-keychain send
    ;;
  approve)
    if [[ ! ${2:-} =~ ^[0-9]+$ ]]; then
      printf '%s\n' 'Usage: bash scripts/receiver-integration.sh approve ACTUAL_PROPOSAL_ID' >&2
      exit 1
    fi
    python3 scripts/receiver-governance.py --proposal-id "$2" --output evidence/funding-vote.json
    printf '%s\n' 'Approve the checked proposal. With the single-member council, approval also starts execution.'
    npx near-cli-rs contract call-function as-transaction "$dao" act_proposal \
      json-args "$(cat evidence/funding-vote.json)" prepaid-gas '150 Tgas' \
      attached-deposit '0 NEAR' sign-as aje-veyntro.testnet \
      network-config testnet sign-with-legacy-keychain send
    ;;
  *)
    printf '%s\n' 'Usage: bash scripts/receiver-integration.sh {create-account|deploy|propose|approve ID}' >&2
    exit 1
    ;;
esac
