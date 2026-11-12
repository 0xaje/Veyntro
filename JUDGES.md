# Veyntro: a short judge walkthrough

**A DAO can have money in its account and still have too little left for a new promise.** Veyntro's Commitment Firewall accounts for work already promised, pending payments, and the contract's safety reserve before another commitment can be made. SputnikDAO makes the decision; the Firewall enforces the money limit. This is a live **NEAR testnet** product.

## See the difference in one minute

1. Start with [DAO request 4](https://veyntro-web.onrender.com/governance), shown as a past failed example above recent requests. It says **Failed during execution**. The DAO voted to set aside 1 NEAR when only 0.27188 NEAR was available, but the [contract rejected the overcommitment](https://testnet.nearblocks.io/txns/HnMJXawR3zD6onxcQe6n27wrYVQ1X591U7r4miPrnEtt). If the explorer does not load, see the [recorded final receipts and unchanged treasury](evidence/OVERCOMMITMENT_REJECTION.json). A vote cannot make unavailable money available. These figures describe that historical test, not today's treasury balance.
2. Open the [public treasury](https://veyntro-web.onrender.com/). Compare **Money available** with **Money set aside**. These are current finalized testnet reads, not fixed demo numbers. No wallet is needed to view them.
3. On [DAO approval](https://veyntro-web.onrender.com/governance), find request 14 **Approved**: the DAO set aside 0.05 testnet NEAR for named work. This approval created [commitment 4](https://veyntro-web.onrender.com/commitments/4); it did not itself send the beneficiary a payment.
4. On commitment 4, inspect the payment account, checked commit, completed status, and zero still set aside. Follow its payment link to [Activity](https://veyntro-web.onrender.com/activity): payment 6 is **Completed**. The [payment transaction and receipts](https://testnet.nearblocks.io/txns/4WDbT9xDxNgJVgGcgeSwcTex7GGrmT2U3tsLPH94jKex) show the 0.05 testnet NEAR transfer to `aje.testnet`; the [payment audit](docs/PAYMENT_6_AUDIT.md) distinguishes the submitted request from its final callback.

## What happened between approval and payment?

The [agreed GitHub checks](https://github.com/0xaje/Veyntro/actions/runs/42136893325) passed on a pinned commit. A [manually started, restricted verifier run](https://github.com/0xaje/Veyntro/actions/runs/42275081154) checked that evidence and [submitted an attestation](https://explorer.testnet.near.org/transactions/23i8gXtwRgN7oqMF3HT1xHgn8PaewqrvDqWh2UuGG2Br). The beneficiary then signed the payment request. The contract checked the approved amount, account, evidence, expiry, and nonce; its final transfer callback recorded the result. Passing CI proves the named checks passed, not that the work has independent business value.

Other real testnet cases: [DAO funding](https://explorer.testnet.near.org/transactions/BwjKrwuyGq1k5kYjZHQTBaof8DbGeT3UyczuWRAWPE5y), [unused money released after expiry](https://explorer.testnet.near.org/transactions/3bWgBZGtCJEHxdgo4Kcm995fXPXzskbfXbpKSG5enMv1), and a [failed transfer](https://explorer.testnet.near.org/transactions/5hXiJWVF6T5Yy5CCwLHe1YwzSZv5LgyhkDagrBMTq28t) followed by a [successful retry](https://explorer.testnet.near.org/transactions/4mugR4TmcxwQ62164DiGFZWinfvKzbvjuqxWK4Po1ukk). See the [README](README.md) for local build commands and all account IDs.

## Scope and trust

This live example uses one testnet DAO with `aje.testnet` as its sole council voter and payment recipient. Another community cannot set up its own DAO from this site. A second independently controlled DAO has **not** completed the governance, evidence, and payout flow. The GitHub verifier trusts a restricted signing key and needs an operator to start its workflow. There is no completed independent security audit or external usability test. Testnet tokens have no mainnet value.

The current public site uses free static hosting and the checked evidence run uses GitHub Actions. A community would need to fund its own DAO and contract storage/gas on NEAR and operate and protect its own restricted verifier key. There is no fee or revenue model in the app. Moving to mainnet would require a separate security audit, deployment and key review, reliable verifier operations, and a verified second-community flow; none of those are claimed today.

For a 2–3 minute recording of this exact evidence, see the [demo recording guide](docs/DEMO_SCRIPT.md). No video or public demo post is claimed until it has actually been recorded and posted.
