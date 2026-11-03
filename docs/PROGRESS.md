# Veyntro — current progress

DATE/TIME (UTC): 2026-11-02T21:05:47.503182+00:00
PHASE / MILESTONE: Phase 2 — Commitment Firewall implemented and tested locally; live lifecycle pending
STATUS: IN_PROGRESS
LAST VERIFIED COMMIT: 3c18cad4f81b949f3e264961da61c97d5613964e (firewall source and local checks; not a deployed contract).
REPOSITORY: https://github.com/0xaje/Veyntro
NETWORK / CONTRACT IDS: testnet; DAO veyntro.sputnikv2.testnet; council aje-veyntro.testnet; receiver receiver.aje-veyntro.testnet verified. Firewall account firewall-aje-veyntro.testnet CREATED with 10 test NEAR; contract DEPLOYED and initialized; final transaction/code hash/initial views verified. Verifier verifier-aje-veyntro.testnet and beneficiary worker-aje-veyntro.testnet CREATED and verified; each has 10 test NEAR.

## Source of truth and completed milestones

Read master plan version 1.2, AGENTS.md and authoritative GitHub progress before coding. Phase 1 is independently VERIFIED: creation, proposal 0, council approval, actual 0.01 NEAR receipt from DAO to receiver and rejected direct council call with unchanged ledger. Full previous progress is preserved in docs/PHASE_1_PROGRESS.md and real receipt files remain in evidence/. Do not repeat Phase 1 writes or replace its receiver.

## Phase 2 work completed locally

- New contracts/commitment-firewall, separate from the deployed receiver. DAO-only funding/reservation/cancellation/withdrawal/verifier rotation; beneficiary-only payouts to immutable recipients; permissionless expiry.
- Checked accounting: DAO accountable funds, storage/gas reserve, remaining liabilities INCLUDING pending payouts, pending uncommitted withdrawals, conservative actual-balance cap. Deployment/direct-transfer balances are not free accountable funds.
- Pending transfer operations, private typed callbacks, exactly one bounded native-transfer result, exactly-once settlement, failure recovery and cancellation/expiry interleavings. Missing/failed callbacks stay encumbered; no invented reconciliation success.
- Drawdown and DAO withdrawal nonces prevent replay. A failed transfer consumes its nonce; retries use a new nonce.
- Fixed evidence slots; verifier-only expiring policy-matched attestations with nonce/epoch checks. Rotation invalidates unspent old attestations. Real GitHub API service is NOT implemented here.
- Future operation storage reserved up front: 32 attempts per commitment, 1024 bytes each, actual growth checked. Unused allowance released on close. See docs/FIREWALL_ACCOUNTING.md for costs/limits and docs/FIREWALL_API.md for parameters.
- Paginated public views and actual-state events. No UI redesign, frontend, fake balances or hosted product was added.

## Verification commands and actual results

PATH="$HOME/.cargo/bin:$PATH" bash scripts/build-firewall.sh — exit 0. Formatting passed; 56 firewall tests and 9 receiver tests passed; Clippy with -D warnings passed; locked WASM release build passed using --cfg near.

Rust 1.95.0; near-sdk 5.30.0; existing lockfile updated only for the new workspace member. WASM 219782 bytes, SHA256 a850073c270245b74668bf692f3fcc9a763ed791f94b4786427cbb39dfc4862a. This local build is not claimed independently reproducible. The user's deployed receiver hash remains separately recorded.

CI workflow added with immutable checkout revision, read-only contents permission and pinned project Rust toolchain. CI has NOT been claimed passed; check the actual run after publication. Third-party quality/design skill files were not found in the refreshed local skill locations; no skill-specific audit is claimed. Manual review identified and fixed prepaid payment storage and withdrawal replay issues.

Evidence: evidence/FIREWALL_BUILD.json; evidence/firewall-build.log; evidence/FIREWALL_CHECK_ATTEMPTS.md. Local SDK harness tests are development checks, not real blockchain or GitHub activity.

## Remaining live gates / risks

- New full-contract account, separate verifier and beneficiary accounts; funding plan using actual testnet balances and free faucet only. Candidate names firewall-aje-veyntro.testnet, verifier-aje-veyntro.testnet, worker-aje-veyntro.testnet returned UNKNOWN_ACCOUNT at block 275952357 (availability observation only). No keys generated in this workspace.
- Deployment and generated ABI guard checks; real DAO funding and two commitments; rejected overcommitment; real evidence-backed payout; failed/retried transfer; expiry release; callbacks/final receipts and public numerical reconciliation. None is verified yet for the firewall.
- Full-access deployment key authority and callback liveness/recovery need review. A stuck callback remains pending rather than releasing funds. No security-audit or trustless-custody claim.
- Storage reserve is conservative and includes future operation slots. Pending refunds/settlement may temporarily pause new actions. Withdrawing the exact displayed capacity can need extra operation storage margin.
- GitHub verifier service, wallet frontend, hosting, indexing and operator remain unimplemented. Phase 0 detailed competitor coverage and Nigeria/prize/KYC confirmation remain open; do not claim those resolved.

## Next exact action

1. Publish this verified source and evidence, then user pulls main in ~/Veyntro-build and runs bash scripts/build-firewall.sh. Record user's actual artifact hash.
2. User creates NEW firewall-aje-veyntro.testnet through the free CLI faucet, keeping keys locally. Verify creation/final receipts and balance; do not deploy over the receiver.
3. Establish separate actual verifier and beneficiary accounts, review contract/key authority and live funding amounts, then prepare initialization and DAO funding proposals from real state.
4. Keep Phase 2 IN_PROGRESS until its entire real testnet financial lifecycle and final evidence gate pass. No more receiver writes are needed.

FILES CHANGED: contracts/commitment-firewall/*; Cargo.toml/Cargo.lock; scripts/build-firewall.sh; docs/FIREWALL_ACCOUNTING.md; docs/FIREWALL_API.md; docs/PROGRESS.md; docs/PHASE_1_PROGRESS.md; docs/DECISIONS.md; docs/BLOCKERS.md; .github/workflows/contracts.yml; README.md; evidence/FIREWALL_BUILD.json; evidence/FIREWALL_CHECK_ATTEMPTS.md; evidence/firewall-build.log.

## Publication

Firewall source and all 21 changed files verified present on GitHub at commit 3c18cad4f81b949f3e264961da61c97d5613964e. Contract checks workflow run 41525421351 started and was in_progress when checked: https://github.com/0xaje/Veyntro/actions/runs/41525421351 . No CI success is claimed yet. User can pull main and run scripts/build-firewall.sh, then create the new free testnet firewall account and return its actual creation hash. Phase 2 remains IN_PROGRESS.

## User build, CI and firewall account verified — 2026-11-02

User terminal output independently reproduced 56 firewall and 9 receiver tests, Clippy and release WASM build. User's actual artifact SHA256 is d7b3563dbea090da6f18bdc67c2dc0f128d4c43ac43efba49c92c8ac5a5f2f6e. It differs from assistant build; no independent reproducibility claim. Deploy and verify against the user's actual artifact, not the assistant's hash.

Creation tx SqyY9uq5NnNn87ty7odKxLoWqj7rVwEyBinqUp9YNc4 independently verified FINAL with successful receipts. firewall-aje-veyntro.testnet has 10 test NEAR, key ed25519:HvgBUbiC7632EQsHZ9qidVUfHHxuNzwqo9b8ZFuB2yAc and no deployed contract at block 275953410. Do not repeat account creation. Evidence: evidence/FIREWALL_ACCOUNT_CREATION.json.

GitHub Contract checks run 41525421351 is completed/success for source commit 3c18cad4f81b949f3e264961da61c97d5613964e: https://github.com/0xaje/Veyntro/actions/runs/41525421351 . Evidence: evidence/FIREWALL_CI.json. This supersedes earlier in-progress CI notes; it is not live contract/payment proof.

Next: user creates separate verifier-aje-veyntro.testnet and worker-aje-veyntro.testnet accounts with free faucet and keys stored locally. Verify public keys, balances and final creation receipts before initializing the new firewall contract. Phase 2 remains IN_PROGRESS; no firewall deployment or financial lifecycle is claimed.

## Verifier and beneficiary accounts verified — 2026-11-02

Both creation transactions independently verified FINAL with successful returned receipts. Verifier verifier-aje-veyntro.testnet: tx 44qThHMJUfVgDZ88KSuHAQDA4HVxGg6GN5fTxoDi4cW4, public key ed25519:5ZVYRESN7v58XtjLnFupZqXEKG21MTvibvh1cRn99xh8. Beneficiary worker-aje-veyntro.testnet: tx 2xzu5dURGr3sZGBFPJVjQnKNSGzkrT4XfWod8QuBk22c, public key ed25519:C7LrgzYBnmy714xGC8C4r5jjLG5NbN6tn35gBhiouar1. Each has 10 test NEAR and no code at block 275953940. Matching FullAccess keys verified; private keys remain on the user's machine. Worker is the beneficiary account, not a privileged automation operator.

Firewall account independently rechecked at block 275953965: 10 test NEAR and no code. Evidence: evidence/FIREWALL_ROLE_ACCOUNTS.json. Earlier account-creation next steps above are completed; do not repeat them.

NEXT EXACT ACTION: user deploys target/wasm32-unknown-unknown/release/veyntro_commitment_firewall.wasm to firewall-aje-veyntro.testnet with atomic new call: dao_account_id=veyntro.sputnikv2.testnet, verifier_account_id=verifier-aje-veyntro.testnet, operating_reserve=100000000000000000000000 (0.1 NEAR configured floor; actual storage reserve can be higher). Check local artifact SHA256 d7b3563dbea090da6f18bdc67c2dc0f128d4c43ac43efba49c92c8ac5a5f2f6e first. Return deployment tx hash, then independently verify final receipts, deployed code hash and initial treasury view before DAO funding. Initial accountable funds and available money must be zero; faucet balance is not DAO funding. Phase 2 remains IN_PROGRESS. Deployment key remains FullAccess: reviewed custody/upgrade policy is still required before production. Real GitHub verifier, hosted frontend and automated operator are not implemented.

## Firewall deployment verified — 2026-11-02

Transaction HMvHPLdXViS6fXigmbCD2aXCPJuMyvo1UEMyWjyniZ3B independently verified FINAL; all returned receipts succeeded. Onchain code hash FX1GAZo5W3HHSP3ZChPHRAE59zzujnW9SYJ4nAi75uMw matches user's WASM SHA256 d7b3563dbea090da6f18bdc67c2dc0f128d4c43ac43efba49c92c8ac5a5f2f6e. Initialization DAO/verifier/configured reserve match approved arguments. Evidence: evidence/FIREWALL_DEPLOYMENT.json.

Initial view: confirmed_accountable_funds=0, reservation_liabilities=0, pending_payouts=0, pending_withdrawals=0, money_available=0; epoch/operation/reservation counters zero. Runtime operating reserve 2.26474 NEAR; configured floor 0.1 NEAR. Actual firewall balance 9.9982260476962562 NEAR, storage_usage=220450 at block 275954172. Faucet funds are NOT credited as DAO accountable funding. ledger_solvent=false because accountable funding is zero and the reserve is not funded in that ledger; physical_backing_check=true. No commitments or payments exist yet.

DAO balance at block 275954171 is 6.99 NEAR, storage_usage=540657 (~5.40657 NEAR storage at the current 10^19 yoctoNEAR/byte protocol cost), leaving ~1.58343 NEAR above storage. It cannot fund the planned 4 NEAR call yet.

NEXT EXACT ACTION: user transfers 4 test NEAR from verifier-aje-veyntro.testnet (10 NEAR verified at role creation) to veyntro.sputnikv2.testnet. This is one-time test funding, not a verifier treasury permission. Verify final transfer and fresh balances, then construct and validate a real DAO FunctionCall proposal attaching 4 NEAR to firewall fund_treasury. Do not count a direct transfer as firewall ledger funding. Return proposal's actual ID and verify before voting. Phase 2 remains IN_PROGRESS: commitments, overcommitment rejection, evidence-backed payment, failed/retried transfer and expiry release remain pending. Previous deployment/account-creation next steps are superseded.

## DAO top-up verified — 2026-11-02

HTeCdMzUik4VFiewoK27rst6DYmFfdoSjBQkFhv93nyJ independently verified FINAL; returned receipts succeeded. Exact native transfer: verifier-aje-veyntro.testnet -> veyntro.sputnikv2.testnet, 4 NEAR. DAO actual balance 10.99 NEAR, storage_usage 540657 at block 275954420; unchanged verified DAO code hash. Funding firewall with 4 NEAR leaves sufficient DAO storage backing. Council actual balance 1.4766848370008687 NEAR, enough for current 1 NEAR proposal bond and fees. Live policy still sole council aje-veyntro.testnet, proposal bond 1 NEAR, voting period 7 days. Firewall confirmed accountable funds and available money remain zero; DAO top-up is not firewall funding. Evidence: evidence/DAO_FIREWALL_TOPUP.json.

NEXT EXACT ACTION: user submits add_proposal to veyntro.sputnikv2.testnet, bond 1 NEAR, FunctionCall receiver firewall-aje-veyntro.testnet, method fund_treasury, args e30= ({}), deposit 4000000000000000000000000 yoctoNEAR, action gas 30000000000000, outer gas 80 Tgas. Proposal is NOT submitted or approved by this session. Return actual proposal ID and transaction hash; verify exact stored proposal before council VoteApprove. Phase 2 remains IN_PROGRESS.

## Firewall funding proposal 1 verified — 2026-11-02

Submission BWjyot7cpM8m86dvahqdjR1bJgRB5FcmY9TavKx3k5CQ independently verified FINAL, successful returned receipts, returned actual proposal ID 1. Stored proposal checked: proposer aje-veyntro.testnet; InProgress; no votes; FunctionCall to firewall-aje-veyntro.testnet fund_treasury, args e30=, deposit 4000000000000000000000000, gas 30000000000000. Firewall accountable funding and available money still zero. Evidence: evidence/FIREWALL_FUNDING_PROPOSAL.json.

NEXT EXACT ACTION: user council signs act_proposal {"id":1,"action":"VoteApprove","memo":null}, 150 Tgas, zero attached deposit. With the verified single-member council this vote starts execution. Return transaction hash; independently verify downstream funding receipt, DAO predecessor, attached 4 NEAR, funded event, proposal status and treasury accounting. Do not equate outer vote success with successful funding. Phase 2 remains IN_PROGRESS.

## DAO firewall funding verified — 2026-11-02

Execution BwjKrwuyGq1k5kYjZHQTBaof8DbGeT3UyczuWRAWPE5y independently FINAL, all returned receipts succeeded. Raw receipt predecessor veyntro.sputnikv2.testnet, receiver firewall-aje-veyntro.testnet, fund_treasury {} with exactly 4 NEAR. Proposal 1 Approved with council vote. Ledger: confirmed=4 NEAR; operating reserve=2.26474; liabilities/pending=0; available=1.73526; actual balance=13.9982260476962562; ledger_solvent and physical_backing_check true. Evidence: evidence/FIREWALL_DAO_FUNDING.json. Initial unfunded ledger_solvent=false notes above superseded.

NEXT EXACT ACTION: submit a DAO proposal for first commitment: beneficiary and payout_recipient worker-aje-veyntro.testnet, amount 0.4 NEAR (400000000000000000000000 yoctoNEAR), expiry 2026-11-09T00:00:00Z (1794182400000000000 ns), evidence_policy_hash 22941ad52c55ba33751c7e27e8738948dc0bf08fae6e708d21b6b661ccc09048. Canonical policy bytes are sorted-key compact JSON in evidence/FIRST_COMMITMENT_POLICY.json, SHA256 excludes trailing newline. Policy requires repo 0xaje/Veyntro, exact commit 3c18cad4f81b949f3e264961da61c97d5613964e, workflow ID 404996405/path .github/workflows/contracts.yml, push/main, success, no forks, maximum age 604800 seconds. Real run 41525421351 rechecked completed/success matching these fields. This commitment recognizes real contract-check work; it does not establish business quality. Verifier service remains unimplemented, no attestation or payment claimed. Proposed action deposit zero, action gas 30 Tgas, proposal bond 1 NEAR. Verify actual new proposal ID/payload before voting. Phase 2 remains IN_PROGRESS; do not fabricate an attestation to bypass Phase 3 evidence work.

## First commitment proposal 2 verified — 2026-11-02

J4Fx94ptonHf1JqkHQncwBx58gucvQacwZAkhWD4uuvJ independently FINAL, successful returned receipts, actual returned proposal ID 2. Stored proposal InProgress, no votes, proposer aje-veyntro.testnet. Decoded FunctionCall confirmed receiver firewall-aje-veyntro.testnet, create_reservation, zero deposit, 30 Tgas; beneficiary/recipient worker-aje-veyntro.testnet, 0.4 NEAR, expiry 1794182400000000000, policy hash 22941ad52c55ba33751c7e27e8738948dc0bf08fae6e708d21b6b661ccc09048. No commitment exists yet: next_reservation_id=0, liabilities=0, available=1.73526 NEAR. Evidence: evidence/FIRST_COMMITMENT_PROPOSAL.json. Repeated funding log in user message has the same already-verified tx hash; it is not a second deposit.

NEXT EXACT ACTION: council approves proposal 2 using act_proposal {"id":2,"action":"VoteApprove","memo":null}, 150 Tgas, zero deposit. Verify downstream create_reservation receipt, actual commitment ID, immutable fields, updated storage reserve/liabilities/available, no payment event. Then prepare a distinct second commitment and test overcommitment. Phase 2 remains IN_PROGRESS; no evidence attestation/payment claimed.

## Commitment 0 created and reconciled — 2026-11-02

2a7YT9gYYdE32k3JmTLwWtZF1vy2vFTxbtWWLW4AYxF1 independently FINAL; returned receipts succeeded; proposal 2 Approved; raw firewall receipt predecessor DAO. Actual commitment ID 0: Active, 0.4 NEAR approved/remaining, zero pending, 32 payment attempts, no evidence, nonce 0, correct worker beneficiary/recipient, expiry and policy hash. Treasury confirmed=4 NEAR; reserve=2.59643; liabilities=0.4; available=1.00357; actual balance unchanged 13.9982260476962562; both backing checks true. Increase in reserve includes prepaid payment-operation storage; it is not a payment. Evidence: evidence/FIRST_COMMITMENT_EXECUTION.json.

NEXT EXACT ACTION: user proposes a distinct 0.4 NEAR time-limited testnet commitment for the expiry/release integration check, same worker and evidence policy, expiry set to two hours from proposal preparation using integer time.time_ns(). Clearly label this as a real testnet integration check, not additional completed customer work. Do not attest or pay it. Check actual new proposal ID and immutable expiry before approval. Aim to verify two active commitments, overcommitment rejection and then permissionless expiry release; if proposal expires before approval, do not approve stale terms. First commitment remains reserved for authentic evidence-backed payout. Phase 2 IN_PROGRESS.

## Expiry-check proposal 3 verified — 2026-11-02

7PMdPEhFi3oadW2cMXgdv4maww4BpnXzShV35WcuAxy6 FINAL, successful returned receipts, actual returned ID 3. Stored proposal InProgress. Exact decoded terms match: worker beneficiary/recipient, 0.4 NEAR, policy hash 22941ad52c55ba33751c7e27e8738948dc0bf08fae6e708d21b6b661ccc09048, expiry 1793662422178871235 ns = 2026-11-02T23:33:42.178871Z (Nov 3 00:33:42 WAT). Latest final block had ~7095 seconds remaining; expiry was not passed. DAO FunctionCall create_reservation, zero deposit, 30 Tgas verified. Existing ledger unchanged: liabilities 0.4, available 1.00357 NEAR; only commitment 0 exists. Evidence: evidence/SECOND_COMMITMENT_PROPOSAL.json.

NEXT EXACT ACTION: council VoteApprove proposal 3, 150 Tgas, zero deposit, before its commitment deadline. Verify downstream execution and actual second commitment ID, reconcile all reserves/liabilities/available. Then submit a real overcommitment proposal against current capacity; capture contract rejection and unchanged ledger. After expiry, any separate caller can release unused second commitment without another governance vote. Do not approve after deadline or assume automatic scheduling. Phase 2 remains IN_PROGRESS.

## Commitment 1 and portfolio totals verified — 2026-11-02

2XpApVroS4NiDaDJZ2AnxCDKNt2d1ZLJWs2a1k687q79 FINAL, all returned receipts succeeded; proposal 3 Approved; raw firewall receipt predecessor DAO. Public list contains commitments 0 and 1, each Active/not expired, approved/remaining 0.4 NEAR, zero pending, no evidence, 32 payment attempts, correct worker terms. Commitment 1 expiry 1793662422178871235. Sum remaining=0.8 NEAR equals ledger liabilities. Confirmed=4; reserve=2.92812; available=0.27188; actual balance unchanged 13.9982260476962562; both backing checks true. next_reservation_id=2 and next_operation_id=0. Evidence: evidence/SECOND_COMMITMENT_EXECUTION.json.

NEXT EXACT ACTION: user submits a clearly labeled adversarial testnet DAO proposal for a third commitment of 1 NEAR, same worker/recipient/policy hash, expiry 1794182400000000000 (Nov 9 UTC). This exceeds the verified 0.27188 NEAR capacity although actual contract balance is much larger. AddProposal may succeed; that does not prove firewall rejection. Verify stored new proposal before council approval, then inspect actual downstream receipt Failure and unchanged treasury/reservation state. Do not mark rejection verified before executing. Proposal bond 1 NEAR, action create_reservation zero deposit/30 Tgas. Keep expiry cleanup for commitment 1 separate. Phase 2 IN_PROGRESS.

## Overcommitment proposal 4 verified — 2026-11-02

Submission 6zmrZ9FtumrvAy2ohMdLouY23iubbWLum5oC3N7RdK6p independently FINAL, successful returned receipts, actual proposal ID 4. Stored InProgress, correct council proposer; decoded create_reservation terms exactly match 1 NEAR request, worker beneficiary/recipient, Nov 9 expiry, existing policy hash; correct firewall receiver, zero action deposit, 30 Tgas. This exceeds available 0.27188 NEAR. Before execution confirmed=4 NEAR, reserve=2.92812, liabilities=0.8, pending=0, next reservation=2, next operation=0, actual balance=13.9982260476962562. Both current reservations and views saved for after comparison. Evidence: evidence/OVERCOMMITMENT_PROPOSAL.json.

NEXT EXACT ACTION: council approves proposal 4 with act_proposal {"id":4,"action":"VoteApprove","memo":null}, 150 Tgas, zero attached deposit. This deliberately executes the real adversarial test. Expected downstream firewall rejection, not assumed success. Verify raw receipt error, resulting DAO proposal status, no commitment_created event, and unchanged reservations/ledger/storage/balance. Outer vote/callback success alone cannot prove the financial action succeeded. No rejection is verified yet. Phase 2 IN_PROGRESS.

## Commitment Firewall overcommitment rejection VERIFIED — 2026-11-02

Execution HnMJXawR3zD6onxcQe6n27wrYVQ1X591U7r4miPrnEtt independently FINAL. Outer DAO call SuccessValue is NOT funding/commitment success. Downstream firewall receipt H8gofQ7ubPjFKr4BBaarJ7pPPe9iEUJPYC922c7tsaD4 failed with exact error: Smart contract panicked: Not enough money available for this commitment. Raw receipt predecessor DAO. Proposal 4 status Failed. No commitment_created event. Treasury view and both reservation views exactly equal saved pre-execution state, including all counters, balances and liabilities. No new commitment: IDs remain 0/1, next=2. Confirmed=4 NEAR; reserve=2.92812; liabilities=0.8; available=0.27188; actual=13.9982260476962562. Firewall storage_usage=221252. Existing liabilities remain fully backed. Evidence: evidence/OVERCOMMITMENT_REJECTION.json. This is real testnet rejection, not a simulated result or a rejected governance vote.

NEXT EXACT ACTION: beneficiary worker-aje-veyntro.testnet signs request_drawdown {"id":"0","amount":"100000000000000000000000","operation_nonce":"1"}, 100 Tgas, zero attached deposit, to verify missing-evidence protection on the deployed ABI. Commitment 0 has no attestation. Expected rejection: Commitment needs current verified evidence and must not be expired. Verify actual final failure and unchanged ledger/nonce/operation count before claiming this gate passed. Do not insert a fabricated attestation. Then implement authentic GitHub verifier required for completing Phase 2 live payout gate (Phase 3 prerequisite overlap; Phase 2 stays IN_PROGRESS). Commitment 1 expires Nov 2 23:33:42 UTC / Nov 3 00:33:42 WAT; release is permissionless after deadline but requires an actual transaction. No payout, failed-transfer callback or expiry release is claimed yet.

## Missing-evidence payout rejection VERIFIED — 2026-11-02

CZjUrjTUbF84GV1fNojwi63KtdUFSvns6UE4XPJe9g9m independently FINAL Failure: Commitment needs current verified evidence and must not be expired. Commitment 0 was not expired and evidence=null, proving missing evidence caused rejection. Entire treasury and reservation views exactly match prior state. No payment_pending event, next_operation_id=0, last_drawdown_nonce=0 and 32 attempts remain. Evidence: evidence/MISSING_EVIDENCE_REJECTION.json. No payment was made.

## GitHub verifier prerequisite implemented — Phase 2 still IN_PROGRESS

Built services/verifier TypeScript modules and key-free CLI: real GitHub API fetch; strict immutable policy/hash matching; repository/head identity/no forks, SHA, workflow ID/path, push/main, success, run identity/attempt/URL and 7-day age; final-block-pinned NEAR views; reservation-bound digest with verifier epoch/nonce/deadline; maximum 30-minute attestation validity capped by run/commitment expiry. Existing attestations refused; onchain nonce provides submitted-request replay guard. No private keys are read and no transaction is signed/sent. This implements a prerequisite from Phase 3 to complete Phase 2's genuine evidence-backed payout gate; neither phase is marked complete.

Checked Node 24.22.1 native TS runtime, TypeScript 7.0.2 and @types/node 24.19.2 pinned dev tools; no runtime dependencies. Official GitHub API 2026-03-10 and Node 24 documentation consulted. npm typecheck and 28 tests passed. Initial typecheck failed for missing explicit Node types in TS7; corrected and reran. Third-party skill files not found in current skill directories; manual review only. No Rust contract or UI change.

Actual CLI fetched GitHub run 41525421351 and current final-block commitment 0, validated and wrote evidence/FIRST_ATTESTATION_PREPARED.json with signed_or_sent=false. Historical prepared file expires and must NOT be signed later. Real invalid run ID 1 returned HTTP404, CLI exit1, no prepared file remained. Saved real responses evidence/GITHUB_RUN_API.json and VERIFIER_CONTEXT.json back explicit adversarial fixture tests. Evidence/VERIFIER_CHECKS.json records outcomes. New Verifier checks CI is configured but not yet claimed passed.

NEXT EXACT ACTION: user pulls main in ~/Veyntro-build; uses Node24 LTS >=24.12; npm --prefix services/verifier ci --ignore-scripts --no-audit --no-fund; run check and test; run CLI with evidence/FIRST_COMMITMENT_POLICY.json, reservation0, run41525421351, signer verifier-aje-veyntro.testnet and a NEW /tmp/veyntro-attestation-TIMESTAMP.json output. Return summary and output filename. Then inspect prepared binding/transaction and prepare user-local NEAR CLI submit_attestation signing command; verify final attestation before drawdown. Do not sign historical evidence/FIRST_ATTESTATION_PREPARED.json. Payout/failed-transfer callback/expiry release still pending. Hosted authentication, beneficiary request validation, rate limiting, durable requests, scoped verifier signing and frontend remain unfinished. Do not deploy this CLI as a public signing service. Commitment1 expires Nov2 23:33:42 UTC; permissionless release still needs transaction.


## Verifier publication and CI verified

Source commit f353f6292dce99062e740a0c433adff7d1988267 published and CLI file independently read back. GitHub Verifier checks run 41531876110 completed/success for that exact source: https://github.com/0xaje/Veyntro/actions/runs/41531876110 . Evidence: evidence/VERIFIER_CI.json. This supersedes the earlier pending verifier CI note. Phase 2 remains IN_PROGRESS; no attestation or payout signed/sent. User-local fresh preparation is the next exact action above.

## User verifier preparation and pre-signing state — 2026-11-02

User pulled through 7f81f53, Node24.22.1, locked install/typecheck/28 tests passed in supplied terminal output. User CLI reported prepared_unsigned/signed_or_sent=false, file /tmp/veyntro-attestation-1793656233.json, evidence_digest b797a45a04d32bc9d14f37f03bf8e6c01af6a9743e4609db37f9d860dcf516d3, valid_until_ns 1793658041436000000. Assistant cannot read user's local file: these file details are user-reported, not an independent file inspection. Independent pinned-final-block state check confirms configured verifier and epoch0, commitment0 Active/not expired/evidence=null, nonce0, operation count0 and unchanged balances. Prepared deadline had ~1761 seconds remaining at check. Evidence: evidence/USER_ATTESTATION_PREPARATION.json.

NEXT EXACT ACTION: locally validate the prepared file's unsigned status, signer/receiver/method/zero deposit, binding SHA256 and exact reported digest/args/deadline; stop if expired or changed. Then user signs submit_attestation with verifier-aje-veyntro.testnet, 30 Tgas and zero deposit using legacy keychain. This records evidence, does not pay the worker. Return transaction output; independently verify final receipts, evidence_checked event, stored digest/nonce/epoch/deadline and unchanged financial ledger before drawdown. No signing/sending/attestation acceptance is claimed yet. Phase2 IN_PROGRESS.

## Authentic GitHub attestation accepted VERIFIED — 2026-11-02

CSEMWodcmLRdWyy7pSyRFiqCigyvcTuXerZvSjeMgWe1 independently FINAL, all returned receipts succeeded. Signed by configured verifier-aje-veyntro.testnet to firewall. evidence_checked event and stored commitment0 evidence match digest b797a45a04d32bc9d14f37f03bf8e6c01af6a9743e4609db37f9d860dcf516d3, exact SHA 3c18cad4f81b949f3e264961da61c97d5613964e, nonce1, epoch0, deadline1793658041436000000; usable=true. Full treasury view unchanged from pre-attestation, no payment_pending event, next_operation_id0, drawdown nonce0, pending0. Actual worker before-payout balance captured: 9999825605283016900000000 yoctoNEAR. Evidence: evidence/FIRST_ATTESTATION_EXECUTION.json. Initial verification script mistakenly used digest instead of public view field evidence_digest; corrected and reran, no writes occurred.

NEXT EXACT ACTION: worker-aje-veyntro.testnet signs request_drawdown {"id":"0","amount":"100000000000000000000000","operation_nonce":"1"}, 100 Tgas, zero attached deposit, before evidence deadline (Nov2 22:20:41.436 UTC). This requests an actual 0.1 NEAR transfer to the immutable worker recipient. Prior missing-evidence rejection did NOT consume nonce1. Verify native-transfer receipt and private callback, get_operation actual ID, pending cleared, confirmed/liabilities each reduced by exactly0.1, actual contract balance and worker delta including actual fees, and available/storage reserve formula. Never infer successful payment from outer request alone. Phase2 IN_PROGRESS; no payout yet, failure/retry callback and expiry release remain pending. Hosted authenticated verification/UI remain unfinished.

## First real evidence-gated payout VERIFIED — 2026-11-02

673VxeaAwfGbJ8pres4mJHxifLwYQbjJ1VdpCoRcf5bn independently FINAL; all returned receipts succeeded. Exactly one native 0.1 NEAR transfer from firewall to worker and private firewall-to-self on_drawdown_result receipt verified. Operation0 Payout/Succeeded, reservation0, immutable worker recipient, amount0.1. Pending cleared; commitment0 remaining0.3, last_drawdown_nonce1, 31 attempts left. Confirmed funds3.9, total liabilities0.7, runtime reserve2.92026, available0.27974; next_operation_id1; both backing checks true. Actual contract balance13.8982260476962562, down exactly0.1. Worker before9.9998256052830169, after10.0992440633433126; net+0.0994184580602957 equals0.1 minus actual summed transaction/receipt tokens_burnt0.0005815419397043. Reserve fell0.00786 as prepaid1024-byte allowance was consumed and actual operation storage used less. Evidence: evidence/FIRST_PAYOUT_EXECUTION.json. This supersedes earlier no-payout notes; hosted product still unfinished.

NEXT EXACT ACTION: worker repeats request_drawdown for commitment0 amount0.1 with SAME operation_nonce1, 100 Tgas/zero deposit, while evidence is still usable, to prove onchain replay denial. Expected Payment nonce was already used or is out of order; actual failure/unchanged operation0, liabilities, nonce and contract balance must be verified. Do not use nonce2 for this duplicate test. Afterward still need real failed/retried transfer reconciliation, permissionless expiry release and full security gates; Phase2 remains IN_PROGRESS. A failed transfer is distinct from rejected method admission, so missing-evidence/replay failures do not satisfy callback-failure proof.


## Permissionless expiry release VERIFIED — 2026-11-03

Transaction 3bWgBZGtCJEHxdgo4Kcm995fXPXzskbfXbpKSG5enMv1 independently FINAL; all receipts succeeded; release_expired(1) returned 0.4 NEAR and emitted commitment_expired with pending=0. Commitment1 now Expired, remaining liability=0; commitment0 still Active with0.3 NEAR liability and successful 0.1 payout. Reconciled current treasury at block276018190: confirmed=3.9 NEAR, total liability0.3, pending=0, dynamic operating reserve2.59258, Money Available1.00742, actual contract balance13.8982260476962562; ledger and physical backing true. Evidence: evidence/EXPIRY_RELEASE.json. This is permissionless contract enforcement after expiry; transaction was initiated by beneficiary account. No governance vote was needed for release.

Payout replay rejection from 3ztmqy6cZe9Ge9P9yYfLPRZM14Qfp4fWDMwLRvMAAf1 independently FINAL Failure, exact nonce-reused error; reservation0/treasury equal prior successful payout state, no transfer receipt. Commitment1 expired. The repeated pasted transaction is the same hash and did not create another action. Expiry and replay are now completed gates, not pending.

NEXT EXACT ACTION: failed-transfer callback/retry test. Recovery recipient recovery.worker-aje-veyntro.testnet verified absent at block276018190. Current DAO balance7.99 NEAR; firewall Money Available1.00742. Submit DAO proposal 5? Determine actual next proposal ID from get_last_proposal_id before use; propose firewall withdraw_available 0.01 NEAR to the absent recovery recipient, nonce1, 30 Tgas action, 1 NEAR DAO bond. Approval should schedule real transfer, fail because account absent, then on_withdraw_result should mark operation Failed and restore pending_withdrawals/available without reducing confirmed funds or firewall actual balance. Verify all receipts and state before creating recovery.worker as a 0.1 NEAR subaccount funded by worker. Then retry withdrawal 0.01 with nonce2 through DAO; verify success, correct balances and operation states. Treat as real testnet funds leaving treasury to a controlled recovery account; report exact amount. Do not claim payout callback failure from this withdrawal test, it specifically validates the withdrawal callback. The failed payout callback branch remains an additional outstanding security check if safely achievable. Proposal action args base64-encode compact JSON {"amount":"10000000000000000000000","recipient":"recovery.worker-aje-veyntro.testnet","operation_nonce":"1"}; verify method ABI/current policy and get actual proposal ID before voting.

Remaining roadmap after callback: complete contract adversarial/security gate, investigate failed payout path (fixed payout recipient is currently an existing account), finish authenticated verifier request flow and the mandatory public React/Vite/Wallet Selector app; current verifier is CLI only. Do not mark P0/Phase2 finished until all required gates and actual UX exist. Preserve free/testnet-only constraints and simple-English UI. Keep docs/PROGRESS.md as source for exact next user action.


## Failed transfer test blocked by proposal bond balance — 2026-11-03

Current live SputnikDAO policy confirms 1 NEAR proposal bond and one-member council aje-veyntro.testnet. Council balance is 0.4726532112827997 NEAR at block276018261; below required bond. Current DAO last proposal ID is5, so next created proposal should receive actual ID5 if no concurrent proposer changes it; never assume before return value. Firewall has 1.00742 NEAR available and recovery.worker-aje-veyntro.testnet is absent. No failed transfer proposal submitted.

NEXT ACTION: user transfers 1 NEAR from worker-aje-veyntro.testnet to council aje-veyntro.testnet (worker has sufficient testnet funds after the verified 0.1 payout). Verify final transfer and balances. Then submit a 0.01 NEAR DAO withdrawal proposal to the absent recovery subaccount with operation_nonce1, confirm actual proposal ID/payload, council vote, and verify callback failure restores accounting. This one-time transfer replenishes the testnet proposal bond; it does not fund or debit the Veyntro firewall. Preserve the approved 1 NEAR bond requirement from live policy.


## Council top-up reported; withdrawal callback test ready — 2026-11-03

The user supplied a successful near-cli-rs receipt for worker-aje-veyntro.testnet transferring 1 NEAR to council aje-veyntro.testnet. Transaction ID: iSiKXnaCM657hE5djjZCSMsNDn13WywAYSwaEhFDyjb. Explorer: https://explorer.testnet.near.org/transactions/iSiKXnaCM657hE5djjZCSMsNDn13WywAYSwaEhFDyjb. This receipt is user-reported; the current environment could not independently query NEAR RPC or verify the resulting account balances. Do not state a live council balance until verified.

NEXT EXACT ACTION: from the user's terminal, confirm worker/council balances, recovery.worker-aje-veyntro.testnet is still absent, firewall available balance and current DAO last proposal ID. Then add a SputnikDAO FunctionCall proposal to firewall-aje-veyntro.testnet.withdraw_available with compact args {"amount":"10000000000000000000000","recipient":"recovery.worker-aje-veyntro.testnet","operation_nonce":"1"}, action gas 30 Tgas and attached deposit 0. The outer add_proposal call needs the current live policy bond (previously observed as 1 NEAR). Capture the returned proposal ID; previous live last ID was5, so expect 5 only if no proposal was added since that observation. Approve only after checking the proposal's exact receiver, method and args. Verify its final receipts: transfer should fail because the target account does not exist, callback should mark the operation Failed and restore pending withdrawal capacity without reducing confirmed funds. Only after that check, create recovery.worker-aje-veyntro.testnet with enough test NEAR from the worker, then submit a retry withdrawal for 0.01 NEAR using nonce2 through DAO approval. This checks the DAO withdrawal callback, not the beneficiary payout callback. Keep Phase 2 IN_PROGRESS.


## Failed withdrawal proposal submitted — 2026-11-03

User supplied successful SputnikDAO add_proposal receipt: proposal ID5; transaction vgeBWK7hny1VR8ZdP1Co4wBmm3mBvMXie2H6JLgwfFr (https://explorer.testnet.near.org/transactions/vgeBWK7hny1VR8ZdP1Co4wBmm3mBvMXie2H6JLgwfFr). The submitted FunctionCall targets firewall-aje-veyntro.testnet.withdraw_available with amount 0.01 NEAR, recipient recovery.worker-aje-veyntro.testnet, nonce1, 30 Tgas, zero action deposit. Proposal bond attached: 1 NEAR. This test proposal and receipt are user-reported; do not mark callback behavior verified until approval execution and all receipts/state are checked. Before voting, inspect proposal5 live and confirm its receiver/method/args exactly match the intended call. If exact, council approves with act_proposal VoteApprove. Then verify the callback's final outcome and ledger before proceeding.

NEXT EXACT ACTION: inspect live proposal5; if payload matches, approve it as aje-veyntro.testnet. Wait for all nested receipts. Report the transfer receipt failure and callback result separately. Verify reservation/withdrawal status, confirmed funds, pending withdrawals, available amount, and contract balance are restored. Do not create the recovery account until callback state is verified. Retry only after, with nonce2.


## Withdrawal proposal approved; execution not yet verified — 2026-11-03

User supplied successful SputnikDAO VoteApprove receipt for proposal5: transaction BP3wYRSWX6FQoKgnKf4xqnFouPwXNvpjfNhYCiDHa3Pn (https://explorer.testnet.near.org/transactions/BP3wYRSWX6FQoKgnKf4xqnFouPwXNvpjfNhYCiDHa3Pn). Receipt has no firewall or recipient logs and returns Empty result. Therefore this proves the vote transaction was accepted, but does NOT prove the proposal executed, the withdrawal transfer was attempted, or the callback ran. No ledger change or callback success is claimed.

NEXT EXACT ACTION: query SputnikDAO get_proposal(id5) and firewall get_treasury_state() at latest final block. Confirm proposal status and any execution failure. If approved/executed, query firewall get_operation for the actual next operation ID (previous payout operation was ID0, so withdrawal may be ID1 only if no other operation exists) and reconcile pending withdrawals, confirmed funds, available capacity and actual balance. Also inspect all receipts for transaction BP3w... via explorer. Do not create recovery.worker or retry until operation status is Failed and balances are reconciled. If proposal is Approved but not executed, follow the DAO's actual status/API for execution; do not cast another approval or submit duplicate proposal without checking.


## Withdrawal proposal 5 failed before entering firewall — 2026-11-03

User supplied live views: SputnikDAO get_proposal(5) reports status Failed, with aje-veyntro.testnet voting Approve. Firewall get_treasury_state reports next_operation_id=1, last_withdrawal_nonce=0, pending_withdrawals=0, confirmed_accountable_funds=3.9 NEAR, Money Available=1.00742 NEAR, actual_balance=13.8982260476962562 NEAR; both ledger_solvent and physical_backing_check true. get_operation(1) returns null. Together these show withdraw_available was never entered; no failed transfer or callback occurred, and balances remain unchanged.

Cause confirmed in contracts/commitment-firewall/src/payments.rs and docs/FIREWALL_API.md: withdraw_available checks env::prepaid_gas() >= 80 Tgas. Proposal5 supplied 30 Tgas, so SputnikDAO marked its call Failed at the gas guard. This was an incorrect gas value in the prepared instruction. No user funds were transferred by the firewall; the 1 NEAR SputnikDAO proposal bond handling must be checked from the council balance before another proposal.

NEXT ACTION: check aje-veyntro.testnet balance and current DAO proposal/bond policy. If enough for the required live bond and fees, submit a fresh proposal (expected ID6 only if no new proposal was added) with the same 0.01 NEAR, recipient recovery.worker-aje-veyntro.testnet, nonce1, zero deposit, but action gas at least 80 Tgas; use 100 Tgas. Inspect exact proposal before approval. Approval should use 150 Tgas. Then verify all nested receipts and onchain views. Do not label proposal5 as a callback test; it only proves DAO gas failure. Keep Phase2 IN_PROGRESS.


## Council bond balance check — 2026-11-03

User supplied account summary for aje-veyntro.testnet at block276019372: native balance 0.472 NEAR. This is below the previously observed live SputnikDAO proposal bond of 1 NEAR, so a new proposal cannot be submitted with the known bond amount from this balance. Do not claim the failed proposal's bond was lost or refunded; its current effect is reflected only by this account balance. Firewall views from the immediately preceding check remain unchanged: next_operation_id1, nonce0, no pending withdrawals, available1.00742 NEAR, confirmed funds3.9 NEAR, physical backing and ledger solvency true.

NEXT EXACT ACTION: transfer 1 NEAR from worker-aje-veyntro.testnet to council aje-veyntro.testnet (covers the 1 NEAR bond and gives room for fees, subject to live policy). Confirm the transfer receipt and then check council balance. Resubmit the callback test as a new DAO proposal only after sufficient balance, using withdraw_available action gas100 Tgas (minimum80), 0.01 NEAR, absent recovery recipient, nonce1. Verify payload, approve and inspect all receipts/state. Proposal ID is dynamic. Phase 2 remains IN_PROGRESS.


## Second council top-up reported — 2026-11-03

User supplied successful near-cli-rs receipt for worker-aje-veyntro.testnet -> aje-veyntro.testnet, amount1 NEAR. Transaction Fnvf3VLqbxi7xnhvG18SgixDrgdN8SRtPsdB54bfGBPw (https://explorer.testnet.near.org/transactions/Fnvf3VLqbxi7xnhvG18SgixDrgdN8SRtPsdB54bfGBPw). Receipt is user-reported; resulting balance has not yet been independently checked. Last council summary before transfer was0.472 NEAR at block276019372. Check current balance and live proposal bond before submitting another proposal. Corrected call uses withdraw_available action gas100 Tgas, since source requires minimum80 Tgas. Use current proposal ID from add_proposal return value, inspect payload before approval. Callback test remains NOT RUN.


## Corrected withdrawal proposal submitted — 2026-11-03

User supplied council account summary at block276019694 showing1.48 NEAR, enough for the previously observed1 NEAR bond plus fees. User then supplied successful add_proposal receipt: proposal ID6; transaction2nMAXLvBiADJmosjKtZZLLpuc5iSyuu1hDH8eWsXwYXw (https://explorer.testnet.near.org/transactions/2nMAXLvBiADJmosjKtZZLLpuc5iSyuu1hDH8eWsXwYXw). FunctionCall targets firewall-aje-veyntro.testnet.withdraw_available with 0.01 NEAR to recovery.worker-aje-veyntro.testnet, nonce1, zero action deposit, gas100 Tgas. This meets the verified contract minimum of80 Tgas. Callback has not run yet.

NEXT EXACT ACTION: inspect proposal6 at latest block, verify exact receiver, method, args, gas and zero deposit; recheck recovery.worker-aje-veyntro.testnet is still absent. If both checks pass, approve as council. Capture all nested receipts; then query firewall treasury state and get_operation(1), and verify recipient transfer failed and callback marked operation Failed while restoring the ledger. If proposal6 fails, inspect exact receipt cause before changing anything.


## Failed withdrawal and callback verified from receipt events — 2026-11-03

User supplied successful council approval transaction7QZ1MrK1FDZGjDkuhzfDtZixKSXKFyUVEjz8UWZ581F4 (https://explorer.testnet.near.org/transactions/7QZ1MrK1FDZGjDkuhzfDtZixKSXKFyUVEjz8UWZ581F4). Logs show firewall withdrawal_pending for operation1, 0.01 NEAR, recipient recovery.worker-aje-veyntro.testnet, nonce1; then operation_settled for operation1 kind Withdrawal status Failed, amount0.01 NEAR. This verifies the failed transfer callback path executed. Treasury restoration still needs confirmation via latest get_treasury_state and get_operation(1); do not claim the exact restored ledger until those views are supplied. No retry or recovery account creation yet.

NEXT EXACT ACTION: query get_treasury_state() and get_operation(1) at latest final block. Confirm operation Failed, pending_withdrawals0, last_withdrawal_nonce1, confirmed funds and liabilities unchanged, money_available restored to1.00742 NEAR (assuming no intervening actions), actual balance unchanged relative to prior reconciliation, and solvency/backing true. If confirmed, then create recovery.worker-aje-veyntro.testnet with test NEAR from worker and retry a DAO withdrawal of0.01 NEAR to it using nonce2, with action gas>=80 Tgas, fresh proposal and current bond. Verify its success receipt and final state. Preserve this as withdrawal callback test, not payout callback test.


## Failed withdrawal callback and ledger reconciliation VERIFIED — 2026-11-03

User supplied latest-final-block get_operation(1) and get_treasury_state views following approval transaction7QZ1MrK1FDZGjDkuhzfDtZixKSXKFyUVEjz8UWZ581F4. Operation1 is Withdrawal, amount0.01 NEAR, recipient recovery.worker-aje-veyntro.testnet, status Failed. Treasury: actual balance13.8982260476962562 NEAR; confirmed accountable funds3.9 NEAR; reservation liabilities0.3 NEAR; pending withdrawals0; pending payouts0; nonce1 consumed; next operation ID2; ledger_solvent=true; physical_backing_check=true. Evidence: evidence/WITHDRAWAL_CALLBACK_FAILURE.json. Transaction receipt emits withdrawal_pending followed by operation_settled Failed.

Compared with the pre-withdrawal view, actual balance, confirmed funds and reservation liabilities are unchanged. Dynamic operating reserve increased0.00247 NEAR (2.59258 ->2.59505), so Money Available decreased0.00247 NEAR (1.00742 ->1.00495). This reflects storage reserved for the persistent failed operation, not a lost 0.01 NEAR payment. Callback failure/reconciliation is verified. This is a withdrawal callback test, not beneficiary payout callback.

NEXT EXACT ACTION: create recovery.worker-aje-veyntro.testnet as a child of worker-aje-veyntro.testnet, funded with0.1 test NEAR; verify account creation and worker/council balances. Check current live SputnikDAO bond and council balance before retry. Submit a new DAO proposal for withdraw_available amount0.01 NEAR, recipient recovery.worker-aje-veyntro.testnet, nonce2 (nonce1 has been consumed), action gas100 Tgas, zero action deposit, with current proposal bond. Capture actual proposal ID and inspect payload before approval. Verify successful transfer receipt, operation status Succeeded, pending_withdrawals0, confirmed funds reduced exactly0.01 NEAR, unchanged liability, actual firewall balance reduced exactly0.01 NEAR and solvent/backed state. Keep Phase2 IN_PROGRESS.


## Recovery recipient account created — 2026-11-03

User supplied successful account creation receipt for recovery.worker-aje-veyntro.testnet, funded with0.1 NEAR from worker-aje-veyntro.testnet. Transaction HZVAKwVd88DjXqbzXRteeZ25dtrvdXE3CtEcRMqeM9Y3 (https://explorer.testnet.near.org/transactions/HZVAKwVd88DjXqbzXRteeZ25dtrvdXE3CtEcRMqeM9Y3). The account is now live and controlled by a new full-access key on the user's local keychain. Do not include or request its private key.

NEXT EXACT ACTION: query current council account balance and live SputnikDAO bond before creating retry proposal. Previous council balance1.48 NEAR was before proposal6; bond handling after execution is not assumed. If balance is insufficient for live bond plus fees, top up council from worker, verify receipt/balance, then propose 0.01 NEAR withdrawal to recovery.worker-aje-veyntro.testnet using nonce2 and100 Tgas action gas. If enough, submit directly. Verify the new proposal payload and actual ID before approval. Retry has not yet been submitted.


## Council balance checked for retry — 2026-11-03

User supplied account summary for aje-veyntro.testnet at block276020381: balance1.48 NEAR. This is sufficient for a new1 NEAR proposal bond plus fees based on the previous live policy. Failed withdrawal callback is verified; operation1 Failed, nonce1 consumed. Recipient recovery.worker-aje-veyntro.testnet has now been created and funded. NEXT ACTION: submit fresh SputnikDAO proposal for 0.01 NEAR withdrawal to recovery.worker-aje-veyntro.testnet using nonce2, zero action deposit, 100 Tgas call gas and current bond. Capture dynamic proposal ID; inspect exact payload before voting. Verify transfer receipt, operation status and final firewall view. Retry not yet submitted.


## Withdrawal retry proposal submitted — 2026-11-03

User supplied successful SputnikDAO add_proposal receipt: proposal ID7, transaction fyTGzJiLamBB1Kr3nPhiRWh4x9GL9yNmj6Tbc1JYsPK (https://explorer.testnet.near.org/transactions/fyTGzJiLamBB1Kr3nPhiRWh4x9GL9yNmj6Tbc1JYsPK). Payload as returned matches withdrawal of0.01 NEAR to recovery.worker-aje-veyntro.testnet with nonce2, zero action deposit and100 Tgas. Bond attached1 NEAR. Approval not yet recorded. NEXT ACTION: inspect get_proposal(7) at current final block and verify receiver, method, args, gas, deposit and proposal status. If exact and still awaiting vote, council approves proposal7. Then check nested receipts and reconcile operation2 and treasury state; do not claim retry success until succeeded receipt and views confirm.


## Retry proposal 7 inspected — 2026-11-03

User supplied get_proposal(7) at final block. Status InProgress, no votes. Payload matches: receiver firewall-aje-veyntro.testnet, method withdraw_available, amount0.01 NEAR, recipient recovery.worker-aje-veyntro.testnet, nonce2, deposit0, action gas100 Tgas. Safe to cast the council approval as the next step. No withdrawal has executed yet.


## Withdrawal retry receipt succeeded; final views pending — 2026-11-03

User supplied successful council approval transaction4c9wTM3nshdpAXRDG9Dgne1QdMDTeq2SsH4duX52whVv (https://explorer.testnet.near.org/transactions/4c9wTM3nshdpAXRDG9Dgne1QdMDTeq2SsH4duX52whVv). Proposal7 execution emitted withdrawal_pending for operation2, amount0.01 NEAR, recipient recovery.worker-aje-veyntro.testnet, nonce2; then operation_settled status Succeeded, released0. This proves the authorized withdrawal completed according to the callback event. Evidence: evidence/WITHDRAWAL_RETRY_SUCCESS.json. Final view reconciliation and recipient balance check are still required.

NEXT EXACT ACTION: query get_operation(2), get_treasury_state(), and recovery.worker-aje-veyntro.testnet account summary. Confirm operation Succeeded; pending withdrawals0; last nonce2; confirmed funds decreased from3.9 to3.89 NEAR; liabilities remain0.3 NEAR; actual firewall balance decreased by exactly0.01 NEAR from13.8982260476962562 to13.8882260476962562 NEAR; solvency/backing remain true. Recipient balance should reflect the real transfer, considering its 0.1 NEAR initial funding and storage/fees. Then reconcile observed exact values; do not assert expected values without views. Phase2 remains IN_PROGRESS until final contract, user interface, and other planned gates are complete.


## Successful withdrawal retry and full balance reconciliation VERIFIED — 2026-11-03

User supplied latest-final-block views after transaction4c9wTM3nshdpAXRDG9Dgne1QdMDTeq2SsH4duX52whVv. get_operation(2): Withdrawal, recipient recovery.worker-aje-veyntro.testnet, amount0.01 NEAR, status Succeeded. get_treasury_state: actual balance13.8882260476962562 NEAR; confirmed accountable funds3.89 NEAR; liabilities0.3 NEAR; pending payouts/withdrawals0; withdrawal nonce2; operating reserve2.59752 NEAR; Money Available0.99248 NEAR; ledger solvent and physical backing true. Recipient account summary at block276021056 shows0.110 NEAR, consistent with initial0.1 plus0.01 receipt. Compared with pre-retry state, contract actual balance and confirmed funds each decreased by exactly0.01 NEAR. Evidence file evidence/WITHDRAWAL_RETRY_SUCCESS.json now includes the receipt and reconciled views.

Verified gates added: one failed DAO withdrawal transfer ran its callback, restored accountable funds, and consumed nonce1; a new DAO-approved withdrawal with nonce2 succeeded to the created recipient; final balances reconcile and solvency/backing pass. This was a withdrawal callback test; do not label it a failed beneficiary payout callback. Phase2 remains IN_PROGRESS pending remaining master-plan security gates and public usable app work.


## Current phase and next payout-callback check — 2026-11-03

Verified live testnet work now includes DAO funding and commitments; actual overcommitment and missing-evidence rejection; evidence-checked payout and successful payment; duplicate payout nonce rejection; permissionless expiry release; failed DAO withdrawal callback and nonce2 retry with full balance reconciliation. Withdrawal retry final state: actual firewall13.8882260476962562 NEAR, confirmed3.89 NEAR, liabilities0.3 NEAR, pending0, Money Available0.99248 NEAR, solvency/backing true. See evidence/WITHDRAWAL_CALLBACK_FAILURE.json and evidence/WITHDRAWAL_RETRY_SUCCESS.json.

Phase2 remains IN_PROGRESS. The remaining named live callback check is a failed beneficiary payout (the recipient is fixed per commitment; existing worker recipient succeeds). This is separate from the now-verified withdrawal callback. Public React/Vite/Wallet Selector application and hosted app remain unbuilt; they are mandatory P0 per master plan. The GitHub verifier has a real API-backed CLI preparation path and a real attestation/payout receipt, but no public HTTP endpoint.

NEXT EXACT ACTION: run read-only views at current final block for firewall get_treasury_state and council aje-veyntro.testnet account balance. Check that payout-failure.worker-aje-veyntro.testnet is absent before using it as the immutable recipient of a new small DAO-approved commitment. Confirm available funds and current SputnikDAO bond before proposing. If sound, create a 0.01 NEAR commitment (worker beneficiary; absent payout recipient; same approved evidence policy; expiry at least48h ahead), approve it, verify its actual commitment ID, prepare attestation from the real GitHub API using the genuine successful run while still fresh, submit verifier attestation, then request payment. Verify failed Promise, on_drawdown_result status Failed, restored liability/remaining amount, pending cleared, actual balance unchanged and nonce1 consumed. Only after verifying those views, create the payout recipient account and retry with nonce2 before evidence expiry; inspect final receipts and balances. No test action may substitute fabricated evidence. Phase2 cannot be marked complete until this and the contract security review gates are resolved. Reconcile docs and then proceed to the mandatory public app milestone.


## Payout-failure test preflight verified — 2026-11-03

User supplied latest final firewall get_treasury_state: confirmed funds3.89 NEAR; liabilities0.3 NEAR; available0.99248 NEAR; actual balance13.8882260476962562 NEAR; no pending payouts/withdrawals; ledger and physical backing true; next reservation ID2, next operation ID3, withdrawal nonce2. Council aje-veyntro.testnet balance1.47 NEAR at block276021931, enough for the previously observed1 NEAR bond and fees. Read-only account view confirms payout-failure.worker-aje-veyntro.testnet does not exist. These checks support a new0.01 NEAR test commitment; new reservation will add storage reserve, so recheck after execution.

NEXT EXACT ACTION: submit DAO proposal to create a clearly labeled security-test commitment: beneficiary worker-aje-veyntro.testnet; fixed payout recipient payout-failure.worker-aje-veyntro.testnet (confirmed absent); amount0.01 NEAR; exact policy hash22941ad52c55ba33751c7e27e8738948dc0bf08fae6e708d21b6b661ccc09048; expiry generated at submission as now+48h. Action create_reservation has zero deposit and30 Tgas. Current known proposal bond1 NEAR. Inspect actual stored proposal terms and expiry before vote. After approval, use genuine GitHub run41525421351 through verifier CLI for actual reservation ID while within its7-day age window; never synthesize evidence. Then beneficiary submits 0.01 payout nonce1, action gas100 Tgas. Confirm failed transfer callback and unchanged accounted balance. Create recipient only after callback verification; retry with nonce2 while attestation remains live. Phase2 IN_PROGRESS.
