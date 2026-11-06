# Payment 6: public testnet audit

This is a checked record of one real testnet payment. It is not a promise that every future payment will have a transaction link. The contract's operation view does not store transaction hashes, so the public app shows this curated link only when the live operation matches the fields below.

| Step | Public evidence |
| --- | --- |
| Agreed work | [Activity work policy](../evidence/ACTIVITY_WORK_POLICY.json); approved DAO request 14, commitment 4, 0.05 testnet NEAR for `aje.testnet` |
| Work completed | [Web app checks run 42136893325](https://github.com/0xaje/Veyntro/actions/runs/42136893325), commit `ed4c4a664a0c0f0a40b8f5dced81290858881a63` |
| Hosted work check | [GitHub submission run 42275081154](https://github.com/0xaje/Veyntro/actions/runs/42275081154) returned `verified_onchain` and `evidence_usable: true`; [attestation transaction](https://explorer.testnet.near.org/transactions/23i8gXtwRgN7oqMF3HT1xHgn8PaewqrvDqWh2UuGG2Br) |
| Payment and final callback | [Request transaction](https://testnet.nearblocks.io/txns/4WDbT9xDxNgJVgGcgeSwcTex7GGrmT2U3tsLPH94jKex) from `aje.testnet` to `firewall-aje-veyntro.testnet`. Final RPC outcome `SuccessValue`; `payment_pending` event links operation 6 to commitment 4, amount `50000000000000000000000` yoctoNEAR, recipient `aje.testnet`, nonce 1. The callback `operation_settled` records operation 6 as `Succeeded` for the same amount. The recipient's transfer receipt also succeeded. |
| Current contract view | Public Activity shows payment 6 `Completed`; commitment 4 shows `Completed`, zero still set aside. |

The GitHub result proves the agreed workflow passed on the pinned commit. It does not independently prove business quality. The verifier key can submit only the configured attestation method; the beneficiary signs the payment request. The contract's callback is the authoritative payment result, not the wallet's initial submission alone.

**Limit:** The immutable contract operation stores no transaction hash. Curated links are matched against the live record before display. Future payments need a verified transaction index or another checked entry; no guessed link is shown. Do not deploy a contract upgrade solely to fill this UI field without a separate storage and migration review.
