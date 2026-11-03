# Phase 2 contract security review

DATE: 2026-11-03
STATUS: OPEN — first-pass static review only; not an audit or security clearance.

## Scope reviewed

Read the Commitment Firewall Rust source on the repository default branch:
- `contracts/commitment-firewall/src/lib.rs`
- `accounting.rs`
- `governance.rs`
- `payments.rs`
- `types.rs`
- adversarial test names and selected callback/accounting test bodies in `tests.rs`

No code was changed and no test suite was run during this review. The previously recorded local test and CI results are not a substitute for this review. Live transaction and view results below are based on terminal output supplied by the user; they were not independently queried from this environment.

## First-pass conclusion

No confirmed critical accounting or authorization flaw was identified in the reviewed code paths. The implementation uses checked arithmetic, restricts funding/reservations/cancellation/withdrawals/verifier changes to the configured DAO, restricts drawdowns to the reservation beneficiary, fixes the payout recipient at reservation creation, and uses private typed callbacks with one promise result. Failed payout and withdrawal callbacks keep funds accounted for; successful outcomes reduce confirmed funds and liabilities together. Storage and pending transfers are included in backing checks.

This conclusion is limited to a source review. It does not establish that the contract is safe for production or free of vulnerabilities.

## Material trust and reliability limits

1. **The verifier is trusted.** Onchain, `submit_attestation` checks that the configured verifier account called it and validates commitment, policy hash, nonce, epoch and time. The contract cannot independently prove that the GitHub run is genuine. A compromised verifier key can attest false evidence. The DAO can rotate the verifier; rotation invalidates old unspent attestations. Keep the verifier key separate and tightly controlled.
2. **Callback failure favors safety over liveness.** A transfer callback that cannot complete leaves its amount pending/encumbered instead of releasing it. That avoids double spending but can leave funds stuck. The contract has no general permissionless repair method for a callback that never settles. Monitor callbacks and keep evidence of every receipt.
3. **Deployment authority remains sensitive.** The firewall account's full-access key can deploy changed contract code. Its custody and upgrade policy need a separate review before production use.
4. **Payment attempts are bounded.** Each commitment has 32 reserved payout-operation slots. Failed attempts consume a slot and nonce; retry requires the next nonce. This bounds per-commitment storage but can require a new DAO commitment after repeated failures.
5. **The public product is not present.** The GitHub verifier is a CLI that prepares unsigned transactions for local signing. There is no public app or hosted verifier endpoint yet. Do not describe the workflow as ordinary-user ready.

## Adversarial coverage status

The source tests include authorization denial, overcommitment, replay protection, callback spoof/multiple-result checks, storage reserve growth, pending payout/cancellation/expiry interleavings and repeated failure bounds. Existing live testnet evidence now also demonstrates:
- rejected overcommitment and missing evidence;
- successful evidence-gated payout and permissionless expiry;
- failed DAO withdrawal callback and nonce-based retry;
- failed beneficiary payout callback, retained liability, and nonce-2 successful retry;
- final balance reconciliation with solvency and physical-backing flags true.

Remaining gates:
- Independent external tester must attempt unauthorized callers, replay/double settlement, concurrent commitments, pending-expiry/cancellation interleavings, verifier rotation and mismatched evidence.
- Re-run the current pinned contract test/build workflow against the exact reviewed source revision before Phase 2 closure.
- Review full-access key custody, callback monitoring and recovery runbook.
- Record any findings and fixes; re-review deployed code hash before calling this gate complete.

## Evidence references

- `evidence/OVERCOMMITMENT_REJECTION.json`
- `evidence/MISSING_EVIDENCE_REJECTION.json`
- `evidence/FIRST_PAYOUT_EXECUTION.json`
- `evidence/EXPIRY_RELEASE.json`
- `evidence/WITHDRAWAL_CALLBACK_FAILURE.json`
- `evidence/WITHDRAWAL_RETRY_SUCCESS.json`
- `evidence/FAILED_PAYOUT_CALLBACK.json`
- `evidence/PAYOUT_FAILURE_RETRY_SUCCESS.json`

## Phase status

Phase 2 remains IN_PROGRESS until the remaining independent security review gates are complete. Phase 3's real GitHub-to-attestation-to-payment acceptance flow has already been exercised through the CLI/manual-signing path. Phase 4 remains NOT_STARTED.
