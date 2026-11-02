# Veyntro — decisions

## 2026-10-31 (WAT) — Preserve supplied source of truth

Decision: use the attached version 1.2 plan and supplied agent instructions as canonical copies for this inspection handoff. They were read completely. The separately saved version 1.1 does not supersede this explicitly supplied version 1.2.
Reason: preserve the user-selected plan, including simple-English UI and skills policy.
Impact: no scope, security or accounting changes.

## 2026-10-31 (WAT) — Resume existing work before implementation

Decision: do not initialize a new repository or scaffold another app while the requested existing repository is unavailable.
Alternative: start a fresh implementation in scratch; rejected because it could duplicate or replace unseen existing work.
Impact: preserve inspection results and request the actual repository/path. Phase 0 stays blocked; no later phase is marked complete.

## 2026-10-31 (WAT) — Use skills when there is appropriate work

Decision: record presence of all four installed skill files. Do not run design or code-quality audits against a documentation-only workspace. Desloppify's scanner executable is absent.
Reason: avoid unnecessary redesign and meaningless quality scores. Third-party advice cannot override fund safety, tests or the master plan.

## 2026-10-31 — Continue environment preparation without a repository

User clarified that repository creation waits until November 1 and requested continued professional development. Prepare real tooling and reproducible live checks now; retain the repository-creation hold. No need to ask again for an existing repository that the user has not created. Current work is Phase 0; no financial or UI scope changes.

## 2026-11-02 — Isolate the governance receiver

Implement a separate capped receiver for the Phase 1 DAO call gate. It is not deployed as the final treasury contract. It has no withdrawal method and accepts at most 0.01 NEAR through its funding method. Use user-signed CLI stages; never move keys to this workspace.

Pin near-sdk 5.30.0 to Rust 1.95 after confirming official MSRV; compile with --cfg near for the onchain path and lock transitive dependencies. Initial Rust 1.93 attempt failed; final local build passes. This is a local release build, not container reproducibility or live compatibility proof.

## 2026-11-02 — Commitment Firewall accounting and bounded storage

Follow master-plan sections 3–5 in a separate contract; preserve receiver evidence. Use immediate-write legacy UnorderedMap collections so post-write storage measurements occur before promises are scheduled. Preallocate fixed evidence fields and 32 operation-storage slots per commitment, measured at most 1024 bytes each, to prevent fully reserved funds blocking payment-record creation and unbounded beneficiary storage growth. Unused slot allowance releases on close.

Add a DAO withdrawal nonce argument to the conceptual master-plan method: callback-failure/governance retries must not create a second transfer for one authorization. This is required replay protection, not a new product feature. Actual balance is a conservative cap; pending transfers/refunds may pause new actions. No admin method can fabricate callback outcomes. Keep emergency verifier rotation possible even during impaired backing.

This implements onchain evidence authorization only; actual GitHub checks remain Phase 3. Full testnet lifecycle remains a Phase 2 exit gate.


## 2026-11-02 — Key-free GitHub verification before live payout

Phase 2's payout gate depends on Phase 3 authentic GitHub evidence. Implement the narrow verifier core and CLI now, while keeping both phases incomplete. The CLI reads live GitHub and pinned-final-block NEAR state, prepares unsigned commitment-bound evidence, and never loads NEAR credentials. User signs locally; no hosted signing endpoint or invented attestation. This preserves the master plan's genuine evidence gate rather than bypassing it to finish accounting tests. Use Node24 native TS with pinned dev-only compiler/types. Onchain nonce prevents duplicate attestations; CLI refuses existing evidence rather than renewing silently. Successful CI is only the DAO-selected evidence condition, not proof of real-world business quality. Remaining hosted request authentication and scoped key custody are explicit blockers.

