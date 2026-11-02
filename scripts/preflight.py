#!/usr/bin/env python3
"""Inspect real NEAR testnet state without keys or signed transactions."""

import argparse
import base64
from datetime import datetime, timezone
import json
from pathlib import Path
import shutil
import subprocess
import urllib.request


def rpc(method, params):
    body = json.dumps({"jsonrpc": "2.0", "id": "veyntro-preflight",
                       "method": method, "params": params}).encode()
    request = urllib.request.Request(
        "https://rpc.testnet.near.org", body,
        {"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        payload = json.load(response)
    if "error" in payload:
        raise RuntimeError(json.dumps(payload["error"]))
    if "result" not in payload:
        raise RuntimeError("RPC response has no result")
    return payload["result"]


def tool_version(name):
    executable = shutil.which(name)
    if executable is None:
        return {"available": False}
    try:
        result = subprocess.run(
            [executable, "--version"], capture_output=True, text=True,
            timeout=15, check=False,
        )
        return {"available": result.returncode == 0,
                "exit_code": result.returncode,
                "output": (result.stdout + result.stderr).strip()}
    except subprocess.TimeoutExpired:
        return {"available": False, "error": "Version check timed out"}


def inspect_dao(account_id, block_hash):
    if not account_id.endswith(".testnet"):
        raise ValueError("Use a named testnet DAO account ending in .testnet")
    account = rpc("query", {"request_type": "view_account",
                           "account_id": account_id, "block_id": block_hash})
    if account["code_hash"] == "11111111111111111111111111111111":
        raise RuntimeError("Selected DAO account has no deployed contract")
    policy = rpc("query", {
        "request_type": "call_function", "account_id": account_id,
        "method_name": "get_policy", "args_base64": base64.b64encode(b"{}").decode(),
        "block_id": block_hash,
    })
    decoded = json.loads(bytes(policy["result"]))
    if not isinstance(decoded, dict) or not isinstance(decoded.get("roles"), list):
        raise RuntimeError("DAO policy does not contain a roles list")
    if "proposal_bond" not in decoded:
        raise RuntimeError("DAO policy does not contain a proposal bond")
    return {"account_id": account_id, "account": account, "policy": decoded,
            "warning": "Policy shape alone does not authenticate deployed SputnikDAO code or signer control"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dao", help="Actual testnet DAO account to inspect")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    report = {
        "checked_at_utc": datetime.now(timezone.utc).isoformat(),
        "endpoint": "https://rpc.testnet.near.org",
        "mode": "read_only", "phase_0_complete": False,
        "tools": {name: tool_version(name) for name in
                  ("node", "npm", "git", "rustc", "cargo", "near", "cargo-near")},
        "dao": {"status": "not_configured"},
    }
    exit_code = 0
    try:
        status = rpc("status", [])
        if status["chain_id"] != "testnet" or status["sync_info"]["syncing"]:
            raise RuntimeError("RPC is on the wrong network or is still syncing")
        report["network"] = status
        block = rpc("block", {"finality": "final"})
        report["final_block"] = block["header"]
        if args.dao:
            report["dao"] = inspect_dao(args.dao, block["header"]["hash"])
        report["read_checks_passed"] = True
    except (OSError, ValueError, KeyError, TypeError, RuntimeError) as error:
        report["read_checks_passed"] = False
        report["error"] = str(error)
        exit_code = 1
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"report": str(args.output),
                      "read_checks_passed": report["read_checks_passed"],
                      "dao_configured": bool(args.dao),
                      "phase_0_complete": False}))
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
