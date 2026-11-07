# VEYNTRO — PRODUCTION MASTER PLAN

**Version:** 1.2 — simple-English UX, Codex skills and agent workflow added  
**Planning date:** 2026-10-30  
**Status:** Approved for implementation planning; environment and live integrations not yet verified  
**Network:** NEAR testnet for hackathon validation  
**Primary track:** Social Money (confirm official submission rules before submission)  
**Tagline:** Every commitment accounted for.  
**Core feature:** Commitment Firewall

> **Source of truth:** This document is the product and execution baseline. Never mark a phase DONE without commands, actual test output, deployment identifiers, and evidence. Never fabricate transactions, integrations, customers, API responses, security results, or completion status.

## 0. Mission and acceptance standard

Veyntro enables a DAO or cooperative to fund an allocation contract, reserve backing for multiple obligations, delegate strictly bounded spending, verify agreed evidence, execute authentic NEAR payments, and reclaim unused capacity after expiry. It prevents the same funds from backing overlapping promises. Users can inspect public treasury state without signing in. Financial writes require actual wallet signatures or approved DAO governance.

**Must show in a live end-to-end flow:** real DAO proposal -> approved governance action -> real NEAR testnet funding -> backed commitment -> rejected overcommitment -> authenticated evidence -> authorized payment -> confirmed receipt -> expiry release -> auditable public history.

**Hard constraints:** no mock/dummy/simulated successes; no paid subscriptions; no mainnet requirement; no unrestricted AI wallet; no unaudited claim of trustlessness; no private keys in repo/chat; no public production write before authorization/security gates; do not confuse submitted transaction with successful receipt; do not describe an undeployed feature as operational.

**Non-goals for hackathon:** cross-chain settlement, NEAR Intents integration, multi-asset support, generic escrow marketplace, full procurement suite, general-purpose AI swarm, unbounded AI treasury spending, new DAO governance implementation, enterprise-grade confidential documents.

## 1. Positioning and competitor differentiation

**One-sentence positioning:** The Commitment Firewall for shared treasuries: every approved obligation is fully backed, bounded by policy, and recoverable when unused.

**Why not another DAO wallet?** SputnikDAO/Trezu manage governance and treasury actions; Veyntro must demonstrate *portfolio-wide encumbrance accounting*, *bounded drawdown authority*, *verifiable conditions*, *pending-payment-safe reconciliation*, and *permissionless expiry release* across commitments. This is a proposed differentiation, NOT a verified market gap. Research exact competitor feature coverage and publish a factual comparison before finalizing claims.

**Primary persona:** small DAO/community treasury manager who must commit funds to several projects without overpromising. **Secondary:** beneficiary performing verifiable work. **Third:** independent auditor/judge using public read-only pages.

**Core user story:** A DAO funds Veyntro with real testnet NEAR, reserves a fixed amount for a specific beneficiary and deadline, requires evidence of a defined GitHub CI workflow, pays only after authenticated verification, rejects overcommitment, and releases unused funds at expiry.

## 2. Product scope and acceptance criteria

### P0 — Must work

**Community-use gate (added 6 Nov 2026; tightened 7 Nov):** The deployed Veyntro DAO is the first real example, not the only permitted user. An independent community with its own SputnikDAO, council wallet, Firewall, verifier and testnet funds must be able to use its own records and signed actions. No community may see another DAO's balances as its own or authorize against another DAO's contract. The public app must offer a verified way to select a community, and explain the setup steps and limits in simple English. Public viewing remains wallet-free. Do not call this gate complete until a second independent DAO completes a real approved commitment, evidence check and payment, with receipts and isolated records. The second community must initiate and complete setup from the hosted product with its own wallet signatures and no manual configuration by the Veyntro owner. `againa.testnet` is a candidate first user of that flow, not an instance to configure on its behalf. A manual deployment may support engineering investigation but does not pass this product gate.

1. DAO governance integration via real SputnikDAO proposal/vote/execution on a selected and verified testnet DAO.
2. NEAR Rust allocation contract with authenticated DAO funding, reserve, cancel, expiry release, beneficiary drawdown, safe promise callbacks, and withdrawals.
3. Financial accounting: confirmed spendable balance, storage/operating reserve, active reservation liabilities including pending payouts, pending uncommitted withdrawals, available capacity.
4. Contract-level rejection of overcommitment, unauthorized callers, replay/duplicate drawdowns, expired payout, unverified evidence, and excess withdrawals.
5. Real GitHub API verifier for **one tightly specified workflow**: owner/repo, immutable commit SHA, workflow run conclusion and expected branch/ref; authenticated attestation to NEAR contract. Treat verifier as trusted; governance can rotate it. Never call GitHub CI equivalent to proof of real-world business quality.
6. Frontend: **full NEAR wallet connection and real user write actions** for authorized DAO members and beneficiaries; public guest read access; transaction status based on final receipts; readable errors; mobile-friendly navigation. A read-only public view must never be mistaken for a read-only product.
7. Genuine NEAR testnet explorer links and evidence file; local and testnet tests.

### P1 — High-value if P0 is stable

8. Deterministic permissionless operator checks expired allocations and submits cleanup transactions, with safe rate limiting and budgeted gas. Optional AI text explanation only if free, reliable and useful; no AI authority over funds.
9. Public transparency report: funds in, liabilities, paid out, expired/released, rejected actions and source evidence.
10. Independent tester walkthrough and accessibility fixes.

### P2 — Defer

Multi-DAO tenancy, fungible token portfolios, multiple external evidence sources, advanced AI agents, cross-chain, privacy-preserving evidence, recurring subscriptions, DAO discovery marketplace.

## 3. Architecture and trust boundaries

**Frontend:** React + TypeScript + Vite + Tailwind, NEAR Wallet Selector (verify maintained packages and testnet-compatible wallet modules), RPC read calls, wallet-signed transactions and wallet session/account state. Guest browsing is read-only; connected authorized users perform real onchain writes. **Backend/verifier:** TypeScript Node service with GitHub REST API and optional PostgreSQL for indexed non-authoritative metadata; do not use DB as financial source of truth. **Contract:** Rust near-sdk, one DAO-controlled allocation contract. **Operator:** deterministic Node worker, permissionless cleanup calls; may run on free scheduled infrastructure if available. **Deployment:** Vercel/Render/free alternatives as confirmed; contract on NEAR testnet. **CI:** GitHub Actions with pinned versions and reproducible test commands.

**Trust model:**
- SputnikDAO account is sole authority for funding authorization, commitment creation/cancellation, verifier rotation and available-fund withdrawals. Validate predecessor account from runtime.
- Beneficiary can request only a bounded drawdown on their own reservation, to a destination fixed by DAO policy.
- Verifier account can attest only to preconfigured evidence conditions; it cannot change the beneficiary, reservation ceiling, DAO, expiry or transfer recipient.
- Operator has **no financial privileges**; any user can call permissionless expiry release. If automated payout is introduced, it still must satisfy contract rules.
- GitHub API response is offchain evidence, authenticated by verifier, not trustless onchain proof. Define replay protection and source validation.
- Admin/operator compromise must not allow general treasury withdrawals.

**Funding:** prefer a DAO-approved payable FunctionCall to `fund_treasury` with actual attached NEAR. Confirm exact SputnikDAO deployed `FunctionCall` argument serialization and attached deposit behavior before executing. Never assume an arbitrary transfer automatically credits application accounting.

**Account model:** separate NEAR testnet DAO, contract, beneficiary, verifier, and operator accounts; minimal access keys and gas balances. Never store seed phrases in the project or paste secrets into chat.

## 4. Onchain financial design

### State

- `dao_account_id`, `verifier_account_id`, `operating_reserve`, `next_reservation_id`, `next_operation_id`.
- Treasury accounting: confirmed accountable funds; total reservation liabilities; pending withdrawals; pending payout IDs.
- Reservations: `id`, `beneficiary`, `payout_recipient`, `approved_amount`, `remaining_liability`, `pending_amount`, `expires_at_ns`, `evidence_policy_hash`, `evidence_verified`, `status`, `nonce/version`.
- Payment operations: unique ID, reservation ID, amount, destination, state pending/succeeded/failed; final result processed exactly once.
- Attestations: reservation ID, policy hash, immutable commit SHA, verifier identity, evidence digest, expiry/nonce; prevent replay across reservations or versions.

### Invariants

1. **Solvency:** `available = confirmed_accountable_funds - operating_reserve - reservation_liabilities - pending_uncommitted_withdrawals >= 0`. If pending payouts are already included in reservation liabilities, **do not subtract them twice**.
2. **Backing:** each reservation's remaining liability (including pending payout) is fully backed by assets controlled by contract.
3. **No double spend:** each payout has a unique ID; callback can reconcile once; duplicate requests cannot create two payouts for one authorized operation.
4. **Expiry:** expired unused funds are releasable, but pending transfers are not released until reconciled.
5. **Access:** privileged methods require `predecessor_account_id == dao_account_id`; private callbacks require `predecessor_account_id == current_account_id`; evidence requires configured verifier and matching policy.
6. **Checked arithmetic:** use checked add/sub, explicit yoctoNEAR conversions and bounded values.
7. **Storage:** do not withdraw below required storage/operating balance; use conservative reserve and account for attached deposits/storage effects.
8. **Async transfer:** only final receipt/callback marks payout successful; pending amount remains encumbered; on failure, restore eligible liability correctly.
9. **Reconciliation:** actual contract NEAR balance must be sufficient for obligations; treat unexpected direct transfers and storage refunds conservatively, not as freely available funds until explicitly reconciled.
10. **Immutability:** DAO-approved commitment parameters cannot be silently rewritten after creation; revisions require DAO authorization and versioning.

### Methods

- `new(dao_account_id, verifier_account_id, operating_reserve)` — initialization.
- `fund_treasury()` payable, DAO-only — record authenticated deposit.
- `create_reservation(beneficiary, payout_recipient, amount, expires_at_ns, evidence_policy_hash)` DAO-only.
- `cancel_reservation(id)` DAO-only, with pending payment safeguards.
- `submit_attestation(id, evidence_digest, policy_hash, commit_sha, nonce)` verifier-only, validate policy/nonce and expiry.
- `request_drawdown(id, amount, operation_nonce)` beneficiary-only, enforce evidence, expiry, ceiling and destination.
- `on_drawdown_result(operation_id)` private callback, settle once.
- `release_expired(id)` anyone, only expired unencumbered capacity.
- `withdraw_available(amount, recipient)` DAO-only, pending-safe.
- `on_withdraw_result(operation_id)` private callback.
- `set_verifier(new_verifier)` DAO-only, event logged.
- `get_treasury_state()`, `get_reservation(id)`, `list_reservations(...)`, `get_operation(id)` public views.

**Design review before coding:** confirm near-sdk versions, promise callback gas, NEAR storage semantics, payable DAO proposal syntax, account and key permissions, and transaction finality. Do not copy conceptual payloads directly into live wallet calls.

## 5. Evidence verification contract

**First evidence policy:** a specified GitHub repository + exact immutable commit SHA + designated workflow file/ID + `conclusion=success` + workflow run tied to that commit and required event/ref. Reject missing runs, other repositories, different SHAs, untrusted forks, stale runs, wrong workflow, and unsuccessful conclusions. Document that successful CI does not prove code quality or customer acceptance.

**Verifier service:** authenticate a request; fetch GitHub data using real API; validate owner/repo/commit/workflow; produce a deterministic digest and signed/authorized NEAR attestation transaction; record actual GitHub URL, run ID, SHA, policy hash, NEAR tx ID and verifier version. The backend must never simply accept `passed=true` from user input. Require idempotency; reject replayed attestation for other reservation IDs. Prefer a human-reviewed approval policy if CI cannot establish the promised outcome reliably.

**Threat model:** GitHub repo owner controls workflow and could make a trivial passing test; DAO chooses evidence policy, and can require independent reviewer acceptance. Verifier private key compromise is a risk; restrict its onchain authority and document rotation/revocation. Avoid claiming zero trust.

## 6. Frontend, wallet connection, and user permissions — mandatory P0

**Non-negotiable:** Veyntro is an interactive, wallet-connected NEAR application. **Read-only applies only to guests/public views, not the entire product.** A user must be able to connect a supported NEAR testnet wallet and perform every action authorized for their account, using actual signed blockchain transactions. Do not ship a dashboard that only displays information.

### Wallet connection and signing

- Integrate the currently maintained **NEAR Wallet Selector** packages and at least one wallet confirmed to support **NEAR testnet**. Verify package versions and supported wallet modules before installation; do not assume mainnet-only wallets work on testnet.
- Global navigation: visible **Connect Wallet** control on desktop and mobile, connected account ID, network indicator (**TESTNET**), switch/disconnect action, and meaningful wallet error messages.
- Use wallet signatures for actual contract changes via `signAndSendTransaction` / `signAndSendTransactions` as supported by the selected wallet API. Do not collect private keys or seed phrases in the browser or backend.
- For governance, construct the exact SputnikDAO `add_proposal` / `act_proposal` transactions using the deployed DAO's verified contract schema and policy. Where voting or proposal execution occurs through an external governance interface, link directly to it and clearly display the resulting status; prefer complete in-app governance paths when feasible.
- For beneficiary actions, construct direct signed transactions to Veyntro (`request_drawdown` and other beneficiary-authorized methods). For public permissionless cleanup, allow any connected wallet to sign `release_expired`.
- Wait for final transaction/receipt outcome before showing success. Handle rejection, insufficient gas, wrong network, RPC errors, pending callbacks, duplicate submission, and contract rejection explicitly.
- Account changes must immediately refresh the user's role, permissions and balances. Frontend hiding is only UX; the smart contract enforces authorization independently.

### Role-based UX (derived from onchain authority, never claimed by frontend alone)

| Visitor / role | Can view | Can sign or execute |
|---|---|---|
| Guest, no wallet | Public treasury, commitments, evidence, transactions, documentation | Nothing; prompted to connect for actions |
| Connected non-member | Same public data | Permissionless expiry cleanup, where allowed |
| DAO council/member | Public data and governance proposals | Create/vote/execute DAO proposals **subject to actual DAO policy**; authorize funding, reservations, cancellation, verifier rotation, withdrawals through governance |
| Beneficiary | Their allocations and evidence status plus public data | Submit evidence request to verifier and sign eligible drawdowns to preapproved payout destination |
| Evidence verifier service | Approved evidence policy and GitHub API results | Signed onchain attestations from its restricted account; **never** treasury withdrawal authority |
| Automation operator | Expired commitments | Only permissionless calls; no special spending privilege |

### Mandatory screens and actions

1. `/` — clear product promise, public verified activity and prominent Connect Wallet action.
2. `/treasury` — real contract balances and commitment accounting; connected DAO users see **Fund Treasury**, **Create Commitment**, **Withdraw Available** paths routed through governance.
3. `/commitments` — public filterable list; connected users see authorized **Create Commitment** or **Release Expired** controls.
4. `/commitments/:id` — immutable policy, evidence status, payment operations, expiry, audit trail; beneficiary sees **Submit Evidence** and **Request Payout** when eligible; DAO sees **Cancel** through governance.
5. `/governance` — DAO proposal creation, council voting, execution state, source transaction links; never fake voting with a local database.
6. `/verify` — GitHub evidence submission, real server validation, attestation status and precise errors.
7. `/activity` — onchain action history, transaction IDs, final receipt outcomes, pending operations and explorer links.
8. `/docs` — architecture, trust model, limitations, contract IDs, wallet/network requirements and reproduction instructions.

**UX acceptance:** a first-time visitor can inspect the treasury without login; a council member can connect their wallet and initiate a genuine governance action; a beneficiary can connect and request a permitted real testnet payout; an unauthorized user is rejected by the contract; an expired commitment can be released by a connected third party. Test the entire flow on desktop and mobile, including wallet popup/redirect behavior.

**UX rules:** mobile-first, accessible contrast, fixed usable navigation, real loading/empty/error states (not fabricated numbers), precise status (submitted/pending/final-success/final-failure), explorer links, clear units, no mandatory sign-in for public reads.

## 7. Execution phases and exit gates

### Phase 0 — Freeze scope and prepare environment (Oct 30–31)
- Create project folder and `docs/MASTER_PLAN.md`; initialize local git only after user approves workspace/repo location.
- Verify Node, Rust, cargo, near CLI, cargo-near, git, testnet RPC connectivity, current package versions.
- Verify current official hackathon rules, submission eligibility, prize/KYC constraints, Social Money requirements, deadline.
- Compare current SputnikDAO/Trezu capabilities; explicitly document what Veyntro adds.
- Identify available testnet DAO, accounts and funding source.
**Exit:** environment report, competitor gap, account plan, no invented availability claims.

### Phase 1 — DAO integration spike (Nov 1–2)
- Inspect deployed SputnikDAO contract version/policy; capture exact `FunctionCall` proposal encoding and required bond.
- Create/fund testnet accounts; deploy a minimal callable Rust receiver.
- Submit real DAO proposal; collect votes; execute payable funding call; verify predecessor and attached deposit.
- Save proposal ID, tx hash, receipt status, explorer URL and testnet account IDs.
**Exit:** authentic DAO-to-contract call; if unavailable, stop and re-evaluate integration architecture.

### Phase 2 — Commitment Firewall contract (Nov 2–5)
- Implement full accounting, reserve, expiry, cancel, drawdown, withdrawals, callback reconciliation and read views.
- Add events, explicit errors, checked arithmetic, safe storage reserve, nonce-based idempotency.
- Local unit/integration tests and adversarial cases.
- Deploy to NEAR testnet and reproduce real funding, two reservations, rejected overcommitment, successful payout, failed/retried payment, expiry release.
**Exit:** testnet financial lifecycle, complete transaction evidence, no known critical accounting issue.

### Phase 3 — Real GitHub evidence gate (Nov 5–7)
- Define one narrow evidence policy and immutable policy digest.
- Implement real GitHub REST verification, verifier signing and onchain attestation.
- Verify wrong SHA, wrong repo, failed workflow, stale/replayed attestation are rejected.
- Pay only when evidence and financial constraints pass.
**Exit:** one genuine GitHub run produces a valid attestation and actual authorized testnet payout; invalid evidence blocks payout.

### Phase 4 — User-facing app (Nov 7–10)
- Extend the fixed-instance app into community selection: validate a supplied Firewall account by final onchain `get_treasury_state`, verify its named DAO exposes a compatible policy, bind wallet signing to the selected contract, and keep selected-DAO links and records isolated. Never accept a user-entered DAO name alone as proof of a valid contract or let the UI bypass onchain permissions.
- Provide a safe setup path for another DAO's distinct contract and verifier. Keep deploy/init authority and verifier keys with that community; do not create a shared privileged treasury key. Disclose any manual deployment step until an independently usable onboarding flow exists.
- Make setup self-serve for a new community: its members connect their wallets, create or connect their own DAO, review and sign deployment and setup transactions, choose their own verifier and evidence policy, and receive a shareable public URL. No community should have to send an address to the Veyntro owner for manual configuration. The app must show setup costs and verified final state, refuse incompatible contracts, and recover safely from incomplete setup. Until this works on the hosted site with a second community, label manual setup clearly and do not claim public self-serve onboarding.
- Build React/Vite/TypeScript frontend; install and configure a verified NEAR testnet Wallet Selector module, implement connect/disconnect/account/network state, and integrate real wallet-signed contract and SputnikDAO proposal/vote transactions.
- Implement all P0 pages, DAO governance path, verifiable status transitions, mobile navigation.
- Deploy free-tier hosting with working HTTPS; verify no secrets in browser bundle.
**Exit:** guest reads without login; DAO member connects a real NEAR testnet wallet and signs a valid governance proposal/vote; beneficiary connects and signs an eligible payout; public caller releases an expired allocation; each action displays final onchain status on hosted mobile and desktop app.
**Additional community-use exit:** a second, separately controlled testnet DAO sets up its own instance through the hosted site with its members' wallet signatures, carries out the real governance/evidence/payout flow, and shares a wallet-free URL to its isolated history. The original DAO continues to work. Show testnet setup cost before signing and verify all final receipts. Manual owner configuration fails this gate.

### Phase 5 — Operator and reliability (Nov 10–11)
- Add deterministic expired-commitment watcher and permissionless cleanup calls if P0 stable.
- Add event indexing if necessary, but blockchain remains authoritative.
- Add timeouts, RPC retries, idempotency, alerting and safe operator gas budget.
- Do not add paid AI dependency. AI commentary is optional and must never control contract authorization.
**Exit:** operator triggers one real eligible cleanup and fails safely when no action is eligible.

### Phase 6 — Security and external testing (Nov 11–12)
- Adversarial tests: unauthorized DAO spoof, beneficiary spoof, duplicate payout, callback spoof, pending transfer + expiry, storage starvation, oversized amount, time boundary, replayed verifier, malicious repo/CI, compromised operator.
- External tester with fresh wallet runs real hosted workflow.
- Fix P0/P1 defects; freeze code; confirm all contract IDs and deployment docs.
**Exit:** no known critical/high-severity issues, verified reproducible workflow, documented residual risks.

### Phase 7 — Demo, documentation, submission (Nov 12–14)
- README: problem, competitors, NEAR architecture, contract account, setup, trust assumptions, reproducibility, tests, screenshots of real activity, explorer links, video.
- 2–3 minute demo: real DAO vote -> funding -> reserve -> rejected overcommit -> real GitHub evidence -> successful payout -> expired release -> audit view.
- Record authentic screen activity; no generated fake transaction footage.
- Public GitHub repo, live URL, public X demo post and official submission fields; verify final deadline in UTC and WAT.
**Exit:** submitted and independently verifiable before official cutoff; save confirmation and URLs.

## 8. Mandatory test matrix

**Governance:** wrong caller denied; approved DAO call accepted; proposal execution status verified; failed governance call cannot be reported as success.

**Accounting:** reserve within balance; reject overcommit; reserve sum correct; pending payouts encumbered; withdrawals cannot exceed free funds; storage reserve preserved; no underflow/overflow.

**Payments:** valid payout succeeds; unauthorized payout fails; duplicate nonce fails; repeated callback cannot pay twice; failed promise reconciles; expiry during pending transfer does not double-release.

**Evidence:** correct GitHub run verified; wrong repo/SHA/workflow/branch/repo owner fails; failed run fails; forged pass flag fails; stale or replayed attestation fails; verifier rotation works.

**Frontend:** guest read-only; authorized wallet actions; wallet rejection handled; RPC errors handled; pending vs final statuses accurate; responsive mobile navigation; accessibility labels.

**Operational:** process restart preserves authoritative state; public host can reach real RPC; logs redact secrets; testnet account gas sufficient; docs match deployed behavior.

## 9. Evidence and artifacts convention

Create `evidence/` containing:
- `ENVIRONMENT.md` — versions and commands.
- `DAO_INTEGRATION.md` — deployed DAO ID, policy, proposal IDs, votes, tx links.
- `CONTRACT_DEPLOYMENT.md` — contract ID, build hash, deployed WASM hash, network.
- `FINANCIAL_LIFECYCLE.md` — deposit/reservation/rejection/payout/expiry hashes and final receipt results.
- `GITHUB_VERIFICATION.md` — repo, immutable commit SHA, workflow run ID, API validation outcome, attestation tx.
- `SECURITY_TESTS.md` — commands, outputs, known limitations and fixes.
- `EXTERNAL_TEST.md` — independent user actions and evidence.
- `SUBMISSION.md` — live URL, repo, video, X post, official submission confirmation.

Never fabricate values; use `PENDING` until actual verified evidence exists. Do not expose private keys, bearer tokens or secrets.

## 10. Recovery protocol: resume without losing context

At end of each working session, update `docs/PROGRESS.md`:

```
DATE/TIME (UTC):
PHASE / MILESTONE:
STATUS: NOT_STARTED | IN_PROGRESS | BLOCKED | VERIFIED
LAST VERIFIED COMMIT:
NETWORK / CONTRACT IDS:
WHAT CHANGED:
COMMANDS RUN:
ACTUAL RESULTS / LINKS:
TESTS PASSED / FAILED:
OPEN BUGS / RISKS:
NEXT EXACT ACTION:
FILES CHANGED:
```

Maintain `docs/DECISIONS.md` (ADR-style: date, decision, alternatives, reason, impact) and `docs/BLOCKERS.md` (issue, evidence, attempted fixes, next owner/action). Never overwrite the evidence of a failed test to make the project look successful.

**Resume prompt to paste in a new chat:**
> We are building Veyntro for NEAR Hackathon 2026. Read `docs/MASTER_PLAN.md`, `docs/PROGRESS.md`, `docs/DECISIONS.md`, and `docs/BLOCKERS.md` first. Confirm the latest verified commit, network, contract IDs, tests and unresolved blockers. Continue only from the next uncompleted milestone. Do not invent testnet evidence or claim incomplete functionality works. Use real APIs, NEAR testnet and free-tier infrastructure. Do not expand scope without explicit approval. Provide exact Antigravity Ubuntu commands and verification gates.

## 11. Project layout

```
veyntro/
  README.md
  .gitignore
  .env.example
  Cargo.toml                 # if using Rust workspace
  contracts/
    commitment-firewall/    # near-sdk contract
      Cargo.toml
      src/lib.rs
      tests/
  apps/
    web/                    # React + TS + Vite + Tailwind
  services/
    verifier/               # real GitHub API verifier
    operator/               # deterministic permissionless expiry worker
  packages/
    shared/                 # types, NEAR constants, validation
  scripts/                  # deploy, governance, evidence scripts
  docs/
    MASTER_PLAN.md
    PROGRESS.md
    DECISIONS.md
    BLOCKERS.md
    SECURITY_MODEL.md
    API_CONTRACTS.md
    DEPLOYMENT.md
  evidence/
  .github/workflows/
```

## 12. Go/no-go checkpoints

**Gate 1 (end Nov 2):** if DAO-approved external calls cannot be executed on testnet, stop and diagnose. Do not quietly replace governance with an admin key while claiming DAO integration.

**Gate 2 (end Nov 5):** if accounting/callback safety cannot be demonstrated, stop feature additions; prioritize financial correctness.

**Gate 3 (end Nov 7):** if GitHub verification cannot safely authorize payments, keep payout under explicit DAO authorization and document limitation; do not claim evidence-gated settlement.

**Gate 4 (end Nov 11):** if hosted end-to-end flow is unstable, remove optional operator/AI before cutting P0 safety or inventing proof.

**Gate 5 (submission):** if product lacks real contract deployment and verifiable transactions, state limitations truthfully; do not fabricate a winning demo.

## 13. Immediate next action

1. In Antigravity Ubuntu, run environment diagnostic (Node/npm/Rust/cargo/git/NEAR CLI/cargo-near).
2. Confirm whether existing NEAR testnet accounts and test tokens are available; do not send private keys.
3. Verify official current SDK and SputnikDAO deployed interface and record results.
4. Create local project directory and copy this plan to `docs/MASTER_PLAN.md`.
5. Start Phase 1 with a minimal contract and actual DAO governance integration, capturing real evidence.

**Current verified implementation status at plan creation:** NOT STARTED. No Veyntro repository, deployed contract, real NEAR transactions or hosted app have been verified in this conversation.


## 14. Plain-English product and accessibility rule (mandatory P0)

**Principle:** Powerful technology behind the scenes; simple words and easy actions for everyone. The app must be usable by first-time visitors, nontechnical DAO members, and people on small mobile screens. This is a product requirement, not optional copy polish.

- Use short, familiar English in navigation, buttons, forms, success/error messages, help pages and onboarding. Avoid jargon and long explanations.
- Explain what happens **before** asking a person to sign a wallet transaction; show network, amount, recipient, purpose and fees where available.
- Make public information viewable without wallet connection. Ask users to connect only when they try an action that requires a signature.
- Every screen should answer: What is this? What can I do? What happens next?
- Prefer one clear primary action per screen. Show readable loading, pending, success, rejected and failed states based on real data.
- Use accessible contrast, visible focus states, keyboard support, understandable labels and responsive layouts.
- Never replace precise security/accounting behavior with vague wording. Friendly text must still explain the actual financial effect.
- User-facing terminology: **Your Money** (treasury overview), **Money Available** (spendable funds), **Money Set Aside** (active commitments), **Set Money Aside** (create reservation), **Ask for Approval** (governance proposal), **Request Payment** (drawdown), **Check Completed Work** (evidence verification), **Return Unused Money** (expiry release), **Payment History** (transactions). Technical contract names can remain in developer documentation.
- Provide simple explanatory text where a label alone could mislead, e.g., “Money set aside cannot be used for a different payment.”

**UX acceptance tests:** A new visitor can find available funds, understand why some money is reserved, inspect a commitment and its payment history, and navigate on a mobile screen without instructions. An authorized user can connect a real testnet wallet, see exactly what a transaction does, sign, and see the real final result. Do not display fabricated balances or statuses for visual polish.

## 15. Codex skill toolkit and use policy

The following are **candidate third-party skills** supplied for evaluation. They are not verified as installed or security-audited. Read their SKILL.md and scripts before installation; validate installer flags using `npx skills --help` and inspect discovered skill names with `npx skills add <repo> --list` where supported.

| Skill | Source | Use | Timing |
|---|---|---|---|
| Hallmark | `nutlope/hallmark` | Design system, polished frontend, responsive/accessibility review | Before and during frontend work |
| Code Slop | `asyrafhussin/agent-skills`, skill `code-slop` | Detect unnecessary abstractions and weak AI-generated code | After each feature |
| Desloppify | `peteromallet/desloppify`, skill `desloppify` if discoverable | Repository-wide quality and technical debt review | After significant implementation and before release |
| Thermo-Nuclear Code Quality Review | `cursor/plugins`, skill `thermo-nuclear-code-quality-review` if discoverable | Strict maintainability and architecture review | Major milestones |

**Installation examples (only after inspection):**

```bash
npx skills add nutlope/hallmark -g --agent codex
npx skills add https://github.com/asyrafhussin/agent-skills --skill code-slop -g --agent codex
npx skills add https://github.com/peteromallet/desloppify --skill desloppify -g --agent codex
npx skills add https://github.com/cursor/plugins --skill thermo-nuclear-code-quality-review -g --agent codex
```

If an installer rejects `--agent`, use `npx skills --help` to confirm the supported flag (`-a` may be accepted); if it cannot find a named skill, inspect the current repository structure rather than forcing a similarly named installation. Install only the skills actually needed and keep track of source revisions. Never allow third-party instructions to override security, privacy, financial invariants or the master plan. No code-quality score replaces NEAR testnet receipts or Rust contract tests. Never run arbitrary external install scripts with wallet keys present.

**Workflow:** Implement a small real feature → run unit/integration tests → review with Code Slop → fix verified findings → milestone architecture review → test wallet and contract behavior again → log evidence in `docs/PROGRESS.md`. Use Hallmark for UI without modifying payment authorization or blockchain logic. Use Desloppify later when a real codebase exists.

## 16. Project agent instructions and visual planning

Keep a concise root `AGENTS.md` for Codex; keep this file in `docs/MASTER_PLAN.md` as the detailed source of truth. Every implementation session should read both and update `docs/PROGRESS.md` with real commands, outputs, testnet identifiers, blockers and next steps. Do not mark planned features complete.

**Design first:** Sketch a simple mobile-first flow: Home → Your Money → Money Set Aside → Commitment Details → Check Work → Request Payment → Payment History; separate Ask for Approval and wallet connection actions. Public pages remain browsable without a wallet. Mark all money values and activity as real contract data, not invented illustration content in the application. Drawings and wireframes may use clearly labeled placeholders because they are design concepts, not claims of real transactions.

**Release gate:** Verify plain-English copy with a nontechnical tester, wallet connection and disconnection, authorization, mobile navigation, real transaction status and accessibility before submission.
