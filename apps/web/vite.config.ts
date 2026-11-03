import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "process.env": {},
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["mustache", "is-mobile", "@near-wallet-selector/core", "@near-wallet-selector/modal-ui"],
  },
  resolve: {
    alias: {
      buffer: fileURLToPath(new URL("./node_modules/buffer/index.js", import.meta.url)),
    },
  },
});
