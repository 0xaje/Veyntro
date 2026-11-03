#!/usr/bin/env python3
"""Read-only preflight for retiring the Ubuntu-only DAO council account.

Writes unsigned public JSON only; never reads keys or sends transactions.
"""

import argparse
import base64
import json
from pathlib import Path

from preflight import rpc

DAO = "veyntro.sputnikv2.testnet"
OLD = "aje-veyntro.testnet"
BROWSER = "aje.testnet"
DESCRIPTION = "Use aje.testnet as the sole Veyntro council voter for browser approvals"
KIND = {"RemoveMemberFromRole": {"member_id": OLD, "role": "council"}}
PERMISSIONS = ["*:Finalize", "*:AddProposal", "*:VoteApprove", "*:VoteReject", "*:VoteRemove"]


def view(method, args, block_hash):
    result = rpc("query", {
        "request_type": "call_function", "account_id": DAO,
        "method_name": method, "block_id": block_hash,
        "args_base64": base64.b64encode(json.dumps(args).encode()).decode(),
    })
    return json.loads(bytes(result["result"]))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("prepare", "vote", "verify"))
    parser.add_argument("--id", type=int, help="Actual removal proposal ID")
    parser.add_argument("--out", type=Path, help="New unsigned JSON file")
    args = parser.parse_args()
    if args.mode in ("prepare", "vote") and not args.out:
        parser.error("--out is required")
    if args.mode in ("vote", "verify") and (args.id is None or args.id < 0):
        parser.error("--id must be the actual removal proposal ID")
    try:
        status = rpc("status", [])
        if status["chain_id"] != "testnet" or status["sync_info"]["syncing"]:
            raise ValueError("A synced NEAR testnet RPC is required")
        block = rpc("block", {"finality": "final"})["header"]
        policy = view("get_policy", {}, block["hash"])
        council = next(role for role in policy["roles"] if role["name"] == "council")
        members = council["kind"]["Group"]
        expected = {BROWSER} if args.mode == "verify" else {OLD, BROWSER}
        if len(members) != len(expected) or set(members) != expected:
            raise ValueError("Council membership differs from the expected state")
        if council["permissions"] != PERMISSIONS or policy["default_vote_policy"]["threshold"] != [1, 2]:
            raise ValueError("Council voting policy changed; review it before continuing")
        if args.mode == "prepare":
            funding = view("get_proposal", {"id": 11}, block["hash"])
            if funding["status"] != "Approved":
                raise ValueError("Finish and verify funding proposal 11 before changing the council")
            payload = {"proposal": {"description": DESCRIPTION, "kind": KIND}}
            with args.out.open("x", encoding="utf-8") as file:
                json.dump(payload, file, separators=(",", ":"))
                file.write("\n")
            print(json.dumps({"state": "prepared_unsigned", "block": block["height"],
                              "file": str(args.out), "bond_yoctonear": policy["proposal_bond"]}))
            return
        proposal = view("get_proposal", {"id": args.id}, block["hash"])
        if proposal["kind"] != KIND or proposal["description"] != DESCRIPTION:
            raise ValueError("The proposal does not match the planned council removal")
        if proposal["proposer"] != OLD:
            raise ValueError("The proposer is not the existing Ubuntu council account")
        if args.mode == "vote":
            if proposal["status"] != "InProgress" or proposal.get("votes", {}).get(OLD):
                raise ValueError("The proposal is closed or the Ubuntu council account already voted")
            if int(block["timestamp_nanosec"]) >= int(proposal["submission_time"]) + int(policy["proposal_period"]):
                raise ValueError("The proposal has expired")
            with args.out.open("x", encoding="utf-8") as file:
                json.dump({"id": args.id, "action": "VoteApprove", "memo": None}, file)
                file.write("\n")
            print(json.dumps({"state": "vote_prepared_unsigned", "file": str(args.out),
                              "proposal_id": args.id, "block": block["height"]}))
            return
        if proposal["status"] != "Approved":
            raise ValueError("Removal proposal is not approved")
        print(json.dumps({"state": "verified", "proposal_id": args.id,
                          "council_members": members, "block": block["height"]}))
    except (KeyError, TypeError, ValueError, StopIteration, OSError, RuntimeError) as error:
        parser.exit(1, f"Council transition stopped: {error}\n")


if __name__ == "__main__":
    main()
