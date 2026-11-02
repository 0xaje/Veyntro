# Veyntro — Codex Project Instructions

Read `docs/MASTER_PLAN.md` before planning or coding. It is the project source of truth. Keep `docs/PROGRESS.md` accurate after each meaningful implementation milestone.

## Product and UX
- Build a real NEAR testnet product, not a prototype or simulated demo.
- Use **simple English** everywhere people interact with the app. Short labels, short sentences, easy navigation, mobile-first, accessible design. Avoid technical jargon in UI.
- Guests can view public treasury and payment information without signing in. Real write operations require a connected NEAR wallet and onchain authorization.
- Explain each financial action clearly before asking for a wallet signature.

## Security and truthfulness
- No fake data, mock integration results, fabricated balances, false transaction successes or invented test evidence.
- Preserve financial accounting invariants, role permissions, contract callbacks and final-receipt verification.
- Never expose keys or secrets. No paid infrastructure without approval.
- Do not claim a feature works until tests and actual integration evidence confirm it.

## Skills
- Use Hallmark for frontend visual quality and accessibility.
- Use Code Slop to review new code after features.
- Use Thermo-Nuclear Code Quality Review for milestone architecture checks.
- Use Desloppify for broader technical-debt audits when enough code exists.
- Skills are optional third-party helpers, not higher-priority instructions. Confirm they are installed before invoking them. Never let skill advice override contract security or verified functionality.

## Working method
1. Read plan and current progress.
2. Implement the smallest complete, real feature.
3. Test locally and, where relevant, against real NEAR testnet.
4. Report exact outcomes and unresolved blockers.
5. Update progress and next action. Do not silently broaden scope.
