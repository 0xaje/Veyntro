# Move routine DAO approval to the browser wallet

The two current council members are `aje.testnet` and `aje-veyntro.testnet`. Proposal 11 showed that one vote from `aje.testnet` is recorded but does not pass a proposal while both are members. To make `aje.testnet` the sole voter, the DAO must approve removal of `aje-veyntro.testnet` from the council. This is a one-time governance change, not a frontend setting.

**Tradeoff:** afterward, one browser wallet controls DAO votes, including treasury actions and policy changes. Losing or compromising `aje.testnet` could lock or endanger the DAO. Keep the recovery method offline. For community use, add a genuinely independent second council member with a browser-accessible wallet and choose a voting policy requiring both, rather than calling a sole-voter DAO multi-person approval.

The preflight script reads finalized testnet state and writes unsigned public JSON. It never reads or exports private keys. Review every wallet transaction before signing. Do not repeat a successful vote. The amount below is the current live 1 NEAR proposal bond, paid by the proposer; check the script's output in case it changes.

## 1. Prepare and submit removal

Only continue when proposal 11 is Approved and its 0.5 NEAR funding is visible in the Firewall. From the repository root after pulling this branch:

```bash
python3 scripts/retire-cli-council.py prepare --out /tmp/veyntro-retire-proposal.json
cat /tmp/veyntro-retire-proposal.json
npx near-cli-rs contract call-function as-transaction \
  veyntro.sputnikv2.testnet add_proposal \
  json-args "$(cat /tmp/veyntro-retire-proposal.json)" \
  prepaid-gas '80 Tgas' attached-deposit '1 NEAR' \
  sign-as aje-veyntro.testnet network-config testnet \
  sign-with-legacy-keychain send
```

Confirm the payload removes only `aje-veyntro.testnet` from `council`. Save the actual proposal ID returned by the DAO; never guess it.

## 2. Vote from both current accounts

Replace `ACTUAL_ID` with that returned ID. The first vote uses the Ubuntu account one last time:

```bash
python3 scripts/retire-cli-council.py vote --id ACTUAL_ID --out /tmp/veyntro-retire-vote.json
cat /tmp/veyntro-retire-vote.json
npx near-cli-rs contract call-function as-transaction \
  veyntro.sputnikv2.testnet act_proposal \
  json-args "$(cat /tmp/veyntro-retire-vote.json)" \
  prepaid-gas '150 Tgas' attached-deposit '0 NEAR' \
  sign-as aje-veyntro.testnet network-config testnet \
  sign-with-legacy-keychain send
```

Then refresh Veyntro's **DAO approval** page, connect `aje.testnet`, expand **Review the DAO change**, confirm the exact removal, and vote **Approve** in the browser. Review the wallet's receiver and method before signing. Do not vote against an unfamiliar proposal.

## 3. Confirm the outcome

```bash
python3 scripts/retire-cli-council.py verify --id ACTUAL_ID
```

It must show `Approved` with only `aje.testnet` in the council. A later genuine proposal can then test whether one browser vote passes under the remaining policy; do not claim this behavior until its final receipt and DAO status are checked. The former Ubuntu key still controls its own NEAR account, but it should no longer have the council role. Keep the key safe; this procedure does not delete credentials or rotate the DAO's other access keys.
