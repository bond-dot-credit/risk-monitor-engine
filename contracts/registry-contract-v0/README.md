# Bond.Credit Registry Contract v0

## Overview

The Registry Contract is the third core component of the Bond.Credit system that handles:
- **Opportunity Listing**: Lists available yield opportunities
- **Opportunity Management**: CRUD operations for opportunities
- **Score Tracking**: Current score system (0-100) for each opportunity
- **Event Logging**: Comprehensive opportunity and score management events

## Features

### ✅ Core Functionality
- **Opportunity Discovery**: List and filter available yield opportunities
- **CRUD Operations**: Add, update, remove, and manage opportunities
- **Score System**: Track trust scores (0-100) for each opportunity
- **Category Management**: Organize opportunities by category (Staking, Lending, Liquidity, etc.)
- **Status Management**: Active, Inactive, Paused, Deprecated statuses
- **Event Logging**: Comprehensive opportunity and score management events

### 🔧 Technical Details
- **Rust + NEAR SDK 5.0**: Built with latest NEAR protocol features
- **Efficient Storage**: Optimized data structures for fast lookups
- **Event Indexing**: Standardized events for easy blockchain indexing
- **Access Control**: Owner-only functions for opportunity management

## Data Structure

### Opportunity Structure
```rust
pub struct Opportunity {
    pub id: u32,                    // Unique identifier
    pub name: String,               // Opportunity name
    pub description: String,        // Detailed description
    pub category: OpportunityCategory, // Category (Staking, Lending, etc.)
    pub apy: u16,                  // APY in basis points (1200 = 12%)
    pub current_score: u16,         // Trust score (0-100)
    pub contract_address: AccountId, // Opportunity contract address
    pub token_address: Option<AccountId>, // Token contract (if applicable)
    pub min_deposit: U128,         // Minimum deposit amount
    pub max_deposit: U128,         // Maximum deposit amount
    pub total_capacity: U128,      // Total capacity
    pub current_tvl: U128,         // Current total value locked
    pub status: OpportunityStatus,  // Active, Inactive, Paused, Deprecated
    pub created_at: Timestamp,     // Creation timestamp
    pub updated_at: Timestamp,     // Last update timestamp
    pub created_by: AccountId,     // Creator account
}
```

### Categories
- **Staking**: NEAR staking pools
- **Lending**: USDC lending protocols
- **Liquidity**: DEX liquidity provision
- **Farming**: Yield farming opportunities
- **Other**: Miscellaneous strategies

### Status Types
- **Active**: Available for allocation
- **Inactive**: Temporarily unavailable
- **Paused**: Paused by owner
- **Deprecated**: No longer supported

## API Reference

### View Functions
- `get_config()` - Get registry configuration
- `get_total_opportunities()` - Get total number of opportunities
- `get_active_opportunities_count()` - Get number of active opportunities
- `get_opportunities(limit?, offset?)` - Get all opportunities with pagination
- `get_active_opportunities(limit?, offset?)` - Get active opportunities only
- `get_opportunity(opportunity_id)` - Get specific opportunity by ID
- `get_opportunities_by_category(category, limit?)` - Get opportunities by category
- `get_opportunities_by_score_range(min_score, max_score, limit?)` - Get opportunities by score range
- `get_top_opportunities(limit?)` - Get top opportunities by score
- `get_opportunity_events(limit?)` - Get opportunity management events
- `get_score_events(limit?)` - Get score update events

### Call Functions (Owner Only)
- `add_opportunity(name, description, category, apy, contract_address, token_address?, min_deposit, max_deposit, total_capacity)` - Add new opportunity
- `update_opportunity(opportunity_id, name?, description?, apy?, min_deposit?, max_deposit?, total_capacity?)` - Update opportunity
- `remove_opportunity(opportunity_id)` - Remove/deprecate opportunity
- `update_opportunity_status(opportunity_id, status)` - Update opportunity status
- `update_opportunity_score(opportunity_id, new_score)` - Update opportunity score
- `update_opportunity_tvl(opportunity_id, new_tvl)` - Update opportunity TVL (called by opportunity contract)
- `update_config(new_config)` - Update registry configuration
- `set_paused(is_paused)` - Pause/unpause registry

## Deployment

### Prerequisites
1. **NEAR CLI**: `npm install -g near-cli`
2. **Rust**: Latest stable version
3. **NEAR Account**: With testnet NEAR tokens

### Quick Deploy
```bash
cd contracts/registry-contract-v0
./deploy.sh
```

This will:
1. Deploy the registry contract
2. Add 3 sample opportunities (Staking, Lending, Liquidity)
3. Set initial scores for demonstration

### Manual Deployment
```bash
# 1. Compile contract
cargo build --target wasm32-unknown-unknown --release

# 2. Create contract account
near create-account registry-contract-v0.your-account.testnet \
    --masterAccount your-account.testnet \
    --networkId testnet

# 3. Deploy contract
near deploy registry-contract-v0.your-account.testnet \
    target/wasm32-unknown-unknown/release/registry-contract-v0.wasm \
    --networkId testnet

# 4. Initialize contract
near call registry-contract-v0.your-account.testnet new \
    '{"owner_id": "your-account.testnet"}' \
    --accountId your-account.testnet \
    --networkId testnet
```

## Testing

### Add New Opportunity
```bash
near call registry-contract-v0.your-account.testnet add_opportunity \
    '{
        "name": "NEAR Staking Pool",
        "description": "Stake wNEAR to earn NEAR rewards with 12% APY",
        "category": "Staking",
        "apy": 1200,
        "contract_address": "staking-contract.testnet",
        "token_address": "wrap.testnet",
        "min_deposit": "1000000000000000000000000",
        "max_deposit": "10000000000000000000000000",
        "total_capacity": "50000000000000000000000000"
    }' \
    --accountId your-account.testnet \
    --networkId testnet
```

### Update Opportunity Score
```bash
near call registry-contract-v0.your-account.testnet update_opportunity_score \
    '{"opportunity_id": 1, "new_score": 95}' \
    --accountId your-account.testnet \
    --networkId testnet
```

### Update Opportunity Status
```bash
near call registry-contract-v0.your-account.testnet update_opportunity_status \
    '{"opportunity_id": 1, "status": "Paused"}' \
    --accountId your-account.testnet \
    --networkId testnet
```

### Verify Results
```bash
# Get all opportunities
near view registry-contract-v0.your-account.testnet get_opportunities --networkId testnet

# Get active opportunities
near view registry-contract-v0.your-account.testnet get_active_opportunities --networkId testnet

# Get top opportunities by score
near view registry-contract-v0.your-account.testnet get_top_opportunities --networkId testnet

# Get opportunities by category
near view registry-contract-v0.your-account.testnet get_opportunities_by_category \
    '{"category": "Staking"}' --networkId testnet

# Get specific opportunity
near view registry-contract-v0.your-account.testnet get_opportunity \
    '{"opportunity_id": 1}' --networkId testnet

# Get events
near view registry-contract-v0.your-account.testnet get_opportunity_events --networkId testnet
near view registry-contract-v0.your-account.testnet get_score_events --networkId testnet
```

## Event Format

### Opportunity Event
```json
{
  "standard": "bond-credit-registry",
  "version": "1.0.0",
  "event": "opportunity_added",
  "data": [{
    "opportunity_id": 1,
    "opportunity_name": "NEAR Staking Pool",
    "timestamp": 1640995200000000000
  }]
}
```

### Score Update Event
```json
{
  "standard": "bond-credit-registry",
  "version": "1.0.0",
  "event": "score_updated",
  "data": [{
    "opportunity_id": 1,
    "opportunity_name": "NEAR Staking Pool",
    "old_score": 75,
    "new_score": 92,
    "score_change": 17,
    "timestamp": 1640995200000000000
  }]
}
```

## Integration

### Frontend Integration
```typescript
import { RegistryContract } from '@/lib/near-contract-interactions';

// Initialize registry contract
const registryContract = new RegistryContract(
    account, 
    'registry-contract-v0.your-account.testnet'
);

// Get all opportunities
const opportunities = await registryContract.getOpportunities();

// Get active opportunities
const activeOpportunities = await registryContract.getActiveOpportunities();

// Get top opportunities by score
const topOpportunities = await registryContract.getTopOpportunities();

// Get opportunities by category
const stakingOpportunities = await registryContract.getOpportunitiesByCategory('Staking');

// Get specific opportunity
const opportunity = await registryContract.getOpportunity(1);
```

### Opportunity Contract Integration
```typescript
// Opportunity contracts can update their own TVL
await registryContract.updateOpportunityTvl(opportunityId, newTvl);
```

## Scoring System Integration

### v0 Scoring (Manual)
- **Manual Input**: Scores updated manually by owner
- **Default Score**: New opportunities start with score 75
- **Score Range**: 0-100 (0 = Very Low, 50 = Medium, 100 = Excellent)

### Future Scoring Integration
The registry is designed to integrate with the scoring system:
- **Performance Metrics**: APY consistency, uptime
- **Reliability Metrics**: Success rate, gas efficiency
- **Safety Metrics**: Audit status, incident history

## Security Considerations

### v0 Limitations
- **Owner-Only Management**: Only owner can add/update opportunities
- **Manual Scoring**: No automated score calculation
- **Basic Validation**: Simple parameter validation

### Future Improvements
- **Community Governance**: Allow community to vote on opportunities
- **Automated Scoring**: Integrate with scoring system for automatic updates
- **Multi-signature**: Require multiple signatures for critical operations

## Monitoring and Analytics

### Key Metrics
- **Total Opportunities**: Number of registered opportunities
- **Active Opportunities**: Number of currently active opportunities
- **Average Score**: Average trust score across all opportunities
- **Score Distribution**: Distribution of scores across opportunities
- **Category Breakdown**: Number of opportunities per category

### Event Monitoring
- **Opportunity Events**: Track all opportunity management activities
- **Score Events**: Monitor score updates and trends
- **TVL Updates**: Track total value locked changes

## Sample Opportunities

The deployment script creates 3 sample opportunities:

### 1. NEAR Staking Pool
- **Category**: Staking
- **APY**: 12%
- **Score**: 92
- **Description**: Stake wNEAR to earn NEAR rewards

### 2. USDC Lending Pool
- **Category**: Lending
- **APY**: 8%
- **Score**: 85
- **Description**: Lend USDC to earn interest

### 3. Liquidity Provision Pool
- **Category**: Liquidity
- **APY**: 15%
- **Score**: 88
- **Description**: Provide liquidity for trading fees

## Next Steps

This registry contract is the foundation for opportunity discovery in the Bond.Credit system. Next components:

1. **Executor Bot** - Automated allocation and yield claiming
2. **Scoring System** - Automated trust score calculation
3. **Frontend Integration** - User interface for opportunity discovery

## Support

For issues or questions:
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Check the main project README
- **Community**: Join our Discord/Telegram for support
