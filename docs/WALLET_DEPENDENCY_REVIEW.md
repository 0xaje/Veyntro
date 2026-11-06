# Wallet dependency review — 2026-11-06

`npm audit --omit=dev` for `apps/web` reported 30 package findings: 19 low, 2 moderate, 9 high, 0 critical. These are dependency findings, not nine demonstrated ways to steal treasury funds. The onchain contract remains the authority for spending.

| Installed path | Finding and constraint |
| --- | --- |
| `@near-wallet-selector/meteor-wallet@10.1.4` → `@meteorwallet/sdk@1.0.24` → `nanoid@5.1.5` | Advisory for some ID generators; SDK pins this exact version. |
| Meteor SDK → `query-string` → `decode-uri-component@0.2.2` | Malformed input can cause denial of service in affected versions. |
| HERE selector `10.1.4` → `@here-wallet/core@3.4.0` → legacy NEAR utilities → `bs58@4.0.0` → `base-x@2.0.6` | Unicode lookalike validation advisory. Meteor also carries legacy NEAR utilities. |

The installed HERE and Meteor selector modules are the current published `10.1.4` releases checked on 2026-11-06. Newer upstream releases of `nanoid` and `decode-uri-component` exist, but that does not establish compatibility with the wallet SDKs. npm's automatic audit remedy proposes selector downgrades across major versions. We did not apply those changes or forcibly override nested packages because either could disable a supported wallet, including the owner's Meteor wallet.

Next: track compatible upstream SDK releases; reproduce the vulnerable code paths in the shipped browser bundle and assess whether untrusted data reaches them; test connect, account switch, disconnect, rejected signature, and signed testnet actions for every affected wallet before shipping any dependency replacement. Keep the advisory open until those checks pass. This internal review is not an external security audit or mainnet clearance.
