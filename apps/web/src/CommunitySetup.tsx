import { useEffect, useState } from "react";
import { Action, FunctionCall } from "@near-js/transactions";
import { Buffer } from "buffer";
import { useWallet } from "./wallet/WalletProvider";
import { accountCanUsePermission, readDao } from "./near/dao";
import { RPC_URL, formatNear } from "./near/rpc";
import { readFactoryQuote, verifyCommunity, type FactoryQuote } from "./near/community";

const FACTORY = "sputnikv2.testnet";
const DAO_FUNDING = 7n * 10n ** 24n;
const SETUP_RESERVE = "50000000000000000000000";

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
  const daoId = name ? `${name}.sputnikv2.testnet` : "";

  useEffect(() => {
    setCreated("");
    setVerifiedFirewall("");
  }, [account?.accountId]);

  async function checkSetupCost() {
    setMessage("");
    setQuote(null);
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
    if (!account || !selector) { setMessage("Connect your wallet first."); return; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 28) {
      setMessage("Use up to 28 lowercase letters, numbers and single dashes for the DAO name."); return;
    }
    if (!purpose.trim() || purpose.length > 240) { setMessage("Describe your group in 240 characters or fewer."); return; }
    setBusy(true);
    try {
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
      const dao = await readDao(daoId);
      if (!accountCanUsePermission(dao.policy, account.accountId, "FunctionCall", "AddProposal")) {
        throw new Error("The DAO exists, but your wallet cannot ask it to set up a Firewall under its current rules.");
      }
      setCreated(daoId);
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
      if (!accountCanUsePermission(dao.policy, account.accountId, "FunctionCall", "AddProposal")) {
        throw new Error("This DAO exists, but your wallet cannot ask it to set up a Firewall under its current rules.");
      }
      setCreated(daoId);
      setMessage(`Your DAO was found at final block ${dao.blockHeight}. The Firewall and work checker still need setup.`);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Could not check this DAO."); }
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
      }} placeholder="our-community" required />
      <p>{daoId || "your-name.sputnikv2.testnet"}</p>
      <label htmlFor="dao-purpose">What is your group for?</label>
      <input id="dao-purpose" value={purpose} maxLength={240} onChange={e => setPurpose(e.target.value)} required />
      <p>Your connected account starts as the only council member. Your group can change its DAO rules later. This creation deposits <strong>7 testnet NEAR</strong> in the new DAO, plus a small network fee. It is testnet money, not a payment to Veyntro. Check your wallet balance before signing.</p>
      <button disabled type="submit">DAO creation opens when the full setup path is ready</button>
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
    {created && <p>Checked DAO: <strong>{created}</strong>. The remaining setup steps are not ready here yet; do not send money for commitments.</p>}
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
