use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{UnorderedMap, Vector};
use near_sdk::json_types::{U128, U64};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, log, near_bindgen, AccountId, Balance, Gas, PanicOnDefault, Promise, PromiseResult,
    PublicKey, Timestamp,
};

// Storage keys
const STORAGE_KEY_OPPORTUNITIES: &[u8] = b"opportunities";
const STORAGE_KEY_OPPORTUNITY_EVENTS: &[u8] = b"opportunity_events";
const STORAGE_KEY_SCORE_EVENTS: &[u8] = b"score_events";

/// Opportunity category
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub enum OpportunityCategory {
    Staking,
    Lending,
    Liquidity,
    Farming,
    Other,
}

/// Opportunity status
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub enum OpportunityStatus {
    Active,
    Inactive,
    Paused,
    Deprecated,
}

/// Opportunity configuration
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Opportunity {
    pub id: u32,
    pub name: String,
    pub description: String,
    pub category: OpportunityCategory,
    pub apy: u16, // APY in basis points (1200 = 12%)
    pub current_score: u16, // Score from 0-100
    pub contract_address: AccountId,
    pub token_address: Option<AccountId>,
    pub min_deposit: U128,
    pub max_deposit: U128,
    pub total_capacity: U128,
    pub current_tvl: U128,
    pub status: OpportunityStatus,
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
    pub created_by: AccountId,
}

/// Opportunity event types
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(crate = "near_sdk::serde")]
pub enum OpportunityEventType {
    Added,
    Updated,
    Removed,
    StatusChanged,
}

/// Opportunity management event
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct OpportunityEvent {
    pub event_type: OpportunityEventType,
    pub opportunity_id: u32,
    pub opportunity_name: String,
    pub old_data: Option<Opportunity>,
    pub new_data: Option<Opportunity>,
    pub timestamp: Timestamp,
    pub tx_hash: String,
    pub triggered_by: AccountId,
}

/// Score update event
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct ScoreUpdateEvent {
    pub opportunity_id: u32,
    pub opportunity_name: String,
    pub old_score: u16,
    pub new_score: u16,
    pub score_change: i16,
    pub timestamp: Timestamp,
    pub tx_hash: String,
    pub updated_by: AccountId,
}

/// Registry configuration
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct RegistryConfig {
    pub owner_id: AccountId,
    pub max_opportunities: u32,
    pub min_score_threshold: u16,
    pub is_paused: bool,
}

/// Main registry contract
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct RegistryContract {
    /// Registry configuration
    pub config: RegistryConfig,
    /// Next opportunity ID
    pub next_opportunity_id: u32,
    /// Opportunities storage
    pub opportunities: UnorderedMap<u32, Opportunity>,
    /// Opportunity events log
    pub opportunity_events: Vector<OpportunityEvent>,
    /// Score update events log
    pub score_events: Vector<ScoreUpdateEvent>,
}

#[near_bindgen]
impl RegistryContract {
    /// Initialize the registry contract
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        
        let config = RegistryConfig {
            owner_id: owner_id.clone(),
            max_opportunities: 100,
            min_score_threshold: 50,
            is_paused: false,
        };

        Self {
            config,
            next_opportunity_id: 1,
            opportunities: UnorderedMap::new(STORAGE_KEY_OPPORTUNITIES),
            opportunity_events: Vector::new(STORAGE_KEY_OPPORTUNITY_EVENTS),
            score_events: Vector::new(STORAGE_KEY_SCORE_EVENTS),
        }
    }

    /// Get registry configuration
    pub fn get_config(&self) -> RegistryConfig {
        self.config.clone()
    }

    /// Get total number of opportunities
    pub fn get_total_opportunities(&self) -> u32 {
        self.opportunities.len()
    }

    /// Get number of active opportunities
    pub fn get_active_opportunities_count(&self) -> u32 {
        let mut count = 0;
        for (_, opportunity) in self.opportunities.iter() {
            if opportunity.status == OpportunityStatus::Active {
                count += 1;
            }
        }
        count
    }

    /// Get all opportunities with pagination
    pub fn get_opportunities(&self, limit: Option<u32>, offset: Option<u32>) -> Vec<Opportunity> {
        let limit = limit.unwrap_or(50);
        let offset = offset.unwrap_or(0);
        
        let mut opportunities = Vec::new();
        let mut current_offset = 0;
        let mut count = 0;
        
        for (_, opportunity) in self.opportunities.iter() {
            if current_offset >= offset && count < limit {
                opportunities.push(opportunity);
                count += 1;
            }
            current_offset += 1;
        }
        
        opportunities
    }

    /// Get active opportunities only
    pub fn get_active_opportunities(&self, limit: Option<u32>, offset: Option<u32>) -> Vec<Opportunity> {
        let limit = limit.unwrap_or(50);
        let offset = offset.unwrap_or(0);
        
        let mut opportunities = Vec::new();
        let mut current_offset = 0;
        let mut count = 0;
        
        for (_, opportunity) in self.opportunities.iter() {
            if opportunity.status == OpportunityStatus::Active {
                if current_offset >= offset && count < limit {
                    opportunities.push(opportunity);
                    count += 1;
                }
                current_offset += 1;
            }
        }
        
        opportunities
    }

    /// Get opportunity by ID
    pub fn get_opportunity(&self, opportunity_id: u32) -> Option<Opportunity> {
        self.opportunities.get(&opportunity_id)
    }

    /// Get opportunities by category
    pub fn get_opportunities_by_category(&self, category: OpportunityCategory, limit: Option<u32>) -> Vec<Opportunity> {
        let limit = limit.unwrap_or(50);
        let mut opportunities = Vec::new();
        
        for (_, opportunity) in self.opportunities.iter() {
            if opportunity.category == category && opportunities.len() < limit as usize {
                opportunities.push(opportunity);
            }
        }
        
        opportunities
    }

    /// Get opportunities by score range
    pub fn get_opportunities_by_score_range(&self, min_score: u16, max_score: u16, limit: Option<u32>) -> Vec<Opportunity> {
        let limit = limit.unwrap_or(50);
        let mut opportunities = Vec::new();
        
        for (_, opportunity) in self.opportunities.iter() {
            if opportunity.current_score >= min_score && 
               opportunity.current_score <= max_score && 
               opportunities.len() < limit as usize {
                opportunities.push(opportunity);
            }
        }
        
        opportunities
    }

    /// Get top opportunities by score
    pub fn get_top_opportunities(&self, limit: Option<u32>) -> Vec<Opportunity> {
        let limit = limit.unwrap_or(10);
        let mut opportunities: Vec<Opportunity> = self.opportunities.iter().map(|(_, opp)| opp).collect();
        
        // Sort by score (descending)
        opportunities.sort_by(|a, b| b.current_score.cmp(&a.current_score));
        
        opportunities.truncate(limit as usize);
        opportunities
    }

    /// Add new opportunity (owner only)
    pub fn add_opportunity(
        &mut self,
        name: String,
        description: String,
        category: OpportunityCategory,
        apy: u16,
        contract_address: AccountId,
        token_address: Option<AccountId>,
        min_deposit: U128,
        max_deposit: U128,
        total_capacity: U128,
    ) -> u32 {
        self.assert_owner();
        self.assert_not_paused();
        assert!(
            self.opportunities.len() < self.config.max_opportunities,
            "Maximum number of opportunities reached"
        );

        let opportunity_id = self.next_opportunity_id;
        
        let opportunity = Opportunity {
            id: opportunity_id,
            name: name.clone(),
            description: description.clone(),
            category: category.clone(),
            apy,
            current_score: 75, // Default score for new opportunities
            contract_address,
            token_address,
            min_deposit,
            max_deposit,
            total_capacity,
            current_tvl: U128(0),
            status: OpportunityStatus::Active,
            created_at: env::block_timestamp(),
            updated_at: env::block_timestamp(),
            created_by: env::predecessor_account_id(),
        };

        self.opportunities.insert(&opportunity_id, &opportunity);
        self.next_opportunity_id += 1;

        // Log event
        self.log_opportunity_event(
            OpportunityEventType::Added,
            opportunity_id,
            name,
            None,
            Some(opportunity.clone()),
        );

        log!("Opportunity added: {} with ID {}", opportunity.name, opportunity_id);
        
        opportunity_id
    }

    /// Update opportunity (owner only)
    pub fn update_opportunity(
        &mut self,
        opportunity_id: u32,
        name: Option<String>,
        description: Option<String>,
        apy: Option<u16>,
        min_deposit: Option<U128>,
        max_deposit: Option<U128>,
        total_capacity: Option<U128>,
    ) {
        self.assert_owner();
        self.assert_not_paused();

        let mut opportunity = self.opportunities.get(&opportunity_id)
            .expect("Opportunity not found");

        let old_opportunity = opportunity.clone();

        // Update fields if provided
        if let Some(new_name) = name {
            opportunity.name = new_name;
        }
        if let Some(new_description) = description {
            opportunity.description = new_description;
        }
        if let Some(new_apy) = apy {
            opportunity.apy = new_apy;
        }
        if let Some(new_min_deposit) = min_deposit {
            opportunity.min_deposit = new_min_deposit;
        }
        if let Some(new_max_deposit) = max_deposit {
            opportunity.max_deposit = new_max_deposit;
        }
        if let Some(new_total_capacity) = total_capacity {
            opportunity.total_capacity = new_total_capacity;
        }

        opportunity.updated_at = env::block_timestamp();

        self.opportunities.insert(&opportunity_id, &opportunity);

        // Log event
        self.log_opportunity_event(
            OpportunityEventType::Updated,
            opportunity_id,
            opportunity.name.clone(),
            Some(old_opportunity),
            Some(opportunity.clone()),
        );

        log!("Opportunity updated: {}", opportunity.name);
    }

    /// Remove opportunity (owner only)
    pub fn remove_opportunity(&mut self, opportunity_id: u32) {
        self.assert_owner();
        self.assert_not_paused();

        let opportunity = self.opportunities.get(&opportunity_id)
            .expect("Opportunity not found");

        let opportunity_name = opportunity.name.clone();
        
        // Mark as deprecated instead of actually removing
        let mut deprecated_opportunity = opportunity.clone();
        deprecated_opportunity.status = OpportunityStatus::Deprecated;
        deprecated_opportunity.updated_at = env::block_timestamp();

        self.opportunities.insert(&opportunity_id, &deprecated_opportunity);

        // Log event
        self.log_opportunity_event(
            OpportunityEventType::StatusChanged,
            opportunity_id,
            opportunity_name,
            Some(opportunity),
            Some(deprecated_opportunity),
        );

        log!("Opportunity deprecated: {}", opportunity_name);
    }

    /// Update opportunity status (owner only)
    pub fn update_opportunity_status(&mut self, opportunity_id: u32, status: OpportunityStatus) {
        self.assert_owner();
        self.assert_not_paused();

        let mut opportunity = self.opportunities.get(&opportunity_id)
            .expect("Opportunity not found");

        let old_opportunity = opportunity.clone();
        opportunity.status = status.clone();
        opportunity.updated_at = env::block_timestamp();

        self.opportunities.insert(&opportunity_id, &opportunity);

        // Log event
        self.log_opportunity_event(
            OpportunityEventType::StatusChanged,
            opportunity_id,
            opportunity.name.clone(),
            Some(old_opportunity),
            Some(opportunity.clone()),
        );

        log!("Opportunity status updated: {} to {:?}", opportunity.name, status);
    }

    /// Update opportunity score (owner only)
    pub fn update_opportunity_score(&mut self, opportunity_id: u32, new_score: u16) {
        self.assert_owner();
        assert!(new_score <= 100, "Score must be between 0 and 100");

        let mut opportunity = self.opportunities.get(&opportunity_id)
            .expect("Opportunity not found");

        let old_score = opportunity.current_score;
        let score_change = new_score as i16 - old_score as i16;
        
        opportunity.current_score = new_score;
        opportunity.updated_at = env::block_timestamp();

        self.opportunities.insert(&opportunity_id, &opportunity);

        // Log score update event
        let score_event = ScoreUpdateEvent {
            opportunity_id,
            opportunity_name: opportunity.name.clone(),
            old_score,
            new_score,
            score_change,
            timestamp: env::block_timestamp(),
            tx_hash: env::block_hash().to_string(),
            updated_by: env::predecessor_account_id(),
        };

        self.score_events.push(&score_event);
        
        // Limit events to last 1000
        if self.score_events.len() > 1000 {
            self.score_events.remove(0);
        }

        // Emit event for indexing
        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"bond-credit-registry\",\"version\":\"1.0.0\",\"event\":\"score_updated\",\"data\":[{{\"opportunity_id\":{},\"opportunity_name\":\"{}\",\"old_score\":{},\"new_score\":{},\"score_change\":{},\"timestamp\":{}}}]}}",
            opportunity_id,
            opportunity.name,
            old_score,
            new_score,
            score_change,
            env::block_timestamp()
        ));

        log!("Opportunity score updated: {} from {} to {}", opportunity.name, old_score, new_score);
    }

    /// Update opportunity TVL (can be called by the opportunity contract)
    pub fn update_opportunity_tvl(&mut self, opportunity_id: u32, new_tvl: U128) {
        // Allow opportunity contracts to update their own TVL
        let opportunity = self.opportunities.get(&opportunity_id)
            .expect("Opportunity not found");

        // Verify caller is the opportunity contract
        assert_eq!(
            env::predecessor_account_id(),
            opportunity.contract_address,
            "Only the opportunity contract can update its TVL"
        );

        let mut updated_opportunity = opportunity.clone();
        updated_opportunity.current_tvl = new_tvl;
        updated_opportunity.updated_at = env::block_timestamp();

        self.opportunities.insert(&opportunity_id, &updated_opportunity);

        log!("TVL updated for {}: {}", updated_opportunity.name, new_tvl.0);
    }

    /// Get opportunity events
    pub fn get_opportunity_events(&self, limit: Option<u32>) -> Vec<OpportunityEvent> {
        let limit = limit.unwrap_or(50);
        let mut events = Vec::new();
        
        let start = if self.opportunity_events.len() > limit {
            self.opportunity_events.len() - limit
        } else {
            0
        };
        
        for i in start..self.opportunity_events.len() {
            if let Some(event) = self.opportunity_events.get(i) {
                events.push(event);
            }
        }
        
        events
    }

    /// Get score update events
    pub fn get_score_events(&self, limit: Option<u32>) -> Vec<ScoreUpdateEvent> {
        let limit = limit.unwrap_or(50);
        let mut events = Vec::new();
        
        let start = if self.score_events.len() > limit {
            self.score_events.len() - limit
        } else {
            0
        };
        
        for i in start..self.score_events.len() {
            if let Some(event) = self.score_events.get(i) {
                events.push(event);
            }
        }
        
        events
    }

    /// Update registry configuration (owner only)
    pub fn update_config(&mut self, new_config: RegistryConfig) {
        self.assert_owner();
        self.config = new_config;
        log!("Registry configuration updated");
    }

    /// Pause/unpause registry (owner only)
    pub fn set_paused(&mut self, is_paused: bool) {
        self.assert_owner();
        self.config.is_paused = is_paused;
        log!("Registry {} by owner", if is_paused { "paused" } else { "unpaused" });
    }

    /// Log opportunity event
    fn log_opportunity_event(
        &mut self,
        event_type: OpportunityEventType,
        opportunity_id: u32,
        opportunity_name: String,
        old_data: Option<Opportunity>,
        new_data: Option<Opportunity>,
    ) {
        let event = OpportunityEvent {
            event_type: event_type.clone(),
            opportunity_id,
            opportunity_name: opportunity_name.clone(),
            old_data,
            new_data,
            timestamp: env::block_timestamp(),
            tx_hash: env::block_hash().to_string(),
            triggered_by: env::predecessor_account_id(),
        };

        self.opportunity_events.push(&event);
        
        // Limit events to last 1000
        if self.opportunity_events.len() > 1000 {
            self.opportunity_events.remove(0);
        }

        // Emit event for indexing
        let event_type_str = match event_type {
            OpportunityEventType::Added => "added",
            OpportunityEventType::Updated => "updated",
            OpportunityEventType::Removed => "removed",
            OpportunityEventType::StatusChanged => "status_changed",
        };

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"bond-credit-registry\",\"version\":\"1.0.0\",\"event\":\"opportunity_{}\",\"data\":[{{\"opportunity_id\":{},\"opportunity_name\":\"{}\",\"timestamp\":{}}}]}}",
            event_type_str,
            opportunity_id,
            opportunity_name,
            env::block_timestamp()
        ));
    }

    /// Assert that the caller is the owner
    fn assert_owner(&self) {
        assert_eq!(
            env::predecessor_account_id(),
            self.config.owner_id,
            "Only owner can call this function"
        );
    }

    /// Assert that the registry is not paused
    fn assert_not_paused(&self) {
        assert!(!self.config.is_paused, "Registry is paused");
    }
}
