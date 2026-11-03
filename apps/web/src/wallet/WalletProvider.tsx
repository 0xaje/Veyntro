import type { AccountState, WalletSelector } from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { FIREWALL_CONTRACT_ID, NETWORK_ID } from "../near/rpc";

interface WalletContextValue {
  account: AccountState | null;
  error: string | null;
  ready: boolean;
  connect: () => void;
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

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void Promise.all([
      import("@near-wallet-selector/core"),
      import("@near-wallet-selector/meteor-wallet"),
      import("@near-wallet-selector/modal-ui"),
    ]).then(async ([core, meteor, modalUi]) => {
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
    }).catch(() => {
      if (!cancelled) setError("Wallet connection is not available right now. You can still view public treasury data.");
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const value = useMemo<WalletContextValue>(() => ({
    account,
    error,
    ready: selector !== null && modal !== null,
    connect: () => modal?.show(),
    disconnect: async () => {
      if (!selector) return;
      setError(null);
      try {
        const wallet = await selector.wallet();
        await wallet.signOut();
      } catch {
        setError("We could not disconnect the wallet. Try again.");
      }
    },
    selector,
  }), [account, error, modal, selector]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
