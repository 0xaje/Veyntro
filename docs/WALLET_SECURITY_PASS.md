# Wallet and payment security pass — 2026-11-06

Scope: the hosted web app's wallet modules, amount entry, DAO proposal/vote calls, beneficiary payment request, and existing production dependency report. This is an internal code review, not an external audit or permission to handle mainnet funds.

## Fixed in this pass

`amountToYocto` previously used `.slice(0, 24)` after padding the decimal part. A user could enter 25 or more decimal places and the wallet would sign a smaller amount without warning. The parser now rejects those inputs, limits very long text, and preserves exact 1-yocto values. The same parser serves DAO funding, commitments, withdrawals, and beneficiary requests. Production web build and focused amount tests passed.

## Existing safeguards checked

- Wallet signatures go through NEAR Wallet Selector. The frontend does not request a private key. DAO proposal/vote permissions are checked from the current policy, and the contract and DAO remain the authority.
- Before voting, the app rereads the live proposal and policy from the same final DAO block, then compares the displayed terms with the fresh proposal. A successful DAO vote alone is not displayed as a successful downstream contract action.
- Beneficiary payment uses the connected account, immutable contract receiver, commitment ID, amount, and next nonce. The firewall enforces beneficiary, evidence validity, amount ceiling, expiry, pending-payment guard, and nonce onchain. Callback status marks the operation final.
- A wallet cancellation or missing final result does not count as payment success. Users can inspect the resulting contract record.

## Open dependency risk

`npm audit --omit=dev` on the web package reported 30 findings: 19 low, 2 moderate, 9 high, 0 critical. High findings transit through `@near-wallet-selector/meteor-wallet` and `@near-wallet-selector/here-wallet` and their SDK/encoding dependencies. The report includes malformed input denial-of-service concerns in `decode-uri-component` and `nanoid`, and a Unicode lookalike validation concern in `base-x`. npm's proposed automatic fixes downgrade wallet-selector modules across major versions and could break supported testnet wallets. No incompatible downgrade was applied. Verify upstream compatible fixes and the actual reachable browser paths before changing modules. Do not interpret the nine package-level findings as nine proven exploitable Veyntro flaws, or as zero risk.

## Remaining checks

1. Independently test a fresh wallet on hosted mobile and desktop, including a rejected signature, switch of connected account, and refresh during an in-flight request.
2. Review full-access deployment key custody and verifier key rotation/revocation. The hosted verifier has a restricted `submit_attestation` key, but the legacy full-access account keys remain a governance/custody risk.
3. Run an independent adversarial review of the deployed contract callbacks, promise failures, storage reserve and DAO policy before mainnet or real-money use.
4. Replace the manually checked transaction-link catalog with a verified public transaction index if ongoing audit links are required; never infer a hash from an operation ID.
