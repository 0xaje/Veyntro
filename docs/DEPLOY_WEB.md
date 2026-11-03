# Publish the Veyntro web app

The web app reads NEAR testnet directly. Visitors can view it without a wallet. A wallet is needed only to sign actions. The web bundle contains no private signing key.

1. In Render, connect the `0xaje/Veyntro` GitHub repository and create a Blueprint using the root `render.yaml` on branch `main`.
2. Check that the service is a **Static Site** and that its publish directory is `apps/web/dist`. Render should give it an HTTPS `onrender.com` address. Do not enter any NEAR private key or seed phrase as an environment variable for this site.
3. Open the HTTPS address in a private window. Check `/`, `/governance`, and `/commitments/3` directly, and reload each page. The rewrite in `render.yaml` serves the app for these paths.
4. Connect a supported NEAR **testnet** wallet. Check the displayed account and network. Read public balances and DAO requests against the NEAR testnet, and test a signed action only when there is an appropriate live request.
5. Check desktop and phone widths, wallet return navigation, and the final transaction state after a reload. Record the URL and transaction ID in `docs/PROGRESS.md` after real verification.

Hosting the web app does not automate evidence verification. The current verifier CLI prepares an unsigned attestation; an authorized verifier account must still sign and submit it. Never add that account's full-access key to the web app or repository. A hosted verifier needs an authenticated request flow, a NEAR function-call key limited to `submit_attestation` on the firewall contract, durable nonce and job tracking, rate limits, and checks of the final transaction result before it can replace the CLI step. Treat that as separate work and do not claim an automated payout until it is verified end to end.
