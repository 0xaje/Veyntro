# Browser council access on NEAR testnet

This procedure adds `aje.testnet` to the `council` role of `veyntro.sputnikv2.testnet`. The existing `aje-veyntro.testnet` member remains. It gives `aje.testnet` the ability to vote on DAO actions, including treasury actions. Live proposal 11 showed that one approval from `aje.testnet` did not pass with two council members; the second member's vote was needed. Do not use this procedure for an account you do not control. See `docs/RETIRE_CLI_COUNCIL.md` for the one-time move to browser-only approval.

The preparation script reads live final testnet state and writes unsigned public JSON. It stops if the DAO council, permissions, or threshold have changed. It never reads keys. Signatures remain in the user's wallets or Ubuntu legacy keychain. Review each CLI transaction summary before sending.

## 1. Prepare the proposal

From the repository root:

```bash
python3 scripts/browser-council.py prepare --out /tmp/veyntro-browser-council-proposal.json
cat /tmp/veyntro-browser-council-proposal.json
```

Expected payload kind: `AddMemberToRole` with `member_id` `aje.testnet` and `role` `council`. Check the printed live proposal bond. The command below assumes the printed bond is exactly `1000000000000000000000000` yoctoNEAR (1 NEAR); stop if different.

Submit using the existing Ubuntu council key after reviewing the payload and attached bond. This does not require the private key of `aje.testnet` or importing the council key into Meteor.

```bash
npx near-cli-rs contract call-function as-transaction veyntro.sputnikv2.testnet add_proposal \
  json-args "$(cat /tmp/veyntro-browser-council-proposal.json)" \
  prepaid-gas '80 Tgas' attached-deposit '1 NEAR' \
  sign-as aje-veyntro.testnet network-config testnet sign-with-legacy-keychain send
```

Record the actual proposal ID returned by the DAO. Do not guess it. The proposal bond is separate from any Firewall funding.

## 2. Check and vote with the existing council key

Replace `ACTUAL_ID` with the proposal ID from step 1:

```bash
python3 scripts/browser-council.py vote --id ACTUAL_ID --out /tmp/veyntro-browser-council-vote.json
cat /tmp/veyntro-browser-council-vote.json
npx near-cli-rs contract call-function as-transaction veyntro.sputnikv2.testnet act_proposal \
  json-args "$(cat /tmp/veyntro-browser-council-vote.json)" \
  prepaid-gas '150 Tgas' attached-deposit '0 NEAR' \
  sign-as aje-veyntro.testnet network-config testnet sign-with-legacy-keychain send
```

The preflight verifies the exact proposal kind, proposer, description, open status, expiry, and council policy at a final block. Check the CLI's transaction summary before confirming. Do not repeat a completed vote.

## 3. Check membership and web voting

```bash
python3 scripts/browser-council.py verify --id ACTUAL_ID
```

This must show Approved and both council accounts. Then connect `aje.testnet` to Veyntro on NEAR testnet. An **Approve** button should appear for a new eligible proposal. Do not create a treasury action only to test a button; use a real DAO decision and inspect its contents before signing. Confirm the final transaction receipts and onchain status after the vote.
