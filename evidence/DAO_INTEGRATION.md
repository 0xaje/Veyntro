# DAO integration evidence

## DAO creation — VERIFIED

Network: NEAR testnet.
DAO: veyntro.sputnikv2.testnet
Council: aje-veyntro.testnet (single-member council).
Creation transaction: 6oV4Y8DX7hxXK2FB2hietaongMPtKzZzbaWazMAyP8JX
Explorer: https://explorer.testnet.near.org/transactions/6oV4Y8DX7hxXK2FB2hietaongMPtKzZzbaWazMAyP8JX

RPC independently returned FINAL with SuccessValue. All returned receipt outcomes were non-failing, including the factory callback returning true. Account code hash matches the previously retrieved factory default: AA4nA45vauiac3jdVwJTzSdUP3oj2r1fDaPAb2mHdgcH. DAO get_config, get_policy and get_factory_info were read live. Full responses: DAO_CREATION_VERIFICATION.json.

Snapshot block: 275946755. Balance: 7 test NEAR; storage usage: 540329 bytes. This is total balance, not freely available treasury capacity.

Proposal bond: 1 NEAR. Proposal period: 604800000000000 nanoseconds (7 days). Default policy lets everyone add proposals; council can vote/finalize. With the current single-member council, one council approval satisfies the default majority.

Factory information: sputnikv2.testnet, auto_update=true. Factory upgrade authority is a trust assumption and must be documented. No code reproducibility or independent security audit is claimed.

## DAO-to-product integration — NOT VERIFIED

No receiver deployed, governance proposal, council vote or DAO-approved payable contract call has been captured. Phase 1 is incomplete. Next: build and test a minimal DAO-only receiver, deploy it to a separate account, then propose and approve a small payable call and verify its final receipts, predecessor and deposit.
