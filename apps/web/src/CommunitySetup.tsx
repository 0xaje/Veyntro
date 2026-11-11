import { useEffect, useState } from "react";
import { Action, FunctionCall } from "@near-js/transactions";
import { Buffer } from "buffer";
import { useWallet } from "./wallet/WalletProvider";
import { accountCanUsePermission, decodeFunctionResult, readDao, readDaoVoteTarget, validateAccountId, type DaoProposal } from "./near/dao";
import { RPC_URL, formatNear } from "./near/rpc";
import { readFactoryQuote, SETUP_FACTORY, verifyCommunity, verifyDaoCode, type FactoryQuote } from "./near/community";
import { matchesSetupRequest, setupDeposit, setupProposal, SETUP_RESERVE, type SetupTerms } from "./near/setup-proposal";

const FACTORY = "sputnikv2.testnet";
const DAO_FUNDING = 7n * 10n ** 24n;
// Only a dedicated test build may open signed setup actions. The public build
// stays read-only until the verifier path and live refund checks pass.
const SETUP_ACTIONS_ENABLED = import.meta.env.VITE_ENABLE_COMMUNITY_SETUP === "true";
const SETUP_GAS = 80_000_000_000_000n;
const VOTE_GAS = 150_000_000_000_000n;

function setupTerms(dao: string, quote: FactoryQuote, verifier: string, deposit = quote.depositYocto): SetupTerms {
  return { dao, factory: SETUP_FACTORY, firewall: quote.firewall, verifier, deposit };
}

function isMatchingSetup(proposal: DaoProposal, dao: string, quote: FactoryQuote, verifier: string): boolean {
  return matchesSetupRequest(proposal, setupTerms(dao, quote, verifier));
}

function failedReceipt(outcome: { receipts_outcome: Array<{ outcome: { status: unknown } }> }): boolean {
  return outcome.receipts_outcome.some(row => Boolean(row.outcome.status &&
    typeof row.outcome.status === "object" && "Failure" in row.outcome.status));
}

async function accountExists(accountId: string): Promise<boolean> {
  const response = await fetch(RPC_URL, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "setup-account", method: "query",
      params: { request_type: "view_account", account_id: accountId, finality: "final" } }),
  });
  if (!response.ok) throw new Error("NEAR testnet could not be reached. Try again later.");
  const data = await response.json() as { result?: unknown; error?: { cause?: { name?: string } } };
  if (data.result) return true;
  if (data.error?.cause?.name === "UNKNOWN_ACCOUNT") return false;
  throw new Error("NEAR testnet could not check this account. Try again later.");
}

async function accountBalance(accountId: string): Promise<bigint> {
  const response = await fetch(RPC_URL, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "setup-balance", method: "query",
      params: { request_type: "view_account", account_id: accountId, finality: "final" } }),
  });
  if (!response.ok) throw new Error("Could not check your testnet balance.");
  const data = await response.json() as { result?: { amount?: string }; error?: unknown };
  if (data.error || !data.result?.amount) throw new Error("Could not check your testnet balance.");
  return BigInt(data.result.amount);
}

export default function CommunitySetup() {
  const { account, connect, selector, error: walletError, initializing } = useWallet();
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState("");
  const [firewall, setFirewall] = useState("");
  const [verifiedFirewall, setVerifiedFirewall] = useState("");
  const [quote, setQuote] = useState<FactoryQuote | null>(null);
  const [verifier, setVerifier] = useState("");
  const [setupRequest, setSetupRequest] = useState<DaoProposal | null>(null);
  const [setupTransaction, setSetupTransaction] = useState("");
  const [confirmedChild, setConfirmedChild] = useState("");
  const daoId = name ? `${name}.sputnikv2.testnet` : "";

  useEffect(() => {
    setCreated("");
    setVerifiedFirewall("");
    setVerifier(account?.accountId ?? "");
    setSetupRequest(null);
    setConfirmedChild("");
  }, [account?.accountId]);

  async function refreshSetupStatus(dao = created, checker = verifier.trim().toLowerCase()) {
    if (!dao || !checker || !validateAccountId(checker)) {
      throw new Error("Check your DAO and enter a valid work-check account first.");
    }
    const latest = await readFactoryQuote(dao, SETUP_RESERVE);
    const snapshot = await readDao(dao);
    const request = snapshot.proposals.find(proposal => isMatchingSetup(proposal, dao, latest, checker)) ?? null;
    setQuote(latest);
    setSetupRequest(request);
    setConfirmedChild("");
    if (latest.status === 2) {
      const checked = await verifyCommunity(latest.firewall);
      if (checked.dao !== dao || checked.verifier !== checker) {
        throw new Error("The finished Firewall has different DAO or work-check accounts. Do not send it money.");
      }
      setConfirmedChild(latest.firewall);
      return `The Firewall and DAO match at a final testnet block. The work-check account still needs its own safe evidence setup before payments are ready.`;
    }
    if (latest.status === 3 || latest.status === 5) return "Setup did not finish. A refund is available or still being sent. Check the DAO before trying again.";
    if (latest.status === 1) return "Setup is still running. Refresh in a moment to check the final result.";
    if (request) return `DAO request ${request.id}: ${request.status}. The Firewall has not been confirmed as ready.`;
    return "No matching DAO setup request or finished Firewall was found. No setup payment has been confirmed.";
  }

  async function refreshSetup() {
    setBusy(true);
    setMessage("");
    try { setMessage(await refreshSetupStatus()); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not check the setup result."); }
    finally { setBusy(false); }
  }

  async function checkSetupCost() {
    setMessage("");
    setQuote(null);
    setSetupRequest(null);
    setConfirmedChild("");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 28) {
      setMessage("Use up to 28 lowercase letters, numbers and single dashes for the DAO name."); return;
    }
    setBusy(true);
    try {
      setQuote(await readFactoryQuote(daoId, SETUP_RESERVE));
      setMessage("This is the setup service’s current testnet deposit quote. No money has moved.");
    } catch {
      setMessage("The reviewed setup service is not available yet. No setup payment can be sent from this page.");
    } finally { setBusy(false); }
  }

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setCreated("");
    if (!SETUP_ACTIONS_ENABLED) { setMessage("DAO creation is not open on this site yet."); return; }
    if (!account || !selector) { setMessage("Connect your wallet first."); return; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 28) {
      setMessage("Use up to 28 lowercase letters, numbers and single dashes for the DAO name."); return;
    }
    if (!purpose.trim() || purpose.length > 240) { setMessage("Describe your group in 240 characters or fewer."); return; }
    setBusy(true);
    try {
      const latest = await readFactoryQuote(daoId, SETUP_RESERVE);
      if (latest.status !== null && latest.status !== 4) throw new Error("This DAO has already started setup. Check its final result first.");
      if (quote?.firewall !== latest.firewall || quote.depositYocto !== latest.depositYocto ||
          BigInt(latest.depositYocto) >= DAO_FUNDING) {
        throw new Error("The setup quote changed or exceeds the DAO’s starting funds. Check the cost again.");
      }
      if (await accountBalance(account.accountId) <= DAO_FUNDING) {
        throw new Error("Your wallet needs more than 7 testnet NEAR for DAO funding and network fees. Add free testnet NEAR before signing.");
      }
      if (await accountExists(daoId)) throw new Error("That DAO name is already taken. Choose another.");
      const args = { name, args: Buffer.from(JSON.stringify({
        config: { name, purpose: purpose.trim(), metadata: "" },
        policy: [account.accountId],
      })).toString("base64") };
      const wallet = await selector.wallet();
      const outcome = await wallet.signAndSendTransaction({
        signerId: account.accountId, receiverId: FACTORY,
        actions: [new Action({ functionCall: new FunctionCall({
          methodName: "create", args: new TextEncoder().encode(JSON.stringify(args)),
          gas: 150_000_000_000_000n, deposit: DAO_FUNDING,
        }) })],
      });
      if (!outcome) throw new Error("Your wallet returned without a final result. Check the DAO account before trying again.");
      if (typeof outcome.status === "object" && "Failure" in outcome.status) throw new Error("DAO creation failed on testnet. Check the wallet transaction.");
      if (failedReceipt(outcome)) throw new Error("A DAO creation step failed. Check the DAO account before trying again.");
      const dao = await readDao(daoId);
      await verifyDaoCode(daoId);
      if (!accountCanUsePermission(dao.policy, account.accountId, "FunctionCall", "AddProposal")) {
        throw new Error("The DAO exists, but your wallet cannot ask it to set up a Firewall under its current rules.");
      }
      setCreated(daoId);
      setQuote(latest);
      setMessage(`DAO created and checked at final block ${dao.blockHeight}. The Firewall and work checker still need setup before this group can use Veyntro.`);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "The DAO could not be created. Check NEAR testnet before trying again.");
    } finally { setBusy(false); }
  }

  async function checkExisting() {
    setMessage("");
    if (!account || !daoId) { setMessage("Connect your wallet and enter the DAO name first."); return; }
    setBusy(true);
    try {
      const dao = await readDao(daoId);
      await verifyDaoCode(daoId);
      if (!accountCanUsePermission(dao.policy, account.accountId, "FunctionCall", "AddProposal")) {
        throw new Error("This DAO exists, but your wallet cannot ask it to set up a Firewall under its current rules.");
      }
      setCreated(daoId);
      // Existing DAO checks remain available while the shared setup service
      // is not deployed. A separate pinned quote is required for any write.
      try { setQuote(await readFactoryQuote(daoId, SETUP_RESERVE)); }
      catch { setQuote(null); }
      setSetupRequest(null);
      setConfirmedChild("");
      setMessage(`Your DAO was found at final block ${dao.blockHeight}. The Firewall and work checker still need setup.`);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not check this DAO."); }
    finally { setBusy(false); }
  }

  async function requestSetup() {
    if (!SETUP_ACTIONS_ENABLED) return;
    setBusy(true);
    setMessage("");
    try {
      if (!account || !selector || !created || created !== daoId) throw new Error("Connect your wallet and check this DAO again.");
      const checker = verifier.trim().toLowerCase();
      if (!validateAccountId(checker) || checker === created || checker === SETUP_FACTORY) {
        throw new Error("Enter a separate NEAR testnet account for checking work.");
      }
      if (!await accountExists(checker)) throw new Error("The work-check account must exist on testnet first.");
      const latest = await readFactoryQuote(created, SETUP_RESERVE);
      if (quote?.firewall !== latest.firewall || quote.depositYocto !== latest.depositYocto ||
          latest.status !== null && latest.status !== 4) {
        throw new Error("Setup changed. Refresh its status before sending a request.");
      }
      const snapshot = await readDao(created);
      await verifyDaoCode(created);
      if (!accountCanUsePermission(snapshot.policy, account.accountId, "FunctionCall", "AddProposal")) {
        throw new Error("Your wallet cannot ask this DAO to set up the Firewall.");
      }
      if (snapshot.proposals.some(p => p.status === "InProgress" && isMatchingSetup(p, created, latest, checker))) {
        throw new Error("A matching setup request already waits for votes. Refresh its status.");
      }
      const bond = BigInt(snapshot.policy.proposal_bond);
      if (await accountBalance(account.accountId) <= bond) throw new Error(`Your wallet needs more than ${formatNear(bond.toString())} testnet NEAR for the DAO request deposit and network fees.`);
      if (await accountBalance(created) <= BigInt(latest.depositYocto)) {
        throw new Error(`The DAO needs more than ${formatNear(latest.depositYocto)} testnet NEAR for setup and network fees. Its request deposit is separate.`);
      }
      const proposal = setupProposal(setupTerms(created, latest, checker));
      const wallet = await selector.wallet();
      const outcome = await wallet.signAndSendTransaction({
        signerId: account.accountId, receiverId: created,
        actions: [new Action({ functionCall: new FunctionCall({
          methodName: "add_proposal", args: new TextEncoder().encode(JSON.stringify({ proposal })),
          gas: SETUP_GAS, deposit: bond,
        }) })],
      });
      if (!outcome || !outcome.transaction?.hash) throw new Error("The wallet returned without a final transaction. Refresh the DAO before trying again.");
      if (typeof outcome.status === "object" && "Failure" in outcome.status || failedReceipt(outcome)) {
        throw new Error("The DAO request failed. Check its transaction before trying again.");
      }
      const id = decodeFunctionResult(typeof outcome.status === "object" ? outcome.status.SuccessValue : undefined);
      if (id === null || !/^\d+$/.test(id)) throw new Error("The DAO returned no request number. Refresh its status before trying again.");
      const target = await readDaoVoteTarget(created, Number(id));
      if (!isMatchingSetup(target.proposal, created, latest, checker)) throw new Error("The DAO request differs from the one you signed. Stop and review it.");
      setSetupRequest(target.proposal);
      setSetupTransaction(outcome.transaction.hash);
      setQuote(latest);
      setMessage(`Request ${id} is on testnet. Council approval is still needed; no Firewall is ready yet.`);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "The setup request could not be confirmed. Refresh before trying again."); }
    finally { setBusy(false); }
  }

  async function approveSetup() {
    if (!SETUP_ACTIONS_ENABLED) return;
    setBusy(true);
    setMessage("");
    try {
      if (!account || !selector || !created || created !== daoId || !setupRequest) {
        throw new Error("Connect your wallet and refresh the DAO request first.");
      }
      const checker = verifier.trim().toLowerCase();
      const latest = await readFactoryQuote(created, SETUP_RESERVE);
      if (latest.status !== null && latest.status !== 4) throw new Error("Setup has already started. Refresh its final status.");
      const target = await readDaoVoteTarget(created, setupRequest.id);
      const deposit = setupDeposit(target.proposal.kind);
      if (deposit === null || BigInt(deposit) < BigInt(latest.depositYocto) ||
          !isMatchingSetup(target.proposal, created, latest, checker) ||
          JSON.stringify(target.proposal.kind) !== JSON.stringify(setupRequest.kind) ||
          target.proposal.description !== setupRequest.description) {
        throw new Error("The amount or details of this request changed. Refresh and review it before voting.");
      }
      if (target.proposal.status !== "InProgress" || target.proposal.votes?.[account.accountId]) {
        throw new Error("This request is closed or your wallet has already voted. Refresh its status.");
      }
      if (!accountCanUsePermission(target.policy, account.accountId, "FunctionCall", "VoteApprove")) {
        throw new Error("Your wallet cannot approve this request under the DAO’s rules.");
      }
      if (await accountBalance(created) <= BigInt(deposit)) {
        throw new Error("The DAO needs more testnet NEAR to cover this setup amount and network fees.");
      }
      const wallet = await selector.wallet();
      const outcome = await wallet.signAndSendTransaction({
        signerId: account.accountId, receiverId: created,
        actions: [new Action({ functionCall: new FunctionCall({
          methodName: "act_proposal", args: new TextEncoder().encode(JSON.stringify({ id: setupRequest.id, action: "VoteApprove", memo: null })),
          gas: VOTE_GAS, deposit: 0n,
        }) })],
      });
      if (!outcome || !outcome.transaction?.hash) throw new Error("The wallet returned without a final transaction. Refresh before voting again.");
      if (typeof outcome.status === "object" && "Failure" in outcome.status || failedReceipt(outcome)) {
        throw new Error("A vote or setup step failed. Refresh to check the final DAO and refund status.");
      }
      setSetupTransaction(outcome.transaction.hash);
      setMessage(await refreshSetupStatus(created, checker));
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not confirm the final result. Refresh setup status."); }
    finally { setBusy(false); }
  }

  async function checkFirewall(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setVerifiedFirewall("");
    if (!created) { setMessage("Check your DAO first."); return; }
    setBusy(true);
    try {
      const checked = await verifyCommunity(firewall.trim());
      if (checked.dao !== created) throw new Error("This Firewall belongs to a different DAO.");
      setVerifiedFirewall(firewall.trim());
      setMessage("The Firewall code and DAO link were checked on a final testnet block. Check your group’s work checker before using evidence-based payments.");
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "This Firewall could not be checked."); }
    finally { setBusy(false); }
  }

  return <main className="community-gate">
    <p><a href="/?choose=1">← Choose a community</a></p>
    <h1>Set up your group</h1>
    <p>Your group controls its own DAO and money. Setup is being completed. Creating a DAO alone does not let your group manage commitments here.</p>
    {account ? <p>Connected wallet: <strong>{account.accountId}</strong></p> : <button type="button" disabled={initializing} onClick={() => void connect()}>Connect wallet</button>}
    {walletError && <p role="alert">{walletError}</p>}
    <form onSubmit={e => void create(e)}>
      <label htmlFor="dao-name">DAO name</label>
      <input id="dao-name" value={name} maxLength={28} onChange={e => {
        setName(e.target.value.toLowerCase()); setCreated(""); setVerifiedFirewall(""); setQuote(null);
        setSetupRequest(null); setSetupTransaction(""); setConfirmedChild("");
      }} placeholder="our-community" required />
      <p>{daoId || "your-name.sputnikv2.testnet"}</p>
      <label htmlFor="dao-purpose">What is your group for?</label>
      <input id="dao-purpose" value={purpose} maxLength={240} onChange={e => setPurpose(e.target.value)} required />
      <p>Your connected account starts as the only council member. Your group can change its DAO rules later. This creation deposits <strong>7 testnet NEAR</strong> in the new DAO, plus a small network fee. It is testnet money, not a payment to Veyntro. Check your wallet balance before signing.</p>
      <button disabled={!SETUP_ACTIONS_ENABLED || !account || !quote || busy} type="submit">{SETUP_ACTIONS_ENABLED ? "Create your DAO" : "DAO creation opens when the full setup path is ready"}</button>
      <button disabled={!account || !name || busy} type="button" onClick={() => void checkExisting()}>Check an existing DAO</button>
      <button disabled={!name || busy} type="button" onClick={() => void checkSetupCost()}>Check setup cost</button>
    </form>
    {message && <p role="status">{message}</p>}
    {quote && <section aria-label="Setup cost">
      <h2>Starting your Firewall</h2>
      <p>Planned account: <strong>{quote.firewall}</strong></p>
      <p>Minimum starting deposit from your DAO: <strong>{formatNear(quote.depositYocto)} testnet NEAR</strong>. This stays in your group’s Firewall for storage and safe operation. A DAO request deposit and network fees are separate.</p>
      <p>{quote.status === null ? "No setup request has started." : quote.status === 1 ? "A setup request is running. Check its final result before acting again." : quote.status === 2 ? "The factory reports setup finished. Check the Firewall and your work checker before sending funds." : quote.status === 3 ? "A refund is available to your DAO. Settle it before trying again." : quote.status === 4 ? "The previous attempt was refunded. Your DAO may try again when setup opens." : "A refund is being sent. Wait for its final result."}</p>
    </section>}
    {created && <p>Checked DAO: <strong>{created}</strong>. {confirmedChild ? "Your Firewall is deployed; its work checker still needs setup before payments." : "Do not send money for commitments until the full setup is checked."}</p>}
    {created && quote && <section aria-label="Set up your Firewall">
      <h2>Ask your DAO to start the Firewall</h2>
      <p>The DAO sends its approved starting deposit to its own Firewall through the reviewed setup service. The DAO request deposit is separate. Council members must review and approve the exact action.</p>
      <label htmlFor="setup-checker">Work-check account</label>
      <input id="setup-checker" value={verifier} maxLength={64} onChange={e => {
        setVerifier(e.target.value.trim().toLowerCase()); setSetupRequest(null); setConfirmedChild("");
      }} placeholder="your-checker.testnet" />
      <p>This must be a separate testnet account your group controls. Creating a Firewall does not set up its evidence key.</p>
      <button type="button" disabled={busy} onClick={() => void refreshSetup()}>Refresh setup status</button>
      {setupRequest && <div>
        <p>DAO request {setupRequest.id}: <strong>{setupRequest.status}</strong></p>
        <p>Work checker: {verifier}; DAO deposit: {formatNear(setupDeposit(setupRequest.kind) ?? "0")} testnet NEAR; destination: {SETUP_FACTORY}</p>
        <p>Review the wallet and DAO details before approving. An approved vote alone does not mean the Firewall was deployed.</p>
        <button type="button" disabled={!SETUP_ACTIONS_ENABLED || busy || setupRequest.status !== "InProgress" || Boolean(account && setupRequest.votes?.[account.accountId])} onClick={() => void approveSetup()}>Approve setup in your wallet</button>
      </div>}
      {!setupRequest && <button type="button" disabled={!SETUP_ACTIONS_ENABLED || busy || quote.status !== null && quote.status !== 4} onClick={() => void requestSetup()}>Ask your DAO to set up the Firewall</button>}
      {setupTransaction && <p><a href={`https://explorer.testnet.near.org/transactions/${encodeURIComponent(setupTransaction)}`} target="_blank" rel="noopener noreferrer">View latest setup transaction</a></p>}
      {confirmedChild && <p>Checked Firewall: <strong>{confirmedChild}</strong>. <a href={`/?firewall=${encodeURIComponent(confirmedChild)}`}>View its public page</a></p>}
    </section>}
    {created && <form onSubmit={e => void checkFirewall(e)}>
      <h2>Check your Firewall</h2>
      <p>If your group already has a Veyntro Firewall, enter it here. This check does not deploy one.</p>
      <label htmlFor="setup-firewall">Firewall testnet account</label>
      <input id="setup-firewall" value={firewall} onChange={e => setFirewall(e.target.value.trim().toLowerCase())} required maxLength={64} placeholder="your-firewall.testnet" />
      <button disabled={busy} type="submit">Check DAO and Firewall</button>
    </form>}
    {verifiedFirewall && <p><a href={`/?firewall=${encodeURIComponent(verifiedFirewall)}`}>Open your group’s public page</a></p>}
  </main>;
}
