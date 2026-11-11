import assert from "node:assert/strict";
import test from "node:test";
import { isExactSetupProposal, matchesSetupRequest, setupProposal, SETUP_ACTION_GAS, SETUP_RESERVE } from "../src/near/setup-proposal.ts";

const terms = {
  dao: "group.sputnikv2.testnet",
  factory: "setup.aje-veyntro.testnet",
  firewall: "group.setup.aje-veyntro.testnet",
  verifier: "group-owner.testnet",
  deposit: "2631470000000000000000000",
};

test("setup request sends one bounded call with the reviewed reserve", () => {
  const proposal = setupProposal(terms);
  assert.equal(isExactSetupProposal(proposal.kind, terms), true);
  const call = proposal.kind.FunctionCall;
  assert.equal(call.receiver_id, terms.factory);
  assert.equal(call.actions.length, 1);
  assert.equal(call.actions[0].gas, SETUP_ACTION_GAS);
  assert.deepEqual(JSON.parse(atob(call.actions[0].args)), {
    verifier: terms.verifier, operating_reserve: SETUP_RESERVE,
  });
});

test("changed receiver, deposit, verifier or extra action cannot be offered as the setup vote", () => {
  const original = setupProposal(terms).kind;
  for (const altered of [
    { FunctionCall: { ...original.FunctionCall, receiver_id: "stranger.testnet" } },
    { FunctionCall: { ...original.FunctionCall, actions: [{ ...original.FunctionCall.actions[0], deposit: "5000000000000000000000000" }] } },
    { FunctionCall: { ...original.FunctionCall, actions: [{ ...original.FunctionCall.actions[0], args: btoa(JSON.stringify({ verifier: "stranger.testnet", operating_reserve: SETUP_RESERVE })) }] } },
    { FunctionCall: { ...original.FunctionCall, actions: [...original.FunctionCall.actions, original.FunctionCall.actions[0]] } },
  ]) assert.equal(isExactSetupProposal(altered, terms), false);
});

test("a DAO or its child cannot be its own work checker", () => {
  assert.throws(() => setupProposal({ ...terms, verifier: terms.dao }));
  assert.throws(() => setupProposal({ ...terms, verifier: terms.firewall }));
});

test("the approval screen rejects too little funding and a changed description", () => {
  const proposal = setupProposal(terms);
  assert.equal(matchesSetupRequest(proposal, terms), true);
  assert.equal(matchesSetupRequest(proposal, { ...terms, deposit: "3000000000000000000000000" }), false);
  assert.equal(matchesSetupRequest({ ...proposal, description: "Pay an unknown recipient" }, terms), false);
});
