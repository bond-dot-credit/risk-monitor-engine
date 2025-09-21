use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{UnorderedMap, UnorderedSet};
use near_sdk::json_types::{U128, U64};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, near_bindgen, AccountId, PanicOnDefault, require, log, Timestamp
};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Opportunity {
    pub id: u64,
    pub name: String,
    pub description: String,
    pub contract_id: AccountId,
    pub apy: u16, // Basis points (e.g., 1250 = 12.5%)
    pub trust_score: u16, // 0-100
    pub performance: u16, // 0-40
    pub reliability: u16, // 0-40
    pub safety: u16, // 0-20
    pub total_score: u16, // 0-100
    pub risk_level: String,
    pub category: String,
    pub min_deposit: U128,
    pub max_deposit: U128,
    pub tvl: U128,
    pub is_active: bool,
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct RegistryConfig {
    pub owner_id: AccountId,
    pub fee_percentage: u16, // Basis points
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct RegistryContract {
    pub config: RegistryConfig,
    pub opportunities: UnorderedMap<u64, Opportunity>,
    pub opportunity_ids: UnorderedSet<u64>,
    pub next_opportunity_id: u64,
    pub categories: UnorderedSet<String>,
}

#[near_bindgen]
impl RegistryContract {
    #[init]
    pub fn new(owner_id: AccountId, fee_percentage: u16) -> Self {
        require!(env::state_exists() == false, "Already initialized");
        
        let config = RegistryConfig {
            owner_id: owner_id.clone(),
            fee_percentage,
        };

        let mut contract = Self {
            config,
            opportunities: UnorderedMap::new(b"opportunities".to_vec()),
            opportunity_ids: UnorderedSet::new(b"opportunity_ids".to_vec()),
            next_opportunity_id: 1,
            categories: UnorderedSet::new(b"categories".to_vec()),
        };

        // Initialize with default categories
        contract.categories.insert(&"staking".to_string());
        contract.categories.insert(&"liquidity".to_string());
        contract.categories.insert(&"bridge".to_string());
        contract.categories.insert(&"index".to_string());

        contract
    }

    // View functions
    pub fn get_config(&self) -> RegistryConfig {
        self.config.clone()
    }

    pub fn get_opportunities(&self, limit: Option<u64>, offset: Option<u64>) -> Vec<Opportunity> {
        let limit = limit.unwrap_or(50);
        let offset = offset.unwrap_or(0);
        
        self.opportunity_ids
            .iter()
            .skip(offset as usize)
            .take(limit as usize)
            .filter_map(|id| self.opportunities.get(&id))
            .collect()
    }

    pub fn get_opportunity(&self, opportunity_id: u64) -> Option<Opportunity> {
        self.opportunities.get(&opportunity_id)
    }

    pub fn get_opportunities_by_category(&self, category: String, limit: Option<u64>) -> Vec<Opportunity> {
        let limit = limit.unwrap_or(50);
        
        self.opportunity_ids
            .iter()
            .filter_map(|id| self.opportunities.get(&id))
            .filter(|opp| opp.category == category && opp.is_active)
            .take(limit as usize)
            .collect()
    }

    pub fn get_categories(&self) -> Vec<String> {
        self.categories.iter().collect()
    }

    pub fn get_total_opportunities(&self) -> u64 {
        self.opportunity_ids.len()
    }

    pub fn get_active_opportunities_count(&self) -> u64 {
        self.opportunity_ids
            .iter()
            .filter_map(|id| self.opportunities.get(&id))
            .filter(|opp| opp.is_active)
            .count() as u64
    }

    // Admin functions
    pub fn add_opportunity(
        &mut self,
        name: String,
        description: String,
        contract_id: AccountId,
        apy: u16,
        trust_score: u16,
        performance: u16,
        reliability: u16,
        safety: u16,
        risk_level: String,
        category: String,
        min_deposit: U128,
        max_deposit: U128,
        tvl: U128,
    ) {
        require!(
            env::predecessor_account_id() == self.config.owner_id,
            "Only owner can add opportunities"
        );

        let total_score = performance + reliability + safety;
        let opportunity_id = self.next_opportunity_id;

        let opportunity = Opportunity {
            id: opportunity_id,
            name: name.clone(),
            description,
            contract_id,
            apy,
            trust_score,
            performance,
            reliability,
            safety,
            total_score,
            risk_level,
            category: category.clone(),
            min_deposit,
            max_deposit,
            tvl,
            is_active: true,
            created_at: env::block_timestamp(),
            updated_at: env::block_timestamp(),
        };

        self.opportunities.insert(&opportunity_id, &opportunity);
        self.opportunity_ids.insert(&opportunity_id);
        self.next_opportunity_id += 1;

        // Add category if it doesn't exist
        if !self.categories.contains(&category) {
            self.categories.insert(&category);
        }

        log!("Added opportunity: {} with ID: {}", name, opportunity_id);
    }

    pub fn update_opportunity(
        &mut self,
        opportunity_id: u64,
        name: Option<String>,
        description: Option<String>,
        apy: Option<u16>,
        trust_score: Option<u16>,
        performance: Option<u16>,
        reliability: Option<u16>,
        safety: Option<u16>,
        risk_level: Option<String>,
        tvl: Option<U128>,
        is_active: Option<bool>,
    ) {
        require!(
            env::predecessor_account_id() == self.config.owner_id,
            "Only owner can update opportunities"
        );

        let mut opportunity = self.opportunities.get(&opportunity_id)
            .expect("Opportunity not found");

        if let Some(name) = name {
            opportunity.name = name;
        }
        if let Some(description) = description {
            opportunity.description = description;
        }
        if let Some(apy) = apy {
            opportunity.apy = apy;
        }
        if let Some(trust_score) = trust_score {
            opportunity.trust_score = trust_score;
        }
        if let Some(performance) = performance {
            opportunity.performance = performance;
        }
        if let Some(reliability) = reliability {
            opportunity.reliability = reliability;
        }
        if let Some(safety) = safety {
            opportunity.safety = safety;
        }
        if let Some(risk_level) = risk_level {
            opportunity.risk_level = risk_level;
        }
        if let Some(tvl) = tvl {
            opportunity.tvl = tvl;
        }
        if let Some(is_active) = is_active {
            opportunity.is_active = is_active;
        }

        // Recalculate total score
        opportunity.total_score = opportunity.performance + opportunity.reliability + opportunity.safety;
        opportunity.updated_at = env::block_timestamp();

        self.opportunities.insert(&opportunity_id, &opportunity);
        log!("Updated opportunity with ID: {}", opportunity_id);
    }

    pub fn remove_opportunity(&mut self, opportunity_id: u64) {
        require!(
            env::predecessor_account_id() == self.config.owner_id,
            "Only owner can remove opportunities"
        );

        if self.opportunities.remove(&opportunity_id).is_some() {
            self.opportunity_ids.remove(&opportunity_id);
            log!("Removed opportunity with ID: {}", opportunity_id);
        }
    }

    pub fn update_config(&mut self, fee_percentage: Option<u16>) {
        require!(
            env::predecessor_account_id() == self.config.owner_id,
            "Only owner can update config"
        );

        if let Some(fee_percentage) = fee_percentage {
            self.config.fee_percentage = fee_percentage;
        }

        log!("Updated registry config");
    }
}
