import { createRoot } from "react-dom/client";
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

try {
  const savedTheme = localStorage.getItem("veyntro-theme") ?? localStorage.getItem("veyntro-theme-mode");
  document.documentElement.setAttribute("data-theme", savedTheme === "dark" ? "dark" : "light");
} catch {
  document.documentElement.setAttribute("data-theme", "light");
}

createRoot(document.getElementById("root")!).render(
  <WalletProvider>
    <App />
  </WalletProvider>,
);
