use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::json_types::{U128, U64};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, log, near_bindgen, AccountId, Balance, Gas, PanicOnDefault, Promise, PromiseResult,
    PublicKey, Timestamp,
};

// Gas constants
const GAS_FOR_FT_TRANSFER: Gas = Gas(10_000_000_000_000);
const GAS_FOR_FT_TRANSFER_CALL: Gas = Gas(25_000_000_000_000);
const GAS_FOR_RESOLVE_TRANSFER: Gas = Gas(10_000_000_000_000);
const GAS_FOR_NFT_TRANSFER_CALL: Gas = Gas(10_000_000_000_000);

// Storage keys
const STORAGE_KEY_ACCOUNTS: &[u8] = b"accounts";
const STORAGE_KEY_TOTAL_SUPPLY: &[u8] = b"total_supply";
const STORAGE_KEY_TOKEN_RESERVES: &[u8] = b"token_reserves";

/// Supported token types
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub enum TokenType {
    WNEAR,
    USDC,
}

impl TokenType {
    pub fn get_contract_id(&self) -> AccountId {
        match self {
            TokenType::WNEAR => "wrap.testnet".parse().unwrap(),
            TokenType::USDC => "usdc.testnet".parse().unwrap(),
        }
    }
}

/// Vault configuration
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct VaultConfig {
    pub owner_id: AccountId,
    pub wnear_contract: AccountId,
    pub usdc_contract: AccountId,
    pub total_supply: U128,
    pub is_paused: bool,
}

/// User account information
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct VaultAccount {
    pub account_id: AccountId,
    pub vault_shares: U128,
    pub wnear_balance: U128,
    pub usdc_balance: U128,
}

/// Token reserves in the vault
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct TokenReserves {
    pub wnear_reserve: U128,
    pub usdc_reserve: U128,
}

/// Deposit event
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct DepositEvent {
    pub account_id: AccountId,
    pub token_type: TokenType,
    pub amount: U128,
    pub vault_shares_minted: U128,
    pub timestamp: Timestamp,
    pub tx_hash: String,
}

/// Withdraw event
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct WithdrawEvent {
    pub account_id: AccountId,
    pub token_type: TokenType,
    pub amount: U128,
    pub vault_shares_burned: U128,
    pub timestamp: Timestamp,
    pub tx_hash: String,
}

/// Main vault contract
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct VaultContract {
    /// Contract configuration
    pub config: VaultConfig,
    /// Total supply of vault shares
    pub total_supply: U128,
    /// Token reserves in the vault
    pub token_reserves: TokenReserves,
    /// User accounts and their vault shares
    pub accounts: UnorderedMap<AccountId, VaultAccount>,
    /// Deposit events log
    pub deposit_events: Vec<DepositEvent>,
    /// Withdraw events log
    pub withdraw_events: Vec<WithdrawEvent>,
}

#[near_bindgen]
impl VaultContract {
    /// Initialize the vault contract
    #[init]
    pub fn new(
        owner_id: AccountId,
        wnear_contract: AccountId,
        usdc_contract: AccountId,
    ) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        
        let config = VaultConfig {
            owner_id: owner_id.clone(),
            wnear_contract,
            usdc_contract,
            total_supply: U128(0),
            is_paused: false,
        };

        Self {
            config,
            total_supply: U128(0),
            token_reserves: TokenReserves {
                wnear_reserve: U128(0),
                usdc_reserve: U128(0),
            },
            accounts: UnorderedMap::new(STORAGE_KEY_ACCOUNTS),
            deposit_events: Vec::new(),
            withdraw_events: Vec::new(),
        }
    }

    /// Get vault configuration
    pub fn get_config(&self) -> VaultConfig {
        self.config.clone()
    }

    /// Get total supply of vault shares
    pub fn get_total_supply(&self) -> U128 {
        self.total_supply
    }

    /// Get token reserves
    pub fn get_token_reserves(&self) -> TokenReserves {
        self.token_reserves.clone()
    }

    /// Get user vault account
    pub fn get_account(&self, account_id: AccountId) -> Option<VaultAccount> {
        self.accounts.get(&account_id)
    }

    /// Get user vault shares
    pub fn get_user_vault_shares(&self, account_id: AccountId) -> U128 {
        match self.accounts.get(&account_id) {
            Some(account) => account.vault_shares,
            None => U128(0),
        }
    }

    /// Deposit tokens into the vault
    pub fn deposit(&mut self, token_type: TokenType, amount: U128) -> Promise {
        assert!(!self.config.is_paused, "Vault is paused");
        assert!(amount.0 > 0, "Amount must be greater than zero");

        let sender_id = env::predecessor_account_id();
        log!("Deposit: {} {} from {}", amount.0, format!("{:?}", token_type), sender_id);

        // Calculate vault shares to mint (1:1 for now, can be improved with proper LP calculation)
        let shares_to_mint = amount;

        // Update user account
        let mut user_account = self.accounts.get(&sender_id).unwrap_or(VaultAccount {
            account_id: sender_id.clone(),
            vault_shares: U128(0),
            wnear_balance: U128(0),
            usdc_balance: U128(0),
        });

        user_account.vault_shares = U128(user_account.vault_shares.0 + shares_to_mint.0);
        
        match token_type {
            TokenType::WNEAR => {
                user_account.wnear_balance = U128(user_account.wnear_balance.0 + amount.0);
                self.token_reserves.wnear_reserve = U128(self.token_reserves.wnear_reserve.0 + amount.0);
            }
            TokenType::USDC => {
                user_account.usdc_balance = U128(user_account.usdc_balance.0 + amount.0);
                self.token_reserves.usdc_reserve = U128(self.token_reserves.usdc_reserve.0 + amount.0);
            }
        }

        self.accounts.insert(&sender_id, &user_account);
        self.total_supply = U128(self.total_supply.0 + shares_to_mint.0);

        // Transfer tokens from user to vault
        let token_contract = token_type.get_contract_id();
        
        Promise::new(token_contract)
            .function_call(
                "ft_transfer_call".to_string(),
                serde_json::to_vec(&serde_json::json!({
                    "receiver_id": env::current_account_id(),
                    "amount": amount.0.to_string(),
                    "msg": ""
                })).unwrap(),
                1,
                GAS_FOR_FT_TRANSFER_CALL,
            )
    }

    /// Callback after token transfer
    #[private]
    pub fn on_tokens_transferred(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        token_type: TokenType,
    ) {
        match env::promise_result(0) {
            PromiseResult::Successful(_) => {
                // Log deposit event
                let deposit_event = DepositEvent {
                    account_id: sender_id.clone(),
                    token_type: token_type.clone(),
                    amount,
                    vault_shares_minted: amount, // 1:1 for now
                    timestamp: env::block_timestamp(),
                    tx_hash: env::block_hash().to_string(),
                };

                self.deposit_events.push(deposit_event.clone());
                
                // Limit events to last 1000
                if self.deposit_events.len() > 1000 {
                    self.deposit_events.remove(0);
                }

                log!("Deposit successful: {} {} from {}", amount.0, format!("{:?}", token_type), sender_id);
                
                // Emit event for indexing
                env::log_str(&format!(
                    "EVENT_JSON:{{\"standard\":\"bond-credit-vault\",\"version\":\"1.0.0\",\"event\":\"deposit\",\"data\":[{{\"account_id\":\"{}\",\"token_type\":\"{:?}\",\"amount\":\"{}\",\"vault_shares_minted\":\"{}\",\"timestamp\":{}}}]}}",
                    sender_id,
                    token_type,
                    amount.0,
                    amount.0,
                    env::block_timestamp()
                ));
            }
            PromiseResult::Failed => {
                // Revert the changes if transfer failed
                log!("Token transfer failed, reverting deposit for {}", sender_id);
                panic!("Token transfer failed");
            }
            _ => {
                panic!("Unexpected promise result");
            }
        }
    }

    /// Withdraw tokens from the vault
    pub fn withdraw(&mut self, token_type: TokenType, amount: U128) -> Promise {
        assert!(!self.config.is_paused, "Vault is paused");
        assert!(amount.0 > 0, "Amount must be greater than zero");

        let sender_id = env::predecessor_account_id();
        log!("Withdraw: {} {} from {}", amount.0, format!("{:?}", token_type), sender_id);

        // Check if user has enough vault shares
        let user_account = self.accounts.get(&sender_id)
            .expect("Account not found");
        
        let required_shares = amount; // 1:1 for now
        
        assert!(
            user_account.vault_shares.0 >= required_shares.0,
            "Insufficient vault shares"
        );

        // Check if vault has enough tokens
        match token_type {
            TokenType::WNEAR => {
                assert!(
                    self.token_reserves.wnear_reserve.0 >= amount.0,
                    "Insufficient WNEAR reserves"
                );
            }
            TokenType::USDC => {
                assert!(
                    self.token_reserves.usdc_reserve.0 >= amount.0,
                    "Insufficient USDC reserves"
                );
            }
        }

        // Update user account
        let mut updated_account = user_account.clone();
        updated_account.vault_shares = U128(updated_account.vault_shares.0 - required_shares.0);
        
        match token_type {
            TokenType::WNEAR => {
                updated_account.wnear_balance = U128(updated_account.wnear_balance.0 - amount.0);
                self.token_reserves.wnear_reserve = U128(self.token_reserves.wnear_reserve.0 - amount.0);
            }
            TokenType::USDC => {
                updated_account.usdc_balance = U128(updated_account.usdc_balance.0 - amount.0);
                self.token_reserves.usdc_reserve = U128(self.token_reserves.usdc_reserve.0 - amount.0);
            }
        }

        self.accounts.insert(&sender_id, &updated_account);
        self.total_supply = U128(self.total_supply.0 - required_shares.0);

        // Log withdraw event
        let withdraw_event = WithdrawEvent {
            account_id: sender_id.clone(),
            token_type: token_type.clone(),
            amount,
            vault_shares_burned: required_shares,
            timestamp: env::block_timestamp(),
            tx_hash: env::block_hash().to_string(),
        };

        self.withdraw_events.push(withdraw_event.clone());
        
        // Limit events to last 1000
        if self.withdraw_events.len() > 1000 {
            self.withdraw_events.remove(0);
        }

        // Emit event for indexing
        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"bond-credit-vault\",\"version\":\"1.0.0\",\"event\":\"withdraw\",\"data\":[{{\"account_id\":\"{}\",\"token_type\":\"{:?}\",\"amount\":\"{}\",\"vault_shares_burned\":\"{}\",\"timestamp\":{}}}]}}",
            sender_id,
            token_type,
            amount.0,
            required_shares.0,
            env::block_timestamp()
        ));

        // Transfer tokens to user
        let token_contract = token_type.get_contract_id();
        
        Promise::new(token_contract)
            .function_call(
                "ft_transfer".to_string(),
                serde_json::to_vec(&serde_json::json!({
                    "receiver_id": sender_id,
                    "amount": amount.0.to_string()
                })).unwrap(),
                1,
                GAS_FOR_FT_TRANSFER,
            )
    }

    /// Get deposit events
    pub fn get_deposit_events(&self, limit: Option<u32>) -> Vec<DepositEvent> {
        let limit = limit.unwrap_or(50);
        let start = if self.deposit_events.len() > limit {
            self.deposit_events.len() - limit
        } else {
            0
        };
        
        self.deposit_events[start..].to_vec()
    }

    /// Get withdraw events
    pub fn get_withdraw_events(&self, limit: Option<u32>) -> Vec<WithdrawEvent> {
        let limit = limit.unwrap_or(50);
        let start = if self.withdraw_events.len() > limit {
            self.withdraw_events.len() - limit
        } else {
            0
        };
        
        self.withdraw_events[start..].to_vec()
    }

    /// Get deposit events for specific account
    pub fn get_deposit_events_for_account(&self, account_id: AccountId, limit: Option<u32>) -> Vec<DepositEvent> {
        let limit = limit.unwrap_or(50);
        let mut account_events: Vec<DepositEvent> = self.deposit_events
            .iter()
            .filter(|event| event.account_id == account_id)
            .rev()
            .take(limit as usize)
            .cloned()
            .collect();
        
        account_events.reverse(); // Return in chronological order
        account_events
    }

    /// Get withdraw events for specific account
    pub fn get_withdraw_events_for_account(&self, account_id: AccountId, limit: Option<u32>) -> Vec<WithdrawEvent> {
        let limit = limit.unwrap_or(50);
        let mut account_events: Vec<WithdrawEvent> = self.withdraw_events
            .iter()
            .filter(|event| event.account_id == account_id)
            .rev()
            .take(limit as usize)
            .cloned()
            .collect();
        
        account_events.reverse(); // Return in chronological order
        account_events
    }

    /// Pause vault operations (owner only)
    pub fn pause_vault(&mut self) {
        self.assert_owner();
        self.config.is_paused = true;
        log!("Vault paused by owner");
    }

    /// Unpause vault operations (owner only)
    pub fn unpause_vault(&mut self) {
        self.assert_owner();
        self.config.is_paused = false;
        log!("Vault unpaused by owner");
    }

    /// Update vault configuration (owner only)
    pub fn update_config(&mut self, new_config: VaultConfig) {
        self.assert_owner();
        self.config = new_config;
        log!("Vault configuration updated");
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

/// Required for FT receiver interface
#[near_bindgen]
impl VaultContract {
    /// Handle FT transfer call (required for receiving tokens)
    #[payable]
    pub fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> U128 {
        // For now, we don't handle the msg parameter
        // In future versions, this could specify which token type to deposit
        
        // Determine token type based on the contract that called this
        let token_contract = env::predecessor_account_id();
        let token_type = if token_contract == self.config.wnear_contract {
            TokenType::WNEAR
        } else if token_contract == self.config.usdc_contract {
            TokenType::USDC
        } else {
            panic!("Unsupported token contract");
        };

        // Call the on_tokens_transferred callback
        self.on_tokens_transferred(sender_id, amount, token_type);
        
        U128(0) // Return 0 to indicate we don't want to refund any tokens
    }
}
