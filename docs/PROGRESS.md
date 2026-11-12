# Veyntro — current progress

DATE/TIME (UTC): 2026-11-03 — status corrected against docs/MASTER_PLAN.md
PHASE / MILESTONE: Phase 4 — user-facing app; first public-view and wallet-connected app slice
STATUS: IN_PROGRESS
LAST VERIFIED COMMIT: Phase 4 source branch `phase4/public-treasury-wallet-slice`; live wallet/RPC checks remain open.
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


## Payout-failure test commitment proposal submitted — 2026-11-03

User supplied successful SputnikDAO add_proposal receipt: returned proposal ID8; tx HFb6nSNRZYySTiK52HzLfditqH6Guc6NzgnKY464Bq6h (https://explorer.testnet.near.org/transactions/HFb6nSNRZYySTiK52HzLfditqH6Guc6NzgnKY464Bq6h). Decoded submitted terms: beneficiary worker-aje-veyntro.testnet; payout recipient payout-failure.worker-aje-veyntro.testnet; amount0.01 NEAR; expiry1793866186320758628 ns (2026-11-05T08:09:46.320759Z); policy hash22941ad52c55ba33751c7e27e8738948dc0bf08fae6e708d21b6b661ccc09048; action create_reservation, zero deposit,30 Tgas. Proposal was submitted with1 NEAR bond. Stored proposal status/payload not yet independently checked, no commitment created yet.

NEXT EXACT ACTION: read SputnikDAO get_proposal(8) at current final block and confirm status, receiver, method, decoded terms, zero deposit,30 Tgas and enough remaining time before expiry. If it exactly matches and is InProgress, council approves. Then verify the created commitment ID and ledger before preparing real GitHub attestation. Never attest or pay before the DAO-approved reservation exists.


## Payout-failure proposal 8 inspected — 2026-11-03

User supplied final-block get_proposal(8). Status InProgress, no votes. Stored call matches: receiver firewall-aje-veyntro.testnet; method create_reservation; decoded terms beneficiary worker-aje-veyntro.testnet, recipient payout-failure.worker-aje-veyntro.testnet, amount0.01 NEAR, expiry1793866186320758628 ns, policy hash22941ad52c55ba33751c7e27e8738948dc0bf08fae6e708d21b6b661ccc09048; action deposit0, gas30 Tgas. Expiry is roughly48 hours after submission, adequate. Council may approve after reviewing the same fields. No commitment created until execution receipt succeeds.


## Payout-failure test commitment 2 created — 2026-11-03

User supplied successful council approval transaction7QiuF85u5E2YxfUrugQw4zF9Mvr6gkyQZPpRUyswZzzN (https://explorer.testnet.near.org/transactions/7QiuF85u5E2YxfUrugQw4zF9Mvr6gkyQZPpRUyswZzzN). Firewall emitted commitment_created ID2: beneficiary worker-aje-veyntro.testnet; recipient payout-failure.worker-aje-veyntro.testnet; amount0.01 NEAR; expiry1793866186320758628 ns; approved policy hash22941ad52c55ba33751c7e27e8738948dc0bf08fae6e708d21b6b661ccc09048. The approval and event are user-reported. Current treasury and commitment views have not yet been checked; no evidence attestation or payout has occurred.

NEXT EXACT ACTION: read firewall get_reservation(2) and get_treasury_state() at current final block. Verify the stored terms, Active status, evidence=null, nonce0, remaining0.01, and correct liability/available/backing totals. Then run the existing verifier CLI against policy evidence/FIRST_COMMITMENT_POLICY.json, reservation2 and genuine GitHub Actions run41525421351, signer verifier-aje-veyntro.testnet. The run is dated Nov2 and policy max age is7 days; the CLI must fetch real GitHub/RPC state and fail closed if stale or mismatched. Inspect its unsigned output before signing. Never use a saved/historical attestation.


## Payout-failure commitment 2 and backing verified — 2026-11-03

User supplied latest-final-block views: reservation2 Active, approved/remaining0.01 NEAR, beneficiary worker-aje-veyntro.testnet, immutable payout recipient payout-failure.worker-aje-veyntro.testnet, policy hash as approved, expires1793866186320758628 ns, evidence null, pending0, nonce0, attempts32. Treasury confirmed3.89 NEAR, liabilities0.31 NEAR, operating reserve2.92936 NEAR, available0.65064 NEAR, actual balance13.8882260476962562 NEAR, no pending operations; ledger_solvent and physical_backing_check true. Evidence: evidence/PAYOUT_FAILURE_COMMITMENT.json. No attestation/payment yet.

NEXT EXACT ACTION: run node services/verifier/src/cli.ts --policy evidence/FIRST_COMMITMENT_POLICY.json --reservation 2 --run 41525421351 --signer verifier-aje-veyntro.testnet --out /tmp/veyntro-payout-failure-$(date +%s).json from current repo. This fetches real GitHub and same-final-block NEAR data, checks the exact DAO-approved policy and commitment, and writes a new unsigned attestation. Inspect the output and confirm signed_or_sent=false before signing locally. The CLI must fail if run stale, policy/context mismatched, or evidence already present. Do not use prior attestation for reservation0.


## Payout-failure attestation prepared unsigned — 2026-11-03

User ran services/verifier/src/cli.ts for reservation2, real GitHub Actions run41525421351 and signer verifier-aje-veyntro.testnet. CLI returned status prepared_unsigned, signed_or_sent=false, output /tmp/veyntro-payout-failure-1793693689.json, evidence digest768c1b825c341cb9691ca39e36fc7369d6a57cd5f44c4833bf312b8bdc55e114, valid_until_ns1793695499336000000. This indicates local verifier checks and live API/RPC context passed at preparation time; it does not mean onchain attestation exists. Must inspect binding and transaction args before signing, then verify final receipt/onchain evidence.

NEXT EXACT ACTION: user prints the prepared file's status, binding and transaction to review recipient, reservation2, policy hash, commit SHA, verifier, nonce1, deadline, exact method and signer/receiver. If these match, sign locally as verifier-aje-veyntro.testnet and submit submit_attestation; do not reuse this prepared file after its validity deadline or after any onchain state change.


## Payout-failure attestation binding reviewed — 2026-11-03

User supplied prepared JSON for reservation2. status=prepared_unsigned; signed_or_sent=false. Reviewed binding: testnet firewall-aje-veyntro.testnet; reservation2; beneficiary worker-aje-veyntro.testnet; immutable payout recipient payout-failure.worker-aje-veyntro.testnet; approved amount0.01 NEAR; approved policy hash22941ad52c55ba33751c7e27e8738948dc0bf08fae6e708d21b6b661ccc09048; verifier verifier-aje-veyntro.testnet epoch0; attestation nonce1; valid_until_ns1793695499336000000; GitHub repo0xaje/Veyntro, run41525421351, commit3c18cad4f81b949f3e264961da61c97d5613964e, workflow404996405 path .github/workflows/contracts.yml, push/main, completed success. Prepared transaction targets firewall submit_attestation with 30 Tgas, zero deposit, exact matching args/digest768c1b825c341cb9691ca39e36fc7369d6a57cd5f44c4833bf312b8bdc55e114. This is a review of user-provided prepared data; no transaction signed or sent yet.

NEXT EXACT ACTION: check that current time is still before valid_until_ns. If so, sign/send these exact args locally as verifier-aje-veyntro.testnet. If deadline passed, rerun the live verifier CLI into a new unique output file and review again. Then verify final receipt and get_reservation(2) evidence fields before any payout request.


## Payout-failure attestation accepted — 2026-11-03

User supplied successful submit_attestation transaction4ZAVqkSqZfxpQhv5zWGYAUAJtYFV7A3xxRNaXBsrwDCR (https://explorer.testnet.near.org/transactions/4ZAVqkSqZfxpQhv5zWGYAUAJtYFV7A3xxRNaXBsrwDCR). evidence_checked event for reservation2 matches digest768c1b825c341cb9691ca39e36fc7369d6a57cd5f44c4833bf312b8bdc55e114, commit3c18cad4f81b949f3e264961da61c97d5613964e, approved policy hash, nonce1, verifier verifier-aje-veyntro.testnet epoch0 and valid-until1793695499336000000. Evidence: evidence/PAYOUT_FAILURE_ATTESTATION.json. Need fresh get_reservation view and confirm payout-failure.worker-aje-veyntro.testnet remains absent before requesting payout. No payout has yet been attempted.

NEXT EXACT ACTION: read get_reservation(2) at current final block and check evidence is verified/current/usable, then view-account-summary for the payout recipient; only if account does not exist, beneficiary worker signs request_drawdown id2, amount0.01 NEAR, operation_nonce1, 100 Tgas, zero deposit. Verify payment_pending, failed transfer receipt and on_drawdown_result settlement before creating the recipient.


## Payout-failure preconditions verified — 2026-11-03

User supplied final-block reservation2 view: Active, evidence present and usable=true, nonce1 still unused, remaining liability0.01 NEAR, no pending amount, fixed payout recipient payout-failure.worker-aje-veyntro.testnet. User also supplied account view error confirming that recipient account does not exist. These conditions are suitable for the live failed-payout callback test. No drawdown has yet been submitted.

NEXT EXACT ACTION: beneficiary worker-aje-veyntro.testnet submits request_drawdown for reservation2, amount0.01 NEAR, operation_nonce1, prepaid gas100 Tgas, zero deposit. Verify the complete receipt chain. Expected outcome is a failed recipient transfer followed by on_drawdown_result marking operation Failed; this is a hypothesis, not yet verified. Immediately query get_operation(actual operation ID), get_reservation(2), get_treasury_state. Do not create recipient account until failure and ledger reconciliation are confirmed.


## Failed beneficiary payout callback executed — reconciliation pending — 2026-11-03

User supplied request_drawdown receipt transaction5hXiJWVF6T5Yy5CCwLHe1YwzSZv5LgyhkDagrBMTq28t (https://explorer.testnet.near.org/transactions/5hXiJWVF6T5Yy5CCwLHe1YwzSZv5LgyhkDagrBMTq28t). Reservation2, operation3, amount0.01 NEAR, fixed recipient payout-failure.worker-aje-veyntro.testnet, nonce1. Receipt emitted payment_pending then operation_settled kindPayout statusFailed; returned value "Failed". This is a real failed beneficiary-payout callback. Evidence: evidence/FAILED_PAYOUT_CALLBACK.json. Treasury/commitment restoration not yet confirmed by views.

NEXT EXACT ACTION: query get_operation(3), get_reservation(2), get_treasury_state() at latest final block. Confirm operation Failed; reservation remains Active with remaining liability0.01 NEAR, pending0, drawdown nonce1 consumed, and inspect evidence usability/attempts; reconcile confirmed funds, total liabilities, pending payouts, actual balance, dynamic reserve, available and both backing flags. Only after these checks may the payout recipient account be created and a retry with nonce2 proposed by beneficiary before evidence expires.


## Failed payout callback fully reconciled — 2026-11-03

User supplied final-block get_operation(3), get_reservation(2), get_treasury_state views. Operation3 Payout/Failed for0.01 NEAR to payout-failure.worker-aje-veyntro.testnet. Reservation2 remains Active, remaining liability0.01 NEAR, pending0, drawdown nonce1 consumed, attempts31, evidence still usable=true. Treasury actual balance13.8882260476962562 NEAR, confirmed funds3.89 NEAR, liabilities0.31 NEAR, pending payouts/withdrawals0, reserve2.92165 NEAR, available0.65835 NEAR; ledger and physical backing true. Compared with pre-attempt state, actual balance, confirmed funds, commitment remaining and total liability are unchanged. Money Available rose0.00771 NEAR because dynamic operating reserve decreased by that amount after a reserved operation slot was consumed and actual operation storage was recorded. This is the live failed beneficiary-payout callback and funds conservation check. Evidence file updated: evidence/FAILED_PAYOUT_CALLBACK.json.

NEXT EXACT ACTION: create payout-failure.worker-aje-veyntro.testnet as a child account of worker-aje-veyntro.testnet with0.1 NEAR, verify final account creation receipt and recipient balance. Recheck commitment2 evidence usable=true before deadline; then retry reservation2 for0.01 NEAR using nonce2,100 Tgas, zero deposit. Verify operation4 Succeeded, commitment liability/remaining decrease by0.01, pending clears, contract actual balance and confirmed funds decrease exactly0.01, and solvency/backing stay true. This is the final live payout retry for the controlled recipient test; no real-world work claim is implied.


## Payout-failure recipient account created — 2026-11-03

User supplied successful account creation transaction HqgLJoSEfNT1HAySTn2Ux8yqaJbMKoQc8gnEwxeJBQJK (https://explorer.testnet.near.org/transactions/HqgLJoSEfNT1HAySTn2Ux8yqaJbMKoQc8gnEwxeJBQJK). Account payout-failure.worker-aje-veyntro.testnet created as child of worker-aje-veyntro.testnet and funded with0.1 NEAR; key remains in user's local legacy keychain. Evidence: evidence/PAYOUT_FAILURE_RECIPIENT.json; public key only, no private credential recorded.

NEXT EXACT ACTION: query account balance for payout-failure.worker-aje-veyntro.testnet and get_reservation(2) to ensure attestation remains usable before deadline, commitment is Active, amount0.01 NEAR, nonce1 already consumed, pending0, and remaining liability0.01. If yes, worker retries request_drawdown id2 amount0.01 nonce2,100 Tgas, zero deposit. Verify final payout/callback and treasury state.


## Failed payout callback retry receipt succeeded — final reconciliation pending — 2026-11-03

User supplied request_drawdown transaction4mugR4TmcxwQ62164DiGFZWinfvKzbvjuqxWK4Po1ukk (https://explorer.testnet.near.org/transactions/4mugR4TmcxwQ62164DiGFZWinfvKzbvjuqxWK4Po1ukk). Before retry, reservation2 was Active with evidence usable=true, last nonce1, remaining0.01 NEAR; payout-failure.worker-aje-veyntro.testnet existed with0.1 NEAR at block276024012. Retry used nonce2 and action100 Tgas. Logs show operation4 payment_pending then operation_settled Payout/Succeeded; request returned Succeeded. Evidence: evidence/PAYOUT_FAILURE_RETRY_SUCCESS.json. Need final read views to reconcile money before closing the gate.

NEXT EXACT ACTION: query get_operation(4), get_reservation(2), get_treasury_state and recipient account summary after payout. Confirm operation Succeeded; reservation remaining0 and liability released, pending0, nonce2; confirmed accountable funds and actual balance each decrease exactly0.01 NEAR from pre-retry values; treasury remains solvent/physically backed. No further payment until these checks are complete.


## Beneficiary payout failure, recovery and retry fully VERIFIED — 2026-11-03

User supplied final-block views after payout transaction4mugR4TmcxwQ62164DiGFZWinfvKzbvjuqxWK4Po1ukk. Operation4 is Payout/Succeeded for0.01 NEAR to payout-failure.worker-aje-veyntro.testnet. Reservation2 is Completed, remaining liability0, pending0, drawdown nonce2, evidence no longer usable after completion. Treasury actual balance13.8782260476962562 NEAR, confirmed funds3.88 NEAR, liabilities0.3 NEAR, pending0, operating reserve2.60674 NEAR, Money Available0.97326 NEAR, ledger_solvent and physical_backing_check true. Recipient balance0.110 NEAR at block276024439, matching0.1 initial funding plus0.01 payout. Compared with pre-retry state actual contract balance and confirmed funds each decreased exactly0.01 NEAR. This closes the live failed beneficiary payout callback and retry check: failed op3 retained funds, then nonce2 op4 succeeded after recipient creation. Evidence: evidence/FAILED_PAYOUT_CALLBACK.json and evidence/PAYOUT_FAILURE_RETRY_SUCCESS.json.

NEXT MILESTONE per docs/MASTER_PLAN.md: Phase4 — User-facing app (Phase3's real GitHub API verifier/attestation/payout acceptance has been exercised; verifier remains a local CLI, not a public endpoint). Before claiming Phase2 fully closed, finish the remaining contract adversarial/security review and external tester gate; no critical accounting issue or production audit claim is implied by the testnet lifecycle. Phase4 P0 frontend/hosted product is not built: React/Vite/TypeScript, real NEAR Wallet Selector, guest public views, DAO proposal/vote path, beneficiary evidence/payment path, expiry action, accessible simple-English mobile UX, final onchain statuses, HTTPS hosting. Next exact action for implementation session: inspect repo and current master plan/progress in user's Veyntro-build checkout, perform the remaining security review first, then build Phase4 screens against live contract views without placeholders. Preserve no mock activity. STATUS remains IN_PROGRESS.


## Beneficiary payout retry fully reconciled — verified — 2026-11-03

User supplied final-block read views after transaction4mugR4TmcxwQ62164DiGFZWinfvKzbvjuqxWK4Po1ukk. Operation4 is Payout/Succeeded for0.01 NEAR; reservation2 is Completed with remaining liability0, pending0, nonce2 and attempts0. Treasury actual balance13.8782260476962562 NEAR; confirmed accountable funds3.88 NEAR; liabilities0.3 NEAR; pending payouts/withdrawals0; operating reserve2.60674 NEAR; Money Available0.97326 NEAR; ledger_solvent and physical_backing_check true. Recipient payout-failure.worker-aje-veyntro.testnet holds0.110 NEAR at block276024439. Compared to pre-retry actual balance13.8882260476962562 and confirmed3.89, both decreased exactly0.01 NEAR; recipient increased from0.100 to0.110. Failed operation3 retained the commitment and funds; operation4 with nonce2 succeeded. Evidence: evidence/FAILED_PAYOUT_CALLBACK.json and evidence/PAYOUT_FAILURE_RETRY_SUCCESS.json, now reconciled with final views.

Phase2 testnet financial lifecycle now has successful proof for beneficiary payout failure and retry in addition to withdrawal failure/retry, overcommitment rejection, evidence gating, real payout and expiry cleanup. No external security audit is claimed. Remaining before Phase2 closure: finish contract adversarial review and external tester gate. Next planned product milestone is Phase4 public app (Phase3 real verifier/attestation/payout flow accepted; current verifier remains CLI-only). STATUS remains IN_PROGRESS.


## Phase order clarification — 2026-11-03

Phase3 was not skipped. Its acceptance flow has already been exercised ahead of the dated schedule, using the local real-GitHub CLI verifier and user-signed onchain transactions: real workflow run41525421351 was checked; attestation was accepted onchain for reservation0 and reservation2; an evidence-gated payout succeeded; missing evidence was rejected; verifier tests reject mismatched/failed/stale/replayed inputs. Core Phase3 acceptance is therefore VERIFIED for this CLI/manual-signing path. This does not mean a public verifier endpoint exists; current verifier is CLI-only, and product integration remains a Phase4 app gap.

Correct phase order/status: Phase2 remains IN_PROGRESS until remaining contract adversarial/security review and external tester gate are complete. Phase3's defined core gate is already VERIFIED and should not be repeated. After Phase2 closes, proceed to Phase4 — public React/Vite/TypeScript app with real Wallet Selector and public read views. Phase4 is NOT_STARTED. The earlier wording that said “next formal product milestone is Phase4” skipped this explanation; it did not mean Phase3 had been skipped.

Model note: this plan confusion was an explanation/tracking error, not a reason to change models. Keep this status explicit in future handoffs.


## Phase 2 first-pass static review recorded — OPEN — 2026-11-03

Added docs/SECURITY_REVIEW.md. Review covered accounting, governance, callback, type and public-view source plus selected adversarial test bodies. No confirmed critical accounting/authorization flaw was identified in the scoped review. This is explicitly not an audit or security clearance; tests were not rerun in this review. Material trust/reliability limits recorded: trusted verifier key, callback liveness/stuck pending funds, full-access deployment key authority, bounded attempts, and no public app. Independent external tester, exact-source CI/test rerun, key-custody review and callback runbook remain open. Phase2 IN_PROGRESS. Phase3 acceptance remains verified for CLI/manual signing; Phase4 app not started.


## Phase gate correction and current handoff — 2026-11-03

The current docs/MASTER_PLAN.md says Phase 2 exits after the full testnet financial lifecycle, complete transaction evidence and no known critical accounting issue. The project has recorded successful contract CI (run 41525421351), the user's successful build output (56 firewall tests, 9 receiver tests, Clippy and release WASM build), and live testnet evidence for DAO funding, commitments, rejected overcommitment, evidence-gated payment, failed/retried payout and withdrawal callbacks, expiry release, and final solvency/backing reconciliation. The first-pass static review found no confirmed critical accounting or authorization flaw in the reviewed paths. Phase 2's stated exit is SATISFIED. This is not a production audit or security clearance.

The independent tester, expanded adversarial suite, hosted workflow, key-custody review and residual-risk sign-off belong to Phase 6 / release hardening, not the Phase 2 exit gate. Phase 3's real GitHub-to-attestation-to-payment path remains accepted for the CLI/manual-signing flow. Phase 4 is IN_PROGRESS but no frontend exists yet. Guest reads must use live testnet RPC and writes must use signed testnet wallet actions; do not show cached example balances as live data.

Verification note: bash scripts/build-firewall.sh was attempted in this workspace on 2026-11-03 but could not start because cargo is not installed (cargo: command not found). This does not replace or invalidate the recorded successful CI and user-terminal results. Re-run in the development environment before any contract source change or release.

NEXT EXACT ACTION: build the first Phase 4 slice in apps/web: React/Vite/TypeScript, supported testnet wallet connection, and public treasury plus paginated commitments read from firewall-aje-veyntro.testnet over NEAR testnet RPC. Verify real loading/error/empty states and compare displayed amounts to fresh RPC output before adding governance and payout writes. MyNearWallet's testnet site announced limited mode effective 2026-11-01 and must not be selected as the sole wallet.


## Phase 4 public treasury and wallet slice — 2026-11-03

Added a first user-facing app slice under apps/web on a separate review branch. It uses React, Vite, TypeScript and Tailwind; reads the deployed firewall's treasury state and reservation pages from NEAR testnet RPC; pins commitment pages to the same final block as the displayed treasury; keeps public viewing available without a wallet; and adds a NEAR Wallet Selector connection through the documented Meteor Wallet testnet module. The UI includes live loading, empty, retry, stale-data and pagination states, simple-English labels, mobile-responsive layout and testnet explorer links. No sample financial data was added.

Local verification on Node 24.22.1 / npm 11.9.0:
- npm --prefix apps/web run check: passed.
- npm --prefix apps/web run build: passed.
- Production build split wallet code into separate chunks. Warnings remain visible: Meteor chunk 607.70 kB (171.56 kB gzip); wallet dependency transitive Node buffer/util references are externalized; js-sha256 includes guarded Node-only eval paths. These need review before release and must not be hidden.
- No live browser RPC comparison or wallet sign-in was performed in this workspace. A paging race was found and fixed: rows from an older block are not merged after a newer treasury refresh. The app has no DAO proposal, beneficiary payout, evidence submission, expiry action, transaction activity index or hosting yet. Phase 4 remains IN_PROGRESS.
- Contract code and testnet state were not changed.

NEXT EXACT ACTION: run the app in the development environment, compare its live treasury/commitment values against NEAR testnet reads at the displayed final block, and test Meteor wallet connect/disconnect. Once those checks pass, add signed DAO governance actions and verify each transaction's final receipts before adding beneficiary payment controls.


## Phase 4 Hallmark UI applied and live browser verified — 2026-11-03

Applied the Hallmark UI files from the archive into `apps/web`:
- `apps/web/src/App.tsx`
- `apps/web/src/GovernancePanel.tsx`
- `apps/web/src/ActivityPanel.tsx`
- `apps/web/src/styles.css`
- `apps/web/src/hallmark/tokens.css`
- `apps/web/src/hallmark/base.css`

Preserved full onchain RPC integration, SputnikDAO proposal and voting flows, wallet connection, and contract behavior. Created matching TypeScript modules `apps/web/src/near/dao.ts` (SputnikDAO queries, permissions, proposal builders), `apps/web/src/CommitmentActions.tsx` (drawdown claim and expiry release), and added operation history pagination and `last_withdrawal_nonce` tracking to `apps/web/src/near/rpc.ts`. Set testnet RPC default to `https://test.rpc.fastnear.com` because the legacy `rpc.testnet.near.org` endpoint returns HTTP 429 deprecation errors.

Verification results:
- `npm --prefix apps/web run check`: passed with zero errors (`tsc -b --pretty false`).
- `npm --prefix apps/web run build`: passed (`tsc -b && vite build`), generating production bundles and split chunks.
- Live browser verification: started Vite dev server and inspected real rendering using headless Chrome CDP. Verified:
  - Dark layout active: `color-scheme: dark`, body background `oklch(0.175 0.014 268)`.
  - Ledger-style treasury rows active: `display: grid`, single ruled list with `1px solid oklch(0.3 0.016 266)` bottom border.
  - Live NEAR testnet data rendered without mock data: Money Available `0.97326 NEAR`, Money set aside `0.3 NEAR`, Accounted treasury `3.88 NEAR`, Safety reserve `2.60674 NEAR`.
  - 3 live commitments rendered (`worker-aje-veyntro.testnet` - In progress, Expired, Completed).
  - 5 live operations rendered (Payment 4, Payment 3, Withdrawal 2, Withdrawal 1, Payment 0).
  - 9 live SputnikDAO proposals rendered (Requests 0-8).
- Saved verification evidence screenshot to `/tmp/veyntro-hallmark-verified.png`.

## Phase 4 Hallmark UI updated (v2 refinement) — 2026-11-03

Applied the updated Hallmark UI package (`veyntro-hallmark-ui_(1).zip`) into `apps/web`:
- `apps/web/src/App.tsx`: updated section ordering (`GovernancePanel` positioned before `ActivityPanel`), added section kickers (`Treasury overview`, `Onchain records`).
- `apps/web/src/GovernancePanel.tsx`: added `section-kicker` label `DAO decisions`.
- `apps/web/src/ActivityPanel.tsx`: added `section-kicker` label `Onchain records`.
- `apps/web/src/styles.css` & `apps/web/src/hallmark/tokens.css`: refined design tokens and palette with clean high-contrast styling (`color-scheme: light`, paper background `#f5f7f6` / `rgb(245, 247, 246)`, forest emerald accents `#176b56`, structured ledger rows).

Verification results:
- `npm --prefix apps/web run check`: passed (`tsc -b --pretty false`).
- `npm --prefix apps/web run build`: passed (`tsc -b && vite build`).
- Live browser verification: inspected via Chrome CDP on `http://localhost:5175/`. Verified:
  - Background `rgb(245, 247, 246)`, color scheme `light`.
  - Treasury money ledger rows active with live testnet values: Money available `0.97326 NEAR`, Money set aside `0.3 NEAR`, Accounted treasury `3.88 NEAR`, Safety reserve `2.60674 NEAR`.
  - Section kickers present: "Treasury overview", "Onchain records", "DAO decisions".
  - Commitments, activity, and SputnikDAO proposals rendering properly.
- Saved verification evidence screenshot to [`evidence/HALLMARK_UI_LIGHT_VERIFIED.png`](file:///home/oyeolorun/Veyntro-build/evidence/HALLMARK_UI_LIGHT_VERIFIED.png).

## Phase 4 Light/Dark Mode & Responsive Governance Stacking — 2026-11-03

Added accessible light and dark mode support and responsive governance grid improvements:
- **Default & Preferences:** Light mode remains the default look. If no preference has been saved in `localStorage`, the app detects the device preference via `prefers-color-scheme`. User toggles are persisted in `localStorage` (`veyntro-theme`) and applied dynamically to `<html data-theme="...">`.
- **Theme Palette:**
  - Light mode: preserved original forest-green and sage tokens (`#f5f7f6` paper, `#103d35` forest deep, `#176b56` emerald accent, soft mint panels).
  - Dark mode: deep forest slate background (`#121816`), elevated dark panels (`#18221f`), muted mint borders (`#273832`), emerald highlight (`#38a17d`), high-contrast body text (`#ecf3ef`), and verified WCAG-readable status badges and borders.
- **Accessible Theme Toggle:** Added a keyboard-focusable button in top navigation with explicit screen-reader label (`aria-label="Switch to dark mode"` / `"Switch to light mode"`), text label ("Dark mode" / "Light mode"), and moon/sun icon. At narrow mobile widths (<480px), the icon remains with full accessibility label intact.
- **Wallet Status Fix:** Corrected wallet button state when wallet connection fails or is unavailable. Instead of indefinitely displaying "Loading wallet…", it now accurately reflects "Wallet unavailable" with `disabled={true}` and matching tooltip.
- **Responsive Stacking:** Added breakpoint at `@media (max-width: 960px)` to stack the DAO proposal list and commitment/funding/withdrawal request form vertically into a single column (`grid-template-columns: minmax(0, 1fr)`) when they no longer comfortably fit side-by-side.

Verification results:
- `npm --prefix apps/web run check`: passed 0 errors (`tsc -b --pretty false`).
- `npm --prefix apps/web run build`: passed (`tsc -b && vite build`).
- Live browser verification (Chrome CDP on running dev server):
  - Desktop light mode verified (`data-theme="light"`, body background `rgb(245, 247, 246)`).
  - Desktop dark mode verified (`data-theme="dark"`, body background `rgb(18, 24, 22)`, text `rgb(236, 243, 239)`, panels `rgb(24, 34, 31)`, borders `rgb(39, 56, 50)`).
  - Keyboard navigation verified: focus outline visible and toggling via `Enter` key functional.
  - Mobile layout verified at 375px: governance grid stacks to single column (`gridTemplateColumns: "343px"`), toggle button adapts cleanly.
  - Persistence verified: `localStorage.getItem('veyntro-theme')` correctly stores selection.
- Evidence screenshots:
  - [`evidence/THEME_DESKTOP_LIGHT.png`](file:///home/oyeolorun/Veyntro-build/evidence/THEME_DESKTOP_LIGHT.png)
  - [`evidence/THEME_DESKTOP_DARK.png`](file:///home/oyeolorun/Veyntro-build/evidence/THEME_DESKTOP_DARK.png)
  - [`evidence/THEME_MOBILE_DARK.png`](file:///home/oyeolorun/Veyntro-build/evidence/THEME_MOBILE_DARK.png)

## Phase 4 True Black Dark Theme & Circular Dot Toggle — 2026-11-03

Updated dark mode and the toggle control:
- **True Black Theme:** Replaced green/olive-tinted dark tokens with true black (`#000000`, `rgb(0, 0, 0)` body background), dark panels (`#0d0d0d`), subtle neutral rules (`#262626`), and clean light-gray typography (`#f3f4f6`). No army green or greenish tint in dark mode.
- **Circular Dot Toggle:** Replaced the wide pill button and sun/moon text with a compact circular dot toggle (38px circle with an active status dot: forest emerald in light mode, crisp white in dark mode). It is fully keyboard-accessible with visible focus ring and screen-reader accessibility labels.
- **Automatic Day / Night Cycle:** In addition to manual clicks, the toggle supports an automatic schedule that uses the local time of day (daylight 7am–7pm = light mode, nighttime 7pm–7am = dark mode) as well as system `prefers-color-scheme`. It periodically updates without page reload.
- **Evidence Screenshots:**
  - [`evidence/THEME_PURE_BLACK_DESKTOP.png`](file:///home/oyeolorun/Veyntro-build/evidence/THEME_PURE_BLACK_DESKTOP.png)
  - [`evidence/THEME_PURE_BLACK_MOBILE.png`](file:///home/oyeolorun/Veyntro-build/evidence/THEME_PURE_BLACK_MOBILE.png)
- Rebuilt archive at `~/Downloads/veyntro-web-source.zip`.

## Phase 4 Unified Palette Harmony — 2026-11-03

Replaced green highlights in light mode with the signature blue accent from dark mode for cohesive design harmony:
- **Consistent Accent:**
  - Light mode: Deep slate headings (`#0f172a`), royal blue primary accents (`#2563eb`), soft blue card highlights (`#bfdbfe`), clean slate backgrounds (`#f8fafc`).
  - Dark mode: True black background (`#000000`), dark panels (`#0d0d0d`), electric/azure blue accents (`#3b82f6` / `#60a5fa`), crisp white headings (`#ffffff`).
- Both modes share matching accent identity across section kickers, status highlights, primary action buttons, focus states, and the circular theme dot toggle.
- Verification evidence screenshots:
  - [`evidence/THEME_BLUE_LIGHT.png`](file:///home/oyeolorun/Veyntro-build/evidence/THEME_BLUE_LIGHT.png)
  - [`evidence/THEME_BLUE_DARK.png`](file:///home/oyeolorun/Veyntro-build/evidence/THEME_BLUE_DARK.png)
- Rebuilt `~/Downloads/veyntro-web-source.zip`.







## Phase 4 UI corrections after user review — 2026-11-03

Work branch: `codex/phase4-ui-corrections`, based on frontend branch commit `b598a2960d6d4080dee02248b5d6a24f95222dea`.

Applied to the React app:
- Split the long dashboard into Overview, Commitments, DAO approval, and Activity views using the existing hash navigation. Direct links and browser back/forward update the selected view. The overview links to the other views.
- Replaced the unclear dot-only theme control with a named Light/Dark mode button. It now has a simple two-way toggle, persists the selected mode, migrates the previous theme preference key, and applies the saved theme before the app renders.
- Restored Veyntro's forest-green accent and changed the dark palette from pure black to a softer dark green/charcoal palette.
- Added a form-panel container breakpoint and constrained the native date-time input. The form stacks its fields when the actual form panel is narrow, including at wide browser widths.
- Kept the Activity view honest: it still says its onchain operation list excludes funding and commitment changes and that records lack direct transaction links.

Verification performed in the cloned review branch:
- `npm --prefix apps/web ci --ignore-scripts --no-audit --no-fund`: completed.
- `npm --prefix apps/web run check`: passed.
- `npm --prefix apps/web run build`: passed. Existing warnings remain for the 607.70 kB Meteor wallet bundle, externalized Node built-ins, and guarded `eval` usage in `js-sha256`.
- `git diff --check`: passed.
- Browser visual verification was attempted, but no local Chromium/Chrome binary is installed in this environment. Do not claim the date field's visual fit or route interactions have been verified in a real browser yet.

Still open; this is not a 10/10 or Phase 4 completion claim:
- Activity is incomplete against the master plan: the current contract view lacks funding/commitment event indexing and per-transaction hashes. Do not invent these records. Determine a reliable public event/transaction source and add it before claiming a full audit history.
- No hosted app, live wallet signing walkthrough, or fresh live RPC comparison was performed for this correction branch.
- Recheck date control fit and routes at desktop and mobile sizes in a real browser, including a narrow governance card.
- The production bundle warnings need a focused dependency/bundle review; do not hide them by raising the size threshold.

NEXT EXACT ACTION: install or use a real browser in the development environment and visually check all four views, the deadline field at wide and narrow widths, keyboard navigation, light/dark persistence, and a real testnet data load. Then resolve the Activity evidence/indexing gap and verify the full hosted wallet flow before marking Phase 4 complete.

## UI follow-up from video review — 2026-11-03

This update corrects the theme and Overview against the user's latest direction. It changes the web interface only; no contract, verifier, DAO, wallet, or backend code is changed.

- The theme control is a small circular dot button with an accessible name and keyboard focus indicator. It switches the saved light/dark preference when clicked. It does not show mode text or switch automatically by time of day.
- Light mode uses a pale slate background with blue highlights. Dark mode uses a black background with blue highlights.
- The Overview includes a Commitment Firewall summary when real treasury state is available. It shows the contract's current coverage and physical-backing checks, tied to the live final block. It does not invent balances or activity.
- Existing Overview, Commitments, DAO approval, and Activity navigation remains in place. Commitment, DAO approval, and Activity views stay mounted while hidden so leaving a page does not discard unfinished form or action state. Existing wallet, RPC, and transaction code is unchanged.

Verification for this follow-up is pending. Do not describe the visual update as finished until the web type check and production build pass and the page has been viewed at desktop and mobile sizes. Do not mark Phase 4 complete: the Activity evidence gap and live wallet review recorded above remain open.


## Phase 4 wallet and payment repair — 2026-11-03

Branch: `codex/phase4-ui-corrections`; draft PR: https://github.com/0xaje/Veyntro/pull/1. This note supersedes earlier README/progress statements saying the app does not exist. The app source is in this review branch; it is not merged or hosted.

Reviewed the deployed contract API against the web action code and fixed two exact ABI mismatches:
- Expiry cleanup now calls `release_expired`, matching the public contract method; the previous `release_expired_reservation` name did not exist.
- Payout requests now include `operation_nonce = last_drawdown_nonce + 1`, and the reservation reader validates that onchain nonce before enabling the action. The UI also blocks zero and above-liability amounts.
- The payout UI reads the contract's final callback result and distinguishes `Succeeded`, `Failed`, and no returned outcome. It does not report an accepted wallet submission as a completed payment. Expiry cleanup reports the returned amount as money made available in the contract, not an outgoing transfer.
- Wallet initialization now has a retry action and logs the actual setup exception to the browser console while keeping the visible message in simple English. This is diagnostic and recovery handling; the initialization root cause is still unknown until exercised in the target browser.

Local verification ran on Node 24.22.1 / npm 11.9.0 after fetching the exact app source from the review branch:
- `npm --prefix apps/web ci --ignore-scripts --no-audit --no-fund`: passed, 183 packages installed.
- `npm --prefix apps/web run check`: passed.
- `npm --prefix apps/web run build`: passed. Existing warnings remain: 607.70 kB Meteor wallet chunk, browser-externalized `buffer`/`util` references, and guarded `eval` warnings from `js-sha256`. These are open for dependency review; the warning threshold was not raised.
- This workspace has no Git metadata and no installed desktop browser. The source was checked from the PR branch in a temporary workspace. No wallet popup, signed app transaction, mobile visual check, or hosted deployment was verified here. Testnet contract state was not changed.

**Current Phase 4 status: IN_PROGRESS.** Public reads and governance/action code exist, but the wallet and transaction flows have not passed a live browser walkthrough. Activity still lacks funding/commitment event indexing and exact transaction links. The current frontend bundle warnings need review.

**Next exact action:** run this review branch in the project development environment, select `Connect Wallet`, inspect the browser console if setup fails, and test a real testnet connect/disconnect without sending a transaction. Confirm the connected testnet account first. Then verify a low-risk permissionless `release_expired` action only if an actually expired commitment is available; otherwise stop without creating test activity. After wallet setup, test the DAO proposal read/permission path and beneficiary payout on existing evidence-backed state, with the user reviewing every signature. Update this record with actual browser, wallet, receipt and RPC results. Do not claim app writes are verified based on a build alone.


### Web CI added — 2026-11-03

Added `.github/workflows/web.yml` on the same review branch. It uses pinned checkout/setup-node action revisions and Node 24.22.1, installs the locked app dependencies without lifecycle scripts, and runs the web type check and production build for app/workflow changes. Local app check/build already passed as recorded above. GitHub reported no workflow runs for the branch at the time this note was written, so the new CI job is not yet claimed passed. This workflow does not test wallet popups or sign transactions.


### Web CI failure and correction — 2026-11-03

The first two Web app checks exposed a source-generation mistake: `apps/web/src/App.tsx` had literal backslash-n text in the wallet retry alert. The failure was at TypeScript compile (run 41647307715, then 41647380801); dependency installation passed in both. The App source was corrected in commit `b265e412c98cfbe61b089f018b6f93e5bf1a7d9e`. Web app checks run 41647513452 then passed on that corrected commit, including the app type check and production build. CI evidence: https://github.com/0xaje/Veyntro/actions/runs/41647513452. The initial failed runs remain part of the record. A successful build still does not verify a wallet popup or real wallet-signed action.

## Phase 4 wallet browser diagnosis — 2026-11-03

The user's Chrome console showed wallet setup failing first at `Buffer.from` because Vite externalized the Node buffer module. Added the browser `buffer` package, Vite alias, and global Buffer; local type-check/build and CI run 41652172750 passed. A new Chrome recording then showed `ReferenceError: global is not defined` at the wallet dependency's `global.crypto` initialization. Added `globalThis.global = globalThis` before wallet dynamic imports (via `Object.assign`). Local type-check passed; CI and an actual browser connect/disconnect check remain pending. The red notice is a wallet setup error and retry action; the top-bar button is the connection control. Do not claim wallet operation or signed transactions until observed in the browser.

NEXT EXACT ACTION: pull commit 0854f42b78ef058d1272e297dc2b730b5c646a66 on the draft branch, restart Vite, hard-refresh Chrome, and verify wallet modal, testnet account connection, and disconnect. If setup still fails, capture the new exact console stack and fix it before any wallet-signed action.

## Phase 4 wallet navigation and account guidance — 2026-11-03

Reviewed the wallet path: WalletProvider initializes NEAR Wallet Selector and Meteor in the browser; GovernancePanel and CommitmentActions request wallet-signed transactions; the verifier service is separate and does not connect browser wallets. Moved wallet setup retry into the navbar wallet control and removed the large page-level retry banner. No contract/backend signing behavior changed. Local web type-check and build passed; actual browser connection and CI for the new UI commit remain to be verified. Only Meteor injected wallet is configured, so a user without that extension has no supported wallet option in the current modal. Browser wallet absence does not explain the earlier Buffer/global initialization exceptions; those were runtime bundling faults and were fixed separately. New browser wallet accounts have no DAO/beneficiary roles until onchain policy grants them. Never expose CLI private keys or import the firewall/verifier keys to a browser to solve this UI issue.

NEXT EXACT ACTION: verify CI for commit 864de26c5014cf4e7ac814dd1b1123fee37faaa3, then pull and test the navbar wallet flow with a real Meteor testnet wallet in Chrome. Record account ID, connection/disconnection, and any exact runtime error; no transaction should be claimed until a signed receipt is verified.

## Phase 4 wallet choice expansion — 2026-11-03

Wallet Selector previously registered only Meteor. The frontend now registers Meteor, HOT, Intear, Nightly, Sender, OKX, and HERE modules on testnet; package versions are pinned to 10.1.4. The existing navbar control and onchain authorization rules remain. Local TypeScript check and production build passed after correcting the OKX export name. These are explicit connectors, not automatic support for every NEAR wallet. Wallet setup, chooser rendering, actual connection/disconnection, and signed testnet actions remain unverified in a browser. The prior startup failures are separate from a user's choice of extension. Review bundle and browser behavior before claiming Phase 4 complete.

NEXT EXACT ACTION: check CI for code commit 3a3caac8524b96af17e03e79ddac780e119b2b96, pull the draft branch in Ubuntu, restart Vite, open the chooser, connect and disconnect at least two supported testnet wallets, and capture exact errors if setup fails. Do not sign treasury actions until account role and transaction details are verified.

## Multi-wallet install correction — 2026-11-03

User's npm ci failed after the seven-wallet change with `Missing: typescript@5.9.3 from lock file`. Root cause: HOT wallet brought in @hot-wallet/sdk -> @solana/web3.js with TypeScript ^5 peer requirements, conflicting with the app's pinned TypeScript 7 under npm 10. Removed the HOT module and its transitive dependencies from this PR. Remaining choices: Meteor, Intear, Nightly, Sender, OKX, HERE. Independently ran `npx npm@10 --prefix apps/web ci --ignore-scripts --no-audit --no-fund` successfully, then the web type-check and build passed locally. GitHub CI and live browser choice/connection still need verification. The prior progress note listing HOT is superseded by this correction.

NEXT EXACT ACTION: verify CI for code commit 4c1cf1d1ff804aaaf802927f03fbebb6d6e5a76f, then user pulls current draft branch and runs npm ci before starting Vite. If clean install succeeds, inspect actual wallet chooser and connect/disconnect on testnet.

## Phase 4 wallet recording and light chooser repair — 2026-11-03

The user's 58-second Chrome recording shows a Meteor testnet wallet connecting to the navbar account and disconnecting again. This verifies that connect/disconnect worked in that browser session. It does not verify transaction signing, another wallet, mobile behavior, or a final contract receipt. Antigravity's commit `1ce78f8` added My NEAR Wallet and browser polyfills; Web app checks run 41675727519 passed. The video also shows the wallet chooser with dark wallet rows and unreadable wallet names while Veyntro is in light mode. Wallet Selector applies a dark palette from the operating system's `prefers-color-scheme` even when Veyntro's own toggle is light. Scoped light-theme variables and explicit wallet-row text colors now align the chooser with the app setting. Recheck this visually on the user's Chrome after pulling this change.

Phase 4 remains IN_PROGRESS against `docs/MASTER_PLAN.md`: the UI currently has hash views for overview, commitments, DAO approval and activity; it does not implement all eight specified paths. Activity shows contract payment/withdrawal records but no funding/commitment event history or per-transaction links. The hosted HTTPS app, evidence submission screen, complete DAO and beneficiary signed workflow, expiry release, final receipts and desktop/mobile end-to-end checks are outstanding. Do not mark the phase complete from the wallet video or a build alone.

## Phase 4 public explanation view — 2026-11-03

Added a public `/docs` view with the contract's money rules, DAO and beneficiary roles, verifier trust limit, live account explorer links, and links to repository instructions. It reads the DAO account from the live treasury state rather than showing a fabricated value. The app plainly says that public evidence submission and complete activity indexing are unavailable. The other main views still use hash navigation, and `/verify` is not implemented. The verifier remains a local unsigned-preparation CLI with no authenticated public HTTP endpoint; exposing it as a public submit form before authorization, durable records, rate limits and limited signing custody would be unsafe. Next: complete the verifier service gate and remaining true routes, then verify the complete signed Phase 4 workflow on a hosted app.

Follow-up: added direct paths for `/commitments`, `/commitments/:id`, `/governance`, and `/activity`, keeping old hashes usable. A commitment detail reads `get_reservation(id)` from the same final block as the treasury and shows real payout account, evidence hash and verified commit when present. This is a public read slice; it does not add a verifier submission flow or transaction history indexing. Type check/build and direct-path browser behavior must be verified before counting these routes as working.

## Phase 4 browser DAO proposal and navigation review — 2026-11-03

The user's screen recording shows testnet explorer transaction `C6EL9CRoCtLq7ZW1k2477w1TK4b1BRcTs7LCXzp1Z5dS` with status Success for `add_proposal` from `aje.testnet` to `veyntro.sputnikv2.testnet`, with a 1 NEAR attached deposit. The app shows the funding request as "Waiting for votes." The 1 NEAR on the transaction is the DAO proposal bond; it is not confirmation that the proposed 1 NEAR funding action has moved to the firewall. Saved DAO policy gives the Everyone role `*:AddProposal`, while voting is in the council group `aje-veyntro.testnet`. Re-read live policy and proposal before a council signature; verify final DAO-to-firewall receipts and live treasury state after approval. This is user-video evidence; an independent RPC receipt/state reconciliation for this proposal remains pending.

The recording also shows the navbar labels wrapping unevenly at desktop width. Reduced desktop nav gaps, kept each label on one line, moved the nav to its own row at narrower widths, and allowed the mobile nav to wrap into complete rows. Build and visual confirmation after pulling remain pending.

## Phase 4 proposal review before vote — 2026-11-03

The prior proposal list showed a description and one action label but hid the actual receiver, amount and remaining actions. Added a read-only summary of the DAO's onchain FunctionCall proposal: receiver, funding amount when it is exactly one `fund_treasury` call to the configured firewall, and an expandable list of every action's method, attached NEAR, gas and original encoded args. This helps a council voter check the real onchain proposal before signing. It does not itself validate successful DAO execution, and a wallet signature must still be reviewed in the wallet and checked against final receipts and refreshed treasury state. CI and browser review remain pending.

## Phase 4 council vote for funding request 9 — 2026-11-03

User supplied local NEAR CLI output for transaction `4hb14JpA6QvayTJERTPcaFj2MyVUGgPq25emxZhFKZXt`: signer `aje-veyntro.testnet`, receiver `veyntro.sputnikv2.testnet`, `act_proposal` VoteApprove ID 9, 150 Tgas, zero attached deposit. CLI reported success and a Firewall `funded` event of 1 NEAR with `confirmed_funds` 4.88 NEAR. The proposal's read-only preflight had shown InProgress, proposer `aje.testnet`, exactly one `fund_treasury` action to `firewall-aje-veyntro.testnet`, 1 NEAR attached to that DAO action, and 30 Tgas. Public explorer access in this workspace failed; this is user-supplied CLI evidence. Next: independently read `get_proposal(9)` and `get_treasury_state` at final testnet state; confirm Approved and 4.88 NEAR accountable funds with zero pending transfer, then compare the app's refreshed numbers. Do not re-run the vote.

Follow-up final-state output supplied by user: `get_proposal(9).status` is Approved; `get_treasury_state.confirmed_accountable_funds` is `4880000000000000000000000` yoctoNEAR (4.88 NEAR); pending payouts and withdrawals are both zero; `ledger_solvent` and `physical_backing_check` are both true. This reconciles the CLI's `funded` event with final public contract state and closes the DAO funding transaction check. A browser comparison of the refreshed Overview's “Accounted treasury” display is still pending. No second vote is needed.

## Phase 4 browser council preparation — 2026-11-03

User selected `aje.testnet` as the browser council account. Added `scripts/browser-council.py` and `docs/BROWSER_COUNCIL.md` to prepare and verify an `AddMemberToRole` proposal without reading keys or signing. The script checks live final-block policy, exact existing council membership, voting permissions and threshold, account existence, proposal bond, and the exact proposal before preparing a vote. Live read-only preparation succeeded at testnet block 276085217: council only `aje-veyntro.testnet`, new account `aje.testnet` exists, bond 1 NEAR. No DAO policy transaction has been submitted yet. Adding this account grants full council voting authority; with the recorded 1/2 threshold and two members, either may be able to approve alone. The user must review and sign proposal/vote with the existing Ubuntu council key, then verify onchain policy and test a real web vote. Do not claim browser voting is verified yet.

Follow-up: user supplied successful `add_proposal` CLI result 10, transaction `8UyHhWmUaWgEBZMu2aLejZcsKkDfjeaCNP48CPj4vGJx`, signed by `aje-veyntro.testnet` with 1 NEAR proposal bond. The payload is exactly `AddMemberToRole` for `aje.testnet` in `council`. This workspace's read-only `browser-council.py vote --id 10` preflight succeeded at final block 276085550: exact kind, description, proposer, open status, unexpired period, unchanged single-member council. No approval vote or role change has happened yet. Next: user locally signs the prepared `VoteApprove` with existing council key; then verify proposal Approved and both members in live policy. Do not re-submit proposal 10.

- 2026-11-03: Council proposal #10 was approved by `aje-veyntro.testnet` in testnet transaction `XQXN9TVQLUSYq1wYPd5areyvaFDY44axbpzafgtXFPA`. Independent finalized RPC verification at block 276085957 confirmed proposal status `Approved` and council members `aje.testnet` and `aje-veyntro.testnet`. The browser wallet `aje.testnet` is now authorized to vote on future open DAO proposals. The first browser-signed vote remains to be tested; proposal #10 is closed. Fixed `scripts/browser-council.py verify` to accept the exact new membership while keeping prepare/vote checks on the old membership.

## Phase 4 browser vote preflight — 2026-11-03

DAO reads now pin the proposal list to the same finalized block as the policy. Before a browser vote, the app re-reads the exact proposal and policy together from one final block; it rejects a closed/already-voted proposal, missing current permission, or changed details before opening the wallet. Non-FunctionCall policy changes now expose their full onchain kind for review. The web production build passed locally after a clean npm install. Published to `codex/phase4-ui-corrections` through commit `e8527c77133fd759e531ea0d9f17eb5f28f9c6fa`. The preflight is an interface safety check; SputnikDAO still enforces voting rights. A browser-signed vote, wallet receipt, hosted app, and full Phase 4 journey remain unverified. Next: pull the branch in Ubuntu, review a genuine new open proposal with `aje.testnet`, sign through the wallet, then independently compare final DAO proposal and contract state. Do not re-vote on approved proposal 10 or create a financial action just to exercise a button.

## Phase 4 browser vote on proposal 11 — 2026-11-03

User screenshot at final DAO block 276092047 showed funding request 11 (0.5 NEAR from DAO to firewall) as Waiting for votes and `aje.testnet` already voted. Independent finalized testnet RPC at blocks 276092254/276092266 confirmed proposal 11 is InProgress, proposer `aje.testnet`, exact single `fund_treasury` FunctionCall with 0.5 NEAR attached and 30 Tgas, `votes.aje.testnet=Approve`, council tally `[1,0,0]`, and council members `aje.testnet` and `aje-veyntro.testnet`. Therefore the browser vote was recorded but did not reach approval; the other council member must vote for this proposal to pass under the observed policy behavior. Corrected the prior assumption that one of two votes might suffice. Updated the UI to say the user's vote was recorded while more council votes are pending; local web build passed and change is on the review branch. No funding from proposal 11 has executed yet. Next: existing Ubuntu council account reviews exact proposal 11 live, votes if appropriate, then verify final DAO and firewall receipt/accounting. Do not repeat the browser vote or present 0.5 NEAR as funded before execution.

## Browser-only council transition prepared — 2026-11-03

Independent finalized RPC at blocks 276092967/276092979 confirmed funding proposal 11 Approved with both council votes, and Firewall accounted funds 5.38 NEAR, zero pending payouts/withdrawals, solvent and physically backed. The user's browser vote from `aje.testnet` was recorded; the Ubuntu account supplied the second approval. The earlier assumption that one of two votes could pass is contradicted by this live result and corrected in `docs/BROWSER_COUNCIL.md`.

User wants `aje.testnet` to be the routine browser approval account, without Ubuntu CLI votes. Added `scripts/retire-cli-council.py` and `docs/RETIRE_CLI_COUNCIL.md` for a one-time `RemoveMemberFromRole` proposal to remove `aje-veyntro.testnet` from council. The script reads finalized policy and exact membership, checks proposal 11 Approved, and emits unsigned JSON; it does not sign, send, or read private keys. `python3 -m py_compile` passed and live prepare succeeded at block 276092911 with 1 NEAR bond; the old council account had about 1.4659 NEAR at block 276093019. No removal proposal has yet been submitted, signed or approved. Two votes remain required for the transition. After it is approved, verify the live council contains only `aje.testnet`, then test a genuine later proposal from the web; the one-member voting outcome remains unverified. Sole council control is a centralization/key-loss risk, not community multisig governance.

## Browser-only council membership verified — 2026-11-03

User screenshot of Veyntro `/governance` showed request 12 Approved and the exact `RemoveMemberFromRole` action for `aje-veyntro.testnet` in `council`, connected as `aje.testnet`, with final DAO block 276094025. Independent read-only `python3 scripts/retire-cli-council.py verify --id 12` succeeded at final block 276094130: proposal 12 Approved and council members exactly `["aje.testnet"]`. This verifies the one-time DAO role transition; the Ubuntu account no longer has a council vote. A future genuine proposal must still test whether one browser approval passes with the single-member council and confirm the final receipt. Do not claim that transaction path or hosted app is verified yet. The sole browser wallet now has governance control; loss/compromise is a centralization risk. No transaction hash for the browser vote was supplied, so the finalized proposal/policy state is the evidence here.

## Phase 4 newest DAO requests — 2026-11-03

Fixed the web DAO list to read `get_last_proposal_id` and then the newest up to 50 proposals, rather than permanently displaying IDs 0–49. Policy, count, and list are pinned to the same finalized block and the list is shown newest first. Live testnet RPC confirmed `get_last_proposal_id=13` with proposals 10–12 available; web TypeScript/production build passed. Published on review branch as `f8baaa78558395b60a90a8bf748b87d70834cc5c`. Browser rendering after pulling remains unverified. Live Firewall at blocks 276094365/276094379 has three commitments; none currently offers an active usable evidence-backed browser payout (reservation 0 evidence unusable, reservation 1 expired, reservation 2 completed). The next end-to-end commitment/evidence/payout must use new genuine work evidence and an actual beneficiary wallet; do not reuse an old successful CI run as fresh work or fabricate an eligible state. Secure public verifier request/signing remains open.

## Fresh web-work GitHub evidence policy — 2026-11-03

Confirmed through GitHub Actions API that workflow run 41708155809 completed successfully on 2026-11-03 for exact commit `f8baaa78558395b60a90a8bf748b87d70834cc5c`, workflow ID 405759133/path `.github/workflows/web.yml`, event pull_request, branch `codex/phase4-ui-corrections`, same non-fork repository. Extended verifier policy parser to allow an explicitly named pull_request event while preserving exact repo/head identity, SHA, workflow, branch, status, age and no-fork checks; the existing push policy still rejects a PR run. Added `evidence/WEB_APP_WORK_POLICY.json` with canonical hash `59ef3ce012e6a54b45e5f78d6ff0e90ed176404eb289a6da0cb86ab27c5b0288` and `docs/WEB_APP_WORK_EVIDENCE.md`. Verifier type check and all 29 tests passed locally. This run proves the named checks passed, not business acceptance. No commitment, attestation, payment or public verifier service was created by this work. The DAO must explicitly approve any payment for already-completed web work with real terms; this CI evidence expires after seven days from its original creation. Browser beneficiary signing and final receipt remain to be verified.

## Proposed web-work commitment terms prepared — 2026-11-03

Rechecked actual GitHub Actions run 41708155809: completed/success, pull_request, exact commit f8baaa78558395b60a90a8bf748b87d70834cc5c, branch codex/phase4-ui-corrections, workflow ID 405759133/path `.github/workflows/web.yml`, same non-fork repository. Finalized RPC at DAO block 276098769: only aje.testnet council, proposal bond 1 NEAR. Firewall block 276098784: 2.47326 NEAR available, confirmed 5.38 NEAR, solvent/backed. Wallet aje.testnet held about 3.9986 NEAR at block 276098798. Added docs/WEB_APP_WORK_REQUEST.md with reviewable suggestion: retroactive 0.05 NEAR testnet for the completed web app change, beneficiary and payout account aje.testnet, deadline 2026-11-07 12:00 UTC, exact policy hash 59ef3ce012e6a54b45e5f78d6ff0e90ed176404eb289a6da0cb86ab27c5b0288. No proposal, commitment, attestation, or payment was submitted by preparation. User must review and sign the DAO proposal; then verify the actual ID and one-vote outcome before verifier signing or beneficiary payout. One account covering all roles is a demonstration of signed paths, not independent governance.

## Browser-only council vote created commitment 3 — 2026-11-03

User screenshots show request 13 moving from Waiting for votes to Approved in the browser with aje.testnet connected. Independent finalized RPC at DAO block 276100167 confirms proposal 13 Approved with exactly one council Approve vote from aje.testnet and one create_reservation call to firewall-aje-veyntro.testnet. Firewall block 276100183 has confirmed funds 5.38 NEAR, liabilities 0.35 NEAR, zero pending, solvent/backed; next reservation ID 4. Reservation 3 at block 276100198 is Active, 0.05 NEAR approved and remaining, beneficiary/payout account aje.testnet, no evidence, nonce 0, policy hash 59ef3ce012e6a54b45e5f78d6ff0e90ed176404eb289a6da0cb86ab27c5b0288, expiry 2026-11-07 12:00 UTC. This verifies a single browser wallet council vote executed a real commitment. The screenshots showed raw base64 proposal arguments; the governance review now decodes valid commitment arguments into readable beneficiary, payout account, amount, deadline and work-check code, with fallback for unknown data. Local web production build passed; browser rendering of this new change remains open.

Live verifier CLI preflight for policy evidence/WEB_APP_WORK_POLICY.json, reservation 3, run 41708155809 and signer verifier-aje-veyntro.testnet passed against GitHub API and same-final-block NEAR views. It prepared an unsigned public attestation bound to reservation 3, exact wallet/recipient/amount/policy, nonce 1, SHA f8baaa78558395b60a90a8bf748b87d70834cc5c and run ID 41708155809. This workspace did not sign or send. The 30-minute prepared deadline requires a fresh Ubuntu preflight immediately before the user's verifier-key signature. Next: user prepares a new unsigned file locally, reviews its binding/transaction, signs submit_attestation with the saved verifier key; then independently verify evidence usable and only then request payment in the browser with aje.testnet. Do not report payout from proposal approval alone.

## Commitment 3 evidence attested — 2026-11-03

User supplied successful NEAR CLI `submit_attestation` receipt from verifier-aje-veyntro.testnet, transaction DP2nwemLGqbXQVVtyA9C7bQy7xnd14uVeKzdixiNf78C, with `evidence_checked` event bound to reservation 3, policy hash 59ef3ce012e6a54b45e5f78d6ff0e90ed176404eb289a6da0cb86ab27c5b0288, commit f8baaa78558395b60a90a8bf748b87d70834cc5c, nonce 1 and digest b0be9f56983f7625e6f1dada730e1caaf8cc94725cbff1f300f0d1e83ecc757a. Independent finalized RPC at block 276102934 confirmed reservation 3 Active, evidence.usable=true, beneficiary and payout recipient aje.testnet, 0.05 NEAR remaining, pending zero and drawdown nonce 0. Treasury block 276102959: 5.38 NEAR accounted, 0.35 NEAR liabilities, zero pending payouts, solvent/backed. Evidence expires at 1793742449335000000 ns (approximately 26 minutes after this check). Next: connect aje.testnet in browser on commitment 3, request exactly 0.05 NEAR once before evidence expires, inspect transaction and final callback/operation/reservation/treasury, and report actual payment status. Do not submit a duplicate if the wallet outcome is unclear; read chain first.

## Browser beneficiary payout for commitment 3 verified — 2026-11-03

User screenshot at `/commitments/3` showed status Completed and zero still set aside while connected as aje.testnet. Independent finalized RPC at block 276103420 confirmed reservation 3 Completed, remaining liability 0, pending 0, drawdown nonce 1, evidence digest b0be9f56983f7625e6f1dada730e1caaf8cc94725cbff1f300f0d1e83ecc757a and commit f8baaa78558395b60a90a8bf748b87d70834cc5c. Operation 5 at block 276103448 is Payout, recipient aje.testnet, amount 0.05 NEAR, status Succeeded, with completed timestamp. Treasury block 276103434: confirmed accountable funds 5.33 NEAR (down exactly 0.05), liabilities 0.30 NEAR (down exactly 0.05), pending payout/withdrawal 0, solvent/backed true; actual firewall balance down exactly 0.05 NEAR from pre-payout view. The recipient account balance was observed at block 276103462, but its exact before/after change includes unrelated bond/fees, so do not use that balance alone to claim a transfer. No browser payout transaction hash was supplied; operation and final state are independent evidence of settlement. This completes the local browser proposal/vote/commitment/payout path, with verifier attestation signed from Ubuntu; hosted HTTPS and public verifier submission remain open.

Fixed the commitment card's misleading `GitHub check needed` on Completed rows with recorded evidence. It now says `Work checked`; active rows with unusable prior evidence say `Work check no longer usable`. Web production build passed; browser confirmation after pulling commit bd3eba7 remains open.

Prepared Render Static Site Blueprint (`render.yaml`) and `docs/DEPLOY_WEB.md` for HTTPS hosting, SPA route rewrites, and explicit public smoke checks. Local production web build passed on 3 Nov 2026. No public URL or hosted wallet transaction has been verified yet. Verifier remains CLI signed; hosted authenticated scoped signing is still open.

Hosted web check (3 Nov 2026): `https://veyntro-web.onrender.com/` loaded over HTTPS as a guest and read final NEAR testnet block 276,105,395: accounted treasury 5.33 NEAR, 0.3 NEAR set aside, 2.41732 NEAR available, and contract coverage/backing reported healthy. Direct `/governance` showed live DAO proposals including request 13 Approved; a refresh served the app route. Direct `/commitments/3` showed the completed 0.05 NEAR commitment, zero still set aside, and recorded work check. Hosted wallet connection/signing, mobile widths, and expiry release remain unverified. The verifier still requires the CLI signing step.

## Hosted follow-up and audit review — 2026-11-03

Started next Phase 4 gates after public hosting. Activity payment/withdrawal rows now link to their onchain commitment and show attempted/sending/completed wording according to the recorded operation state; they no longer silently omit failed RPC reads as if no operation existed. README opens with the 10/8/4 NEAR overcommitment example and links to real hosted records. Local web `npm ci`, TypeScript check and production build passed. Verifier check and 29 tests passed. `npm audit --omit=dev` reported 30 dependency findings (19 low, 2 moderate, 9 high, 0 critical), concentrated in wallet selector transitive dependencies including Meteor and HERE. No automatic major downgrade was applied; assess exploit paths and supported upstream fixes before release. Hosted wallet signing and mobile return, public authenticated verifier signing, broader audit history, an independent second council voter, and external adversarial walkthrough remain open. Do not treat this UI improvement as those gates passing.

Hosted UI follow-up (5 Nov 2026): opened `https://veyntro-web.onrender.com/` and clicked Connect wallet in an unauthenticated browser. Light-mode chooser visibly listed MyNearWallet, Meteor, Intear, Nightly, Sender, OKX, HERE with readable names. No wallet extension was available in this browser; connection, disconnection and signed action on the hosted URL remain unverified. Hosted `/activity` at final block 276,356,081 showed payment 5 as Completed with a direct link to commitment 3; older failed and successful operations had status-specific text. This validates the merged audit UI on the hosted site, not a complete transaction history. Draft PR #3 prepares a manually dispatched restricted verifier job; verifier CI run 42049500406 passed, and production dependency audit for that service reported zero findings. No restricted key was installed and no attestation was sent by that job.

## Public judge path and DAO activity hosted — 2026-11-06

PR #4 (README judge walkthrough) and PR #5 (Activity DAO request list) were merged into `main`, with PR #5 merge commit `ed4c4a664a0c0f0a40b8f5dced81290858881a63`. GitHub web checks for that commit passed in run `42136893325`. The hosted `https://veyntro-web.onrender.com/activity` displayed finalized Firewall block 276415236 with payment 5 Completed and other recorded payment/withdrawal operations, and finalized DAO block 276415237 with request 13 Approved and requests 4–12, including failed execution labels for requests 4 and 5. These are live public reads, not a complete transaction index; DAO approval alone is not a payment receipt. README now offers a no-wallet path through the real records. Hosted wallet connection/signing was not tested in this browser because it has no NEAR wallet extension. Draft PR #3 still requires review, up-to-date CI, a separately installed restricted verifier key, and a fresh live attestation; do not count its job as operational. Next: owner checks connect/disconnect/reconnect on hosted URL with `aje.testnet`, then a fresh wallet-signed commitment/evidence/payout path after verifier gate is ready.

## Hosted wallet session checked by owner — 2026-11-06

The owner reports opening the public Render site with the `aje.testnet` wallet, connecting, disconnecting, reconnecting, and refreshing successfully. This is user-reported browser evidence, not a transaction receipt or an independent check in this workspace. It closes the hosted wallet session smoke check; a new hosted wallet-signed DAO proposal/vote and beneficiary payout still need their own finalized onchain verification. Do not infer those transaction paths from connection alone. Next: finish draft PR #3 verification and restricted-key setup privately, then use genuinely new approved work for the hosted end-to-end signing test.

## Restricted GitHub Actions verifier bridge — 2026-11-06

Reviewed the main-only, manually dispatched verifier job with read-only GitHub permissions and a protected `verifier-testnet` environment. It checks the configured method-scoped key, current GitHub run and finalized NEAR state before signing a zero-deposit attestation; afterward it requires a matching, still-usable onchain evidence record and verifier epoch. The local key helper creates a separate key outside the repository and prints only its public half. Fresh local `npm ci`, TypeScript check and all 31 verifier tests passed; production dependency audit found zero advisories. Earlier verifier CI run 42049500406 passed on a prior commit, not this final branch head. See `docs/VERIFIER_ACTION.md`.

This is code review and local verification only. No new restricted key or protected GitHub environment was configured, no workflow signed a transaction, and public `/verify` is still absent. Merging inert workflow code to main will allow CI to run at the final commit; only afterward should the account owner add a new restricted key and environment secret privately. Do not reuse completed commitment 3. A fresh approved commitment and GitHub run are needed for the live attestation and hosted beneficiary payout.

## Verifier bridge merged to main — 2026-11-06

PR #3 merged at `d358117ba6c88544364ca58e67d7b97fb8819fe2`. GitHub Actions `Verifier checks` completed successfully for this exact main commit in run `42138088460`. The local 31-test check and zero-advisory production dependency audit described above were completed before merge. The manually started `Submit checked work evidence` workflow is now present on main, but no protected environment secret or new method-scoped signing key is installed, and the workflow has not submitted live evidence. The owner must follow `docs/VERIFIER_ACTION.md` privately; then a fresh approved commitment and real GitHub run can exercise the hosted evidence and payout path. Do not mark the evidence service or hosted signed transaction complete yet.

## Verifier GitHub environment and restricted secret configured — 2026-11-06

The owner added the restricted public key to `verifier-aje-veyntro.testnet` in transaction `6gncc8M3q1gBraLXWHQ8wudzreTTvMo3jL2PVCNgHcHT`. The GitHub deployment environment `verifier-testnet` was created on repository `0xaje/Veyntro` and restricted strictly to the `main` branch via custom deployment branch policy. The matching restricted private key was read locally from `~/.near-credentials/veyntro-github-verifier/restricted-key.txt` and securely installed as environment secret `VERIFIER_FUNCTION_CALL_KEY` using standard input pipe without exposing the key value in command arguments, logs, or repository files. The presence of secret `VERIFIER_FUNCTION_CALL_KEY` within environment `verifier-testnet` was verified via GitHub CLI. No live attestation workflow run has been triggered yet.


## Fresh Activity work check prepared — 2026-11-06

PR #6 merged at `f0363e1e0e2d48391c8379c5079e7081637ad088`. `evidence/ACTIVITY_WORK_POLICY.json` binds the successful main Web app checks run `42136893325` (commit `ed4c4a664a0c0f0a40b8f5dced81290858881a63`) to a new, distinct work item. `docs/ACTIVITY_WORK_REQUEST.md` proposes 0.05 testnet NEAR to `aje.testnet`, with canonical policy hash `1fdae61d1021131076f964a6083bf99f4fc033ba02a4436812c48e9f9f78b959`. The GitHub run metadata was checked; its run began on 6 Nov 2026 at 00:27 UTC and passed. The preparation workspace could not reach NEAR RPC, so current final funds/council state and any new commitment remain unverified. No proposal, vote, evidence submission, or payout has been sent for this work. Check live onchain state and owner-reviewed wallet signatures before proceeding; do not reuse completed commitment 3.

## Browser DAO approval and commitment 4 — 2026-11-06

The owner submitted Activity work request 14 with `aje.testnet` and then voted Approve in the hosted app; the supplied screenshot showed final UI status Approved. An independent guest read of the hosted `/commitments/4` page then showed a real onchain Active/In progress commitment 4: `aje.testnet` beneficiary and payment account, 0.05 NEAR approved and 0.05 still set aside, deadline 12 Nov 2026 12:00 UTC, policy hash `1fdae61d1021131076f964a6083bf99f4fc033ba02a4436812c48e9f9f78b959`, and work check still needed. This confirms the DAO action created the intended contract record. The exact approval transaction hash was not captured in this workspace. The restricted GitHub evidence workflow has not yet run for commitment 4, and no payment is claimed. Next: manually dispatch `Submit checked work evidence` on `main` with reservation ID 4, run ID 42136893325, policy `evidence/ACTIVITY_WORK_POLICY.json`; inspect final onchain evidence before requesting payment.

## First hosted evidence run failed safely — 2026-11-06

Manual workflow run `42273750709` on main received commitment ID `4`, GitHub web run `42136893325`, and `evidence/ACTIVITY_WORK_POLICY.json`. Checkout, install, TypeScript and 31 verifier tests passed; `submit.ts` exited 1 in under one second with its intentionally generic error. An independent public read of commitment 4 after the failed run still showed 0.05 NEAR set aside and `GitHub check needed`; no usable evidence or payout is claimed. The exact failure point cannot be learned from the old generic log. PR #7 merged at `e119fb696a9a378f1e3a67eeeeb69eb625af27e8`: it accepts surrounding line endings in the protected key secret and adds safe stage-only failure diagnostics, without logging secret or SDK errors. Its PR verifier checks passed in run `42274245788`; main-merge verifier checks passed in run `42274334620`. The newline was a plausible cause, not confirmed. Start a **new** workflow dispatch after main checks pass; rerunning the old job would use the old commit. Inspect onchain evidence before any payment or further retry.

## Hosted work check and payment 6 verified — 2026-11-06

Fresh workflow run `42275081154` on main succeeded. Its log reports `verified_onchain`, commitment 4, GitHub run `42136893325`, attestation transaction `23i8gXtwRgN7oqMF3HT1xHgn8PaewqrvDqWh2UuGG2Br`, and `evidence_usable: true`. The owner then requested 0.05 testnet NEAR from commitment 4 with `aje.testnet`. Independent final RPC read of transaction `4WDbT9xDxNgJVgGcgeSwcTex7GGrmT2U3tsLPH94jKex` showed `payment_pending` for operation 6, commitment 4, 0.05 NEAR to `aje.testnet`, successful recipient receipt, and `operation_settled` `Succeeded` for operation 6. Public Activity shows payment 6 Completed and the commitment page shows Completed, zero remaining. See `docs/PAYMENT_6_AUDIT.md` for links and limits.

Public audit UI improvement prepared: exact matched links for this verified payment and work check, clearer meaning of the GitHub result, and an explicit notice that the contract does not store transaction hashes for other payments. `npm --prefix apps/web ci --ignore-scripts --no-audit --no-fund`, `npm --prefix apps/web run build`, and `node --test apps/web/test/verified-audit.test.ts` passed (2 checks). The build warns about browser-externalized `crypto`/`util`, large wallet chunks, and direct `eval` inside the installed `js-sha256` dependency; none is introduced by this audit-view change. Publish and confirm hosted deployment next. The broader security and independent usability review remains open; a verified one-time testnet flow is not an external audit.

## Payment audit links published — 2026-11-06

PR #8 merged at `13128afb8285679d327be4b7ac57e0bc9102f3b6`. Web app checks passed on the PR (`42278813250`) and merged main (`42278891828`). Hosted `/activity` at final block 276527266 visibly showed payment 6, 0.05 NEAR, Completed, and its checked transaction link; this verifies deployment of the audit UI on that page. The separate hosted commitment detail was not rechecked after navigation due browser approval usage limit. An `npm audit --omit=dev` review still reports 30 findings (19 low, 2 moderate, 9 high, 0 critical), concentrated in existing wallet dependencies; the suggested fixes require incompatible major selector downgrades. No automatic fix was applied. Investigate supported upstream updates and actual browser exploit paths before claiming a security clearance.

## Wallet security pass and amount input fix prepared — 2026-11-06

Reviewed the wallet-signed DAO and beneficiary paths and the reported production dependency tree. Found a real financial input problem: amounts with more than 24 decimal places were silently truncated before signing. The parser now rejects them and very long inputs while preserving exact yoctoNEAR conversion. Local web production build and four focused tests passed. `docs/WALLET_SECURITY_PASS.md` records scope, existing contract and frontend safeguards, nine transitive high dependency reports, and uncompleted independent review. Publish this change through reviewed CI; do not claim external security clearance.
## Documentation and independent review handoff — 2026-11-06

README now describes the verified hosted commitment 4, restricted GitHub Actions attestation, and payment 6 instead of the earlier Ubuntu-only/unverified hosted path. `docs/INDEPENDENT_WALKTHROUGH.md` gives an outside tester a no-wallet audit trail and optional wallet/mobile checks; no outside person has completed it yet. `docs/WALLET_DEPENDENCY_REVIEW.md` records the 30 package audit findings and exact Meteor/HERE transitive paths. No incompatible wallet downgrade or forced override was shipped. The dependency risk, fresh-wallet regression checks, independent security review, and broader transaction indexing remain open.
## Community-use gate started — 2026-11-06

The owner clarified that independent DAOs must be able to use Veyntro, not merely inspect one owner's treasury. Updated the P0 and Phase 4 master-plan gates and added `docs/COMMUNITY_ONBOARDING.md`. A read-only `scripts/check-community.py` now validates a distinct DAO/Firewall pair at one finalized NEAR testnet block, including deployed code presence, DAO policy shape, matching Firewall DAO ID and separate verifier. A live read of the original pair returned final block 276541645, matching DAO and verifier, council role count 2, 1 NEAR proposal bond, ledger solvent and physically backed. This does not validate SputnikDAO code identity, deploy a second instance, offer community selection in the hosted app, or prove second-DAO use. Next: implement isolated community selection and wallet targeting; then provision and exercise a truly separate second DAO and verifier with receipts. Do not mark this gate complete yet.
## Community selection app slice — 2026-11-06

Added a Choose community entry to the hosted web app. A non-default Firewall account is checked against the existing tested Firewall and SputnikDAO deployed code hashes at one final NEAR testnet block; the reported DAO, policy and separate verifier must be readable before the wallet or app mounts. Selected-account query links carry through the public pages and wallet selector targets the selected Firewall. DAO proposal receiver and payment receiver derive from that selected instance, while the DAO account is read from its Firewall state. The curated original payment/evidence transaction links are explicitly scoped to the original Firewall. The page warns that each separate community needs its own GitHub work checker. Local `npm ci`, TypeScript production build, and four focused tests passed. No second DAO or hosted browser transaction has been checked; do not claim community-use completion. Next: deploy an independently controlled second testnet DAO/Firewall/verifier, test public isolation and signed flow, then harden any failure cases.
## Hosted community chooser smoke check — 2026-11-06

PR #12 merged at `de34b0a40ed2d6e926a2417ec1352e547c3d4c43`; web checks passed on its PR and merged main. Hosted Render page visibly included “Choose community.” In a guest browser, an unknown account yielded a check error without mounting wallet actions; the deployed but incompatible `receiver.aje-veyntro.testnet` contract was rejected for different code; returning to the original overview worked. No second compatible DAO/Firewall was deployed or exercised. Updated the chooser copy and community documentation to say clearly that setup is still manual and a distinct verifier is needed. Next: independently provision a second testnet DAO/Firewall/verifier under different wallet control, then verify isolated public state and real signed governance/evidence/payment receipts.

## Judge path prepared — 2026-11-11

On a clean branch from `origin/main` at `1871f73`, checked the hosted guest overview and governance page. The overview read final testnet block 277249351 with 2.36138 NEAR available, 0.3 NEAR set aside, and coverage/backing indicators. The governance page read final DAO block 277249367 and displayed request 4 Failed during execution, request 14 Approved and the other recorded proposals. This is a public read-only observation, not a new transaction or a fresh wallet test.

Added `JUDGES.md` to put the recorded overcommitment rejection, approval, attestation, payout, expiry and callback evidence in a short review path; `docs/DEMO_SCRIPT.md` guides an authentic 2–3 minute recording and does not claim a video was made. The README now starts with the judge path and calls out incomplete second-community setup. `.nvmrc` pins Node 24.22.1 to match web CI. A clean `npm --prefix apps/web ci --ignore-scripts --no-audit --no-fund`, `npm --prefix apps/web run check`, and `npm --prefix apps/web run build` passed locally on Node 24.22.1. Build emitted existing dependency browser-compatibility and direct-eval warnings; no code or dependency change was made here.

Submission remains open: owner must record and publish the public X demo with required event tag, confirm the links, and submit them through the official form by 14 Nov 2026 23:59 UTC. No second independent DAO, outside usability check, or security audit is claimed. Keep the draft factory/onboarding work separate from this proven judge path unless its full financial lifecycle is verified before submission.

## Return to the tested single-DAO site — 2026-11-12

The owner chose to remove unfinished independent-DAO and self-serve organization setup from this hackathon submission. Draft PR #14 was closed without merge; no setup factory or second DAO flow was deployed. A separate submission cleanup restores the app's fixed Veyntro DAO/Firewall routing, removes the chooser and its unused check script, and updates the master-plan submission scope, README, judge guide and demo wording. The earlier entries above remain as an honest development record, not a current release plan. The desktop navigation overlap observed in the owner's video is fixed in the same submission cleanup. Verify the resulting hosted build after merge; local compilation alone is not a browser check.

## Final code and repository audit — 2026-11-12

The separate final-audit report is kept outside the Git repository. This release cleanup removes the completed one-time council migration scripts and their now-invalid instructions, keeps source/evidence required to reproduce the deployed Firewall and earlier receiver, pins the web app's directly imported NEAR transaction package, and adds the existing focused web tests to CI. The README and plan now state the actual single-DAO scope. The root blockers file marks old development blockers as historical. Local web type check/build and four focused tests, and verifier type check and 32 tests passed before this cleanup; run clean-install checks and exact-head CI after the changes. No new chain transaction or external security audit is claimed. Remaining gates: hosted mobile/fresh-wallet review, public X demo post, official form submission.

## Mobile navigation repair — 2026-11-12

The owner's phone screenshot showed “How it works” wrapping to a third header row and leaving an empty gap. At phone widths, the main navigation now stays on one horizontal scroll row with 44px link targets; the brand and wallet controls remain above it. Web type check, four focused tests, and production build pass locally. A headless browser screenshot could not run in this workspace, so verify the hosted result on the owner's phone after deployment; do not count this as a completed mobile walkthrough yet.

## Mobile header menu — 2026-11-12

The horizontal swipe row was hard to discover and use on the owner's phone. The phone header now shows the brand, theme and wallet controls, followed by a labeled Menu button with the current page. Opening it shows all five navigation links as large targets and the testnet label; no sideways scrolling is required. Connected account text is constrained on narrow phones. Local web type check, four focused tests and production build passed. A hosted phone screenshot and actual wallet flow still need owner verification after deployment.
