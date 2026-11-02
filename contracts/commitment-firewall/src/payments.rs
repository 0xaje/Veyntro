use crate::types::{Operation, OperationKind, OperationStatus};
use crate::{CommitmentFirewall, CommitmentFirewallExt, add, event, sub};
use near_sdk::{
    AccountId, Gas, NearToken, Promise, PromiseError, env,
    json_types::{U64, U128},
    near, require,
};

const CALLBACK_GAS: Gas = Gas::from_tgas(30);
const MIN_PAYMENT_GAS: Gas = Gas::from_tgas(80);

#[near]
impl CommitmentFirewall {
    pub fn request_drawdown(&mut self, id: U64, amount: U128, operation_nonce: U64) -> Promise {
        let mut r = self
            .reservations
            .get(&id.0)
            .expect("Commitment was not found");
        require!(
            env::predecessor_account_id() == r.beneficiary,
            "Only the beneficiary can request payment"
        );
        require!(
            self.evidence_usable(&r),
            "Commitment needs current verified evidence and must not be expired"
        );
        require!(r.pending == 0, "Wait for the pending payment to finish");
        require!(
            r.operation_slots > 0,
            "Payment attempt limit reached; ask the DAO for a new commitment"
        );
        require!(
            amount.0 > 0 && amount.0 <= r.remaining,
            "Payment is larger than the money set aside"
        );
        require!(
            operation_nonce.0
                == r.last_drawdown_nonce
                    .checked_add(1)
                    .expect("Too many payment requests"),
            "Payment nonce was already used or is out of order"
        );
        require!(
            env::prepaid_gas() >= MIN_PAYMENT_GAS,
            "Attach at least 80 Tgas for payment and callback"
        );
        let op_id = self.next_operation_id;
        let storage_before = env::storage_usage();
        self.next_operation_id = op_id.checked_add(1).expect("Too many operations");
        let operation = Operation {
            kind: OperationKind::Payout,
            reservation_id: id.0,
            amount: amount.0,
            recipient: r.recipient.clone(),
            status: OperationStatus::Pending,
            created_at: env::block_timestamp(),
            completed_at: 0,
        };
        r.pending = amount.0;
        r.operation_slots -= 1;
        self.reserved_operation_bytes = self
            .reserved_operation_bytes
            .checked_sub(crate::OPERATION_STORAGE_BYTES)
            .expect("Missing operation storage reserve");
        r.last_drawdown_nonce = operation_nonce.0;
        self.pending_payouts = add(self.pending_payouts, amount.0);
        self.reservations.insert(&id.0, &r);
        self.operations.insert(&op_id, &operation);
        require!(
            env::storage_usage().saturating_sub(storage_before) <= crate::OPERATION_STORAGE_BYTES,
            "Operation exceeds its storage allowance"
        );
        self.assert_backed();
        event(
            "payment_pending",
            near_sdk::serde_json::json!({"operation_id": U64(op_id), "reservation_id": id, "amount": amount, "recipient": r.recipient, "nonce": operation_nonce}),
        );
        self.transfer_with_callback(&operation, op_id, "on_drawdown_result")
    }

    pub fn withdraw_available(
        &mut self,
        amount: U128,
        recipient: AccountId,
        operation_nonce: U64,
    ) -> Promise {
        self.assert_dao();
        require!(
            operation_nonce.0
                == self
                    .last_withdrawal_nonce
                    .checked_add(1)
                    .expect("Too many withdrawals"),
            "Withdrawal nonce was already used or is out of order"
        );
        require!(
            recipient != env::current_account_id(),
            "Choose a recipient outside this contract"
        );
        require!(
            amount.0 > 0 && amount.0 <= self.available(),
            "Withdrawal exceeds money available"
        );
        require!(
            env::prepaid_gas() >= MIN_PAYMENT_GAS,
            "Attach at least 80 Tgas for withdrawal and callback"
        );
        let id = self.next_operation_id;
        self.next_operation_id = id.checked_add(1).expect("Too many operations");
        self.last_withdrawal_nonce = operation_nonce.0;
        let operation = Operation {
            kind: OperationKind::Withdrawal,
            reservation_id: 0,
            amount: amount.0,
            recipient,
            status: OperationStatus::Pending,
            created_at: env::block_timestamp(),
            completed_at: 0,
        };
        self.pending_withdrawals = add(self.pending_withdrawals, amount.0);
        self.operations.insert(&id, &operation);
        self.assert_backed();
        event(
            "withdrawal_pending",
            near_sdk::serde_json::json!({"operation_id": U64(id), "amount": amount, "recipient": operation.recipient, "nonce": operation_nonce}),
        );
        self.transfer_with_callback(&operation, id, "on_withdraw_result")
    }

    #[private]
    pub fn on_drawdown_result(&mut self, operation_id: U64) -> OperationStatus {
        self.assert_callback();
        let mut operation = self
            .operations
            .get(&operation_id.0)
            .expect("Operation was not found");
        require!(
            operation.kind == OperationKind::Payout,
            "Wrong callback for this operation"
        );
        if operation.status != OperationStatus::Pending {
            return operation.status;
        }
        let succeeded = self.payment_result();
        let mut r = self
            .reservations
            .get(&operation.reservation_id)
            .expect("Commitment was not found");
        require!(
            r.pending == operation.amount,
            "Pending payment does not match the operation"
        );
        self.pending_payouts = sub(self.pending_payouts, operation.amount);
        r.pending = 0;
        if succeeded {
            self.confirmed_funds = sub(self.confirmed_funds, operation.amount);
            self.liabilities = sub(self.liabilities, operation.amount);
            r.remaining = sub(r.remaining, operation.amount);
        }
        let released = self.close_after_settlement(&mut r);
        self.reservations.insert(&operation.reservation_id, &r);
        self.finish_operation(operation_id.0, &mut operation, succeeded, released);
        operation.status
    }

    #[private]
    pub fn on_withdraw_result(&mut self, operation_id: U64) -> OperationStatus {
        self.assert_callback();
        let mut operation = self
            .operations
            .get(&operation_id.0)
            .expect("Operation was not found");
        require!(
            operation.kind == OperationKind::Withdrawal,
            "Wrong callback for this operation"
        );
        if operation.status != OperationStatus::Pending {
            return operation.status;
        }
        let succeeded = self.payment_result();
        self.pending_withdrawals = sub(self.pending_withdrawals, operation.amount);
        if succeeded {
            self.confirmed_funds = sub(self.confirmed_funds, operation.amount);
        }
        self.finish_operation(operation_id.0, &mut operation, succeeded, 0);
        operation.status
    }
}

impl CommitmentFirewall {
    fn assert_callback(&self) {
        require!(
            env::predecessor_account_id() == env::current_account_id(),
            "Only this contract can settle a payment"
        );
    }

    fn payment_result(&self) -> bool {
        require!(
            env::promise_results_count() == 1,
            "Expected exactly one payment result"
        );
        match env::promise_result_checked(0, 0) {
            Ok(_) => true,
            Err(PromiseError::Failed) => false,
            Err(_) => env::panic_str("Native transfer returned unexpected data"),
        }
    }

    fn transfer_with_callback(&self, operation: &Operation, id: u64, callback: &str) -> Promise {
        Promise::new(operation.recipient.clone())
            .transfer(NearToken::from_yoctonear(operation.amount))
            .then(
                Promise::new(env::current_account_id()).function_call(
                    callback.to_owned(),
                    near_sdk::serde_json::to_vec(
                        &near_sdk::serde_json::json!({"operation_id": U64(id)}),
                    )
                    .unwrap(),
                    NearToken::from_yoctonear(0),
                    CALLBACK_GAS,
                ),
            )
    }

    fn finish_operation(
        &mut self,
        id: u64,
        operation: &mut Operation,
        succeeded: bool,
        released: u128,
    ) {
        operation.status = if succeeded {
            OperationStatus::Succeeded
        } else {
            OperationStatus::Failed
        };
        operation.completed_at = env::block_timestamp();
        self.operations.insert(&id, operation);
        event(
            "operation_settled",
            near_sdk::serde_json::json!({"operation_id": U64(id), "kind": operation.kind, "status": operation.status, "amount": U128(operation.amount), "released": U128(released)}),
        );
    }
}
