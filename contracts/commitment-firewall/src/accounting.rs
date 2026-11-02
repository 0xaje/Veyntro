use crate::types::{Reservation, ReservationStatus};
use crate::{CommitmentFirewall, MIN_GAS_BUFFER, STATE_STORAGE_MARGIN, add, sub};
use near_sdk::{env, require};

impl CommitmentFirewall {
    pub(crate) fn assert_dao(&self) {
        require!(
            env::predecessor_account_id() == self.dao_account_id,
            "Only the DAO can approve this action"
        );
    }

    pub(crate) fn effective_reserve(&self) -> u128 {
        let bytes = env::storage_usage()
            .checked_add(STATE_STORAGE_MARGIN)
            .and_then(|n| n.checked_add(self.reserved_operation_bytes))
            .expect("Storage size is too large");
        let storage = u128::from(bytes)
            .checked_mul(env::storage_byte_cost().as_yoctonear())
            .expect("Storage cost is too large");
        self.configured_reserve.max(add(storage, MIN_GAS_BUFFER))
    }

    pub(crate) fn required_backing(&self, reserve: u128) -> Option<u128> {
        reserve
            .checked_add(self.liabilities)?
            .checked_add(self.pending_withdrawals)
    }

    pub(crate) fn available(&self) -> u128 {
        let Some(required) = self.required_backing(self.effective_reserve()) else {
            return 0;
        };
        // Conservative physical check can pause new actions until pending callbacks settle.
        self.confirmed_funds
            .min(env::account_balance().as_yoctonear())
            .saturating_sub(required)
    }

    pub(crate) fn assert_backed(&self) {
        let required = self
            .required_backing(self.effective_reserve())
            .expect("Required balance is too large");
        require!(
            self.confirmed_funds >= required,
            "Not enough money available after keeping reserves"
        );
        require!(
            env::account_balance().as_yoctonear() >= required,
            "Actual balance cannot back these commitments"
        );
    }

    pub(crate) fn release_unused(&mut self, r: &mut Reservation) -> u128 {
        self.reserved_operation_bytes = self
            .reserved_operation_bytes
            .checked_sub(u64::from(r.operation_slots) * crate::OPERATION_STORAGE_BYTES)
            .expect("Reserved operation storage is too small");
        r.operation_slots = 0;
        let released = sub(r.remaining, r.pending);
        r.remaining = sub(r.remaining, released);
        self.liabilities = sub(self.liabilities, released);
        released
    }

    pub(crate) fn close_after_settlement(&mut self, r: &mut Reservation) -> u128 {
        if r.status == ReservationStatus::Active && env::block_timestamp() >= r.expires_at {
            r.status = ReservationStatus::Expired;
        }
        if r.status != ReservationStatus::Active {
            self.release_unused(r)
        } else {
            if r.remaining == 0 {
                r.status = ReservationStatus::Completed;
                self.release_unused(r);
            }
            0
        }
    }
}
