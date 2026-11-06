# Another community using Veyntro

**Current status:** Veyntro's hosted site still points to the original testnet Firewall. This is the implementation and acceptance plan for a second community, not a claim that onboarding is live.

1. A community brings a NEAR testnet SputnikDAO it controls. Its council policy must permit the intended members to submit and vote on FunctionCall proposals. Members use their own wallets and cover the DAO's proposal bond and testnet gas.
2. Deploy a separate Commitment Firewall account with the reviewed WASM. Its initial call names that community's DAO, a distinct verifier account and an operating reserve. Never reuse `firewall-aje-veyntro.testnet`, its verifier key, or its DAO funds.
3. Read both contracts at a finalized testnet block. Confirm the Firewall reports the intended DAO and verifier, the DAO answers `get_policy`, and the Firewall is solvent before offering any write action. Reject mismatches or missing contracts.
4. The public app should let visitors choose that verified Firewall, then read its own DAO approvals, money, commitments and payments. Links should preserve that choice. Wallet signatures must target only the selected DAO or Firewall, and contract permissions remain authoritative.
5. Verify with a second community-owned DAO and wallet: fund through DAO approval; set money aside; reject an overcommitment; run the agreed GitHub work check with that community's verifier; settle a beneficiary payment; inspect the public record without a wallet. Capture final receipts and regression-check the original DAO.

The current manually dispatched evidence workflow is configured for the original deployment. A second DAO needs its **own restricted verifier setup and evidence policy** before claiming evidence-gated payments. Do not route another community's evidence through the original private key by default. Mainnet and real treasury funds need independent security review; this gate is testnet-only.

The first read-only check is available to developers now:

```bash
python3 scripts/check-community.py --dao veyntro.sputnikv2.testnet --firewall firewall-aje-veyntro.testnet
```

Use another DAO and Firewall account pair when they exist. It reads finalized onchain state and rejects a mismatched pair. It does not deploy a contract, authenticate its code hash against an approved build, prove a council wallet is controlled by the community, or enable another DAO in the hosted app yet.
