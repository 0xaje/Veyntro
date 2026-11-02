use near_sdk::{
    AccountId, PanicOnDefault, env,
    json_types::{U64, U128},
    near, require,
};

const MAX_TOTAL_FUNDING: u128 = 10_000_000_000_000_000_000_000; // 0.01 NEAR.

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct DaoReceiver {
    dao_account_id: AccountId,
    total_received: u128,
    funding_count: u64,
}

#[near(serializers = [json])]
pub struct FundingState {
    pub dao_account_id: AccountId,
    pub total_received: U128,
    pub funding_count: U64,
}

#[near]
impl DaoReceiver {
    #[init]
    pub fn new(dao_account_id: AccountId) -> Self {
        require!(
            env::predecessor_account_id() == env::current_account_id(),
            "Only this contract account can set it up"
        );
        Self {
            dao_account_id,
            total_received: 0,
            funding_count: 0,
        }
    }

    #[payable]
    pub fn fund_treasury(&mut self) {
        require!(
            env::predecessor_account_id() == self.dao_account_id,
            "Only the DAO can add money"
        );
        let amount = env::attached_deposit().as_yoctonear();
        require!(amount > 0, "Attach some NEAR to add money");
        let total_received = self
            .total_received
            .checked_add(amount)
            .expect("Funding amount is too large");
        require!(
            total_received <= MAX_TOTAL_FUNDING,
            "This integration receiver accepts at most 0.01 NEAR in total"
        );
        let funding_count = self
            .funding_count
            .checked_add(1)
            .expect("Too many funding records");
        self.total_received = total_received;
        self.funding_count = funding_count;

        env::log_str(&format!(
            "EVENT_JSON:{}",
            near_sdk::serde_json::json!({
                "standard": "veyntro_receiver",
                "version": "1.0.0",
                "event": "funded",
                "data": [{
                    "dao_account_id": self.dao_account_id,
                    "amount": U128(amount),
                    "total_received": U128(total_received),
                    "funding_count": U64(funding_count)
                }]
            })
        ));
    }

    pub fn get_funding_state(&self) -> FundingState {
        FundingState {
            dao_account_id: self.dao_account_id.clone(),
            total_received: U128(self.total_received),
            funding_count: U64(self.funding_count),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::{
        NearToken,
        test_utils::{VMContextBuilder, get_logs},
        testing_env,
    };

    fn context(predecessor: &str, signer: &str, amount: u128) {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id("receiver.aje-veyntro.testnet".parse().unwrap())
            .predecessor_account_id(predecessor.parse().unwrap())
            .signer_account_id(signer.parse().unwrap())
            .attached_deposit(NearToken::from_yoctonear(amount));
        testing_env!(builder.build());
    }

    fn receiver() -> DaoReceiver {
        context(
            "receiver.aje-veyntro.testnet",
            "receiver.aje-veyntro.testnet",
            0,
        );
        DaoReceiver::new("veyntro.sputnikv2.testnet".parse().unwrap())
    }

    #[test]
    fn starts_with_no_recorded_funding() {
        let state = receiver().get_funding_state();
        assert_eq!(state.dao_account_id.as_str(), "veyntro.sputnikv2.testnet");
        assert_eq!(state.total_received.0, 0);
        assert_eq!(state.funding_count.0, 0);
    }

    #[test]
    #[should_panic(expected = "Only this contract account can set it up")]
    fn rejects_setup_by_another_account() {
        context("stranger.testnet", "stranger.testnet", 0);
        DaoReceiver::new("stranger.testnet".parse().unwrap());
    }

    #[test]
    fn accepts_dao_receipt_even_when_council_signed_the_original_transaction() {
        let mut contract = receiver();
        context("veyntro.sputnikv2.testnet", "aje-veyntro.testnet", 25);
        contract.fund_treasury();
        context("veyntro.sputnikv2.testnet", "aje-veyntro.testnet", 17);
        contract.fund_treasury();
        let state = contract.get_funding_state();
        assert_eq!(state.total_received.0, 42);
        assert_eq!(state.funding_count.0, 2);
        let logs = get_logs();
        let event: near_sdk::serde_json::Value = near_sdk::serde_json::from_str(
            logs.last().unwrap().strip_prefix("EVENT_JSON:").unwrap(),
        )
        .unwrap();
        assert_eq!(event["data"][0]["amount"], "17");
        assert_eq!(event["data"][0]["total_received"], "42");
    }

    #[test]
    #[should_panic(expected = "Only the DAO can add money")]
    fn rejects_council_bypassing_governance() {
        let mut contract = receiver();
        context("aje-veyntro.testnet", "aje-veyntro.testnet", 1);
        contract.fund_treasury();
    }

    #[test]
    #[should_panic(expected = "Only the DAO can add money")]
    fn rejects_signer_spoofing_through_another_contract() {
        let mut contract = receiver();
        context("stranger.testnet", "veyntro.sputnikv2.testnet", 1);
        contract.fund_treasury();
    }

    #[test]
    #[should_panic(expected = "Attach some NEAR")]
    fn rejects_zero_deposit() {
        let mut contract = receiver();
        context("veyntro.sputnikv2.testnet", "aje-veyntro.testnet", 0);
        contract.fund_treasury();
    }

    #[test]
    #[should_panic(expected = "Funding amount is too large")]
    fn rejects_amount_overflow() {
        let mut contract = receiver();
        contract.total_received = u128::MAX;
        context("veyntro.sputnikv2.testnet", "aje-veyntro.testnet", 1);
        contract.fund_treasury();
    }

    #[test]
    #[should_panic(expected = "at most 0.01 NEAR")]
    fn rejects_funding_above_the_integration_limit() {
        let mut contract = receiver();
        context(
            "veyntro.sputnikv2.testnet",
            "aje-veyntro.testnet",
            MAX_TOTAL_FUNDING,
        );
        contract.fund_treasury();
        context("veyntro.sputnikv2.testnet", "aje-veyntro.testnet", 1);
        contract.fund_treasury();
    }

    #[test]
    #[should_panic(expected = "Too many funding records")]
    fn rejects_counter_overflow() {
        let mut contract = receiver();
        contract.funding_count = u64::MAX;
        context("veyntro.sputnikv2.testnet", "aje-veyntro.testnet", 1);
        contract.fund_treasury();
    }
}
