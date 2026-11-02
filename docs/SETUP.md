# Development setup

This workspace is preparing Veyntro for implementation. It does not yet contain a deployed Veyntro contract or working application. No Git repository has been created.

## Run real environment checks

Use Python 3 and the Rust/NEAR tools on PATH:

```bash
export PATH="$HOME/.cargo/bin:$PATH"
python3 scripts/preflight.py --output evidence/preflight.json
```

After selecting the real DAO, supply its public testnet account ID with `--dao`. The script checks RPC network/sync status, obtains a final block, and pins DAO account and policy reads to that block. It never signs transactions or reads keys.

Exit 0 means the requested read checks passed. It does not mean missing tools/accounts are ready or Phase 0 is complete. Inspect `tools`, `dao`, and `phase_0_complete` in the report. RPC or requested DAO failures produce exit 1 and an error report. Missing tool executables are recorded as unavailable.

A get_policy response alone does not prove that the deployed code is SputnikDAO, nor that we control an authorized member. Those checks remain mandatory before signed actions.

## Tools prepared in this session

Rust/Cargo installed with the official rustup installer. WebAssembly target: wasm32-unknown-unknown. NEAR CLI and cargo-near installed through their official release installers. Exact observed versions are in evidence/preflight.json. This is a local environment result, not an installation on the user's own computer. Reverify tools in any new execution environment.

## Governance schema inspected

Source: https://raw.githubusercontent.com/near-daos/sputnik-dao-contract/main/sputnikdao2/src/proposals.rs . This is an inspection of upstream main, not a match to selected deployed code.

FunctionCall proposals contain receiver_id and actions. Each action contains method_name, base64-encoded args, deposit and gas. add_proposal requires attached deposit to equal the DAO policy proposal_bond in the inspected source; do not assume an arbitrary bond or copy example amounts. Confirm serialized token/gas representations against the selected deployed version before constructing a signed proposal.

## Next integration gate

Identify the testnet council wallet and DAO (or arrange creation of a new DAO), inspect its code/policy/bond and funding source. Then deploy the minimal receiver and capture a real DAO-approved payable call with final receipts. Do not mark this gate complete from a build or a policy read alone.
