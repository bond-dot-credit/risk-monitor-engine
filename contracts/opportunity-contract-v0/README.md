# Bond.Credit Opportunity Contract v0

## Overview

The Opportunity Contract is the second core component of the Bond.Credit system that handles:
- **Yield Strategies**: Individual yield opportunities (staking wNEAR, lending USDC, liquidity provision)
- **NEAR Intents Integration**: Executes allocations using NEAR Intents
- **Event Emission**: CapitalAllocated and YieldClaimed events for tracking

## Features

### ✅ Core Functionality
- **Multiple Yield Strategies**: Staking, Lending, Liquidity Provision
- **NEAR Intents Integration**: Automated allocation execution
- **Capital Allocation**: Track user allocations and capacity
- **Yield Claiming**: Automated yield calculation and claiming
- **Event Logging**: Comprehensive allocation and yield event tracking
- **Access Control**: Owner-only functions for opportunity management

### 🔧 Technical Details
- **Rust + NEAR SDK 5.0**: Built with latest NEAR protocol features
- **Intent Execution**: Integration with NEAR Intents for automated operations
- **Gas Optimization**: Efficient storage and computation patterns
- **Event Indexing**: Standardized events for easy blockchain indexing

## Yield Strategies

### 1. Staking Strategy
- **Description**: Stake wNEAR to earn NEAR rewards
- **Expected APY**: 12%
- **Integration**: NEAR staking pools
- **Risk Level**: Low

### 2. Lending Strategy
- **Description**: Lend USDC to earn interest
- **Expected APY**: 8%
- **Integration**: Lending protocols (Burrow, etc.)
- **Risk Level**: Medium

### 3. Liquidity Provision Strategy
- **Description**: Provide liquidity for trading fees
- **Expected APY**: 15%
- **Integration**: DEX protocols (Ref Finance, etc.)
- **Risk Level**: Medium-High

## Contract Structure

### Data Structures
```rust
pub struct OpportunityConfig {
    pub owner_id: AccountId,
    pub name: String,
    pub description: String,
    pub strategy: YieldStrategy,
    pub target_apy: u16,
    pub max_allocation: U128,
    pub total_capacity: U128,
    pub min_allocation: U128,
    pub is_active: bool,
    pub created_at: Timestamp,
}

pub struct UserAllocation {
    pub account_id: AccountId,
    pub allocated_amount: U128,
    pub allocation_timestamp: Timestamp,
    pub last_yield_claim: Timestamp,
    pub total_yield_claimed: U128,
    pub is_active: bool,
}
```

### Events
```rust
pub struct CapitalAllocatedEvent {
    pub account_id: AccountId,
    pub strategy: YieldStrategy,
    pub amount: U128,
    pub intent_hash: String,
    pub timestamp: Timestamp,
    pub tx_hash: String,
}

pub struct YieldClaimedEvent {
    pub account_id: AccountId,
    pub strategy: YieldStrategy,
    pub yield_amount: U128,
    pub intent_hash: String,
    pub timestamp: Timestamp,
    pub tx_hash: String,
}

pub struct IntentExecutionResult {
    pub intent_hash: String,
    pub success: bool,
    pub gas_used: Gas,
    pub latency_ms: u64,
    pub error_message: Option<String>,
    pub timestamp: Timestamp,
}
```

## API Reference

### View Functions
- `get_config()` - Get opportunity configuration
- `get_total_allocated()` - Get total allocated capital
- `get_available_capacity()` - Get remaining capacity
- `get_allocation(account_id)` - Get user's allocation
- `get_total_participants()` - Get total number of participants
- `get_active_participants()` - Get number of active participants
- `get_capital_allocated_events(limit?)` - Get capital allocation events
- `get_yield_claimed_events(limit?)` - Get yield claim events
- `get_intent_execution_results(limit?)` - Get intent execution results

### Call Functions
- `allocate(amount)` - Allocate capital to opportunity
- `claim_yield()` - Claim accumulated yield
- `update_config(new_config)` - Update opportunity config (owner only)
- `set_active(is_active)` - Activate/deactivate opportunity (owner only)

## Deployment

### Prerequisites
1. **NEAR CLI**: `npm install -g near-cli`
2. **Rust**: Latest stable version
3. **NEAR Account**: With testnet NEAR tokens

### Quick Deploy (All Opportunities)
```bash
cd contracts/opportunity-contract-v0
./deploy.sh
```

This will deploy three opportunities:
- **Staking**: `staking-opportunity-contract-v0.your-account.testnet`
- **Lending**: `lending-opportunity-contract-v0.your-account.testnet`
- **Liquidity**: `liquidity-opportunity-contract-v0.your-account.testnet`

### Manual Deployment (Single Opportunity)
```bash
# 1. Compile contract
cargo build --target wasm32-unknown-unknown --release

# 2. Create contract account
near create-account staking-opportunity-contract-v0.your-account.testnet \
    --masterAccount your-account.testnet \
    --networkId testnet

# 3. Deploy contract
near deploy staking-opportunity-contract-v0.your-account.testnet \
    target/wasm32-unknown-unknown/release/opportunity-contract-v0.wasm \
    --networkId testnet

# 4. Initialize contract
near call staking-opportunity-contract-v0.your-account.testnet new \
    '{
        "owner_id": "your-account.testnet",
        "name": "NEAR Staking Pool",
        "description": "Stake wNEAR to earn NEAR rewards",
        "strategy": "Staking",
        "target_apy": 1200,
        "max_allocation": "10000000000000000000000000",
        "total_capacity": "50000000000000000000000000",
        "min_allocation": "1000000000000000000000000"
    }' \
    --accountId your-account.testnet \
    --networkId testnet
```

## Testing

### Test Capital Allocation
```bash
# Allocate 1 NEAR to staking opportunity
near call staking-opportunity-contract-v0.your-account.testnet allocate \
    '{"amount":"1000000000000000000000000"}' \
    --accountId your-account.testnet \
    --networkId testnet
```

### Test Yield Claiming
```bash
# Claim yield (wait some time after allocation)
near call staking-opportunity-contract-v0.your-account.testnet claim_yield \
    --accountId your-account.testnet \
    --networkId testnet
```

### Verify Results
```bash
# Check your allocation
near view staking-opportunity-contract-v0.your-account.testnet get_allocation \
    '{"account_id":"your-account.testnet"}' \
    --networkId testnet

# Check total allocated
near view staking-opportunity-contract-v0.your-account.testnet get_total_allocated \
    --networkId testnet

# Check capital allocated events
near view staking-opportunity-contract-v0.your-account.testnet get_capital_allocated_events \
    --networkId testnet

# Check yield claimed events
near view staking-opportunity-contract-v0.your-account.testnet get_yield_claimed_events \
    --networkId testnet

# Check intent execution results
near view staking-opportunity-contract-v0.your-account.testnet get_intent_execution_results \
    --networkId testnet
```

## Event Format

### Capital Allocated Event
```json
{
  "standard": "bond-credit-opportunity",
  "version": "1.0.0",
  "event": "capital_allocated",
  "data": [{
    "account_id": "user.testnet",
    "strategy": "Staking",
    "amount": "1000000000000000000000000",
    "intent_hash": "user.testnet-1000000000000000000000000-1640995200000000000-abc123",
    "timestamp": 1640995200000000000
  }]
}
```

### Yield Claimed Event
```json
{
  "standard": "bond-credit-opportunity",
  "version": "1.0.0",
  "event": "yield_claimed",
  "data": [{
    "account_id": "user.testnet",
    "strategy": "Staking",
    "yield_amount": "50000000000000000000000",
    "intent_hash": "yield-user.testnet-50000000000000000000000-1640995200000000000-def456",
    "timestamp": 1640995200000000000
  }]
}
```

## NEAR Intents Integration

### How It Works
1. **User Allocates**: User calls `allocate()` with amount
2. **Intent Generation**: Contract generates unique intent hash
3. **Strategy Execution**: Contract calls appropriate strategy contract
4. **Intent Tracking**: Results tracked in `IntentExecutionResult`
5. **Event Emission**: Success/failure events logged

### Strategy Contracts (v0 Mock)
- **Staking**: `staking-pool.testnet` (mock contract)
- **Lending**: `lending-protocol.testnet` (mock contract)
- **Liquidity**: `liquidity-pool.testnet` (mock contract)

### Production Integration
In production, these would integrate with real protocols:
- **Staking**: NEAR staking pools, validator contracts
- **Lending**: Burrow, Meta Pool lending
- **Liquidity**: Ref Finance, Trisolaris DEX

## Security Considerations

### v0 Limitations
- **Mock Integrations**: Uses mock strategy contracts for testing
- **Simplified Yield**: Basic yield calculation without compounding
- **No Slippage Protection**: Basic allocation without slippage checks
- **Manual Yield Claims**: Users must manually claim yield

### Future Improvements
- **Real Protocol Integration**: Connect with actual DeFi protocols
- **Automated Yield Claims**: Auto-compound yield
- **Slippage Protection**: Add slippage tolerance
- **Dynamic APY**: Real-time APY calculation from protocols

## Integration

### Frontend Integration
```typescript
import { OpportunityContract } from '@/lib/near-contract-interactions';

// Initialize opportunity contract
const stakingContract = new OpportunityContract(
    account, 
    'staking-opportunity-contract-v0.your-account.testnet'
);

// Allocate capital
await stakingContract.allocate('1000000000000000000000000');

// Claim yield
await stakingContract.claimYield();

// Get user allocation
const allocation = await stakingContract.getAllocation(accountId);

// Get events
const capitalEvents = await stakingContract.getCapitalAllocatedEvents();
const yieldEvents = await stakingContract.getYieldClaimedEvents();
```

## Monitoring and Analytics

### Key Metrics
- **Total Allocated**: Total capital allocated across all opportunities
- **Active Participants**: Number of users with active allocations
- **Intent Success Rate**: Percentage of successful intent executions
- **Average Yield**: Average yield generated per user
- **Gas Efficiency**: Gas usage per intent execution

### Event Monitoring
- **Capital Allocation Events**: Track all capital allocations
- **Yield Claim Events**: Monitor yield generation
- **Intent Execution Results**: Track success rates and performance

## Next Steps

This opportunity contract is the foundation for yield generation in the Bond.Credit system. Next components:

1. **Registry Contract** - Opportunity management and discovery
2. **Executor Bot** - Automated allocation and yield claiming
3. **Scoring System** - Trust score calculation based on performance

## Support

For issues or questions:
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Check the main project README
- **Community**: Join our Discord/Telegram for support
