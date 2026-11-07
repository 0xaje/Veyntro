use near_sdk::json_types::U128;
use near_sdk::{AccountId, Gas, NearToken, PanicOnDefault, Promise, PromiseOrValue, collections::UnorderedMap, env, near, require};

const SUFFIX: &str = ".sputnikv2.testnet";
const FACTORY: &str = "setup.aje-veyntro.testnet";
const MIN_RESERVE: u128 = 50_000_000_000_000_000_000_000;
const INIT_GAS: Gas = Gas::from_tgas(30);
const CALLBACK_GAS: Gas = Gas::from_tgas(15);

#[cfg(target_arch = "wasm32")]
const FIREWALL_CODE: &[u8] = include_bytes!(concat!(env!("CARGO_MANIFEST_DIR"), "/../../target/wasm32-unknown-unknown/release/veyntro_commitment_firewall.wasm"));
#[cfg(not(target_arch = "wasm32"))]
const FIREWALL_CODE: &[u8] = b"host-test-placeholder";

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct CommunityFactory {
    // 1 = pending; 2 = ready; 3 = refund claimable; 4 = refunded; 5 = refund in flight.
    status: UnorderedMap<AccountId, u8>,
    deposits: UnorderedMap<AccountId, u128>,
}

#[near]
impl CommunityFactory {
    #[init]
    pub fn new() -> Self {
        require!(env::predecessor_account_id() == env::current_account_id(), "Only this account can initialize");
        require!(env::current_account_id().as_str() == FACTORY, "Wrong factory account");
        Self { status: UnorderedMap::new(b"s"), deposits: UnorderedMap::new(b"d") }
    }

    pub fn get_status(&self, dao: AccountId) -> Option<u8> {
        self.status.get(&dao)
    }

    pub fn firewall_for(&self, dao: AccountId) -> AccountId {
        child_for(&dao)
    }

    /// Called by a DAO-approved FunctionCall proposal, never directly by a council wallet.
    #[payable]
    pub fn deploy(&mut self, verifier: AccountId, operating_reserve: U128) -> Promise {
        let dao = env::predecessor_account_id();
        let child = child_for(&dao);
        require!(self.status.get(&dao).is_none(), "This DAO already started setup");
        require!(verifier != dao && verifier != child && verifier != env::current_account_id(), "Choose a separate verifier");
        require!(operating_reserve.0 >= MIN_RESERVE, "Reserve must be at least 0.05 NEAR");
        require!(env::attached_deposit().as_yoctonear() >= operating_reserve.0, "Setup deposit must cover reserve");
        self.status.insert(&dao, &1);
        self.deposits.insert(&dao, &env::attached_deposit().as_yoctonear());
        let args = near_sdk::serde_json::to_vec(&near_sdk::serde_json::json!({
            "dao_account_id": dao,
            "verifier_account_id": verifier,
            "operating_reserve": operating_reserve,
        })).expect("Serialize setup arguments");
        let callback_args = near_sdk::serde_json::to_vec(&near_sdk::serde_json::json!({"dao": dao})).expect("Serialize callback arguments");
        Promise::new(child)
            .create_account()
            .transfer(env::attached_deposit())
            .deploy_contract(FIREWALL_CODE.to_vec())
            .function_call("new_from_factory".to_string(), args, NearToken::from_yoctonear(0), INIT_GAS)
            .then(Promise::new(env::current_account_id()).function_call(
                "on_deployed".to_string(), callback_args, NearToken::from_yoctonear(0), CALLBACK_GAS,
            ))
    }

    #[private]
    pub fn on_deployed(&mut self, dao: AccountId) -> PromiseOrValue<bool> {
        require!(self.status.get(&dao) == Some(1), "No pending setup");
        require!(env::promise_results_count() == 1, "Expected one deployment receipt");
        let succeeded = env::promise_result_checked(0, 64).is_ok();
        if succeeded {
            self.status.insert(&dao, &2);
            self.deposits.remove(&dao);
            PromiseOrValue::Value(true)
        } else {
            self.status.insert(&dao, &3);
            PromiseOrValue::Promise(self.start_refund(dao))
        }
    }

    /// A DAO can retry a failed refund, never a successful deployment.
    pub fn claim_refund(&mut self) -> Promise {
        let dao = env::predecessor_account_id();
        require!(self.status.get(&dao) == Some(3), "No refund is available");
        self.start_refund(dao)
    }

    #[private]
    pub fn on_refunded(&mut self, dao: AccountId) -> bool {
        require!(self.status.get(&dao) == Some(5), "No refund in flight");
        require!(env::promise_results_count() == 1, "Expected one refund receipt");
        let succeeded = env::promise_result_checked(0, 64).is_ok();
        self.status.insert(&dao, &(if succeeded { 4 } else { 3 }));
        if succeeded { self.deposits.remove(&dao); }
        succeeded
    }
}

impl CommunityFactory {
    fn start_refund(&mut self, dao: AccountId) -> Promise {
        let amount = self.deposits.get(&dao).expect("No recorded deposit");
        self.status.insert(&dao, &5);
        let args = near_sdk::serde_json::to_vec(&near_sdk::serde_json::json!({"dao": dao})).expect("Serialize refund callback");
        Promise::new(dao).transfer(NearToken::from_yoctonear(amount)).then(
            Promise::new(env::current_account_id()).function_call(
                "on_refunded".to_string(), args, NearToken::from_yoctonear(0), CALLBACK_GAS,
            )
        )
    }
}

fn child_for(dao: &AccountId) -> AccountId {
    let slug = dao.as_str().strip_suffix(SUFFIX).expect("Use a SputnikDAO testnet account");
    require!(!slug.is_empty() && slug.len() <= 28 && slug.bytes().all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'-'), "Invalid DAO name");
    format!("{slug}.{FACTORY}").parse().expect("Valid child account")
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::{PromiseResult, RuntimeFeesConfig, test_vm_config, testing_env};
    use std::collections::HashMap;

    fn context(caller: &str, deposit: u128) {
        let mut c = VMContextBuilder::new();
        c.current_account_id(FACTORY.parse().unwrap())
            .predecessor_account_id(caller.parse().unwrap())
            .attached_deposit(NearToken::from_yoctonear(deposit));
        testing_env!(c.build());
    }

    #[test]
    fn derives_child_from_dao_only() {
        assert_eq!(child_for(&"group.sputnikv2.testnet".parse().unwrap()).as_str(), "group.setup.aje-veyntro.testnet");
    }

    #[test]
    #[should_panic(expected = "Use a SputnikDAO testnet account")]
    fn rejects_non_dao_caller() {
        context(FACTORY, 0);
        let mut f = CommunityFactory::new();
        context("stranger.testnet", MIN_RESERVE);
        let _ = f.deploy("verifier.testnet".parse().unwrap(), U128(MIN_RESERVE));
    }

    #[test]
    #[should_panic(expected = "This DAO already started setup")]
    fn rejects_duplicate_setup() {
        context(FACTORY, 0);
        let mut f = CommunityFactory::new();
        context("group.sputnikv2.testnet", MIN_RESERVE);
        let _ = f.deploy("verifier.testnet".parse().unwrap(), U128(MIN_RESERVE));
        let _ = f.deploy("verifier.testnet".parse().unwrap(), U128(MIN_RESERVE));
    }

    #[test]
    #[should_panic(expected = "Choose a separate verifier")]
    fn rejects_dao_as_verifier() {
        context(FACTORY, 0);
        let mut f = CommunityFactory::new();
        context("group.sputnikv2.testnet", MIN_RESERVE);
        let _ = f.deploy("group.sputnikv2.testnet".parse().unwrap(), U128(MIN_RESERVE));
    }

    #[test]
    #[should_panic(expected = "Setup deposit must cover reserve")]
    fn rejects_underfunded_setup() {
        context(FACTORY, 0);
        let mut f = CommunityFactory::new();
        context("group.sputnikv2.testnet", 0);
        let _ = f.deploy("verifier.testnet".parse().unwrap(), U128(MIN_RESERVE));
    }

    #[test]
    fn failed_batch_starts_refund_and_successful_refund_closes_it() {
        context(FACTORY, 0);
        let mut f = CommunityFactory::new();
        let dao: AccountId = "group.sputnikv2.testnet".parse().unwrap();
        context(dao.as_str(), MIN_RESERVE);
        let _ = f.deploy("verifier.testnet".parse().unwrap(), U128(MIN_RESERVE));
        assert_eq!(f.get_status(dao.clone()), Some(1));

        let mut b = VMContextBuilder::new();
        b.current_account_id(FACTORY.parse().unwrap())
            .predecessor_account_id(FACTORY.parse().unwrap())
            .account_balance(NearToken::from_yoctonear(10 * MIN_RESERVE));
        testing_env!(b.build(), test_vm_config(), RuntimeFeesConfig::test(), HashMap::default(), vec![PromiseResult::Failed]);
        let _ = f.on_deployed(dao.clone());
        assert_eq!(f.get_status(dao.clone()), Some(5));

        testing_env!(b.build(), test_vm_config(), RuntimeFeesConfig::test(), HashMap::default(), vec![PromiseResult::Successful(vec![])]);
        assert!(f.on_refunded(dao.clone()));
        assert_eq!(f.get_status(dao.clone()), Some(4));
        assert!(f.deposits.get(&dao).is_none());
    }
}
