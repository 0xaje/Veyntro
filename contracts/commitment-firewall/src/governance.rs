use crate::types::{Evidence, Reservation, ReservationStatus};
use crate::{CommitmentFirewall, CommitmentFirewallExt, add, event, parse_hex};
use near_sdk::{
    AccountId, env,
    json_types::{U64, U128},
    near, require,
};

#[near]
impl CommitmentFirewall {
    #[payable]
    pub fn fund_treasury(&mut self) {
        self.assert_dao();
        let amount = env::attached_deposit().as_yoctonear();
        require!(amount > 0, "Attach money to fund the treasury");
        self.confirmed_funds = add(self.confirmed_funds, amount);
        event(
            "funded",
            near_sdk::serde_json::json!({"amount": U128(amount), "confirmed_funds": U128(self.confirmed_funds)}),
        );
    }

    pub fn create_reservation(
        &mut self,
        beneficiary: AccountId,
        payout_recipient: AccountId,
        amount: U128,
        expires_at_ns: U64,
        evidence_policy_hash: String,
    ) -> U64 {
        self.assert_dao();
        require!(
            amount.0 > 0 && amount.0 <= self.available(),
            "Not enough money available for this commitment"
        );
        require!(
            expires_at_ns.0 > env::block_timestamp(),
            "Choose a future deadline"
        );
        require!(
            payout_recipient != env::current_account_id(),
            "Choose a recipient outside this contract"
        );
        let policy_hash = parse_hex(&evidence_policy_hash);
        let id = self.next_reservation_id;
        self.next_reservation_id = id.checked_add(1).expect("Too many commitments");
        let reservation = Reservation {
            operation_slots: crate::PAYMENT_ATTEMPTS,
            beneficiary,
            recipient: payout_recipient,
            approved: amount.0,
            remaining: amount.0,
            pending: 0,
            expires_at: expires_at_ns.0,
            policy_hash,
            evidence: Evidence::default(),
            last_drawdown_nonce: 0,
            status: ReservationStatus::Active,
        };
        self.liabilities = add(self.liabilities, amount.0);
        self.reserved_operation_bytes = self
            .reserved_operation_bytes
            .checked_add(u64::from(crate::PAYMENT_ATTEMPTS) * crate::OPERATION_STORAGE_BYTES)
            .expect("Too much reserved operation storage");
        self.reservations.insert(&id, &reservation);
        self.assert_backed();
        event(
            "commitment_created",
            near_sdk::serde_json::json!({"id": U64(id), "beneficiary": reservation.beneficiary, "recipient": reservation.recipient, "amount": amount, "expires_at_ns": expires_at_ns, "policy_hash": evidence_policy_hash}),
        );
        U64(id)
    }

    pub fn cancel_reservation(&mut self, id: U64) -> U128 {
        self.assert_dao();
        let mut r = self
            .reservations
            .get(&id.0)
            .expect("Commitment was not found");
        if r.status != ReservationStatus::Active {
            return U128(0);
        }
        r.status = ReservationStatus::Cancelled;
        let released = self.release_unused(&mut r);
        self.reservations.insert(&id.0, &r);
        event(
            "commitment_cancelled",
            near_sdk::serde_json::json!({"id": id, "released": U128(released), "pending": U128(r.pending)}),
        );
        U128(released)
    }

    pub fn release_expired(&mut self, id: U64) -> U128 {
        let mut r = self
            .reservations
            .get(&id.0)
            .expect("Commitment was not found");
        require!(
            env::block_timestamp() >= r.expires_at,
            "This commitment has not expired"
        );
        if r.status != ReservationStatus::Active {
            return U128(0);
        }
        r.status = ReservationStatus::Expired;
        let released = self.release_unused(&mut r);
        self.reservations.insert(&id.0, &r);
        event(
            "commitment_expired",
            near_sdk::serde_json::json!({"id": id, "released": U128(released), "pending": U128(r.pending)}),
        );
        U128(released)
    }

    pub fn set_verifier(&mut self, new_verifier: AccountId) {
        self.assert_dao();
        require!(
            new_verifier != self.dao_account_id && new_verifier != env::current_account_id(),
            "Use a separate verifier account"
        );
        self.verifier_epoch = self
            .verifier_epoch
            .checked_add(1)
            .expect("Too many verifier changes");
        self.verifier_account_id = new_verifier;
        event(
            "verifier_changed",
            near_sdk::serde_json::json!({"verifier": self.verifier_account_id, "epoch": U64(self.verifier_epoch)}),
        );
    }

    pub fn submit_attestation(
        &mut self,
        id: U64,
        evidence_digest: String,
        policy_hash: String,
        commit_sha: String,
        nonce: U64,
        valid_until_ns: U64,
    ) {
        require!(
            env::predecessor_account_id() == self.verifier_account_id,
            "Only the chosen verifier can check evidence"
        );
        let mut r = self
            .reservations
            .get(&id.0)
            .expect("Commitment was not found");
        require!(
            r.status == ReservationStatus::Active && env::block_timestamp() < r.expires_at,
            "This commitment is closed or expired"
        );
        require!(
            parse_hex::<32>(&policy_hash) == r.policy_hash,
            "Evidence does not match the approved policy"
        );
        require!(
            nonce.0
                == r.evidence
                    .nonce
                    .checked_add(1)
                    .expect("Too many evidence records"),
            "Evidence nonce was already used or is out of order"
        );
        require!(
            valid_until_ns.0 > env::block_timestamp() && valid_until_ns.0 <= r.expires_at,
            "Choose an evidence deadline within the commitment deadline"
        );
        r.evidence = Evidence {
            verified: true,
            digest: parse_hex(&evidence_digest),
            commit: parse_hex(&commit_sha),
            nonce: nonce.0,
            valid_until: valid_until_ns.0,
            verifier_epoch: self.verifier_epoch,
        };
        self.reservations.insert(&id.0, &r);
        event(
            "evidence_checked",
            near_sdk::serde_json::json!({"id": id, "evidence_digest": evidence_digest, "commit_sha": commit_sha, "policy_hash": policy_hash, "nonce": nonce, "valid_until_ns": valid_until_ns, "verifier": self.verifier_account_id, "epoch": U64(self.verifier_epoch)}),
        );
    }
}
