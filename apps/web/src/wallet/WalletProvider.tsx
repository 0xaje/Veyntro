import type { AccountState, WalletSelector } from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { FIREWALL_CONTRACT_ID, NETWORK_ID } from "../near/rpc";

interface WalletContextValue {
  account: AccountState | null;
  error: string | null;
  initializing: boolean;
  ready: boolean;
  retry: () => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  selector: WalletSelector | null;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet(): WalletContextValue {
  const value = useContext(WalletContext);
  if (!value) throw new Error("useWallet must be used within WalletProvider.");
  return value;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [account, setAccount] = useState<AccountState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    setInitializing(true);
    setError(null);

    void (async () => {
      try {
        const [core, meteor, modalUi] = await Promise.all([
          import("@near-wallet-selector/core"),
          import("@near-wallet-selector/meteor-wallet"),
          import("@near-wallet-selector/modal-ui"),
        ]);
        const instance = await core.setupWalletSelector({
          network: NETWORK_ID,
          modules: [meteor.setupMeteorWallet()],
        });
        if (cancelled) return;
        const walletModal = modalUi.setupModal(instance, {
          contractId: FIREWALL_CONTRACT_ID,
          theme: "light",
          description: "Connect your NEAR testnet wallet to Veyntro.",
        });
        setSelector(instance);
        setModal(walletModal);
        const update = () => {
          const active = instance.store.getState().accounts.find((item) => item.active) ?? null;
          setAccount(active);
        };
        update();
        const subscription = instance.store.observable.subscribe(update);
        unsubscribe = () => subscription.unsubscribe();
      } catch (cause) {
        console.error("[Veyntro] NEAR wallet setup failed", cause);
        if (!cancelled) setError("We could not start the wallet. Try again or reload the page.");
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [retryCount]);

  const value = useMemo<WalletContextValue>(() => ({
    account,
    error,
    initializing,
    ready: selector !== null && modal !== null,
    retry: () => {
      setSelector(null);
      setModal(null);
      setAccount(null);
      setError(null);
      setInitializing(true);
      setRetryCount((count) => count + 1);
    },
    connect: async () => {
      setError(null);
      try {
        if (!modal) throw new Error("Wallet setup did not finish.");
        modal.show();
      } catch (cause) {
        console.error("[Veyntro] Could not open the wallet", cause);
        setError("We could not open the wallet. Try again.");
      }
    },
    disconnect: async () => {
      if (!selector) return;
      setError(null);
      try {
        const wallet = await selector.wallet();
        await wallet.signOut();
      } catch (cause) {
        console.error("[Veyntro] Wallet disconnect failed", cause);
        setError("We could not disconnect the wallet. Try again.");
      }
    },
    selector,
  }), [account, error, initializing, modal, selector]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
