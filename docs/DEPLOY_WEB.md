# Publish the Veyntro web app

The current public site is https://veyntro-web.onrender.com/. It is a Render Static Site built from the public `0xaje/Veyntro` repository on `main`, using the root `render.yaml`. Public pages read NEAR testnet directly; wallet signatures are needed only for authorized write actions. No private signing key belongs in the web bundle.

## Check the deployed site

1. Verify Render's service is a Static Site and publishes `apps/web/dist`.
2. Open the public site in a private browser window. Check `/`, `/governance`, `/commitments/4`, and `/activity` directly and reload each route. The rewrite in `render.yaml` serves the app for those paths.
3. Follow the README's request 4 rejection, request 14 approval, commitment 4, and payment 6 trail. Public reading must work without a wallet. Amounts on Overview are live finalized-block reads and can change.
4. On desktop and phone, confirm navigation and that a supported NEAR testnet wallet connects, disconnects, and restores its account after a refresh. Test a signed action only when there is an appropriate live request. Check the final onchain result after reloading; a submitted transaction alone is not proof of success.

## Evidence checker

Static hosting does not run the evidence checker. The checked-work example used an operator-started GitHub Actions workflow with a function-call key restricted to `submit_attestation` on the Firewall. Its successful run and transaction are linked from README.md and JUDGES.md. See docs/VERIFIER_ACTION.md for operation and limits. The verifier is trusted and operator-run; a different DAO cannot configure its own verifier from this website today. Do not put a full-access key, seed phrase, or verifier secret in Render's Static Site configuration.
