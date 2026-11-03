# Proposed testnet commitment for completed web app work

This is a reviewable suggestion for a genuine DAO decision. It has not been submitted or approved. The work is the Veyntro web app change at commit `f8baaa78558395b60a90a8bf748b87d70834cc5c` that loads the newest DAO requests. GitHub Actions web checks run `41708155809` completed successfully. This is a retroactive payment request for completed work; CI confirms the named checks passed, not independent acceptance of the work.

Use the **Set money aside for approved work** option on `/governance` with `aje.testnet` connected to NEAR testnet. Review these terms before signing:

| Form field | Proposed value |
| --- | --- |
| Request note | Pay 0.05 NEAR testnet for completed Veyntro web app work: newest DAO requests at commit f8baaa78558395b60a90a8bf748b87d70834cc5c. Evidence: web checks run 41708155809. |
| Person doing the work | `aje.testnet` |
| Payment account | `aje.testnet` |
| Amount in NEAR | `0.05` |
| Deadline | 7 November 2026, 13:00 WAT (12:00 UTC) |
| Work check code | `59ef3ce012e6a54b45e5f78d6ff0e90ed176404eb289a6da0cb86ab27c5b0288` |

The policy is `evidence/WEB_APP_WORK_POLICY.json`. The live DAO policy read on 3 November at block 276098769 listed `aje.testnet` as sole council member and required a 1 NEAR proposal bond. The Firewall read at block 276098784 showed 2.47326 NEAR available and healthy backing, enough for this suggested 0.05 NEAR commitment. Recheck live amounts and the form before signing. The proposed 0.05 NEAR is set aside from funds already in the Firewall; the bond is paid by the proposer to submit a DAO request. A proposal does not create a commitment until DAO approval and successful contract execution.

After the DAO approves, read the new commitment's actual ID and exact stored terms. The trusted verifier account must independently check the real GitHub run and sign `submit_attestation` for that ID. Only after onchain evidence is usable should the beneficiary use the browser's **Request payment** action. Verify final transfer receipts and contract accounting. The run expires under its seven-day evidence rule around 10 November 2026 19:57:58 UTC, and the commitment deadline above is earlier. A reused run does not become fresh through a rerun.

Using one testnet wallet as proposer, sole council voter and beneficiary proves the distinct signed app paths, but not independent multi-person governance. A later tester with a separate wallet is still needed.
