use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{UnorderedMap, UnorderedSet};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, ext_contract, near_bindgen, AccountId, Gas, Promise, 
    Timestamp, PanicOnDefault, require, log
};

// Constants
const GAS_FOR_FT_TRANSFER: Gas = Gas::from_gas(10_000_000_000_000);
const GAS_FOR_FT_TRANSFER_CALL: Gas = Gas::from_gas(20_000_000_000_000);
const GAS_FOR_RESOLVE_TRANSFER: Gas = Gas::from_gas(10_000_000_000_000);
const INITIAL_SUPPLY: u128 = 1_000_000_000_000_000_000_000_000; // 1M tokens with 24 decimals

// External contract interfaces
#[ext_contract(ext_fungible_token)]
trait FungibleToken {
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>);
    fn ft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        amount: U128,
        memo: Option<String>,
        msg: String,
    ) -> Promise;
    fn ft_total_supply(&self) -> U128;
    fn ft_balance_of(&self, account_id: AccountId) -> U128;
}

#[ext_contract(ext_self)]
trait ExtSelf {
    fn on_tokens_transferred(&mut self, sender_id: AccountId, amount: U128, token_id: AccountId);
}

// Data structures
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct VaultShare {
    pub account_id: AccountId,
    pub amount: U128,
    pub token_type: TokenType,
    pub deposited_at: Timestamp,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, PartialEq, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum TokenType {
    WNEAR,
    USDC,
    USDT,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct VaultConfig {
    pub owner_id: AccountId,
    pub wnear_contract: AccountId,
    pub usdc_contract: AccountId,
    pub usdt_contract: AccountId,
    pub fee_percentage: u16, // Basis points (e.g., 100 = 1%)
    pub is_paused: bool,
}

// Events
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct DepositEvent {
    pub account_id: AccountId,
    pub token_type: TokenType,
    pub amount: U128,
    pub vault_shares_minted: U128,
    pub timestamp: Timestamp,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct WithdrawEvent {
    pub account_id: AccountId,
    pub token_type: TokenType,
    pub amount: U128,
    pub vault_shares_burned: U128,
    pub yield_earned: U128,
    pub timestamp: Timestamp,
}

// Main contract
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct VaultContract {
    // Contract configuration
    pub config: VaultConfig,
    
    // Vault state
    pub total_supply: U128,
    pub total_deposits: UnorderedMap<TokenType, U128>,
    pub vault_shares: UnorderedMap<AccountId, UnorderedMap<TokenType, U128>>,
    
    // Token reserves
    pub token_reserves: UnorderedMap<TokenType, U128>,
    
    // Events log
    pub deposit_events: Vec<DepositEvent>,
    pub withdraw_events: Vec<WithdrawEvent>,
}

#[near_bindgen]
impl VaultContract {
    #[init]
    pub fn new(
        owner_id: AccountId,
        wnear_contract: AccountId,
        usdc_contract: AccountId,
        usdt_contract: AccountId,
        fee_percentage: u16,
    ) -> Self {
        require!(env::state_exists() == false, "Already initialized");
        
        let config = VaultConfig {
            owner_id: owner_id.clone(),
            wnear_contract,
            usdc_contract,
            usdt_contract,
            fee_percentage,
            is_paused: false,
        };

        Self {
            config,
            total_supply: U128(INITIAL_SUPPLY),
            total_deposits: UnorderedMap::new(b"total_deposits".to_vec()),
            vault_shares: UnorderedMap::new(b"vault_shares".to_vec()),
            token_reserves: UnorderedMap::new(b"token_reserves".to_vec()),
            deposit_events: Vec::new(),
            withdraw_events: Vec::new(),
        }
    }

    // View functions
    pub fn get_config(&self) -> VaultConfig {
        self.config.clone()
    }

    pub fn get_total_supply(&self) -> U128 {
        self.total_supply
    }

    pub fn get_token_reserves(&self, token_type: TokenType) -> U128 {
        self.token_reserves.get(&token_type).unwrap_or(U128(0))
    }

    pub fn get_user_vault_shares(&self, account_id: AccountId, token_type: TokenType) -> U128 {
        self.vault_shares
            .get(&account_id)
            .and_then(|shares_map| shares_map.get(&token_type))
            .unwrap_or(U128(0))
    }

    pub fn get_user_total_shares(&self, account_id: AccountId) -> U128 {
        let mut total = 0u128;
        if let Some(shares_map) = self.vault_shares.get(&account_id) {
            for token_type in [TokenType::WNEAR, TokenType::USDC, TokenType::USDT] {
                if let Some(amount) = shares_map.get(&token_type) {
                    total += amount.0;
                }
            }
        }
        U128(total)
    }

    // Deposit function
    pub fn deposit(&mut self, token_type: TokenType, amount: U128) -> Promise {
        require!(!self.config.is_paused, "Vault is paused");
        require!(amount.0 > 0, "Amount must be greater than zero");

        let sender_id = env::predecessor_account_id();
        let token_contract = self.get_token_contract(&token_type);

        log!("Depositing {} {:?} from {}", amount.0, token_type, sender_id);

        // Transfer tokens from user to vault
        ext_fungible_token::ext(token_contract.clone())
            .ft_transfer_call(
                env::current_account_id(),
                amount,
                Some(format!("Deposit {:?}", token_type)),
                "".to_string(),
            )
            .then(
                ext_self::ext(env::current_account_id())
                    .on_tokens_transferred(sender_id, amount, token_contract)
            )
    }

    #[private]
    pub fn on_tokens_transferred(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        token_id: AccountId,
    ) {
        let token_type = self.get_token_type_from_contract(&token_id);
        
        // Calculate vault shares to mint (1:1 ratio for now)
        let vault_shares_to_mint = amount;

        // Update vault state
        self.update_token_reserves(&token_type, amount.0, true);
        self.update_user_vault_shares(&sender_id, &token_type, vault_shares_to_mint.0, true);
        self.total_supply = U128(self.total_supply.0 + vault_shares_to_mint.0);

        // Emit deposit event
        let deposit_event = DepositEvent {
            account_id: sender_id.clone(),
            token_type: token_type.clone(),
            amount,
            vault_shares_minted: vault_shares_to_mint,
            timestamp: env::block_timestamp(),
        };
        self.deposit_events.push(deposit_event.clone());

        log!(
            "Deposit successful: {} deposited {} {:?}, received {} vault shares",
            sender_id,
            amount.0,
            token_type,
            vault_shares_to_mint.0
        );

        // Log event for external systems
        env::log_str(&format!(
            "EVENT_JSON:{{\"type\":\"deposit\",\"account_id\":\"{}\",\"token_type\":\"{:?}\",\"amount\":\"{}\",\"vault_shares_minted\":\"{}\",\"timestamp\":{}}}",
            sender_id,
            token_type,
            amount.0,
            vault_shares_to_mint.0,
            env::block_timestamp()
        ));
    }

    // Withdraw function
    pub fn withdraw(&mut self, token_type: TokenType, vault_shares_amount: U128) -> Promise {
        require!(!self.config.is_paused, "Vault is paused");
        require!(vault_shares_amount.0 > 0, "Amount must be greater than zero");

        let sender_id = env::predecessor_account_id();
        let user_shares = self.get_user_vault_shares(sender_id.clone(), token_type.clone());
        
        require!(user_shares.0 >= vault_shares_amount.0, "Insufficient vault shares");

        // Calculate withdrawal amount (1:1 ratio for now, will add yield calculation later)
        let withdrawal_amount = vault_shares_amount;

        // Update vault state
        self.update_token_reserves(&token_type, withdrawal_amount.0, false);
        self.update_user_vault_shares(&sender_id, &token_type, vault_shares_amount.0, false);
        self.total_supply = U128(self.total_supply.0 - vault_shares_amount.0);

        // Emit withdraw event
        let withdraw_event = WithdrawEvent {
            account_id: sender_id.clone(),
            token_type: token_type.clone(),
            amount: withdrawal_amount,
            vault_shares_burned: vault_shares_amount,
            yield_earned: U128(0), // Will calculate yield in future versions
            timestamp: env::block_timestamp(),
        };
        self.withdraw_events.push(withdraw_event.clone());

        log!(
            "Withdrawal successful: {} burned {} vault shares, received {} {:?}",
            sender_id,
            vault_shares_amount.0,
            withdrawal_amount.0,
            token_type
        );

        // Log event for external systems
        env::log_str(&format!(
            "EVENT_JSON:{{\"type\":\"withdraw\",\"account_id\":\"{}\",\"token_type\":\"{:?}\",\"amount\":\"{}\",\"vault_shares_burned\":\"{}\",\"timestamp\":{}}}",
            sender_id,
            token_type,
            withdrawal_amount.0,
            vault_shares_amount.0,
            env::block_timestamp()
        ));

        // Transfer tokens back to user
        let token_contract = self.get_token_contract(&token_type);
        ext_fungible_token::ext(token_contract)
            .ft_transfer(sender_id, withdrawal_amount, Some(format!("Withdraw {:?}", token_type)))
    }

    // Admin functions
    pub fn update_config(&mut self, new_config: VaultConfig) {
        require!(
            env::predecessor_account_id() == self.config.owner_id,
            "Only owner can update config"
        );
        self.config = new_config;
    }

    pub fn pause_vault(&mut self) {
        require!(
            env::predecessor_account_id() == self.config.owner_id,
            "Only owner can pause vault"
        );
        self.config.is_paused = true;
        log!("Vault paused by owner");
    }

    pub fn unpause_vault(&mut self) {
        require!(
            env::predecessor_account_id() == self.config.owner_id,
            "Only owner can unpause vault"
        );
        self.config.is_paused = false;
        log!("Vault unpaused by owner");
    }

    // Helper functions
    fn get_token_contract(&self, token_type: &TokenType) -> AccountId {
        match token_type {
            TokenType::WNEAR => self.config.wnear_contract.clone(),
            TokenType::USDC => self.config.usdc_contract.clone(),
            TokenType::USDT => self.config.usdt_contract.clone(),
        }
    }

    fn get_token_type_from_contract(&self, contract_id: &AccountId) -> TokenType {
        if contract_id == &self.config.wnear_contract {
            TokenType::WNEAR
        } else if contract_id == &self.config.usdc_contract {
            TokenType::USDC
        } else if contract_id == &self.config.usdt_contract {
            TokenType::USDT
        } else {
            env::panic_str("Unsupported token contract");
        }
    }

    fn update_token_reserves(&mut self, token_type: &TokenType, amount: u128, is_deposit: bool) {
        let current_reserve = self.token_reserves.get(token_type).unwrap_or(U128(0));
        let new_reserve = if is_deposit {
            current_reserve.0 + amount
        } else {
            current_reserve.0 - amount
        };
        self.token_reserves.insert(token_type, &U128(new_reserve));
    }

    fn update_user_vault_shares(
        &mut self,
        account_id: &AccountId,
        token_type: &TokenType,
        amount: u128,
        is_deposit: bool,
    ) {
        let mut user_shares = self
            .vault_shares
            .get(account_id)
            .unwrap_or_else(|| UnorderedMap::new(format!("shares_{}", account_id).as_bytes().to_vec()));

        let current_shares = user_shares.get(token_type).unwrap_or(U128(0));
        let new_shares = if is_deposit {
            current_shares.0 + amount
        } else {
            current_shares.0 - amount
        };

        user_shares.insert(token_type, &U128(new_shares));
        self.vault_shares.insert(account_id, &user_shares);
    }

    // Events query functions
    pub fn get_deposit_events(&self, limit: Option<u64>) -> Vec<DepositEvent> {
        let limit = limit.unwrap_or(100);
        self.deposit_events
            .iter()
            .rev()
            .take(limit as usize)
            .cloned()
            .collect()
    }

    pub fn get_withdraw_events(&self, limit: Option<u64>) -> Vec<WithdrawEvent> {
        let limit = limit.unwrap_or(100);
        self.withdraw_events
            .iter()
            .rev()
            .take(limit as usize)
            .cloned()
            .collect()
    }
}

