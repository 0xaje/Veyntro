import assert from "node:assert/strict";
import { test } from "node:test";
import { amountToYocto } from "../src/near/amount.ts";

test("converts exact NEAR values without rounding", () => {
  assert.equal(amountToYocto("0.05"), "50000000000000000000000");
  assert.equal(amountToYocto("0.000000000000000000000001"), "1");
});

test("rejects values that would otherwise be silently reduced", () => {
  assert.throws(() => amountToYocto("0.0500000000000000000000001"), /24 digits/);
  assert.throws(() => amountToYocto("1."), /valid NEAR amount/);
  assert.throws(() => amountToYocto("9".repeat(1000)), /valid NEAR amount/);
});
