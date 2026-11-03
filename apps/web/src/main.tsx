import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
import "@near-wallet-selector/modal-ui/styles.css";
import "./styles.css";
import App from "./App";
import { WalletProvider } from "./wallet/WalletProvider";

globalThis.Buffer = Buffer;
Object.assign(globalThis, { global: globalThis });

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
