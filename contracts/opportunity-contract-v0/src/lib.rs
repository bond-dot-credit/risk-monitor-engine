use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{UnorderedMap, Vector};
use near_sdk::json_types::{U128, U64};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, log, near_bindgen, AccountId, Balance, Gas, PanicOnDefault, Promise, PromiseResult,
    PublicKey, Timestamp,
};

// Gas constants
const GAS_FOR_FT_TRANSFER: Gas = Gas(10_000_000_000_000);
const GAS_FOR_FT_TRANSFER_CALL: Gas = Gas(25_000_000_000_000);
const GAS_FOR_STAKING_CALL: Gas = Gas(50_000_000_000_000);
const GAS_FOR_LENDING_CALL: Gas = Gas(30_000_000_000_000);

// Storage keys
const STORAGE_KEY_ALLOCATIONS: &[u8] = b"allocations";
const STORAGE_KEY_CAPITAL_ALLOCATED_EVENTS: &[u8] = b"capital_allocated_events";
const STORAGE_KEY_YIELD_CLAIMED_EVENTS: &[u8] = b"yield_claimed_events";

/// Yield strategy types
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub enum YieldStrategy {
    /// Staking wNEAR for NEAR rewards
    Staking,
    /// Lending USDC for interest
    Lending,
    /// Liquidity provision for trading fees
    LiquidityProvision,
}

impl YieldStrategy {
    pub fn get_description(&self) -> String {
        match self {
            YieldStrategy::Staking => "Stake wNEAR to earn NEAR rewards".to_string(),
            YieldStrategy::Lending => "Lend USDC to earn interest".to_string(),
            YieldStrategy::LiquidityProvision => "Provide liquidity for trading fees".to_string(),
        }
    }

    pub fn get_expected_apy(&self) -> u16 {
        match self {
            YieldStrategy::Staking => 12, // 12% APY
            YieldStrategy::Lending => 8,  // 8% APY
            YieldStrategy::LiquidityProvision => 15, // 15% APY
        }
    }
}

/// Opportunity configuration
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct OpportunityConfig {
    pub owner_id: AccountId,
    pub name: String,
    pub description: String,
    pub strategy: YieldStrategy,
    pub target_apy: u16, // Expected APY in basis points (100 = 1%)
    pub max_allocation: U128, // Maximum allocation per user
    pub total_capacity: U128, // Total capacity for this opportunity
    pub min_allocation: U128, // Minimum allocation
    pub is_active: bool,
    pub created_at: Timestamp,
}

/// User allocation information
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct UserAllocation {
    pub account_id: AccountId,
    pub allocated_amount: U128,
    pub allocation_timestamp: Timestamp,
    pub last_yield_claim: Timestamp,
    pub total_yield_claimed: U128,
    pub is_active: bool,
}

/// Capital allocated event
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct CapitalAllocatedEvent {
    pub account_id: AccountId,
    pub strategy: YieldStrategy,
    pub amount: U128,
    pub intent_hash: String, // NEAR Intent transaction hash
    pub timestamp: Timestamp,
    pub tx_hash: String,
}

/// Yield claimed event
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct YieldClaimedEvent {
    pub account_id: AccountId,
    pub strategy: YieldStrategy,
    pub yield_amount: U128,
    pub intent_hash: String, // NEAR Intent transaction hash
    pub timestamp: Timestamp,
    pub tx_hash: String,
}

/// NEAR Intent execution result
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct IntentExecutionResult {
    pub intent_hash: String,
    pub success: bool,
    pub gas_used: Gas,
    pub latency_ms: u64,
    pub error_message: Option<String>,
    pub timestamp: Timestamp,
}

/// Main opportunity contract
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct OpportunityContract {
    /// Opportunity configuration
    pub config: OpportunityConfig,
    /// Total allocated capital
    pub total_allocated: U128,
    /// User allocations
    pub allocations: UnorderedMap<AccountId, UserAllocation>,
    /// Capital allocated events
    pub capital_allocated_events: Vector<CapitalAllocatedEvent>,
    /// Yield claimed events
    pub yield_claimed_events: Vector<YieldClaimedEvent>,
    /// Intent execution results
    pub intent_execution_results: Vector<IntentExecutionResult>,
}

#[near_bindgen]
impl OpportunityContract {
    /// Initialize the opportunity contract
    #[init]
    pub fn new(
        owner_id: AccountId,
        name: String,
        description: String,
        strategy: YieldStrategy,
        target_apy: u16,
        max_allocation: U128,
        total_capacity: U128,
        min_allocation: U128,
    ) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        
        let config = OpportunityConfig {
            owner_id: owner_id.clone(),
            name,
            description,
            strategy: strategy.clone(),
            target_apy,
            max_allocation,
            total_capacity,
            min_allocation,
            is_active: true,
            created_at: env::block_timestamp(),
        };

        Self {
            config,
            total_allocated: U128(0),
            allocations: UnorderedMap::new(STORAGE_KEY_ALLOCATIONS),
            capital_allocated_events: Vector::new(STORAGE_KEY_CAPITAL_ALLOCATED_EVENTS),
            yield_claimed_events: Vector::new(STORAGE_KEY_YIELD_CLAIMED_EVENTS),
            intent_execution_results: Vector::new(b"intent_execution_results"),
        }
    }

    /// Get opportunity configuration
    pub fn get_config(&self) -> OpportunityConfig {
        self.config.clone()
    }

    /// Get total allocated capital
    pub fn get_total_allocated(&self) -> U128 {
        self.total_allocated
    }

    /// Get available capacity
    pub fn get_available_capacity(&self) -> U128 {
        U128(self.config.total_capacity.0 - self.total_allocated.0)
    }

    /// Get user allocation
    pub fn get_allocation(&self, account_id: AccountId) -> Option<UserAllocation> {
        self.allocations.get(&account_id)
    }

    /// Get total participants
    pub fn get_total_participants(&self) -> u32 {
        self.allocations.len()
    }

    /// Get active participants
    pub fn get_active_participants(&self) -> u32 {
        let mut active_count = 0;
        for (_, allocation) in self.allocations.iter() {
            if allocation.is_active {
                active_count += 1;
            }
        }
        active_count
    }

    /// Allocate capital to this opportunity using NEAR Intents
    pub fn allocate(&mut self, amount: U128) -> Promise {
        self.assert_active();
        self.assert_valid_allocation(amount);

        let sender_id = env::predecessor_account_id();
        log!("Allocating {} to opportunity {} by {}", amount.0, self.config.name, sender_id);

        // Check if user already has an allocation
        let existing_allocation = self.allocations.get(&sender_id);
        let new_total_amount = if let Some(existing) = existing_allocation {
            U128(existing.allocated_amount.0 + amount.0)
        } else {
            amount
        };

        // Check max allocation per user
        assert!(
            new_total_amount.0 <= self.config.max_allocation.0,
            "Exceeds maximum allocation per user"
        );

        // Update allocation
        let user_allocation = UserAllocation {
            account_id: sender_id.clone(),
            allocated_amount: new_total_amount,
            allocation_timestamp: env::block_timestamp(),
            last_yield_claim: env::block_timestamp(),
            total_yield_claimed: U128(0),
            is_active: true,
        };

        self.allocations.insert(&sender_id, &user_allocation);
        self.total_allocated = U128(self.total_allocated.0 + amount.0);

        // Execute NEAR Intent based on strategy
        self.execute_intent_for_allocation(sender_id, amount)
    }

    /// Execute NEAR Intent for capital allocation
    fn execute_intent_for_allocation(&mut self, account_id: AccountId, amount: U128) -> Promise {
        let intent_hash = self.generate_intent_hash(&account_id, &amount);
        
        match self.config.strategy {
            YieldStrategy::Staking => {
                // Execute staking intent
                self.execute_staking_intent(account_id, amount, intent_hash)
            }
            YieldStrategy::Lending => {
                // Execute lending intent
                self.execute_lending_intent(account_id, amount, intent_hash)
            }
            YieldStrategy::LiquidityProvision => {
                // Execute liquidity provision intent
                self.execute_liquidity_intent(account_id, amount, intent_hash)
            }
        }
    }

    /// Execute staking intent (stake wNEAR)
    fn execute_staking_intent(&mut self, account_id: AccountId, amount: U128, intent_hash: String) -> Promise {
        // For v0, we'll simulate staking by calling a mock staking contract
        // In production, this would integrate with real NEAR staking pools
        
        log!("Executing staking intent: {} wNEAR for {}", amount.0, account_id);
        
        // Simulate staking contract call
        let staking_contract = "staking-pool.testnet".parse::<AccountId>().unwrap();
        
        Promise::new(staking_contract)
            .function_call(
                "stake".to_string(),
                serde_json::to_vec(&serde_json::json!({
                    "account_id": account_id,
                    "amount": amount.0.to_string()
                })).unwrap(),
                0, // No attached deposit for now
                GAS_FOR_STAKING_CALL,
            )
    }

    /// Execute lending intent (lend USDC)
    fn execute_lending_intent(&mut self, account_id: AccountId, amount: U128, intent_hash: String) -> Promise {
        // For v0, we'll simulate lending by calling a mock lending protocol
        // In production, this would integrate with real lending protocols like Burrow
        
        log!("Executing lending intent: {} USDC for {}", amount.0, account_id);
        
        // Simulate lending contract call
        let lending_contract = "lending-protocol.testnet".parse::<AccountId>().unwrap();
        
        Promise::new(lending_contract)
            .function_call(
                "supply".to_string(),
                serde_json::to_vec(&serde_json::json!({
                    "account_id": account_id,
                    "amount": amount.0.to_string(),
                    "token": "USDC"
                })).unwrap(),
                0, // No attached deposit for now
                GAS_FOR_LENDING_CALL,
            )
    }

    /// Execute liquidity provision intent
    fn execute_liquidity_intent(&mut self, account_id: AccountId, amount: U128, intent_hash: String) -> Promise {
        // For v0, we'll simulate liquidity provision
        // In production, this would integrate with real DEX protocols
        
        log!("Executing liquidity intent: {} tokens for {}", amount.0, account_id);
        
        // Simulate liquidity contract call
        let liquidity_contract = "liquidity-pool.testnet".parse::<AccountId>().unwrap();
        
        Promise::new(liquidity_contract)
            .function_call(
                "add_liquidity".to_string(),
                serde_json::to_vec(&serde_json::json!({
                    "account_id": account_id,
                    "amount": amount.0.to_string()
                })).unwrap(),
                0, // No attached deposit for now
                GAS_FOR_LENDING_CALL,
            )
    }

    /// Callback after intent execution
    #[private]
    pub fn on_intent_executed(
        &mut self,
        account_id: AccountId,
        amount: U128,
        intent_hash: String,
        success: bool,
    ) {
        let execution_result = IntentExecutionResult {
            intent_hash: intent_hash.clone(),
            success,
            gas_used: env::used_gas(),
            latency_ms: env::block_timestamp() % 1000, // Mock latency
            error_message: if success { None } else { Some("Intent execution failed".to_string()) },
            timestamp: env::block_timestamp(),
        };

        self.intent_execution_results.push(&execution_result);

        if success {
            // Log capital allocated event
            let capital_event = CapitalAllocatedEvent {
                account_id: account_id.clone(),
                strategy: self.config.strategy.clone(),
                amount,
                intent_hash,
                timestamp: env::block_timestamp(),
                tx_hash: env::block_hash().to_string(),
            };

            self.capital_allocated_events.push(&capital_event);
            
            // Limit events to last 1000
            if self.capital_allocated_events.len() > 1000 {
                self.capital_allocated_events.remove(0);
            }

            log!("Capital allocated successfully: {} to {} by {}", amount.0, self.config.name, account_id);
            
            // Emit event for indexing
            env::log_str(&format!(
                "EVENT_JSON:{{\"standard\":\"bond-credit-opportunity\",\"version\":\"1.0.0\",\"event\":\"capital_allocated\",\"data\":[{{\"account_id\":\"{}\",\"strategy\":\"{:?}\",\"amount\":\"{}\",\"intent_hash\":\"{}\",\"timestamp\":{}}}]}}",
                account_id,
                self.config.strategy,
                amount.0,
                capital_event.intent_hash,
                env::block_timestamp()
            ));
        } else {
            log!("Intent execution failed for {}: {}", account_id, amount.0);
        }
    }

    /// Claim yield from the opportunity
    pub fn claim_yield(&mut self) -> Promise {
        self.assert_active();
        
        let sender_id = env::predecessor_account_id();
        let allocation = self.allocations.get(&sender_id)
            .expect("No allocation found for this account");

        assert!(allocation.is_active, "Allocation is not active");

        // Calculate yield (simplified for v0)
        let yield_amount = self.calculate_yield(&allocation);
        
        if yield_amount.0 == 0 {
            panic!("No yield to claim");
        }

        log!("Claiming yield: {} for {}", yield_amount.0, sender_id);

        // Execute yield claim intent
        let intent_hash = self.generate_yield_intent_hash(&sender_id, &yield_amount);
        self.execute_yield_claim_intent(sender_id, yield_amount, intent_hash)
    }

    /// Calculate yield for an allocation
    fn calculate_yield(&self, allocation: &UserAllocation) -> U128 {
        // Simplified yield calculation for v0
        // In production, this would be more sophisticated
        let time_elapsed = env::block_timestamp() - allocation.last_yield_claim;
        let days_elapsed = time_elapsed / (24 * 60 * 60 * 1_000_000_000); // Convert nanoseconds to days
        
        if days_elapsed == 0 {
            return U128(0);
        }

        // Calculate yield based on APY
        let daily_rate = (self.config.target_apy as u128) * 100 / 36500; // Convert basis points to daily rate
        let yield_amount = (allocation.allocated_amount.0 * daily_rate * days_elapsed) / 10000;
        
        U128(yield_amount)
    }

    /// Execute yield claim intent
    fn execute_yield_claim_intent(&mut self, account_id: AccountId, yield_amount: U128, intent_hash: String) -> Promise {
        match self.config.strategy {
            YieldStrategy::Staking => {
                // Claim staking rewards
                let staking_contract = "staking-pool.testnet".parse::<AccountId>().unwrap();
                Promise::new(staking_contract)
                    .function_call(
                        "claim_rewards".to_string(),
                        serde_json::to_vec(&serde_json::json!({
                            "account_id": account_id
                        })).unwrap(),
                        0,
                        GAS_FOR_STAKING_CALL,
                    )
            }
            YieldStrategy::Lending => {
                // Claim lending rewards
                let lending_contract = "lending-protocol.testnet".parse::<AccountId>().unwrap();
                Promise::new(lending_contract)
                    .function_call(
                        "claim_rewards".to_string(),
                        serde_json::to_vec(&serde_json::json!({
                            "account_id": account_id
                        })).unwrap(),
                        0,
                        GAS_FOR_LENDING_CALL,
                    )
            }
            YieldStrategy::LiquidityProvision => {
                // Claim liquidity rewards
                let liquidity_contract = "liquidity-pool.testnet".parse::<AccountId>().unwrap();
                Promise::new(liquidity_contract)
                    .function_call(
                        "claim_fees".to_string(),
                        serde_json::to_vec(&serde_json::json!({
                            "account_id": account_id
                        })).unwrap(),
                        0,
                        GAS_FOR_LENDING_CALL,
                    )
            }
        }
    }

    /// Callback after yield claim
    #[private]
    pub fn on_yield_claimed(
        &mut self,
        account_id: AccountId,
        yield_amount: U128,
        intent_hash: String,
        success: bool,
    ) {
        if success {
            // Update user allocation
            if let Some(mut allocation) = self.allocations.get(&account_id) {
                allocation.last_yield_claim = env::block_timestamp();
                allocation.total_yield_claimed = U128(allocation.total_yield_claimed.0 + yield_amount.0);
                self.allocations.insert(&account_id, &allocation);
            }

            // Log yield claimed event
            let yield_event = YieldClaimedEvent {
                account_id: account_id.clone(),
                strategy: self.config.strategy.clone(),
                yield_amount,
                intent_hash,
                timestamp: env::block_timestamp(),
                tx_hash: env::block_hash().to_string(),
            };

            self.yield_claimed_events.push(&yield_event);
            
            // Limit events to last 1000
            if self.yield_claimed_events.len() > 1000 {
                self.yield_claimed_events.remove(0);
            }

            log!("Yield claimed successfully: {} by {}", yield_amount.0, account_id);
            
            // Emit event for indexing
            env::log_str(&format!(
                "EVENT_JSON:{{\"standard\":\"bond-credit-opportunity\",\"version\":\"1.0.0\",\"event\":\"yield_claimed\",\"data\":[{{\"account_id\":\"{}\",\"strategy\":\"{:?}\",\"yield_amount\":\"{}\",\"intent_hash\":\"{}\",\"timestamp\":{}}}]}}",
                account_id,
                self.config.strategy,
                yield_amount.0,
                yield_event.intent_hash,
                env::block_timestamp()
            ));
        } else {
            log!("Yield claim failed for {}", account_id);
        }
    }

    /// Get capital allocated events
    pub fn get_capital_allocated_events(&self, limit: Option<u32>) -> Vec<CapitalAllocatedEvent> {
        let limit = limit.unwrap_or(50);
        let mut events = Vec::new();
        
        let start = if self.capital_allocated_events.len() > limit {
            self.capital_allocated_events.len() - limit
        } else {
            0
        };
        
        for i in start..self.capital_allocated_events.len() {
            if let Some(event) = self.capital_allocated_events.get(i) {
                events.push(event);
            }
        }
        
        events
    }

    /// Get yield claimed events
    pub fn get_yield_claimed_events(&self, limit: Option<u32>) -> Vec<YieldClaimedEvent> {
        let limit = limit.unwrap_or(50);
        let mut events = Vec::new();
        
        let start = if self.yield_claimed_events.len() > limit {
            self.yield_claimed_events.len() - limit
        } else {
            0
        };
        
        for i in start..self.yield_claimed_events.len() {
            if let Some(event) = self.yield_claimed_events.get(i) {
                events.push(event);
            }
        }
        
        events
    }

    /// Get intent execution results
    pub fn get_intent_execution_results(&self, limit: Option<u32>) -> Vec<IntentExecutionResult> {
        let limit = limit.unwrap_or(50);
        let mut results = Vec::new();
        
        let start = if self.intent_execution_results.len() > limit {
            self.intent_execution_results.len() - limit
        } else {
            0
        };
        
        for i in start..self.intent_execution_results.len() {
            if let Some(result) = self.intent_execution_results.get(i) {
                results.push(result);
            }
        }
        
        results
    }

    /// Update opportunity configuration (owner only)
    pub fn update_config(&mut self, new_config: OpportunityConfig) {
        self.assert_owner();
        self.config = new_config;
        log!("Opportunity configuration updated");
    }

    /// Activate/deactivate opportunity (owner only)
    pub fn set_active(&mut self, is_active: bool) {
        self.assert_owner();
        self.config.is_active = is_active;
        log!("Opportunity {} by owner", if is_active { "activated" } else { "deactivated" });
    }

    /// Generate intent hash for tracking
    fn generate_intent_hash(&self, account_id: &AccountId, amount: &U128) -> String {
        let timestamp = env::block_timestamp();
        let nonce = env::random_seed();
        format!("{}-{}-{}-{}", account_id, amount.0, timestamp, nonce)
    }

    /// Generate yield intent hash
    fn generate_yield_intent_hash(&self, account_id: &AccountId, yield_amount: &U128) -> String {
        let timestamp = env::block_timestamp();
        let nonce = env::random_seed();
        format!("yield-{}-{}-{}-{}", account_id, yield_amount.0, timestamp, nonce)
    }

    /// Assert that the opportunity is active
    fn assert_active(&self) {
        assert!(self.config.is_active, "Opportunity is not active");
    }

    /// Assert valid allocation amount
    fn assert_valid_allocation(&self, amount: U128) {
        assert!(amount.0 >= self.config.min_allocation.0, "Amount below minimum allocation");
        assert!(
            amount.0 <= self.get_available_capacity().0,
            "Amount exceeds available capacity"
        );
    }

    /// Assert that the caller is the owner
    fn assert_owner(&self) {
        assert_eq!(
            env::predecessor_account_id(),
            self.config.owner_id,
            "Only owner can call this function"
        );
    }
}
