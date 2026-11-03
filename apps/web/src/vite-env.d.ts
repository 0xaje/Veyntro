/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NEAR_RPC_URL?: string;
  readonly VITE_FIREWALL_CONTRACT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
