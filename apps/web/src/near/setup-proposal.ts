export const SETUP_RESERVE = "50000000000000000000000";
export const SETUP_ACTION_GAS = "100000000000000";

export interface SetupTerms {
  dao: string;
  factory: string;
  firewall: string;
  verifier: string;
  deposit: string;
}

export function setupProposal(terms: SetupTerms) {
  if (!/^\d+$/.test(terms.deposit) || BigInt(terms.deposit) <= 0n ||
      terms.verifier === terms.dao || terms.verifier === terms.firewall || terms.verifier === terms.factory) {
    throw new Error("Choose a separate work-check account and a valid setup amount.");
  }
  return {
    description: `Set up Veyntro for ${terms.dao}; work checker ${terms.verifier}`,
    kind: { FunctionCall: {
      receiver_id: terms.factory,
      actions: [{
        method_name: "deploy",
        args: btoa(JSON.stringify({ verifier: terms.verifier, operating_reserve: SETUP_RESERVE })),
        deposit: terms.deposit,
        gas: SETUP_ACTION_GAS,
      }],
    } },
  };
}

// Reject any changed receiver, action, arguments, deposit, gas, or extra
// action before offering the council a setup vote. A DAO view is still
// re-read at finality immediately before signing.
export function isExactSetupProposal(kind: unknown, terms: SetupTerms): boolean {
  if (!kind || typeof kind !== "object" || Array.isArray(kind)) return false;
  const call = (kind as Record<string, unknown>).FunctionCall;
  if (!call || typeof call !== "object" || Array.isArray(call)) return false;
  const data = call as Record<string, unknown>;
  if (data.receiver_id !== terms.factory || !Array.isArray(data.actions) || data.actions.length !== 1) return false;
  const action: unknown = data.actions[0];
  if (!action || typeof action !== "object" || Array.isArray(action)) return false;
  const actual = action as Record<string, unknown>;
  const expected = setupProposal(terms).kind.FunctionCall.actions[0];
  return actual.method_name === expected.method_name && actual.args === expected.args &&
    actual.deposit === expected.deposit && actual.gas === expected.gas;
}

export function setupDeposit(kind: unknown): string | null {
  if (!kind || typeof kind !== "object") return null;
  const call = (kind as Record<string, unknown>).FunctionCall as { actions?: Array<{ deposit?: unknown }> } | undefined;
  const deposit = call?.actions?.[0]?.deposit;
  return typeof deposit === "string" && /^\d+$/.test(deposit) ? deposit : null;
}

export function matchesSetupRequest(proposal: { description: string; kind: unknown }, terms: SetupTerms): boolean {
  const deposit = setupDeposit(proposal.kind);
  if (deposit === null || BigInt(deposit) < BigInt(terms.deposit)) return false;
  const proposedTerms = { ...terms, deposit };
  return proposal.description === setupProposal(proposedTerms).description &&
    isExactSetupProposal(proposal.kind, proposedTerms);
}
