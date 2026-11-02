#!/usr/bin/env python3
"""Prepare a real DAO proposal or validate a specific proposal before voting."""

import argparse
import base64
import hashlib
import json
from pathlib import Path

from preflight import rpc

DAO = "veyntro.sputnikv2.testnet"
COUNCIL = "aje-veyntro.testnet"
RECEIVER = "receiver.aje-veyntro.testnet"
WASM = Path("target/wasm32-unknown-unknown/release/veyntro_dao_receiver.wasm")
DEPOSIT = "10000000000000000000000"  # 0.01 NEAR, for this integration gate only.
DESCRIPTION = "Veyntro integration: fund the DAO-only receiver with 0.01 test NEAR"


def base58(raw):
    alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    number = int.from_bytes(raw, "big")
    encoded = ""
    while number:
        number, remainder = divmod(number, 58)
        encoded = alphabet[remainder] + encoded
    return "1" * (len(raw) - len(raw.lstrip(b"\0"))) + encoded


def view(account, method, args, block):
    response = rpc("query", {
        "request_type": "call_function", "account_id": account,
        "method_name": method, "block_id": block,
        "args_base64": base64.b64encode(json.dumps(args).encode()).decode(),
    })
    return json.loads(bytes(response["result"]))


def proposal_kind():
    return {"FunctionCall": {"receiver_id": RECEIVER, "actions": [{
        "method_name": "fund_treasury", "args": "e30=",
        "deposit": DEPOSIT, "gas": "30000000000000",
    }]}}


def prepare(proposal_id):
    status = rpc("status", [])
    if status["chain_id"] != "testnet" or status["sync_info"]["syncing"]:
        raise ValueError("A synced testnet RPC is required")
    block = rpc("block", {"finality": "final"})["header"]
    block_hash = block["hash"]
    code = WASM.read_bytes()
    code_hash = base58(hashlib.sha256(code).digest())
    account = rpc("query", {
        "request_type": "view_account", "account_id": RECEIVER,
        "block_id": block_hash,
    })
    if account["code_hash"] != code_hash:
        raise ValueError("Deployed receiver code does not match the local WASM")
    funding = view(RECEIVER, "get_funding_state", {}, block_hash)
    if funding["dao_account_id"] != DAO or funding["total_received"] != "0":
        raise ValueError("Receiver has a different DAO or has already received funding")
    policy = view(DAO, "get_policy", {}, block_hash)
    council = next(role for role in policy["roles"] if role["name"] == "council")
    if COUNCIL not in council["kind"]["Group"]:
        raise ValueError("Expected council member is missing from DAO policy")
    if proposal_id is not None:
        proposal = view(DAO, "get_proposal", {"id": proposal_id}, block_hash)
        if (proposal["kind"] != proposal_kind()
                or proposal["description"] != DESCRIPTION
                or proposal["proposer"] != COUNCIL
                or proposal["status"] != "InProgress"):
            raise ValueError("Proposal does not match the expected funding action")
        if int(block["timestamp_nanosec"]) >= int(proposal["submission_time"]) + int(policy["proposal_period"]):
            raise ValueError("Proposal has expired")
        payload = {"id": proposal_id, "action": "VoteApprove", "memo": None}
    else:
        payload = {"proposal": {"description": DESCRIPTION, "kind": proposal_kind()}}
    return payload, policy["proposal_bond"], block_hash, code_hash


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--proposal-id", type=int)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if args.proposal_id is not None and args.proposal_id < 0:
        parser.error("Proposal ID must be nonnegative")
    try:
        payload, bond, block_hash, code_hash = prepare(args.proposal_id)
    except (OSError, ValueError, KeyError, TypeError, RuntimeError, StopIteration) as error:
        parser.exit(1, f"Cannot prepare governance action: {error}\n")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload) + "\n")
    print(json.dumps({"payload_file": str(args.output), "proposal_bond_yoctonear": bond,
                      "block_hash": block_hash, "receiver_code_hash": code_hash,
                      "signed_or_sent": False}))


if __name__ == "__main__":
    main()
