#!/usr/bin/env bash
set -euo pipefail

# Signing uses the account key already saved on the user's computer.
veyntro_dao_args="$(node <<'JS'
const init = {
  config: {
    name: 'Veyntro',
    purpose: 'Every commitment accounted for. Shared treasury governance on NEAR testnet.',
    metadata: ''
  },
  policy: ['aje-veyntro.testnet']
};
console.log(JSON.stringify({
  name: 'veyntro',
  args: Buffer.from(JSON.stringify(init)).toString('base64')
}));
JS
)"

printf '%s\n' 'Create veyntro.sputnikv2.testnet with aje-veyntro.testnet as its sole council member.'
printf '%s\n' 'Attach 7 test NEAR from aje-veyntro.testnet; transaction fees are additional.'
printf '%s\n' 'Factory creation does not complete the DAO-to-Veyntro funding milestone.'

npx near-cli-rs contract call-function as-transaction \
  sputnikv2.testnet create json-args "$veyntro_dao_args" \
  prepaid-gas '150 Tgas' attached-deposit '7 NEAR' \
  sign-as aje-veyntro.testnet network-config testnet \
  sign-with-legacy-keychain send
