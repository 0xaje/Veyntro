# Firewall check history

Source preparation on 2026-11-02. Final results are in FIREWALL_BUILD.json and firewall-build.log.

- Initial compilation failed: generated CommitmentFirewallExt was not imported into split near impl modules; a test storage prefix used String instead of bytes; the old promise_result helper was deprecated. Imports/prefixes fixed, callback now uses promise_result_checked with zero-byte native-transfer output.
- First compiled suite: 39 passed, 3 failed (42 tests total). Failing expectations assumed a fixed 1 NEAR reserve despite SDK runtime storage baseline and assumed available money could not increase when unused estimated storage allowance is released. Tests corrected to check real invariant behavior instead of a fabricated fixed available amount.
- Manual review found later payment-record storage needed preallocation. Added 32 bounded 1024-byte slots per commitment, measured storage growth, and release of unused slots. Added a test proving a fully committed ledger can still record its payment.
- An additional invariant assertion needed an explicit u64 sum annotation; compilation fixed.
- Expanded suite: 54 firewall tests passed. Review then found governance withdrawal retries needed caller-supplied replay protection; added a withdrawal nonce and two regression tests.
- Final run: 56 firewall tests and 9 receiver tests passed; formatting and Clippy with warnings denied passed; locked WASM build passed. No testnet deployment/payment results are inferred from these SDK harness checks.

Resolved issues remain documented rather than being hidden behind the successful final run. Generated ABI/private/payable guards, receipt rollback, callback gas and physical cross-receipt behavior still require sandbox/live tests.
