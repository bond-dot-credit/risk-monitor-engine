# Bond.Credit Vault Contract v0

## Overview

The Vault Contract is the core component of the Bond.Credit system that handles:
- **Accept deposits** (wNEAR, USDC)
- **Mint LP tokens** (VaultShares) 
- **Handle withdrawals**
- **Emit events** (Deposit, Withdraw)

## Features

### ✅ Core Functionality
- **Multi-token Support**: Accepts wNEAR and USDC deposits
- **LP Token Minting**: Mints VaultShares (1:1 ratio for v0)
- **Withdrawal System**: Burns VaultShares to withdraw tokens
- **Event Logging**: Comprehensive deposit/withdraw event tracking
- **Access Control**: Owner-only functions for vault management

### 🔧 Technical Details
- **Rust + NEAR SDK 5.0**: Built with latest NEAR protocol features
- **FT Standard Compatible**: Works with NEAR fungible token standard
- **Event Indexing**: Standardized events for easy blockchain indexing
- **Gas Optimized**: Efficient storage and computation patterns

## Contract Structure

### Data Structures
```rust
pub struct VaultConfig {
    pub owner_id: AccountId,
    pub wnear_contract: AccountId,
    pub usdc_contract: AccountId,
    pub total_supply: U128,
    pub is_paused: bool,
}

pub struct VaultAccount {
    pub account_id: AccountId,
    pub vault_shares: U128,
    pub wnear_balance: U128,
    pub usdc_balance: U128,
}

pub struct TokenReserves {
    pub wnear_reserve: U128,
    pub usdc_reserve: U128,
}
```

### Events
```rust
pub struct DepositEvent {
    pub account_id: AccountId,
    pub token_type: TokenType,
    pub amount: U128,
    pub vault_shares_minted: U128,
    pub timestamp: Timestamp,
    pub tx_hash: String,
}

pub struct WithdrawEvent {
    pub account_id: AccountId,
    pub token_type: TokenType,
    pub amount: U128,
    pub vault_shares_burned: U128,
    pub timestamp: Timestamp,
    pub tx_hash: String,
}
```

## API Reference

### View Functions
- `get_config()` - Get vault configuration
- `get_total_supply()` - Get total vault shares supply
- `get_token_reserves()` - Get token reserves
- `get_account(account_id)` - Get user account info
- `get_user_vault_shares(account_id)` - Get user's vault shares
- `get_deposit_events(limit?)` - Get recent deposit events
- `get_withdraw_events(limit?)` - Get recent withdraw events
- `get_deposit_events_for_account(account_id, limit?)` - Get user's deposit events
- `get_withdraw_events_for_account(account_id, limit?)` - Get user's withdraw events

### Call Functions
- `deposit(token_type, amount)` - Deposit tokens into vault
- `withdraw(token_type, amount)` - Withdraw tokens from vault
- `pause_vault()` - Pause vault operations (owner only)
- `unpause_vault()` - Unpause vault operations (owner only)
- `update_config(new_config)` - Update vault config (owner only)

## Deployment

### Prerequisites
1. **NEAR CLI**: `npm install -g near-cli`
2. **Rust**: Latest stable version
3. **NEAR Account**: With testnet NEAR tokens

### Quick Deploy
```bash
cd contracts/vault-contract-v0
./deploy.sh
```

### Manual Deployment
```bash
# 1. Compile contract
cargo build --target wasm32-unknown-unknown --release

# 2. Create contract account
near create-account vault-contract-v0.your-account.testnet \
    --masterAccount your-account.testnet \
    --networkId testnet

# 3. Deploy contract
near deploy vault-contract-v0.your-account.testnet \
    target/wasm32-unknown-unknown/release/vault-contract-v0.wasm \
    --networkId testnet

# 4. Initialize contract
near call vault-contract-v0.your-account.testnet new \
    '{
        "owner_id": "your-account.testnet",
        "wnear_contract": "wrap.testnet",
        "usdc_contract": "usdc.testnet"
    }' \
    --accountId your-account.testnet \
    --networkId testnet
```

## Testing

### Test Deposit
```bash
# Deposit 1 WNEAR (you need WNEAR tokens first)
near call vault-contract-v0.your-account.testnet deposit \
    '{"token_type":"WNEAR","amount":"1000000000000000000000000"}' \
    --accountId your-account.testnet \
    --networkId testnet
```

### Test Withdraw
```bash
# Withdraw 1 WNEAR
near call vault-contract-v0.your-account.testnet withdraw \
    '{"token_type":"WNEAR","amount":"1000000000000000000000000"}' \
    --accountId your-account.testnet \
    --networkId testnet
```

### Verify Results
```bash
# Check your account
near view vault-contract-v0.your-account.testnet get_account \
    '{"account_id":"your-account.testnet"}' \
    --networkId testnet

# Check deposit events
near view vault-contract-v0.your-account.testnet get_deposit_events \
    --networkId testnet

# Check withdraw events
near view vault-contract-v0.your-account.testnet get_withdraw_events \
    --networkId testnet
```

## Event Format

The contract emits standardized events for easy indexing:

```json
{
  "standard": "bond-credit-vault",
  "version": "1.0.0",
  "event": "deposit",
  "data": [{
    "account_id": "user.testnet",
    "token_type": "WNEAR",
    "amount": "1000000000000000000000000",
    "vault_shares_minted": "1000000000000000000000000",
    "timestamp": 1640995200000000000
  }]
}
```

## Security Considerations

### v0 Limitations
- **1:1 LP Ratio**: Simple 1:1 minting for v0 (no complex LP math)
- **No Slippage Protection**: Basic deposit/withdraw without slippage checks
- **Manual Pause**: Owner can pause operations manually
- **No Yield Generation**: v0 only handles deposits/withdrawals

### Future Improvements
- **Dynamic LP Pricing**: Implement proper LP token calculation
- **Slippage Protection**: Add slippage tolerance for large trades
- **Automated Pausing**: Circuit breakers for emergency situations
- **Yield Integration**: Connect with yield opportunities

## Integration

### Frontend Integration
```typescript
import { VaultContract } from '@/lib/near-contract-interactions';

// Initialize vault contract
const vaultContract = new VaultContract(account, 'vault-contract-v0.your-account.testnet');

// Deposit tokens
await vaultContract.deposit('WNEAR', '1000000000000000000000000');

// Withdraw tokens
await vaultContract.withdraw('WNEAR', '1000000000000000000000000');

// Get user data
const userShares = await vaultContract.getUserVaultShares(accountId);
const depositEvents = await vaultContract.getDepositEvents(accountId);
```

## Next Steps

This vault contract is the foundation for the complete Bond.Credit system. Next components:

1. **Opportunity Contract** - Individual yield strategies
2. **Registry Contract** - Opportunity management
3. **Executor Bot** - Automated allocation system
4. **Scoring System** - Trust score calculation

## Support

For issues or questions:
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Check the main project README
- **Community**: Join our Discord/Telegram for support
