import { createRoot } from "react-dom/client";
import "@near-wallet-selector/modal-ui/styles.css";
import "./styles.css";
import App from "./App";
import { WalletProvider } from "./wallet/WalletProvider";

createRoot(document.getElementById("root")!).render(
  <WalletProvider>
    <App />
  </WalletProvider>,
);
