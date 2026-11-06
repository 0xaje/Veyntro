import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  (window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
  (window as unknown as { global: typeof window }).global = window;
  if (!window.process) {
    (window as unknown as { process: { env: Record<string, string> } }).process = { env: {} };
  }
}

import "@near-wallet-selector/modal-ui/styles.css";
import "./styles.css";
import App from "./App";
import { WalletProvider } from "./wallet/WalletProvider";
import { DEFAULT_FIREWALL, selectedFirewall, verifyCommunity } from "./near/community";

function CommunityGate() {
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState<"checking" | "ready" | "error">(
    selectedFirewall() === DEFAULT_FIREWALL ? "ready" : "checking",
  );
  const [error, setError] = useState("");
  const choosing = new URLSearchParams(window.location.search).has("choose");

  useEffect(() => {
    if (choosing || selectedFirewall() === DEFAULT_FIREWALL) return;
    let active = true;
    void verifyCommunity(selectedFirewall()).then(() => {
      if (active) setStatus("ready");
    }).catch((cause: unknown) => {
      if (active) {
        setError(cause instanceof Error ? cause.message : "This community could not be checked.");
        setStatus("error");
      }
    });
    return () => { active = false; };
  }, [choosing]);

  if (choosing || status === "error") return (
    <main className="community-gate">
      <h1>Choose a community</h1>
      <p>Enter its Veyntro Firewall testnet account. We check the contract and its DAO before showing money or wallet actions.</p>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={(event) => {
        event.preventDefault();
        const next = new URL("/", window.location.origin);
        next.searchParams.set("firewall", account.trim());
        window.location.assign(next);
      }}>
        <label htmlFor="community-account">Firewall account</label>
        <input id="community-account" value={account} onChange={(event) => setAccount(event.target.value)}
          placeholder="your-firewall.testnet" required maxLength={64} />
        <button type="submit">Check community</button>
      </form>
      <p><a href="/">View Veyntro's testnet community</a></p>
      <p>New DAO setup still needs its own deployed Firewall and work checker. Do not send funds until your community has verified both.</p>
    </main>
  );
  if (status === "checking") return <main className="community-gate" role="status">Checking this community on NEAR testnet…</main>;
  return <WalletProvider><App /></WalletProvider>;
}

try {
  const savedTheme = localStorage.getItem("veyntro-theme") ?? localStorage.getItem("veyntro-theme-mode");
  document.documentElement.setAttribute("data-theme", savedTheme === "dark" ? "dark" : "light");
} catch {
  document.documentElement.setAttribute("data-theme", "light");
}

createRoot(document.getElementById("root")!).render(
  <CommunityGate />,
);
