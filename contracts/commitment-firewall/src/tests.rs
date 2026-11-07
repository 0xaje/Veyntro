use super::*;
use crate::types::{OperationKind, OperationStatus};
use near_sdk::test_utils::{VMContextBuilder, get_created_receipts};
use near_sdk::{NearToken, PromiseResult, RuntimeFeesConfig, test_vm_config, testing_env};
use std::collections::HashMap;

const N: u128 = 1_000_000_000_000_000_000_000_000;
const CURRENT: &str = "firewall.testnet";
const DAO: &str = "veyntro.sputnikv2.testnet";
const VERIFIER: &str = "verifier.testnet";
const BENEFICIARY: &str = "worker.testnet";
const DEADLINE: u64 = 10_000;

fn set_context(caller: &str, now: u64, deposit: u128, balance: u128, results: Vec<PromiseResult>) {
    let mut b = VMContextBuilder::new();
    b.current_account_id(CURRENT.parse().unwrap())
        .predecessor_account_id(caller.parse().unwrap())
        .signer_account_id("council.testnet".parse().unwrap())
        .block_timestamp(now)
        .account_balance(NearToken::from_yoctonear(balance))
        .attached_deposit(NearToken::from_yoctonear(deposit));
    testing_env!(
        b.build(),
        test_vm_config(),
        RuntimeFeesConfig::test(),
        HashMap::default(),
        results
    );
}

fn ctx(caller: &str, now: u64) {
    set_context(caller, now, 0, 1000 * N, vec![]);
}

#[test]
fn factory_init_requires_factory_child() {
    ctx("setup.aje-veyntro.testnet", 1);
    let failed = std::panic::catch_unwind(|| CommitmentFirewall::new_from_factory(
        DAO.parse().unwrap(), VERIFIER.parse().unwrap(), U128(N),
    ));
    assert!(failed.is_err());

    let mut b = VMContextBuilder::new();
    b.current_account_id("group.setup.aje-veyntro.testnet".parse().unwrap())
        .predecessor_account_id("setup.aje-veyntro.testnet".parse().unwrap())
        .account_balance(NearToken::from_yoctonear(1000 * N));
    testing_env!(b.build());
    let state = CommitmentFirewall::new_from_factory(
        DAO.parse().unwrap(), VERIFIER.parse().unwrap(), U128(N),
    );
    assert_eq!(state.dao_account_id.as_str(), DAO);
}

fn funded() -> CommitmentFirewall {
    ctx(CURRENT, 1);
    let mut c = CommitmentFirewall::new(DAO.parse().unwrap(), VERIFIER.parse().unwrap(), U128(N));
    set_context(DAO, 1, 100 * N, 1000 * N, vec![]);
    c.fund_treasury();
    ctx(DAO, 1);
    c
}

fn reserve(c: &mut CommitmentFirewall, amount: u128) -> U64 {
    ctx(DAO, 1);
    c.create_reservation(
        BENEFICIARY.parse().unwrap(),
        "recipient.testnet".parse().unwrap(),
        U128(amount),
        U64(DEADLINE),
        "12".repeat(32),
    )
}

fn attest(c: &mut CommitmentFirewall, id: U64) {
    ctx(VERIFIER, 2);
    c.submit_attestation(
        id,
        "ab".repeat(32),
        "12".repeat(32),
        "cd".repeat(20),
        U64(1),
        U64(DEADLINE),
    );
}

fn draw(c: &mut CommitmentFirewall, id: U64, amount: u128, nonce: u64) -> U64 {
    ctx(BENEFICIARY, 3);
    let op = U64(c.next_operation_id);
    drop(c.request_drawdown(id, U128(amount), U64(nonce)));
    op
}

fn settle(c: &mut CommitmentFirewall, id: U64, now: u64, success: bool) -> OperationStatus {
    let r = if success {
        PromiseResult::Successful(vec![])
    } else {
        PromiseResult::Failed
    };
    set_context(CURRENT, now, 0, 1000 * N, vec![r]);
    c.on_drawdown_result(id)
}

fn invariant(c: &CommitmentFirewall) {
    let mut liabilities = 0;
    let mut pending = 0;
    for (_, r) in c.reservations.iter() {
        assert!(r.pending <= r.remaining && r.remaining <= r.approved);
        liabilities += r.remaining;
        pending += r.pending;
    }
    assert_eq!(c.liabilities, liabilities);
    assert_eq!(c.pending_payouts, pending);
    assert_eq!(
        c.reserved_operation_bytes,
        c.reservations
            .iter()
            .map(|(_, r)| u64::from(r.operation_slots) * OPERATION_STORAGE_BYTES)
            .sum::<u64>()
    );
    assert_eq!(
        c.pending_withdrawals,
        c.operations
            .iter()
            .filter(|(_, o)| o.kind == OperationKind::Withdrawal
                && o.status == OperationStatus::Pending)
            .map(|(_, o)| o.amount)
            .sum()
    );
    let state = c.get_treasury_state();
    assert!(
        state.money_available.0
            <= c.confirmed_funds
                .saturating_sub(state.operating_reserve.0 + c.liabilities + c.pending_withdrawals)
    );
}

#[test]
fn records_only_dao_funding_not_deployment_or_direct_balance() {
    let c = funded();
    assert_eq!(c.confirmed_funds, 100 * N);
    let available = c.available();
    assert!(available > 0 && available < 100 * N);
    set_context(DAO, 1, 0, 2000 * N, vec![]);
    assert_eq!(c.available(), available);
    invariant(&c);
}

#[test]
#[should_panic(expected = "Only the DAO")]
fn rejects_non_dao_funding() {
    let mut c = funded();
    set_context("council.testnet", 2, N, 1000 * N, vec![]);
    c.fund_treasury();
}

#[test]
#[should_panic(expected = "Attach money")]
fn rejects_zero_funding() {
    let mut c = funded();
    ctx(DAO, 2);
    c.fund_treasury();
}

#[test]
#[should_panic(expected = "Only this account")]
fn rejects_hostile_initialization() {
    ctx("stranger.testnet", 1);
    CommitmentFirewall::new(DAO.parse().unwrap(), VERIFIER.parse().unwrap(), U128(N));
}

#[test]
#[should_panic(expected = "0.05 NEAR")]
fn rejects_tiny_operating_reserve() {
    ctx(CURRENT, 1);
    CommitmentFirewall::new(DAO.parse().unwrap(), VERIFIER.parse().unwrap(), U128(1));
}

#[test]
#[should_panic(expected = "Not enough money")]
fn rejects_overlapping_commitments() {
    let mut c = funded();
    reserve(&mut c, 60 * N);
    reserve(&mut c, 30 * N);
    invariant(&c);
    assert!(c.get_treasury_state().money_available.0 < 10 * N);
    reserve(&mut c, 10 * N);
}

#[test]
#[should_panic(expected = "Only the DAO")]
fn rejects_unauthorized_commitment() {
    let mut c = funded();
    ctx(BENEFICIARY, 1);
    c.create_reservation(
        BENEFICIARY.parse().unwrap(),
        "recipient.testnet".parse().unwrap(),
        U128(N),
        U64(DEADLINE),
        "12".repeat(32),
    );
}

#[test]
#[should_panic(expected = "future deadline")]
fn rejects_deadline_at_current_time() {
    let mut c = funded();
    c.create_reservation(
        BENEFICIARY.parse().unwrap(),
        "recipient.testnet".parse().unwrap(),
        U128(N),
        U64(1),
        "12".repeat(32),
    );
}

#[test]
#[should_panic(expected = "complete hexadecimal")]
fn rejects_invalid_policy_hash() {
    let mut c = funded();
    c.create_reservation(
        BENEFICIARY.parse().unwrap(),
        "recipient.testnet".parse().unwrap(),
        U128(N),
        U64(DEADLINE),
        "not-a-hash".into(),
    );
}

#[test]
fn expiry_is_permissionless_and_idempotent() {
    let mut c = funded();
    let id = reserve(&mut c, 10 * N);
    ctx("anyone.testnet", DEADLINE);
    assert_eq!(c.release_expired(id).0, 10 * N);
    assert_eq!(c.release_expired(id).0, 0);
    assert_eq!(c.liabilities, 0);
    invariant(&c);
}

#[test]
#[should_panic(expected = "has not expired")]
fn rejects_early_release() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    ctx("anyone.testnet", DEADLINE - 1);
    c.release_expired(id);
}

#[test]
fn pending_payout_stays_in_liabilities_without_double_subtraction() {
    let mut c = funded();
    let id = reserve(&mut c, 20 * N);
    attest(&mut c, id);
    let before = c.available();
    let op = draw(&mut c, id, 5 * N, 1);
    assert_eq!(c.liabilities, 20 * N);
    assert_eq!(c.pending_payouts, 5 * N);
    assert!(c.available().abs_diff(before) < N);
    assert_eq!(
        c.get_operation(op).unwrap().status,
        OperationStatus::Pending
    );
    let receipts = get_created_receipts();
    assert_eq!(receipts[0].receiver_id.as_str(), "recipient.testnet");
    assert_eq!(receipts[1].receiver_id.as_str(), CURRENT);
    invariant(&c);
}

#[test]
fn success_settles_exactly_once() {
    let mut c = funded();
    let id = reserve(&mut c, 20 * N);
    attest(&mut c, id);
    let op = draw(&mut c, id, 5 * N, 1);
    assert_eq!(settle(&mut c, op, 4, true), OperationStatus::Succeeded);
    assert_eq!(c.confirmed_funds, 95 * N);
    assert_eq!(c.liabilities, 15 * N);
    assert_eq!(c.pending_payouts, 0);
    assert_eq!(settle(&mut c, op, 5, false), OperationStatus::Succeeded);
    assert_eq!(c.confirmed_funds, 95 * N);
    invariant(&c);
}

#[test]
fn failed_payout_retains_backing_and_retry_uses_new_nonce() {
    let mut c = funded();
    let id = reserve(&mut c, 20 * N);
    attest(&mut c, id);
    let first = draw(&mut c, id, 5 * N, 1);
    settle(&mut c, first, 4, false);
    assert_eq!(c.confirmed_funds, 100 * N);
    assert_eq!(c.liabilities, 20 * N);
    let second = draw(&mut c, id, 5 * N, 2);
    assert_ne!(first.0, second.0);
    settle(&mut c, second, 4, true);
    assert_eq!(c.liabilities, 15 * N);
    invariant(&c);
}

#[test]
#[should_panic(expected = "nonce was already used")]
fn rejects_replay_after_failure() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    attest(&mut c, id);
    let op = draw(&mut c, id, N, 1);
    settle(&mut c, op, 4, false);
    draw(&mut c, id, N, 1);
}

#[test]
#[should_panic(expected = "pending payment")]
fn rejects_second_inflight_payment_on_same_commitment() {
    let mut c = funded();
    let id = reserve(&mut c, 20 * N);
    attest(&mut c, id);
    draw(&mut c, id, N, 1);
    draw(&mut c, id, N, 2);
}

#[test]
#[should_panic(expected = "verified evidence")]
fn rejects_unverified_payment() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    draw(&mut c, id, N, 1);
}

#[test]
#[should_panic(expected = "Only the beneficiary")]
fn rejects_payment_by_dao_or_other_account() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    attest(&mut c, id);
    ctx(DAO, 3);
    drop(c.request_drawdown(id, U128(N), U64(1)));
}

#[test]
#[should_panic(expected = "larger than")]
fn rejects_payout_above_remaining() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    attest(&mut c, id);
    draw(&mut c, id, N + 1, 1);
}

#[test]
#[should_panic(expected = "verified evidence")]
fn rejects_payout_at_exact_expiry() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    attest(&mut c, id);
    ctx(BENEFICIARY, DEADLINE);
    drop(c.request_drawdown(id, U128(N), U64(1)));
}

#[test]
fn expiry_during_pending_payment_releases_only_unused_and_failure_releases_rest() {
    let mut c = funded();
    let id = reserve(&mut c, 20 * N);
    attest(&mut c, id);
    let op = draw(&mut c, id, 5 * N, 1);
    ctx("anyone.testnet", DEADLINE);
    assert_eq!(c.release_expired(id).0, 15 * N);
    assert_eq!(c.liabilities, 5 * N);
    assert_eq!(c.release_expired(id).0, 0);
    invariant(&c);
    settle(&mut c, op, DEADLINE + 1, false);
    assert_eq!(c.confirmed_funds, 100 * N);
    assert_eq!(c.liabilities, 0);
    assert_eq!(c.get_reservation(id).unwrap().remaining_liability.0, 0);
    invariant(&c);
}

#[test]
fn expiry_during_pending_success_does_not_release_paid_money_twice() {
    let mut c = funded();
    let id = reserve(&mut c, 20 * N);
    attest(&mut c, id);
    let op = draw(&mut c, id, 5 * N, 1);
    ctx("anyone.testnet", DEADLINE);
    c.release_expired(id);
    settle(&mut c, op, DEADLINE + 1, true);
    assert_eq!(c.confirmed_funds, 95 * N);
    assert_eq!(c.liabilities, 0);
    assert_eq!(
        c.get_reservation(id).unwrap().status,
        ReservationStatus::Expired
    );
    invariant(&c);
}

#[test]
fn callback_after_expiry_without_cleanup_releases_unused_money() {
    let mut c = funded();
    let id = reserve(&mut c, 20 * N);
    attest(&mut c, id);
    let op = draw(&mut c, id, 5 * N, 1);
    settle(&mut c, op, DEADLINE, true);
    assert_eq!(c.confirmed_funds, 95 * N);
    assert_eq!(c.liabilities, 0);
    invariant(&c);
}

#[test]
fn cancellation_keeps_pending_payment_backed() {
    let mut c = funded();
    let id = reserve(&mut c, 20 * N);
    attest(&mut c, id);
    let op = draw(&mut c, id, 5 * N, 1);
    ctx(DAO, 4);
    assert_eq!(c.cancel_reservation(id).0, 15 * N);
    assert_eq!(c.liabilities, 5 * N);
    settle(&mut c, op, 5, false);
    assert_eq!(c.liabilities, 0);
    assert_eq!(c.confirmed_funds, 100 * N);
    invariant(&c);
}

#[test]
fn simultaneous_reservations_and_out_of_order_callbacks_preserve_ledger() {
    let mut c = funded();
    let a = reserve(&mut c, 20 * N);
    let b = reserve(&mut c, 30 * N);
    attest(&mut c, a);
    attest(&mut c, b);
    let x = draw(&mut c, a, 7 * N, 1);
    let y = draw(&mut c, b, 11 * N, 1);
    invariant(&c);
    settle(&mut c, y, 4, true);
    invariant(&c);
    settle(&mut c, x, 5, false);
    invariant(&c);
    assert_eq!(c.confirmed_funds, 89 * N);
    assert_eq!(c.liabilities, 39 * N);
}

#[test]
fn many_payment_failure_success_interleavings_preserve_all_invariants() {
    for mask in 0..16 {
        // Distinct namespaces avoid reusing persistent collection storage between models.
        let mut c = funded();
        c.reservations = UnorderedMap::new(format!("r{mask}").into_bytes());
        c.operations = UnorderedMap::new(format!("o{mask}").into_bytes());
        let id = reserve(&mut c, 20 * N);
        attest(&mut c, id);
        let mut paid = 0;
        for step in 1..=4 {
            let op = draw(&mut c, id, N, step);
            invariant(&c);
            let success = mask & (1 << (step - 1)) != 0;
            settle(&mut c, op, 4, success);
            if success {
                paid += N;
            }
            invariant(&c);
        }
        assert_eq!(c.confirmed_funds, 100 * N - paid);
        assert_eq!(c.liabilities, 20 * N - paid);
    }
}

#[test]
#[should_panic(expected = "Only this contract")]
fn rejects_callback_spoof() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    attest(&mut c, id);
    let op = draw(&mut c, id, N, 1);
    set_context(DAO, 4, 0, 1000 * N, vec![PromiseResult::Successful(vec![])]);
    c.on_drawdown_result(op);
}

#[test]
#[should_panic(expected = "exactly one")]
fn rejects_callback_without_a_result() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    attest(&mut c, id);
    let op = draw(&mut c, id, N, 1);
    ctx(CURRENT, 4);
    c.on_drawdown_result(op);
}

#[test]
fn withdrawal_is_reserved_then_restored_on_failure() {
    let mut c = funded();
    reserve(&mut c, 80 * N);
    ctx(DAO, 2);
    let op = U64(c.next_operation_id);
    drop(c.withdraw_available(U128(10 * N), "dao-vault.testnet".parse().unwrap(), U64(1)));
    assert_eq!(c.pending_withdrawals, 10 * N);
    assert!(c.available() < 10 * N);
    invariant(&c);
    set_context(CURRENT, 3, 0, 1000 * N, vec![PromiseResult::Failed]);
    assert_eq!(c.on_withdraw_result(op), OperationStatus::Failed);
    assert_eq!(c.confirmed_funds, 100 * N);
    assert_eq!(c.pending_withdrawals, 0);
    invariant(&c);
}

#[test]
fn withdrawal_success_settles_once() {
    let mut c = funded();
    ctx(DAO, 2);
    drop(c.withdraw_available(U128(10 * N), "dao-vault.testnet".parse().unwrap(), U64(1)));
    set_context(
        CURRENT,
        3,
        0,
        1000 * N,
        vec![PromiseResult::Successful(vec![])],
    );
    assert_eq!(c.on_withdraw_result(U64(0)), OperationStatus::Succeeded);
    assert_eq!(c.on_withdraw_result(U64(0)), OperationStatus::Succeeded);
    assert_eq!(c.confirmed_funds, 90 * N);
    invariant(&c);
}

#[test]
#[should_panic(expected = "Withdrawal exceeds")]
fn rejects_withdrawal_of_committed_money() {
    let mut c = funded();
    reserve(&mut c, 90 * N);
    ctx(DAO, 2);
    drop(c.withdraw_available(U128(10 * N), "dao-vault.testnet".parse().unwrap(), U64(1)));
}

#[test]
#[should_panic(expected = "Only the DAO")]
fn rejects_verifier_withdrawal() {
    let mut c = funded();
    ctx(VERIFIER, 2);
    drop(c.withdraw_available(U128(N), "recipient.testnet".parse().unwrap(), U64(1)));
}

#[test]
#[should_panic(expected = "Wrong callback")]
fn rejects_wrong_callback_kind() {
    let mut c = funded();
    ctx(DAO, 2);
    drop(c.withdraw_available(U128(N), "recipient.testnet".parse().unwrap(), U64(1)));
    set_context(
        CURRENT,
        3,
        0,
        1000 * N,
        vec![PromiseResult::Successful(vec![])],
    );
    c.on_drawdown_result(U64(0));
}

#[test]
#[should_panic(expected = "chosen verifier")]
fn rejects_attestation_by_other_account() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    ctx(DAO, 2);
    c.submit_attestation(
        id,
        "ab".repeat(32),
        "12".repeat(32),
        "cd".repeat(20),
        U64(1),
        U64(DEADLINE),
    );
}

#[test]
#[should_panic(expected = "approved policy")]
fn rejects_wrong_evidence_policy() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    ctx(VERIFIER, 2);
    c.submit_attestation(
        id,
        "ab".repeat(32),
        "34".repeat(32),
        "cd".repeat(20),
        U64(1),
        U64(DEADLINE),
    );
}

#[test]
#[should_panic(expected = "nonce was already used")]
fn rejects_attestation_replay() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    attest(&mut c, id);
    attest(&mut c, id);
}

#[test]
#[should_panic(expected = "evidence deadline")]
fn rejects_stale_evidence() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    ctx(VERIFIER, 2);
    c.submit_attestation(
        id,
        "ab".repeat(32),
        "12".repeat(32),
        "cd".repeat(20),
        U64(1),
        U64(2),
    );
}

#[test]
fn verifier_rotation_invalidates_unspent_evidence() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    attest(&mut c, id);
    assert!(c.get_reservation(id).unwrap().evidence.unwrap().usable);
    ctx(DAO, 3);
    c.set_verifier("replacement.testnet".parse().unwrap());
    assert!(!c.get_reservation(id).unwrap().evidence.unwrap().usable);
    ctx("replacement.testnet", 3);
    c.submit_attestation(
        id,
        "ab".repeat(32),
        "12".repeat(32),
        "cd".repeat(20),
        U64(2),
        U64(DEADLINE),
    );
    assert!(c.get_reservation(id).unwrap().evidence.unwrap().usable);
}

#[test]
fn actual_balance_shortfall_never_increases_capacity() {
    let c = funded();
    set_context(DAO, 2, 0, N, vec![]);
    assert_eq!(c.available(), 0);
    assert!(!c.get_treasury_state().physical_backing_check);
}

#[test]
fn growing_storage_reserve_is_protected() {
    let mut c = funded();
    c.configured_reserve = MIN_GAS_BUFFER;
    let before = c.effective_reserve();
    reserve(&mut c, N);
    assert!(c.effective_reserve() > before);
    assert!(c.available() < c.confirmed_funds - c.liabilities - MIN_GAS_BUFFER);
}

#[test]
#[should_panic(expected = "page size")]
fn rejects_unbounded_public_listing() {
    let c = funded();
    c.list_reservations(None, Some(1000));
}

#[test]
fn views_show_no_fabricated_evidence_before_verification() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    assert!(c.get_reservation(id).unwrap().evidence.is_none());
    assert!(c.get_reservation(U64(999)).is_none());
    assert!(c.get_operation(U64(999)).is_none());
    assert_eq!(c.list_reservations(None, Some(10)).len(), 1);
}

#[test]
fn full_payment_closes_commitment_and_returns_unused_storage_allowance() {
    let mut c = funded();
    let id = reserve(&mut c, 5 * N);
    attest(&mut c, id);
    let op = draw(&mut c, id, 5 * N, 1);
    settle(&mut c, op, 4, true);
    let r = c.get_reservation(id).unwrap();
    assert_eq!(r.status, ReservationStatus::Completed);
    assert_eq!(r.payment_attempts_left, 0);
    assert_eq!(c.reserved_operation_bytes, 0);
    invariant(&c);
}

#[test]
fn cancellation_during_successful_payout_does_not_double_release() {
    let mut c = funded();
    let id = reserve(&mut c, 20 * N);
    attest(&mut c, id);
    let op = draw(&mut c, id, 5 * N, 1);
    ctx(DAO, 4);
    assert_eq!(c.cancel_reservation(id).0, 15 * N);
    settle(&mut c, op, 5, true);
    assert_eq!(c.confirmed_funds, 95 * N);
    assert_eq!(c.liabilities, 0);
    assert_eq!(c.reserved_operation_bytes, 0);
    invariant(&c);
}

#[test]
fn failed_callback_after_expiry_without_cleanup_releases_full_unused_liability() {
    let mut c = funded();
    let id = reserve(&mut c, 20 * N);
    attest(&mut c, id);
    let op = draw(&mut c, id, 5 * N, 1);
    settle(&mut c, op, DEADLINE, false);
    assert_eq!(c.confirmed_funds, 100 * N);
    assert_eq!(c.liabilities, 0);
    assert_eq!(
        c.get_reservation(id).unwrap().status,
        ReservationStatus::Expired
    );
    invariant(&c);
}

#[test]
fn prepaid_storage_allows_payment_when_ledger_has_no_free_capacity() {
    let mut c = funded();
    c.configured_reserve = MIN_GAS_BUFFER;
    let id = reserve(&mut c, 20 * N);
    attest(&mut c, id);
    c.confirmed_funds = c.effective_reserve() + c.liabilities;
    assert_eq!(c.available(), 0);
    let op = draw(&mut c, id, N, 1);
    assert_eq!(
        c.get_operation(op).unwrap().status,
        OperationStatus::Pending
    );
    assert!(c.get_treasury_state().ledger_solvent);
    invariant(&c);
}

#[test]
fn pending_state_survives_serialization_and_then_reconciles() {
    let mut c = funded();
    let id = reserve(&mut c, 20 * N);
    attest(&mut c, id);
    let op = draw(&mut c, id, 5 * N, 1);
    let bytes = near_sdk::borsh::to_vec(&c).unwrap();
    let mut restored: CommitmentFirewall = near_sdk::borsh::from_slice(&bytes).unwrap();
    assert_eq!(
        restored.get_operation(op).unwrap().status,
        OperationStatus::Pending
    );
    settle(&mut restored, op, 4, true);
    assert_eq!(restored.confirmed_funds, 95 * N);
    invariant(&restored);
}

#[test]
#[should_panic(expected = "Payment attempt limit")]
fn repeated_failed_requests_cannot_create_unbounded_storage() {
    let mut c = funded();
    let id = reserve(&mut c, 20 * N);
    attest(&mut c, id);
    for nonce in 1..=u64::from(PAYMENT_ATTEMPTS) {
        let op = draw(&mut c, id, N, nonce);
        settle(&mut c, op, 4, false);
        invariant(&c);
    }
    assert_eq!(c.get_reservation(id).unwrap().payment_attempts_left, 0);
    draw(&mut c, id, N, u64::from(PAYMENT_ATTEMPTS) + 1);
}

#[test]
#[should_panic(expected = "Only the DAO")]
fn rejects_beneficiary_cancellation() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    ctx(BENEFICIARY, 3);
    c.cancel_reservation(id);
}

#[test]
#[should_panic(expected = "chosen verifier")]
fn rejects_rotated_out_verifier() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    ctx(DAO, 3);
    c.set_verifier("replacement.testnet".parse().unwrap());
    attest(&mut c, id);
}

#[test]
#[should_panic(expected = "verified evidence")]
fn rejects_attestation_that_expired_before_the_commitment() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    ctx(VERIFIER, 2);
    c.submit_attestation(
        id,
        "ab".repeat(32),
        "12".repeat(32),
        "cd".repeat(20),
        U64(1),
        U64(3),
    );
    draw(&mut c, id, N, 1);
}

#[test]
#[should_panic(expected = "exactly one")]
fn rejects_callback_with_multiple_results() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    attest(&mut c, id);
    let op = draw(&mut c, id, N, 1);
    set_context(
        CURRENT,
        4,
        0,
        1000 * N,
        vec![PromiseResult::Successful(vec![]), PromiseResult::Failed],
    );
    c.on_drawdown_result(op);
}

#[test]
#[should_panic(expected = "unexpected data")]
fn rejects_success_response_with_unexpected_native_transfer_data() {
    let mut c = funded();
    let id = reserve(&mut c, N);
    attest(&mut c, id);
    let op = draw(&mut c, id, N, 1);
    set_context(
        CURRENT,
        4,
        0,
        1000 * N,
        vec![PromiseResult::Successful(vec![1])],
    );
    c.on_drawdown_result(op);
}

#[test]
fn emergency_verifier_rotation_does_not_require_spendable_funds() {
    let mut c = funded();
    set_context(DAO, 2, 0, 1, vec![]);
    c.set_verifier("emergency.testnet".parse().unwrap());
    assert_eq!(c.verifier_epoch, 1);
    assert_eq!(c.available(), 0);
}

#[test]
#[should_panic(expected = "Withdrawal nonce was already used")]
fn replayed_withdrawal_cannot_schedule_a_second_transfer() {
    let mut c = funded();
    ctx(DAO, 2);
    drop(c.withdraw_available(U128(N), "recipient.testnet".parse().unwrap(), U64(1)));
    set_context(
        CURRENT,
        3,
        0,
        1000 * N,
        vec![PromiseResult::Successful(vec![])],
    );
    c.on_withdraw_result(U64(0));
    ctx(DAO, 4);
    drop(c.withdraw_available(U128(N), "recipient.testnet".parse().unwrap(), U64(1)));
}

#[test]
fn failed_withdrawal_retry_requires_a_new_nonce() {
    let mut c = funded();
    ctx(DAO, 2);
    drop(c.withdraw_available(U128(N), "recipient.testnet".parse().unwrap(), U64(1)));
    set_context(CURRENT, 3, 0, 1000 * N, vec![PromiseResult::Failed]);
    c.on_withdraw_result(U64(0));
    ctx(DAO, 4);
    drop(c.withdraw_available(U128(N), "recipient.testnet".parse().unwrap(), U64(2)));
    assert_eq!(c.pending_withdrawals, N);
    assert_eq!(c.next_operation_id, 2);
    invariant(&c);
}
