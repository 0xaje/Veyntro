use near_sdk::{
    AccountId,
    json_types::{U64, U128},
    near,
};

#[near(serializers = [borsh, json])]
#[derive(Clone, Copy, PartialEq, Debug)]
pub enum ReservationStatus {
    Active,
    Cancelled,
    Expired,
    Completed,
}

#[near(serializers = [borsh, json])]
#[derive(Clone, Copy, PartialEq, Debug)]
pub enum OperationStatus {
    Pending,
    Succeeded,
    Failed,
}

#[near(serializers = [borsh, json])]
#[derive(Clone, Copy, PartialEq, Debug)]
pub enum OperationKind {
    Payout,
    Withdrawal,
}

// Fixed-size evidence fields reserve storage before anyone can request payment.
#[near(serializers = [borsh])]
#[derive(Clone, Default)]
pub(crate) struct Evidence {
    pub verified: bool,
    pub digest: [u8; 32],
    pub commit: [u8; 20],
    pub nonce: u64,
    pub valid_until: u64,
    pub verifier_epoch: u64,
}

#[near(serializers = [borsh])]
#[derive(Clone)]
pub(crate) struct Reservation {
    pub operation_slots: u8,
    pub beneficiary: AccountId,
    pub recipient: AccountId,
    pub approved: u128,
    pub remaining: u128,
    pub pending: u128,
    pub expires_at: u64,
    pub policy_hash: [u8; 32],
    pub evidence: Evidence,
    pub last_drawdown_nonce: u64,
    pub status: ReservationStatus,
}

#[near(serializers = [borsh])]
#[derive(Clone)]
pub(crate) struct Operation {
    pub kind: OperationKind,
    pub reservation_id: u64,
    pub amount: u128,
    pub recipient: AccountId,
    pub status: OperationStatus,
    pub created_at: u64,
    pub completed_at: u64,
}

#[near(serializers = [json])]
pub struct TreasuryState {
    pub dao_account_id: AccountId,
    pub verifier_account_id: AccountId,
    pub verifier_epoch: U64,
    pub confirmed_accountable_funds: U128,
    pub operating_reserve: U128,
    pub configured_reserve: U128,
    pub reservation_liabilities: U128,
    pub pending_payouts: U128,
    pub pending_withdrawals: U128,
    pub money_available: U128,
    pub actual_balance: U128,
    pub ledger_solvent: bool,
    pub physical_backing_check: bool,
    pub next_reservation_id: U64,
    pub next_operation_id: U64,
    pub last_withdrawal_nonce: U64,
}

#[near(serializers = [json])]
pub struct EvidenceView {
    pub evidence_digest: String,
    pub commit_sha: String,
    pub nonce: U64,
    pub valid_until_ns: U64,
    pub verifier_epoch: U64,
    pub usable: bool,
}

#[near(serializers = [json])]
pub struct ReservationView {
    pub payment_attempts_left: u8,
    pub id: U64,
    pub beneficiary: AccountId,
    pub payout_recipient: AccountId,
    pub approved_amount: U128,
    pub remaining_liability: U128,
    pub pending_amount: U128,
    pub expires_at_ns: U64,
    pub evidence_policy_hash: String,
    pub evidence: Option<EvidenceView>,
    pub last_drawdown_nonce: U64,
    pub status: ReservationStatus,
    pub is_expired: bool,
}

#[near(serializers = [json])]
pub struct OperationView {
    pub id: U64,
    pub kind: OperationKind,
    pub reservation_id: Option<U64>,
    pub amount: U128,
    pub recipient: AccountId,
    pub status: OperationStatus,
    pub created_at_ns: U64,
    pub completed_at_ns: U64,
}
