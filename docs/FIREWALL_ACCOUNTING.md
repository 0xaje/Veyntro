# Commitment Firewall — accounting design

This implements master-plan sections 3–5 in a separate contract. Phase 1's receiver stays unchanged. This document describes implementation decisions, not a deployed product or an audit.

## Money and pending operations

- C: DAO-funded accountable funds. Deployment money, direct transfers and unexpected refunds are excluded. A DAO can add funds in several deposits; nothing is spendable until backing/reserve checks pass.
- R: total remaining commitment liabilities, **including pending payouts**.
- W: pending withdrawals of uncommitted funds.
- O: max(configured operating reserve, current runtime storage stake + reserved future operation storage + 1,024-byte state margin + 0.05 NEAR gas buffer).
- Ledger capacity = max(0, C − O − R − W). Pending payouts are not subtracted again.
- Public money available is conservatively capped using actual account balance as well. New commitments/transfers require both C and actual balance to cover O + R + W. Actual balance can fall before a callback runs, so this can temporarily block otherwise safe actions. It deliberately prefers a temporary pause over optimistic backing. Callbacks and releases can still reconcile.

Storage is measured again after writing each new commitment/operation and before scheduling a transfer. A failed receipt rolls back its writes. Evidence slots and settlement fields have fixed serialized size so normal callbacks do not allocate new history records. Configuration changes remain DAO-controlled. Verifier rotation is allowed even while backing is impaired, so emergency revocation does not depend on a solvent ledger.

Each commitment reserves 32 payment-attempt slots of 1,024 bytes each before its amount is considered backed. A payout consumes one slot before its operation is stored; measured storage growth must fit that allowance. This keeps an otherwise fully committed treasury able to store its payment record. Attempts are bounded so beneficiaries cannot grow history without limit. Failed attempts consume a slot, but not the payment amount. If all 32 are exhausted, the DAO must cancel/release and approve a new commitment. Closing the commitment releases all unused slot allowances. A DAO withdrawal also needs storage headroom for its operation, so withdrawing every last quoted unit can fail rather than consume storage backing.

## Transition rules

| Action | C | R | W |
| --- | --- | --- | --- |
| Authenticated DAO deposit x | +x | unchanged | unchanged |
| New commitment x | unchanged | +x | unchanged |
| Payout submitted x | unchanged | unchanged; x stays encumbered | unchanged |
| Payout success x | −x | −x | unchanged |
| Payout failure, still open | unchanged | unchanged | unchanged |
| Withdrawal submitted x | unchanged | unchanged | +x |
| Withdrawal success x | −x | unchanged | −x |
| Withdrawal failure x | unchanged | unchanged | −x |
| Cancel/expire | unchanged | release only remaining minus pending | unchanged |

A cancelled/expired commitment retains its pending liability. Success settles that amount once. Failure releases it once. A callback at or after expiry also releases any unused amount. Callback entry points are private, explicitly check the immediate predecessor and promise-result count, require the correct operation kind, and ignore already-settled operations. No externally supplied success flag is accepted.

One pending payout per commitment keeps concurrency bounded; separate commitments can pay concurrently. Drawdown nonces start at 1, are consumed on submission, and are never reused even after failure. Each retry uses a new nonce and operation ID. Withdrawals also require a monotonically increasing DAO-supplied nonce (starts 1); a replayed governance call cannot schedule the same authorized withdrawal twice, even if the transfer succeeded but a later callback failed. Withdrawal IDs are unique and pending withdrawals reduce capacity immediately. This extra argument strengthens the master plan's replay protection; no existing full-contract client has been deployed.

## Evidence and trust

DAO policy hash, beneficiary, fixed recipient, ceiling and deadline are immutable. All reservations require evidence. Only the configured verifier can attest. Attestations bind the target reservation's policy and monotonically increasing nonce, accept fixed-size nonzero hashes, and expire no later than the commitment. Rotating the verifier increments an epoch and invalidates existing unspent attestations. Already-submitted native transfers cannot be recalled by rotation.

The contract authenticates the verifier; it does not query GitHub. A valid signed NEAR transaction includes the reservation ID, so editing the ID requires a new verifier signature. Actual GitHub ownership/ref/workflow/commit checks and contextual digest generation remain Phase 3. Local test attestations are test inputs and must never be presented as genuine GitHub results.

## Boundaries and recovery

If a callback itself fails (for example, gas exhaustion), the operation stays pending and its money remains encumbered. There is no administrative method to declare arbitrary success/failure or release an unresolved transfer. Such an incident requires investigation of final receipts and a reviewed recovery/upgrade plan; stuck callbacks remain a liveness risk until further recovery design is verified.

The callback returns an operation status. A successfully executed callback can report `Failed` for the native transfer: a top-level transaction success alone must never be shown as payment success. Clients must read the operation and inspect receipt outcomes. A failed native transfer's refund may arrive separately; conservative physical checks can pause retries until the actual money is back.

Views paginate up to 50 records; no public method loops through all history. Only the DAO creates liabilities or withdraws free funds. Beneficiaries cannot change recipients, evidence or budgets. The verifier cannot withdraw. Expiry cleanup is permissionless. A deployment full-access key can bypass application controls; no production custody claim is valid until deployment/key/upgrade policy is reviewed. Unexpected external balance loss makes backing checks fail, never creates new capacity.

Live Phase 2 gate remains: deploy new contract; DAO-fund it; create two backed obligations; reject overcommitment; check authorization/replay; execute real evidenced payout and failure/retry; release expiry; verify final receipts and public numbers. Local tests alone do not complete Phase 2.

Primary references inspected: https://docs.near.org/smart-contracts/anatomy/crosscontract and https://docs.near.org/protocol/storage/storage-staking . SDK/runtime compatibility baseline remains Rust 1.95, near-sdk 5.30, protocol 88 verified for the receiver; the larger contract must be verified separately on testnet.
