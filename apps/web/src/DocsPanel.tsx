import { explorerAccountUrl, FIREWALL_CONTRACT_ID, type TreasuryState } from "./near/rpc";

const SOURCE = "https://github.com/0xaje/Veyntro/blob/main";

export default function DocsPanel({ state }: { state: TreasuryState | null }) {
  return (
    <section className="docs-section" aria-labelledby="docs-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">About Veyntro</p>
          <h2 id="docs-title">How it works</h2>
        </div>
      </div>
      <div className="docs-grid">
        <article className="docs-card">
          <h3>What happens to the money?</h3>
          <p>The DAO approves money for work. The Commitment Firewall checks money already set aside and pending payments before accepting a new commitment. Anyone can read the treasury without connecting a wallet.</p>
        </article>
        <article className="docs-card">
          <h3>Who can change it?</h3>
          <p>DAO members ask for approval and vote under the DAO’s current rules. A beneficiary can request a payment only for their commitment after its work check passes. The contract checks these permissions when a transaction is sent.</p>
        </article>
        <article className="docs-card">
          <h3>How is work checked?</h3>
          <p>A separate verifier checks a specific GitHub workflow run and signs an onchain work check. A passing workflow is not proof that the work is useful. Public evidence submission is not available in this app yet.</p>
        </article>
        <article className="docs-card">
          <h3>What can I check now?</h3>
          <p>The treasury and commitments come from final NEAR testnet reads. The Activity view shows saved payments and withdrawals; it does not yet list all funding or commitment changes or link each record to its transaction.</p>
        </article>
      </div>
      <div className="docs-links">
        <h3>Accounts and instructions</h3>
        <p>Network: NEAR testnet. Testnet money has no mainnet value.</p>
        <a href={explorerAccountUrl(FIREWALL_CONTRACT_ID)} target="_blank" rel="noreferrer">View the Commitment Firewall account ↗</a>
        {state ? <a href={explorerAccountUrl(state.dao_account_id)} target="_blank" rel="noreferrer">View the DAO account ↗</a> : <p>The DAO account will appear when the live treasury loads.</p>}
        <a href={`${SOURCE}/README.md`} target="_blank" rel="noreferrer">Setup and current status ↗</a>
        <a href={`${SOURCE}/docs/FIREWALL_ACCOUNTING.md`} target="_blank" rel="noreferrer">Money rules ↗</a>
        <a href={`${SOURCE}/services/verifier/README.md`} target="_blank" rel="noreferrer">Work-check rules and limits ↗</a>
      </div>
    </section>
  );
}
