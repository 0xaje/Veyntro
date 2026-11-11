#!/usr/bin/env python3
"""Read-only check of the exact factory build, testnet storage price and account funding."""

import argparse
import hashlib
import json
from pathlib import Path
import sys

from preflight import rpc


FACTORY = "setup.aje-veyntro.testnet"
PARENT = "aje-veyntro.testnet"
WASM_DIR = Path("target/wasm32-unknown-unknown/release")
PINNED = {
    "firewall": ("veyntro_commitment_firewall.wasm", "04e7dc5ffaa8cfe9d58879641724ad0ec2a2608fdd426a22922a92201143b66a"),
    "factory": ("veyntro_community_factory.wasm", "ebda5e982baa31026a0acc545e8c383c64dbd5030773586b63162e163cc94c10"),
}
HEADROOM_BYTES = 32_768
MIN_RESERVE = 50_000_000_000_000_000_000_000


def base58(data):
    alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    value = int.from_bytes(data, "big")
    encoded = ""
    while value:
        value, digit = divmod(value, 58)
        encoded = alphabet[digit] + encoded
    return "1" * (len(data) - len(data.lstrip(b"\0"))) + encoded


def artifact(kind, wasm_dir):
    name, pinned_hash = PINNED[kind]
    data = (wasm_dir / name).read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    if digest != pinned_hash:
        raise ValueError(f"{name} differs from the reviewed CI build. Stop before any deployment.")
    return {"bytes": len(data), "sha256": digest, "near_code_hash": base58(bytes.fromhex(digest))}


def account(account_id, block_hash):
    try:
        value = rpc("query", {"request_type": "view_account", "account_id": account_id,
                              "block_id": block_hash})
        if value.get("block_hash") != block_hash:
            raise ValueError(f"{account_id} returned a different block")
        return {"exists": True, "amount_yoctonear": value["amount"],
                "storage_usage": value["storage_usage"], "code_hash": value["code_hash"]}
    except RuntimeError as error:
        if "UNKNOWN_ACCOUNT" in str(error):
            return {"exists": False}
        raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--wasm-dir", type=Path, default=WASM_DIR,
                        help="Directory containing the locally rebuilt release WASM files")
    args = parser.parse_args()
    try:
        built = {kind: artifact(kind, args.wasm_dir) for kind in PINNED}
        block = rpc("block", {"finality": "final"})["header"]
        config = rpc("EXPERIMENTAL_protocol_config", {"finality": "final"})
        price = int(config["runtime_config"]["storage_amount_per_byte"])
        if price <= 0:
            raise ValueError("Invalid testnet storage price")
        parent = account(PARENT, block["hash"])
        factory = account(FACTORY, block["hash"])
        if not parent["exists"]:
            raise ValueError("Parent account is missing on testnet")
        if factory["exists"] and factory["code_hash"] not in (
            "11111111111111111111111111111111", built["factory"]["near_code_hash"]
        ):
            raise ValueError("Factory account already contains different code. Stop before deployment.")
        report = {
            "status": "read_only_preflight", "signed_or_sent": False,
            "final_block": block["height"], "parent": {"id": PARENT, **parent},
            "factory": {"id": FACTORY, **factory}, "artifacts": built,
            "storage_price_yoctonear_per_byte": str(price),
            "factory_starting_backing_floor_yoctonear": str((built["factory"]["bytes"] + HEADROOM_BYTES) * price),
            "child_starting_deposit_floor_yoctonear": str((built["firewall"]["bytes"] + HEADROOM_BYTES) * price + MIN_RESERVE),
            "note": "Funding floors include storage headroom. They are not transaction fees or a live factory quote. No account or key was created.",
        }
        print(json.dumps(report, indent=2))
    except (OSError, KeyError, TypeError, ValueError, RuntimeError) as error:
        print(json.dumps({"status": "preflight_failed", "signed_or_sent": False,
                          "reason": str(error)}), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
