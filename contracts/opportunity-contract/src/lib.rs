use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{UnorderedMap, UnorderedSet};
use near_sdk::json_types::{U128, U64};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, near_bindgen, AccountId, PanicOnDefault, require, log, Timestamp
};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Allocation {
    pub account_id: AccountId,
    pub amount: U128,
    pub timestamp: Timestamp,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct OpportunityConfig {
    pub owner_id: AccountId,
    pub name: String,
    pub description: String,
    pub apy: u16, // Basis points (e.g., 1250 = 12.5%)
    pub min_allocation: U128,
    pub max_allocation: U128,
    pub total_capacity: U128,
    pub is_active: bool,
    pub category: String,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct AllocationEvent {
    pub account_id: AccountId,
    pub amount: U128,
    pub timestamp: Timestamp,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct WithdrawalEvent {
    pub account_id: AccountId,
    pub amount: U128,
    pub yield_earned: U128,
    pub timestamp: Timestamp,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct OpportunityContract {
    pub config: OpportunityConfig,
    pub total_allocated: U128,
    pub allocations: UnorderedMap<AccountId, Allocation>,
    pub allocation_events: Vec<AllocationEvent>,
    pub withdrawal_events: Vec<WithdrawalEvent>,
    pub total_participants: u64,
}

#[near_bindgen]
impl OpportunityContract {
    #[init]
    pub fn new(
        owner_id: AccountId,
        name: String,
        description: String,
        apy: u16,
        min_allocation: U128,
        max_allocation: U128,
        total_capacity: U128,
        category: String,
    ) -> Self {
        require!(env::state_exists() == false, "Already initialized");
        
        let config = OpportunityConfig {
            owner_id: owner_id.clone(),
            name: name.clone(),
            description,
            apy,
            min_allocation,
            max_allocation,
            total_capacity,
            is_active: true,
            category,
        };

        Self {
            config,
            total_allocated: U128(0),
            allocations: UnorderedMap::new(b"allocations".to_vec()),
            allocation_events: Vec::new(),
            withdrawal_events: Vec::new(),
            total_participants: 0,
        }
    }

    // View functions
    pub fn get_config(&self) -> OpportunityConfig {
        self.config.clone()
    }

    pub fn get_total_allocated(&self) -> U128 {
        self.total_allocated
    }

    pub fn get_available_capacity(&self) -> U128 {
        U128(self.config.total_capacity.0 - self.total_allocated.0)
    }

    pub fn get_allocation(&self, account_id: AccountId) -> Option<Allocation> {
        self.allocations.get(&account_id)
    }

    pub fn get_total_participants(&self) -> u64 {
        self.total_participants
    }

    pub fn get_allocation_events(&self, limit: Option<u64>) -> Vec<AllocationEvent> {
        let limit = limit.unwrap_or(100);
        self.allocation_events
            .iter()
            .rev()
            .take(limit as usize)
            .cloned()
            .collect()
    }

    pub fn get_withdrawal_events(&self, limit: Option<u64>) -> Vec<WithdrawalEvent> {
        let limit = limit.unwrap_or(100);
        self.withdrawal_events
            .iter()
            .rev()
            .take(limit as usize)
            .cloned()
            .collect()
    }

    // Allocation function
    pub fn allocate(&mut self, amount: U128) {
        require!(self.config.is_active, "Opportunity is not active");
        require!(amount.0 > 0, "Amount must be greater than zero");
        require!(amount.0 >= self.config.min_allocation.0, "Amount below minimum allocation");
        require!(amount.0 <= self.config.max_allocation.0, "Amount exceeds maximum allocation");

        let available_capacity = self.get_available_capacity();
        require!(amount.0 <= available_capacity.0, "Insufficient capacity");

        let account_id = env::predecessor_account_id();
        
        // Check if user already has an allocation
        let existing_allocation = self.allocations.get(&account_id);
        let new_total_amount = if let Some(existing) = existing_allocation {
            U128(existing.amount.0 + amount.0)
        } else {
            amount
        };

        require!(new_total_amount.0 <= self.config.max_allocation.0, "Total allocation exceeds maximum");

        // Update allocation
        let allocation = Allocation {
            account_id: account_id.clone(),
            amount: new_total_amount,
            timestamp: env::block_timestamp(),
        };

        let is_new_participant = existing_allocation.is_none();
        if is_new_participant {
            self.total_participants += 1;
        }

        self.allocations.insert(&account_id, &allocation);
        self.total_allocated = U128(self.total_allocated.0 + amount.0);

        // Emit allocation event
        let allocation_event = AllocationEvent {
            account_id: account_id.clone(),
            amount,
            timestamp: env::block_timestamp(),
        };
        self.allocation_events.push(allocation_event.clone());

        log!(
            "Allocation successful: {} allocated {} tokens to {}",
            account_id,
            amount.0,
            self.config.name
        );

        // Log event for external systems
        env::log_str(&format!(
            "EVENT_JSON:{{\"type\":\"allocation\",\"account_id\":\"{}\",\"amount\":\"{}\",\"opportunity\":\"{}\",\"timestamp\":{}}}",
            account_id,
            amount.0,
            self.config.name,
            env::block_timestamp()
        ));
    }

    // Withdrawal function
    pub fn withdraw(&mut self, amount: U128) {
        require!(self.config.is_active, "Opportunity is not active");
        require!(amount.0 > 0, "Amount must be greater than zero");

        let account_id = env::predecessor_account_id();
        let allocation = self.allocations.get(&account_id)
            .expect("No allocation found for this account");

        require!(amount.0 <= allocation.amount.0, "Insufficient allocation");

        // Calculate yield (simplified: APY * time_held / 365 days)
        let time_held = env::block_timestamp() - allocation.timestamp;
        let days_held = time_held / (24 * 60 * 60 * 1_000_000_000); // Convert to days
        let yield_rate = (self.config.apy as u128 * days_held) / 365;
        let yield_earned = U128((amount.0 * yield_rate) / 10000); // Convert basis points

        // Update allocation
        let new_allocation_amount = U128(allocation.amount.0 - amount.0);
        if new_allocation_amount.0 == 0 {
            self.allocations.remove(&account_id);
            self.total_participants -= 1;
        } else {
            let updated_allocation = Allocation {
                account_id: account_id.clone(),
                amount: new_allocation_amount,
                timestamp: allocation.timestamp,
            };
            self.allocations.insert(&account_id, &updated_allocation);
        }

        self.total_allocated = U128(self.total_allocated.0 - amount.0);

        // Emit withdrawal event
        let withdrawal_event = WithdrawalEvent {
            account_id: account_id.clone(),
            amount,
            yield_earned,
            timestamp: env::block_timestamp(),
        };
        self.withdrawal_events.push(withdrawal_event.clone());

        log!(
            "Withdrawal successful: {} withdrew {} tokens from {}, earned {} yield",
            account_id,
            amount.0,
            self.config.name,
            yield_earned.0
        );

        // Log event for external systems
        env::log_str(&format!(
            "EVENT_JSON:{{\"type\":\"withdrawal\",\"account_id\":\"{}\",\"amount\":\"{}\",\"yield_earned\":\"{}\",\"opportunity\":\"{}\",\"timestamp\":{}}}",
            account_id,
            amount.0,
            yield_earned.0,
            self.config.name,
            env::block_timestamp()
        ));
    }

    // Admin functions
    pub fn update_config(
        &mut self,
        name: Option<String>,
        description: Option<String>,
        apy: Option<u16>,
        min_allocation: Option<U128>,
        max_allocation: Option<U128>,
        total_capacity: Option<U128>,
        is_active: Option<bool>,
    ) {
        require!(
            env::predecessor_account_id() == self.config.owner_id,
            "Only owner can update config"
        );

        if let Some(name) = name {
            self.config.name = name;
        }
        if let Some(description) = description {
            self.config.description = description;
        }
        if let Some(apy) = apy {
            self.config.apy = apy;
        }
        if let Some(min_allocation) = min_allocation {
            self.config.min_allocation = min_allocation;
        }
        if let Some(max_allocation) = max_allocation {
            self.config.max_allocation = max_allocation;
        }
        if let Some(total_capacity) = total_capacity {
            self.config.total_capacity = total_capacity;
        }
        if let Some(is_active) = is_active {
            self.config.is_active = is_active;
        }

        log!("Updated opportunity config for: {}", self.config.name);
    }

    pub fn pause_opportunity(&mut self) {
        require!(
            env::predecessor_account_id() == self.config.owner_id,
            "Only owner can pause opportunity"
        );
        self.config.is_active = false;
        log!("Paused opportunity: {}", self.config.name);
    }

    pub fn unpause_opportunity(&mut self) {
        require!(
            env::predecessor_account_id() == self.config.owner_id,
            "Only owner can unpause opportunity"
        );
        self.config.is_active = true;
        log!("Unpaused opportunity: {}", self.config.name);
    }
}
