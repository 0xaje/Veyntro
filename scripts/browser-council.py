#!/usr/bin/env python3
"""Prepare and verify the exact DAO proposal to add aje.testnet to council.

This script reads testnet state and writes unsigned public proposal/vote JSON.
It never reads credentials or signs a transaction.
"""

import argparse
import base64
import json
import sys
from pathlib import Path

from preflight import rpc

DAO = "veyntro.sputnikv2.testnet"
OLD_MEMBER = "aje-veyntro.testnet"
NEW_MEMBER = "aje.testnet"
KIND = {"AddMemberToRole": {"member_id": NEW_MEMBER, "role": "council"}}
DESCRIPTION = "Add aje.testnet as a Veyntro council voter for browser wallet approvals"


def view(account, method, args, block_hash):
    result = rpc("query", {
        "request_type": "call_function",
        "account_id": account,
        "method_name": method,
        "block_id": block_hash,
        "args_base64": base64.b64encode(json.dumps(args).encode()).decode(),
    })
    return json.loads(bytes(result["result"]))


def current_state():
    status = rpc("status", [])
    if status["chain_id"] != "testnet" or status["sync_info"]["syncing"]:
        raise ValueError("A synced NEAR testnet RPC is required")
    block = rpc("block", {"finality": "final"})["header"]
    policy = view(DAO, "get_policy", {}, block["hash"])
    council = next(role for role in policy["roles"] if role["name"] == "council")
    members = council["kind"]["Group"]
    if members != [OLD_MEMBER]:
        raise ValueError("Council membership changed; stop and review the DAO")
    if council["permissions"] != [
        "*:Finalize", "*:AddProposal", "*:VoteApprove", "*:VoteReject", "*:VoteRemove"
    ]:
        raise ValueError("Council permissions have changed; stop and review the DAO")
    if policy["default_vote_policy"]["threshold"] != [1, 2]:
        raise ValueError("The voting threshold changed; stop and review the DAO")
    if not str(policy["proposal_bond"]).isdigit():
        raise ValueError("The proposal bond is invalid")
    rpc("query", {
        "request_type": "view_account", "account_id": NEW_MEMBER,
        "block_id": block["hash"],
    })
    return block, policy, members


def write_new(path, payload):
    with path.open("x", encoding="utf-8") as file:
        json.dump(payload, file, separators=(",", ":"))
        file.write("\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("prepare", "vote", "verify"))
    parser.add_argument("--id", type=int, help="Actual proposal ID returned by the DAO")
    parser.add_argument("--out", type=Path, help="New unsigned JSON file, outside the repository")
    args = parser.parse_args()
    if args.mode in ("prepare", "vote") and not args.out:
        parser.error("--out is required for prepare and vote")
    if args.mode in ("vote", "verify") and (args.id is None or args.id < 0):
        parser.error("--id must be the actual nonnegative proposal ID")
    try:
        block, policy, members = current_state()
        if args.mode == "prepare":
            if NEW_MEMBER in members:
                raise ValueError("aje.testnet is already a council member")
            payload = {"proposal": {"description": DESCRIPTION, "kind": KIND}}
            write_new(args.out, payload)
            print(json.dumps({"state": "prepared_unsigned", "file": str(args.out),
                              "block": block["height"], "old_members": members,
                              "new_member": NEW_MEMBER,
                              "proposal_bond_yoctonear": policy["proposal_bond"]}))
            return

        proposal = view(DAO, "get_proposal", {"id": args.id}, block["hash"])
        if proposal["kind"] != KIND or proposal["description"] != DESCRIPTION:
            raise ValueError("The proposal does not match the planned council change")
        if proposal["proposer"] != OLD_MEMBER:
            raise ValueError("The proposer is not the existing council account")
        if args.mode == "vote":
            if NEW_MEMBER in members or proposal["status"] != "InProgress":
                raise ValueError("The member is already added or proposal is not open")
            if (int(block["timestamp_nanosec"]) >=
                    int(proposal["submission_time"]) + int(policy["proposal_period"])):
                raise ValueError("The proposal has expired")
            write_new(args.out, {"id": args.id, "action": "VoteApprove", "memo": None})
            print(json.dumps({"state": "vote_prepared_unsigned", "file": str(args.out),
                              "proposal_id": args.id, "block": block["height"]}))
            return

        if proposal["status"] != "Approved" or NEW_MEMBER not in members:
            raise ValueError("The proposal is not approved or aje.testnet is not in council")
        print(json.dumps({"state": "verified", "proposal_id": args.id,
                          "status": proposal["status"], "council_members": members,
                          "block": block["height"]}))
    except (KeyError, TypeError, ValueError, StopIteration, OSError, RuntimeError) as error:
        parser.exit(1, f"Council check stopped: {error}\n")


if __name__ == "__main__":
    main()
