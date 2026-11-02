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
