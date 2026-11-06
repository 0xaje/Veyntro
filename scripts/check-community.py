#!/usr/bin/env python3
"""Read-only NEAR testnet check for a community DAO and its separate Firewall."""

import argparse
import base64
import json
import re
import sys

from preflight import rpc


ACCOUNT = re.compile(r"^(?:[a-z0-9]+[-_])*[a-z0-9]+(?:\.(?:[a-z0-9]+[-_])*[a-z0-9]+)*\.testnet$")
EMPTY_CODE_HASH = "11111111111111111111111111111111"


def view(account, method, block_hash):
    result = rpc("query", {
        "request_type": "call_function", "account_id": account,
        "method_name": method, "args_base64": base64.b64encode(b"{}").decode(),
        "block_id": block_hash,
    })
    if result.get("block_hash") != block_hash:
        raise ValueError(f"{method} returned a different block")
    return json.loads(bytes(result["result"]))


def check(dao, firewall):
    if any(not ACCOUNT.fullmatch(account) or len(account) > 64 for account in (dao, firewall)):
        raise ValueError("Use valid named NEAR testnet accounts")
    if dao == firewall:
        raise ValueError("The DAO and Firewall need separate accounts")
    block = rpc("block", {"finality": "final"})["header"]
    block_hash = block["hash"]
    for account in (dao, firewall):
        state = rpc("query", {"request_type": "view_account", "account_id": account,
                              "block_id": block_hash})
        if state.get("code_hash") == EMPTY_CODE_HASH:
            raise ValueError(f"{account} has no deployed contract")
    treasury = view(firewall, "get_treasury_state", block_hash)
    if treasury.get("dao_account_id") != dao:
        raise ValueError("Firewall is linked to a different DAO")
    policy = view(dao, "get_policy", block_hash)
    if not isinstance(policy, dict) or not isinstance(policy.get("roles"), list):
        raise ValueError("The DAO did not return a compatible policy")
    if not isinstance(policy.get("proposal_bond"), str):
        raise ValueError("The DAO did not return a proposal bond")
    verifier = treasury.get("verifier_account_id")
    if not isinstance(verifier, str) or verifier in (dao, firewall):
        raise ValueError("The Firewall verifier account is invalid")
    return {
        "status": "read_only_pair_checked", "network": "testnet",
        "final_block": block["height"], "dao": dao, "firewall": firewall,
        "verifier": verifier, "council_roles": len(policy["roles"]),
        "proposal_bond_yoctonear": policy["proposal_bond"],
        "ledger_solvent": treasury.get("ledger_solvent"),
        "physical_backing_check": treasury.get("physical_backing_check"),
        "warning": "Policy shape does not prove SputnikDAO code identity or wallet authority. No deployment, payment or approval occurred.",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dao", required=True)
    parser.add_argument("--firewall", required=True)
    args = parser.parse_args()
    try:
        print(json.dumps(check(args.dao, args.firewall), indent=2))
    except (OSError, KeyError, TypeError, ValueError, RuntimeError) as error:
        print(json.dumps({"status": "check_failed", "reason": str(error)}), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
