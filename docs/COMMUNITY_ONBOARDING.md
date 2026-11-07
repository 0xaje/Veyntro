# Another community using Veyntro

**Current status:** The public site opens the original testnet Firewall by default and now lets a visitor select a separately deployed, compatible community Firewall. It does not deploy a new DAO, Firewall or verifier for that community. The second-community payment flow is not verified yet.

**Who does setup?** Today, deploying a new instance is a manual, technical process. A new community should not need to send its wallet address to the Veyntro owner. The intended hosted setup flow will let members connect their own wallets, create or connect their DAO, inspect the cost and contract accounts, sign each setup transaction, configure a verifier they control, and share their own public link. Veyntro must never receive their recovery phrase or private key. This self-serve flow is an open product gate, not a shipped feature.

**Second-community candidate (7 Nov 2026):** `againa.testnet` was verified by finalized testnet RPC as an existing wallet account with 1 testnet NEAR and one full-access key. This does not prove who controls the key. It is intended to exercise the hosted self-serve flow as a new user. Do not preconfigure its DAO, Firewall or verifier on its behalf and then claim onboarding works. The earlier Veyntro DAO factory transaction attached 7 testnet NEAR; do not assume 1 NEAR is sufficient. Check current factory requirements and show the cost before wallet signing. No setup transaction has been signed for this candidate.

1. A community brings a NEAR testnet SputnikDAO it controls. Its council policy must permit the intended members to submit and vote on FunctionCall proposals. Members use their own wallets and cover the DAO's proposal bond and testnet gas.
2. Deploy a separate Commitment Firewall account with the reviewed WASM. Its initial call names that community's DAO, a distinct verifier account and an operating reserve. Never reuse `firewall-aje-veyntro.testnet`, its verifier key, or its DAO funds.
3. Read both contracts at a finalized testnet block. Confirm the Firewall reports the intended DAO and verifier, the DAO answers `get_policy`, and the Firewall is solvent before offering any write action. Reject mismatches or missing contracts.
4. The public app should let visitors choose that verified Firewall, then read its own DAO approvals, money, commitments and payments. Links should preserve that choice. Wallet signatures must target only the selected DAO or Firewall, and contract permissions remain authoritative.
5. Verify with a second community-owned DAO and wallet: fund through DAO approval; set money aside; reject an overcommitment; run the agreed GitHub work check with that community's verifier; settle a beneficiary payment; inspect the public record without a wallet. Capture final receipts and regression-check the original DAO.

The current manually dispatched evidence workflow is configured for the original deployment. A second DAO needs its **own restricted verifier setup and evidence policy** before claiming evidence-gated payments. Do not route another community's evidence through the original private key by default. Mainnet and real treasury funds need independent security review; this gate is testnet-only.

The public app's first selection slice accepts a Firewall account in **Choose community**. For a non-default account, it checks the deployed Firewall and DAO code hashes against the currently tested testnet contracts at one finalized block, confirms the Firewall points to that DAO and a separate verifier, then loads its balances, requests and wallet targets. Links preserve the selected account. Exact receipt links checked for the original DAO are never shown for another account. This is not a contract audit or a deployment wizard. The second DAO's own verifier and end-to-end payment still need proof.

The first read-only check is available to developers now:

```bash
python3 scripts/check-community.py --dao veyntro.sputnikv2.testnet --firewall firewall-aje-veyntro.testnet
```

Use another DAO and Firewall account pair when they exist. The script reads finalized onchain state and rejects a mismatched pair. It does not deploy a contract, authenticate its code hash against an approved build, or prove a council wallet is controlled by the community. The hosted app performs an additional exact deployed-code comparison before loading a non-default community.

**Hosted smoke check (6 Nov 2026):** `https://veyntro-web.onrender.com/?choose=1` showed the chooser. Submitting an unknown testnet account stayed on the chooser with an error and no wallet actions. Submitting the real but incompatible `receiver.aje-veyntro.testnet` account produced “This Firewall does not match the Veyntro contract on testnet.” Returning to the original community showed its public overview. This tests rejection and the existing deployment; no second compatible Firewall exists in this check.
