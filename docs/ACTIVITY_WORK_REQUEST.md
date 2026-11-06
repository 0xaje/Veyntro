# New Activity work check — review before any testnet signature

This is a proposed, unpaid work item for the public Activity page change that added finalized DAO requests. The code landed on `main` at commit `ed4c4a664a0c0f0a40b8f5dced81290858881a63`. The genuine [Web app checks run](https://github.com/0xaje/Veyntro/actions/runs/42136893325) finished successfully on 6 November 2026 at 00:27 UTC. A passing CI run confirms those checks, not independent acceptance of the work. This is distinct from the already completed commitment 3 and its earlier commit and run.

## Reviewable proposal terms

| Field in the website | Suggested value |
| --- | --- |
| Request note | Pay 0.05 NEAR testnet for the completed Veyntro Activity page update showing DAO requests, commit ed4c4a664a0c0f0a40b8f5dced81290858881a63. Web checks run 42136893325. |
| Person doing the work | `aje.testnet` |
| Payment account | `aje.testnet` |
| Amount in NEAR | `0.05` |
| Deadline | 12 November 2026, 13:00 WAT (12:00 UTC) |
| Work check code | `1fdae61d1021131076f964a6083bf99f4fc033ba02a4436812c48e9f9f78b959` |

The work check code is the SHA-256 of the policy's canonical sorted JSON at `evidence/ACTIVITY_WORK_POLICY.json`, matching `services/verifier/src/policy.ts`. The policy binds repo, commit, workflow, main branch, successful push event, and a seven-day maximum run age. The run was created 6 November 2026 at 00:27 UTC, so the verifier must act **before 13 November 2026 at 00:27 UTC**, and before the commitment deadline. Leave time to request the payment before the recorded attestation expires.

## Required live sequence

1. Confirm this policy is committed on `main`, the GitHub environment secret exists privately, the DAO still permits `aje.testnet` to vote, and final Firewall state has enough available money. Those current onchain values were not reachable from the preparation workspace. Do not rely on an old screenshot.
2. Connect `aje.testnet` to the hosted website and ask the DAO to set aside the exact terms above. Review the wallet request and its 1 NEAR proposal bond if still required by live DAO policy. Wait for a final receipt; note the new request number.
3. Vote Approve from the authorized council wallet in the hosted website. Check the final DAO proposal status and final Firewall commitment record, including its actual new commitment ID, beneficiary, payment account, amount, deadline, and work check code. An approved DAO label without successful execution is insufficient.
4. In GitHub Actions, open `Submit checked work evidence`, choose `main`, and run with the **actual new commitment number**, run ID `42136893325`, and policy file `evidence/ACTIVITY_WORK_POLICY.json`. Never put a key in workflow inputs. Confirm its transaction hash and final matching usable onchain evidence. On failure, read the onchain commitment before retrying.
5. From the hosted site, request the eligible 0.05 NEAR testnet payment with `aje.testnet`. Verify the final transfer receipt and updated public balances/activity. Record transaction links in `docs/PROGRESS.md`.

No proposal, vote, attestation, or payout is claimed by this file. The amount and recipient are suggestions for the owner to review, not an authorization to pay. Do not reuse completed commitment 3.
