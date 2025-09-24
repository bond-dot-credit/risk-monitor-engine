use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, log, near_bindgen, AccountId, Gas, PanicOnDefault, require,
    Timestamp,
};

// Gas constants
const GAS_FOR_FT_TRANSFER: Gas = Gas::from_gas(10_000_000_000_000);

/// Supported token types
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub enum TokenType {
    WNEAR,
    USDC,
    USDT,
}

/// Vault configuration
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct VaultConfig {
    pub owner_id: AccountId,
    pub wnear_contract: AccountId,
    pub usdc_contract: AccountId,
    pub usdt_contract: AccountId,
    pub fee_percentage: u16,
    pub is_paused: bool,
}

/// User vault shares
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct UserShares {
    pub wnear_shares: U128,
    pub usdc_shares: U128,
    pub usdt_shares: U128,
}

/// Main contract state
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct SimpleVaultContract {
    pub config: VaultConfig,
    pub total_supply: U128,
    pub token_reserves: UnorderedMap<TokenType, U128>,
    pub user_shares: UnorderedMap<AccountId, UserShares>,
    pub deposit_events: Vec<DepositEvent>,
    pub withdraw_events: Vec<WithdrawEvent>,
}

/// Deposit event
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct DepositEvent {
    pub account_id: AccountId,
    pub token_type: TokenType,
    pub amount: U128,
    pub vault_shares_minted: U128,
    pub timestamp: Timestamp,
}

/// Withdraw event
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct WithdrawEvent {
    pub account_id: AccountId,
    pub token_type: TokenType,
    pub amount: U128,
    pub vault_shares_burned: U128,
    pub timestamp: Timestamp,
}

#[near_bindgen]
impl SimpleVaultContract {
    #[init]
    pub fn new(
        owner_id: AccountId,
        wnear_contract: AccountId,
        usdc_contract: AccountId,
        usdt_contract: AccountId,
        fee_percentage: u16,
    ) -> Self {
        require!(!env::state_exists(), "Already initialized");

        let config = VaultConfig {
            owner_id: owner_id.clone(),
            wnear_contract,
            usdc_contract,
            usdt_contract,
            fee_percentage,
            is_paused: false,
        };

        let mut token_reserves = UnorderedMap::new(b"token_reserves".to_vec());
        token_reserves.insert(&TokenType::WNEAR, &U128(0));
        token_reserves.insert(&TokenType::USDC, &U128(0));
        token_reserves.insert(&TokenType::USDT, &U128(0));

        Self {
            config,
            total_supply: U128(0),
            token_reserves,
            user_shares: UnorderedMap::new(b"user_shares".to_vec()),
            deposit_events: Vec::new(),
            withdraw_events: Vec::new(),
        }
    }

    /// Get vault configuration
    pub fn get_config(&self) -> VaultConfig {
        self.config.clone()
    }

    /// Get total supply
    pub fn get_total_supply(&self) -> U128 {
        self.total_supply
    }

    /// Get token reserves
    pub fn get_token_reserves(&self, token_type: TokenType) -> U128 {
        self.token_reserves.get(&token_type).unwrap_or(U128(0))
    }

    /// Get user vault shares
    pub fn get_user_vault_shares(&self, account_id: AccountId, token_type: TokenType) -> U128 {
        let user_shares = self.user_shares.get(&account_id).unwrap_or(UserShares {
            wnear_shares: U128(0),
            usdc_shares: U128(0),
            usdt_shares: U128(0),
        });

        match token_type {
            TokenType::WNEAR => user_shares.wnear_shares,
            TokenType::USDC => user_shares.usdc_shares,
            TokenType::USDT => user_shares.usdt_shares,
        }
    }

    /// Get user total shares
    pub fn get_user_total_shares(&self, account_id: AccountId) -> U128 {
        let user_shares = self.user_shares.get(&account_id).unwrap_or(UserShares {
            wnear_shares: U128(0),
            usdc_shares: U128(0),
            usdt_shares: U128(0),
        });

        U128(
            user_shares.wnear_shares.0 +
            user_shares.usdc_shares.0 +
            user_shares.usdt_shares.0
        )
    }

    /// Get deposit events
    pub fn get_deposit_events(&self, account_id: AccountId, limit: u32) -> Vec<DepositEvent> {
        self.deposit_events
            .iter()
            .filter(|event| event.account_id == account_id)
            .rev()
            .take(limit as usize)
            .cloned()
            .collect()
    }

    /// Get withdraw events
    pub fn get_withdraw_events(&self, account_id: AccountId, limit: u32) -> Vec<WithdrawEvent> {
        self.withdraw_events
            .iter()
            .filter(|event| event.account_id == account_id)
            .rev()
            .take(limit as usize)
            .cloned()
            .collect()
    }

    /// Simulate deposit (for testing)
    pub fn deposit(&mut self, token_type: TokenType, amount: U128) -> U128 {
        let sender_id = env::predecessor_account_id();
        
        log!("Simulating deposit of {} {:?} from {}", amount.0, token_type, sender_id);

        // Calculate vault shares to mint (1:1 for simplicity)
        let vault_shares_minted = amount;

        // Update user shares
        let mut user_shares = self.user_shares.get(&sender_id).unwrap_or(UserShares {
            wnear_shares: U128(0),
            usdc_shares: U128(0),
            usdt_shares: U128(0),
        });

        match token_type {
            TokenType::WNEAR => user_shares.wnear_shares.0 += vault_shares_minted.0,
            TokenType::USDC => user_shares.usdc_shares.0 += vault_shares_minted.0,
            TokenType::USDT => user_shares.usdt_shares.0 += vault_shares_minted.0,
        }

        self.user_shares.insert(&sender_id, &user_shares);

        // Update token reserves
        let current_reserve = self.token_reserves.get(&token_type).unwrap_or(U128(0));
        self.token_reserves.insert(&token_type, &U128(current_reserve.0 + amount.0));

        // Update total supply
        self.total_supply = U128(self.total_supply.0 + vault_shares_minted.0);

        // Record event
        let deposit_event = DepositEvent {
            account_id: sender_id.clone(),
            token_type: token_type.clone(),
            amount,
            vault_shares_minted,
            timestamp: env::block_timestamp(),
        };
        self.deposit_events.push(deposit_event);

        log!("Deposit successful: {} deposited {} {:?}, received {} vault shares", 
             sender_id, amount.0, token_type, vault_shares_minted.0);

        vault_shares_minted
    }

    /// Simulate withdraw (for testing)
    pub fn withdraw(&mut self, token_type: TokenType, vault_shares_amount: U128) -> U128 {
        let sender_id = env::predecessor_account_id();
        
        log!("Simulating withdrawal of {} {:?} shares from {}", vault_shares_amount.0, token_type, sender_id);

        // Check user has enough shares
        let user_shares = self.user_shares.get(&sender_id).unwrap_or(UserShares {
            wnear_shares: U128(0),
            usdc_shares: U128(0),
            usdt_shares: U128(0),
        });

        let available_shares = match token_type {
            TokenType::WNEAR => user_shares.wnear_shares,
            TokenType::USDC => user_shares.usdc_shares,
            TokenType::USDT => user_shares.usdt_shares,
        };

        require!(available_shares.0 >= vault_shares_amount.0, "Insufficient vault shares");

        // Calculate tokens to withdraw (1:1 for simplicity)
        let withdrawal_amount = vault_shares_amount;

        // Update user shares
        let mut updated_user_shares = user_shares;
        match token_type {
            TokenType::WNEAR => updated_user_shares.wnear_shares.0 -= vault_shares_amount.0,
            TokenType::USDC => updated_user_shares.usdc_shares.0 -= vault_shares_amount.0,
            TokenType::USDT => updated_user_shares.usdt_shares.0 -= vault_shares_amount.0,
        }
        self.user_shares.insert(&sender_id, &updated_user_shares);

        // Update token reserves
        let current_reserve = self.token_reserves.get(&token_type).unwrap_or(U128(0));
        require!(current_reserve.0 >= withdrawal_amount.0, "Insufficient token reserves");
        self.token_reserves.insert(&token_type, &U128(current_reserve.0 - withdrawal_amount.0));

        // Update total supply
        self.total_supply = U128(self.total_supply.0 - vault_shares_amount.0);

        // Record event
        let withdraw_event = WithdrawEvent {
            account_id: sender_id.clone(),
            token_type: token_type.clone(),
            amount: withdrawal_amount,
            vault_shares_burned: vault_shares_amount,
            timestamp: env::block_timestamp(),
        };
        self.withdraw_events.push(withdraw_event);

        log!("Withdrawal successful: {} burned {} vault shares, received {} {:?}", 
             sender_id, vault_shares_amount.0, withdrawal_amount.0, token_type);

        withdrawal_amount
    }
}
