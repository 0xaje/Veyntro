# Commitment Firewall — deployed contract API

The contract is deployed on NEAR testnet as `firewall-aje-veyntro.testnet`; its deployment and verified transaction behavior are recorded in `docs/PROGRESS.md` and `evidence/`. This file documents the contract interface, not a hosted user application. A browser UI and hosted service are not yet available. Amounts are decimal-string yoctoNEAR (`U128`); IDs, nonces and nanosecond deadlines are decimal-string `U64`. Account IDs use NEAR's validated AccountId type. All writes require a signed NEAR transaction. SDK nonpayable wrappers reject attached deposits except on fund_treasury.

| Method | Immediate caller | Arguments / behavior |
| --- | --- | --- |
| new | Contract account itself | dao_account_id, verifier_account_id, operating_reserve; minimum reserve 0.05 NEAR; different authority accounts |
| fund_treasury | DAO | No JSON arguments; positive attached NEAR; credits only actual attached amount |
| create_reservation | DAO | beneficiary, payout_recipient, amount, expires_at_ns, evidence_policy_hash (64 nonzero hex characters); returns reservation ID |
| cancel_reservation | DAO | id; releases unused amount, keeps pending liability |
| submit_attestation | Configured verifier | id, evidence_digest (64 hex), policy_hash (64 hex), commit_sha (40 hex), nonce (starts 1), valid_until_ns |
| request_drawdown | Reservation beneficiary | id, amount, operation_nonce (starts 1); at least 80 Tgas; fixed DAO-approved recipient; returns transfer/callback promise |
| release_expired | Anyone | id; at or after deadline; releases only unused capacity; idempotent |
| withdraw_available | DAO | amount, recipient, operation_nonce (global DAO withdrawal sequence starts 1); at least 80 Tgas; free capacity only |
| set_verifier | DAO | new_verifier; invalidates old unspent evidence by increasing verifier epoch |
| on_drawdown_result | Contract callback only | operation_id; exactly one native transfer result; settles once |
| on_withdraw_result | Contract callback only | operation_id; withdrawal operation only; settles once |
| get_treasury_state | Public view | C, effective/configured reserve, liabilities, pending amounts, conservative money_available and backing flags |
| get_reservation | Public view | id; immutable terms, remaining/pending money, status, payment attempts left, evidence or null |
| list_reservations | Public view | optional from_index and limit; default 20, maximum 50 |
| get_operation | Public view | id; kind, fixed recipient/amount, pending/succeeded/failed, timestamps |

Evidence fields are authenticated assertions from the trusted verifier, not GitHub data fetched by the contract. The real GitHub verification service is still Phase 3. Policy hash must commit to the full approved offchain evidence policy, including repo, immutable commit, workflow/ref and allowed event. Contextual attestation digests and real workflow URLs must be recorded by the verifier. Do not attest fabricated outcomes to exercise the live contract.

## Events

`EVENT_JSON:` records use standard `veyntro`, version `1.0.0` and an array in data. Names: funded, commitment_created, commitment_cancelled, commitment_expired, verifier_changed, evidence_checked, payment_pending, withdrawal_pending, operation_settled. Events describe the stage actually reached; pending is never a payment success. Rejected receipts are errors, not successful state transitions. Audit pages must use real receipts and current chain views.

## Deployment and live verification gate

Use a NEW contract account; never redeploy over receiver.aje-veyntro.testnet. Build locally with scripts/build-firewall.sh, record its actual hash, create the account with a free testnet faucet, and establish separate actual verifier and beneficiary accounts before initialization. Signing keys stay on the user's machine until a separately reviewed backend deployment flow exists.

The initial artifact is about 219 KB, so storage requires over 2 test NEAR. The DAO must also deposit enough accountable funds to cover the effective reserve and commitment budgets; pre-funded deployment balances are deliberately excluded from accountable funds. Query actual state and balances before choosing proposal amounts. No fixed example balance is live evidence.

Phase 2 is not complete until real DAO funding, backed commitments, rejected overcommitment, actual authorized payout and failed/retried payment, pending-safe reconciliation, expiry release and final explorer evidence have been captured. Current SDK harness tests validate Rust behavior but do not certify generated ABI guards, transaction rollback, actual gas sufficiency or real cross-receipt execution. These need sandbox/live integration checks. Deployment full-access keys and callback liveness remain explicit trust/reliability review items.
