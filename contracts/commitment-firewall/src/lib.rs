mod accounting;
mod governance;
mod payments;
#[cfg(test)]
mod tests;
mod types;

use near_sdk::json_types::{U64, U128};
use near_sdk::{AccountId, PanicOnDefault, collections::UnorderedMap, env, near, require};
use types::{
    EvidenceView, Operation, OperationKind, OperationView, Reservation, ReservationStatus,
    ReservationView, TreasuryState,
};

pub use types::{OperationStatus, ReservationStatus as CommitmentStatus};

pub(crate) const MIN_GAS_BUFFER: u128 = 50_000_000_000_000_000_000_000; // 0.05 NEAR.
pub(crate) const STATE_STORAGE_MARGIN: u64 = 1024;
pub(crate) const OPERATION_STORAGE_BYTES: u64 = 1024;
pub(crate) const PAYMENT_ATTEMPTS: u8 = 32;

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct CommitmentFirewall {
    dao_account_id: AccountId,
    verifier_account_id: AccountId,
    verifier_epoch: u64,
    configured_reserve: u128,
    confirmed_funds: u128,
    liabilities: u128,
    pending_payouts: u128,
    pending_withdrawals: u128,
    reserved_operation_bytes: u64,
    next_reservation_id: u64,
    next_operation_id: u64,
    last_withdrawal_nonce: u64,
    reservations: UnorderedMap<u64, Reservation>,
    operations: UnorderedMap<u64, Operation>,
}

#[near]
impl CommitmentFirewall {
    #[init]
    pub fn new(
        dao_account_id: AccountId,
        verifier_account_id: AccountId,
        operating_reserve: U128,
    ) -> Self {
        require!(
            env::predecessor_account_id() == env::current_account_id(),
            "Only this account can set up the contract"
        );
        Self::initial_state(dao_account_id, verifier_account_id, operating_reserve)
    }

    /// The reviewed setup factory deploys a new child account and initializes it.
    /// This entry point cannot initialize the existing Veyntro deployment.
    #[init]
    pub fn new_from_factory(
        dao_account_id: AccountId,
        verifier_account_id: AccountId,
        operating_reserve: U128,
    ) -> Self {
        let factory: AccountId = "setup.aje-veyntro.testnet".parse().unwrap();
        require!(
            env::predecessor_account_id() == factory
                || env::predecessor_account_id() == env::current_account_id(),
            "Only the setup factory or this account can initialize"
        );
        require!(
            env::current_account_id().as_str().ends_with(".setup.aje-veyntro.testnet"),
            "Factory setup requires a factory child account"
        );
        Self::initial_state(dao_account_id, verifier_account_id, operating_reserve)
    }

    fn initial_state(
        dao_account_id: AccountId,
        verifier_account_id: AccountId,
        operating_reserve: U128,
    ) -> Self {
        require!(
            dao_account_id != env::current_account_id(),
            "Use a separate DAO account"
        );
        require!(
            verifier_account_id != env::current_account_id()
                && verifier_account_id != dao_account_id,
            "Use a separate verifier account"
        );
        require!(
            operating_reserve.0 >= MIN_GAS_BUFFER,
            "Keep at least 0.05 NEAR for operations"
        );
        Self {
            dao_account_id,
            verifier_account_id,
            verifier_epoch: 0,
            configured_reserve: operating_reserve.0,
            confirmed_funds: 0,
            liabilities: 0,
            pending_payouts: 0,
            pending_withdrawals: 0,
            reserved_operation_bytes: 0,
            next_reservation_id: 0,
            next_operation_id: 0,
            last_withdrawal_nonce: 0,
            reservations: UnorderedMap::new(b"r"),
            operations: UnorderedMap::new(b"o"),
        }
    }

    pub fn get_treasury_state(&self) -> TreasuryState {
        let reserve = self.effective_reserve();
        let required = self.required_backing(reserve);
        TreasuryState {
            dao_account_id: self.dao_account_id.clone(),
            verifier_account_id: self.verifier_account_id.clone(),
            verifier_epoch: U64(self.verifier_epoch),
            confirmed_accountable_funds: U128(self.confirmed_funds),
            operating_reserve: U128(reserve),
            configured_reserve: U128(self.configured_reserve),
            reservation_liabilities: U128(self.liabilities),
            pending_payouts: U128(self.pending_payouts),
            pending_withdrawals: U128(self.pending_withdrawals),
            money_available: U128(self.available()),
            actual_balance: U128(env::account_balance().as_yoctonear()),
            ledger_solvent: required.is_some_and(|n| self.confirmed_funds >= n),
            physical_backing_check: required
                .is_some_and(|n| env::account_balance().as_yoctonear() >= n),
            next_reservation_id: U64(self.next_reservation_id),
            next_operation_id: U64(self.next_operation_id),
            last_withdrawal_nonce: U64(self.last_withdrawal_nonce),
        }
    }

    pub fn get_reservation(&self, id: U64) -> Option<ReservationView> {
        self.reservations
            .get(&id.0)
            .map(|r| self.reservation_view(id.0, r))
    }

    pub fn list_reservations(
        &self,
        from_index: Option<U64>,
        limit: Option<u32>,
    ) -> Vec<ReservationView> {
        let limit = limit.unwrap_or(20);
        require!((1..=50).contains(&limit), "Choose a page size from 1 to 50");
        let start = from_index.unwrap_or(U64(0)).0;
        let end = start
            .saturating_add(u64::from(limit))
            .min(self.next_reservation_id);
        (start..end)
            .filter_map(|id| self.get_reservation(U64(id)))
            .collect()
    }

    pub fn get_operation(&self, id: U64) -> Option<OperationView> {
        self.operations.get(&id.0).map(|o| OperationView {
            id,
            kind: o.kind,
            reservation_id: (o.kind == OperationKind::Payout).then_some(U64(o.reservation_id)),
            amount: U128(o.amount),
            recipient: o.recipient,
            status: o.status,
            created_at_ns: U64(o.created_at),
            completed_at_ns: U64(o.completed_at),
        })
    }
}

impl CommitmentFirewall {
    fn reservation_view(&self, id: u64, r: Reservation) -> ReservationView {
        let usable = self.evidence_usable(&r);
        let evidence = r.evidence.verified.then(|| EvidenceView {
            evidence_digest: encode_hex(&r.evidence.digest),
            commit_sha: encode_hex(&r.evidence.commit),
            nonce: U64(r.evidence.nonce),
            valid_until_ns: U64(r.evidence.valid_until),
            verifier_epoch: U64(r.evidence.verifier_epoch),
            usable,
        });
        ReservationView {
            payment_attempts_left: r.operation_slots,
            id: U64(id),
            beneficiary: r.beneficiary,
            payout_recipient: r.recipient,
            approved_amount: U128(r.approved),
            remaining_liability: U128(r.remaining),
            pending_amount: U128(r.pending),
            expires_at_ns: U64(r.expires_at),
            evidence_policy_hash: encode_hex(&r.policy_hash),
            evidence,
            last_drawdown_nonce: U64(r.last_drawdown_nonce),
            status: r.status,
            is_expired: env::block_timestamp() >= r.expires_at,
        }
    }

    fn evidence_usable(&self, r: &Reservation) -> bool {
        r.status == ReservationStatus::Active
            && env::block_timestamp() < r.expires_at
            && r.evidence.verified
            && r.evidence.verifier_epoch == self.verifier_epoch
            && env::block_timestamp() < r.evidence.valid_until
    }
}

pub(crate) fn parse_hex<const N: usize>(value: &str) -> [u8; N] {
    require!(
        value.len() == N * 2 && value.is_ascii(),
        "Use a complete hexadecimal hash"
    );
    let mut bytes = [0u8; N];
    for (index, byte) in bytes.iter_mut().enumerate() {
        *byte = u8::from_str_radix(&value[index * 2..index * 2 + 2], 16)
            .expect("Hash must contain only hexadecimal characters");
    }
    require!(bytes.iter().any(|b| *b != 0), "Hash cannot be empty");
    bytes
}

fn encode_hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

pub(crate) fn add(a: u128, b: u128) -> u128 {
    a.checked_add(b).expect("Amount is too large")
}
pub(crate) fn sub(a: u128, b: u128) -> u128 {
    a.checked_sub(b).expect("Accounting balance is too small")
}
pub(crate) fn event(name: &str, data: near_sdk::serde_json::Value) {
    env::log_str(&format!(
        "EVENT_JSON:{}",
        near_sdk::serde_json::json!({
            "standard": "veyntro", "version": "1.0.0", "event": name, "data": [data]
        })
    ));
}
