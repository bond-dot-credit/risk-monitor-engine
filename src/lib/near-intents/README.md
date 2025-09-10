# NEAR Intents Integration

This module provides integration with the NEAR Intents protocol for executing multichain transactions within the Risk Monitor Engine.

## Overview

NEAR Intents is a system for executing multichain transactions. An intent represents a user's desired state change (e.g., "I want to swap X NEAR for Y USDC") rather than a specific execution path. This allows for more flexible and efficient execution of financial operations.

## Architecture

```
near-intents/
├── near-intents.ts        # Core protocol interactions
├── ai-agent.ts            # High-level interface
├── bulk-operations.ts     # Bulk transaction processing
├── onchain-metrics.ts     # On-chain metrics collection for Protocol Rewards
├── basic-swap.ts          # Usage example
└── index.ts               # Module exports
```

## Components

### NearIntents (near-intents.ts)

The core library implementing the NEAR Intents protocol:

1. **Intent Creation**: Creates intent requests for token swaps with agent linking
2. **Quote Management**: Fetches and compares quotes from the Solver Bus
3. **Intent Execution**: Signs and publishes intents to the Solver Bus
4. **Risk Integration**: Integrates with the risk monitoring system to evaluate agent credibility before high-value transactions

### AIAgent (ai-agent.ts)

The AI Agent serves as a high-level interface for executing intents on NEAR mainnet. It handles:

1. **Account Management**: Loading NEAR accounts and managing credentials
2. **Token Operations**: Depositing tokens and executing swaps with agent linking
3. **Risk Integration**: Checks agent credibility before executing transactions
4. **Error Handling**: Managing errors and providing feedback

### BulkOperationsManager (bulk-operations.ts)

Manages large-scale transaction operations:

1. **Bulk Wallet Processing**: Execute transactions across multiple wallets simultaneously
2. **High-Volume Transaction Handling**: Efficiently process 10k+ transactions
3. **Batch Processing**: Process transactions in batches to optimize performance
4. **Error Management**: Comprehensive error handling and reporting

### OnChainMetricsCollector (onchain-metrics.ts)

Collects on-chain metrics for the NEAR Protocol Rewards system:

1. **NEAR Connection**: Connects to the NEAR blockchain using near-api-js
2. **Transaction Collection**: Fetches transaction data from indexers
3. **Metric Calculation**: Calculates the three key metrics for Protocol Rewards:
   - Transaction Volume: Total value of transactions on NEAR Blockchain
   - Smart Contract Calls: Number of unique contract interactions
   - Unique Wallets: Number of distinct wallets interacting
4. **Reward Tier Calculation**: Determines reward tier based on scoring system

## Usage

### Single Transaction
```typescript
import { AIAgent } from './near-intents';

// Initialize agent
const agent = new AIAgent({
  accountId: 'your-account.near',
  privateKey: 'ed25519:your-private-key'
});

// Deposit NEAR for operations
await agent.depositNear(1.0, 'agent_1');

// Swap NEAR to USDC, linked to an agent for risk monitoring
const result = await agent.swapNearToToken('USDC', 1.0, 'agent_1');
```

### Bulk Operations (500 calls, 100 wallets, 10k transactions)
```typescript
import { BulkOperationsManager } from './near-intents';

const bulkManager = new BulkOperationsManager();

const config = {
  wallets: [
    // Array of 100 wallet configurations
    {
      accountId: 'wallet1.near',
      privateKey: 'ed25519:private-key-1'
    },
    // ... 99 more wallets
  ],
  transactionsPerWallet: 100, // 100 transactions per wallet = 10,000 total
  tokens: [
    { from: 'NEAR', to: 'USDC' },
    { from: 'USDC', to: 'NEAR' }
  ],
  amountRange: { min: 1, max: 100 },
  delayBetweenTransactions: 100, // ms
  agentId: 'agent_1'
};

const result = await bulkManager.executeHighVolumeTransactions(config);
console.log(`Processed ${result.totalTransactions} transactions`);
console.log(`Successful: ${result.successfulTransactions}`);
console.log(`Failed: ${result.failedTransactions}`);
```

### Protocol Rewards Metrics Collection
```typescript
import { OnChainMetricsCollector } from './near-intents';

const collector = new OnChainMetricsCollector({
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
  walletUrl: 'https://wallet.near.org',
  helperUrl: 'https://helper.mainnet.near.org',
  accountId: 'your-account.near',
  privateKey: 'ed25519:your-private-key'
});

await collector.initialize();

const startDate = new Date('2023-01-01');
const endDate = new Date('2023-01-31');

const metrics = await collector.collectMetrics(startDate, endDate);
console.log('Metrics:', metrics);

// Calculate reward tier based on NEAR Protocol Rewards scoring system
const rewardTier = calculateRewardTier(metrics);
const monetaryReward = calculateMonetaryReward(rewardTier);
```

## Supported Assets

Currently supported tokens:
- NEAR (Native token)
- USDC (a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near)

## Integration with Risk Monitor Engine

This integration enhances the Risk Monitor Engine by:

1. **Cross-chain Transactions**: Execute transactions across multiple blockchain networks
2. **Agent-Linked Operations**: All transactions are linked to specific agents for tracking and risk assessment
3. **Risk-Based Controls**: High-value transactions are evaluated based on agent credibility before execution
4. **Real-time Monitoring**: Transaction data can be integrated with the existing risk monitoring system
5. **Bulk Operations**: Process large volumes of transactions efficiently with proper error handling
6. **Protocol Rewards**: Track on-chain metrics and calculate potential rewards through the NEAR Protocol Rewards program

## API Endpoints

The integration provides the following API endpoints:

- `POST /api/near-intents`: Execute NEAR Intents operations
  - `getAccountInfo`: Get account information
  - `swapTokens`: Execute a token swap
  - `getAgentInfo`: Get agent information

- `POST /api/near-intents-bulk`: Execute bulk operations
  - `executeBulkSwaps`: Execute bulk token swaps across multiple wallets

- `POST /api/near-protocol-rewards`: Collect Protocol Rewards metrics
  - `collectMetrics`: Collect on-chain metrics for a date range
  - `getAccountInfo`: Get account information for rewards calculation

## Bulk Operations Capabilities

The bulk operations module can handle:

- **500+ API Calls**: Execute 500+ simultaneous API calls
- **100+ Wallets**: Process transactions for 100+ different wallets
- **10,000+ Transactions**: Execute up to 10,000 transactions in batch mode

Features:
- Batch processing for memory efficiency
- Configurable delays between transactions
- Comprehensive error reporting
- Progress tracking
- High-volume optimized processing

## NEAR Protocol Rewards Integration

The integration includes comprehensive support for the NEAR Protocol Rewards system:

### On-Chain Metrics (20 points total):
- **Transaction Volume**: 8 points (max at $10,000+)
- **Smart Contract Calls**: 8 points (max at 500+ calls)
- **Unique Wallets**: 4 points (max at 100+ unique wallets)

### Reward Tiers:
- **Diamond** (17-20 points): $10,000
- **Gold** (14-16 points): $6,000
- **Silver** (11-13 points): $3,000
- **Bronze** (8-10 points): $1,000
- **Contributor** (4-7 points): $500
- **Explorer** (1-3 points): $100

For detailed setup and usage instructions, see [PROTOCOL_REWARDS.md](PROTOCOL_REWARDS.md).

## Setup

1. Install dependencies:
```bash
npm install near-api-js bn.js cross-fetch
```

2. Configure your NEAR account credentials in environment variables or config files

3. Use the modules in your components or services as needed

## Security Considerations

1. **Agent Risk Assessment**: High-value transactions are evaluated based on agent credibility
2. **Input Validation**: All API endpoints validate input parameters
3. **Error Handling**: Comprehensive error handling prevents information leakage
4. **Secure Storage**: Private keys should be stored securely and never exposed in client-side code
5. **Rate Limiting**: Bulk operations include configurable delays to prevent network overload
6. **Protocol Rewards**: Secure handling of metrics data and reward calculations

For detailed security considerations for Protocol Rewards, see [PROTOCOL_REWARDS.md](PROTOCOL_REWARDS.md).

# NEAR Intents On-Chain Implementation

This directory contains the complete on-chain implementation of NEAR Intents integration, replacing all mock data and simulations with real blockchain interactions.

## 🎯 Overview

The NEAR Intents system has been completely refactored to work with real NEAR blockchain data and transactions. All previous mock implementations have been replaced with actual on-chain interactions.

## 🔧 Components

### Core Classes

#### `AIAgent` - Autonomous Trading Agent
- **Real NEAR blockchain connection** using `near-api-js`
- **Actual wallet integration** with private key management
- **Live transaction execution** with proper gas fee handling
- **Real balance checking** and validation
- **Comprehensive error handling** for blockchain operations

#### `NearIntents` - Intent Management System
- **Real Solver Bus integration** with fallback mechanisms
- **Actual verifier contract interactions** on NEAR
- **Live quote fetching** from real solvers
- **On-chain transaction signing** and submission
- **Multi-DEX support** with direct execution fallbacks

#### `OnChainMetricsCollector` - Real Data Collection
- **Live transaction data** from NEAR indexers (NearBlocks, Pagoda)
- **Real price oracle integration** (CoinGecko API)
- **Actual blockchain metrics** calculation
- **Historical data analysis** with proper date filtering
- **Multiple data source fallbacks** for reliability

#### `BulkOperationsManager` - High-Volume Processing
- **Real multi-wallet management** with proper initialization
- **Batch processing** for high-volume operations (10k+ transactions)
- **Rate limiting** and proper delays between operations
- **Memory management** for large-scale operations
- **Comprehensive error tracking** per wallet/transaction

### Configuration Management

#### `NearIntentsConfigManager` - Environment Configuration
- **Network-specific settings** (mainnet/testnet/localnet)
- **API key management** for external services
- **Validation utilities** for all configuration parameters
- **Singleton pattern** for global access
- **Environment variable integration**

### Utilities

#### `NearIntentsErrorHandler` - Error Management
- **Blockchain-specific error parsing** and categorization
- **Retry logic** with exponential backoff
- **User-friendly error messages**
- **Retryability detection** for different error types

#### `ValidationUtils` - Input Validation
- **NEAR account ID validation**
- **Private key format checking**
- **Transaction parameter validation**
- **Network and URL validation**

#### `TransactionUtils` - Blockchain Utilities
- **NEAR/yoctoNEAR conversions**
- **Gas fee estimation**
- **Transaction hash validation**
- **Amount formatting**

## 🚀 Setup and Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```
# NEAR Network Configuration
NEAR_NETWORK_ID=testnet
NEAR_NODE_URL=https://rpc.testnet.near.org
NEAR_WALLET_URL=https://wallet.testnet.near.org
NEAR_HELPER_URL=https://helper.testnet.near.org

# NEAR Account Configuration
NEAR_ACCOUNT_ID=your-account.testnet
NEAR_PRIVATE_KEY=ed25519:your-private-key-here

# NEAR Intents Configuration
NEAR_INTENTS_CONTRACT_ID=intents.testnet
VERIFIER_CONTRACT_ID=intents.verifier.testnet
SOLVER_BUS_URL=https://solver-bus.testnet.near.org
SOLVER_BUS_API_KEY=your-solver-bus-api-key

# Indexer APIs
NEARBLOCKS_API_KEY=your-nearblocks-api-key
PAGODA_API_KEY=your-pagoda-api-key

# Price Oracles
COINGECKO_API_KEY=your-coingecko-api-key
```

### Required API Keys

1. **NearBlocks API** - For transaction indexing
   - Sign up at [nearblocks.io](https://nearblocks.io)
   - Get API key from dashboard

2. **Pagoda API** - For enhanced NEAR data access
   - Sign up at [pagoda.co](https://pagoda.co)
   - Get API credentials

3. **CoinGecko API** - For real-time price data
   - Sign up at [coingecko.com](https://coingecko.com/en/api)
   - Get API key (free tier available)

4. **Solver Bus API** - For intent processing
   - Contact NEAR Intents team for access
   - Get API credentials

### Account Setup

1. **Create NEAR Testnet Account**:
   ```bash
   near create-account your-account.testnet --masterAccount testnet
   ```

2. **Fund Account**:
   - Use [NEAR Testnet Faucet](https://near-faucet.io/)
   - Get testnet NEAR tokens

3. **Export Private Key**:
   ```bash
   near keys your-account.testnet
   ```

## 💻 Usage Examples

### Basic Token Swap

```
import { AIAgent, nearIntentsConfig } from '@/lib/near-intents';

// Initialize with configuration
const accountConfig = nearIntentsConfig.getAccountConfig();
const agent = new AIAgent(accountConfig);

// Initialize connection
await agent.initialize();

// Check balance
const state = await agent.getAccountState();
console.log(`Balance: ${state.balanceInNear.available} NEAR`);

// Execute swap
const result = await agent.swapNearToToken('USDC', 1.0);
if (result.success) {
  console.log(`Swap successful: ${result.transactionHash}`);
} else {
  console.error(`Swap failed: ${result.error}`);
}

```

### Bulk Operations

```
import { BulkOperationsManager } from '@/lib/near-intents';

const bulkManager = new BulkOperationsManager();

const config = {
  wallets: [accountConfig], // Array of wallet configs
  transactionsPerWallet: 10,
  tokens: [{ from: 'NEAR', to: 'USDC' }],
  amountRange: { min: 0.1, max: 1.0 },
  delayBetweenTransactions: 1000,
};

const result = await bulkManager.executeBulkSwaps(config);
console.log(`Completed: ${result.successfulTransactions}/${result.totalTransactions}`);

```

### Metrics Collection

```
import { OnChainMetricsCollector } from '@/lib/near-intents';

const collector = new OnChainMetricsCollector({
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  // ... other config
});

await collector.initialize();

const metrics = await collector.collectMetrics(
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  new Date()
);

console.log(`Volume: $${metrics.transactionVolume}`);
console.log(`Contracts: ${metrics.smartContractCalls}`);
console.log(`Wallets: ${metrics.uniqueWallets}`);

```


## 🔄 API Endpoints

### NEAR Intents API (`/api/near-intents`)

**GET** - Check configuration status
**POST** - Execute operations:
- `getAccountInfo` - Get real account information
- `swapTokens` - Execute real token swaps
- `depositNear` - Deposit NEAR to intents contract
- `getAgentInfo` - Get agent information

### Bulk Operations API (`/api/near-intents-bulk`)

**GET** - Check bulk API status
**POST** - Execute bulk operations:
- `executeBulkSwaps` - Execute multiple swaps across wallets

## 🧪 Testing

### Run Integration Tests

```
npm test src/tests/near-intents-integration.test.ts

```

### Test Categories

1. **Configuration Tests** - Validate environment setup
2. **Connection Tests** - Test NEAR blockchain connectivity
3. **Transaction Tests** - Validate transaction parameters
4. **Error Handling Tests** - Test error parsing and handling
5. **API Integration Tests** - Test API endpoints
6. **Live Testnet Tests** - Optional real blockchain tests

## 🛡️ Security Considerations

### Private Key Management
- Store private keys securely in environment variables
- Never commit private keys to version control
- Use different keys for different environments
- Consider using NEAR wallet integration for production

### Rate Limiting
- Built-in rate limiting for bulk operations
- Delays between transactions to avoid overwhelming network
- Proper error handling for rate limit responses

### Error Handling
- Comprehensive error categorization
- Retry logic for transient failures
- Graceful degradation for external service failures

## 🔧 Troubleshooting

### Common Issues

1. **\"Configuration errors\"**
   - Check `.env` file exists and has all required variables
   - Validate account ID format (must end with `.testnet` for testnet)
   - Ensure private key starts with `ed25519:`

2. **\"Failed to initialize NEAR connection\"**
   - Check network connectivity
   - Verify RPC endpoint is accessible
   - Validate account exists on the network

3. **\"Insufficient balance\"**
   - Fund account using testnet faucet
   - Check available vs staked balance
   - Account for gas fees in calculations

4. **\"Rate limit exceeded\"**
   - Wait before retrying
   - Reduce transaction frequency
   - Check API key quotas

### Debug Mode

Enable debug logging:
```
DEBUG=near-intents:* npm start

```

## 📊 Monitoring

### Metrics Available
- Transaction success/failure rates
- Average transaction times
- Gas fee consumption
- API response times
- Error rates by category

### Logging
- All transactions logged with hashes
- Error details with categorization
- Performance metrics
- Configuration validation results

## 🚦 Production Deployment

### Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] API keys tested and working
- [ ] Integration tests passing
- [ ] Rate limits configured appropriately
- [ ] Error handling tested
- [ ] Monitoring set up
- [ ] Security review completed

### Mainnet Configuration

For production mainnet deployment:

```
NEAR_NETWORK_ID=mainnet
NEAR_NODE_URL=https://rpc.mainnet.near.org
NEAR_WALLET_URL=https://wallet.near.org
NEAR_HELPER_URL=https://helper.mainnet.near.org
NEAR_INTENTS_CONTRACT_ID=intents.near
VERIFIER_CONTRACT_ID=intents.verifier.near
SOLVER_BUS_URL=https://solver-bus.near.org

```


## 📚 Resources

- [NEAR Documentation](https://docs.near.org/)
- [NEAR API JS](https://github.com/near/near-api-js)
- [NEAR Intents Protocol](https://github.com/near/NEPs/discussions/497)
- [NearBlocks API](https://api.nearblocks.io/api-docs/)
- [Pagoda API](https://docs.pagoda.co/)

## 🤝 Contributing

When contributing to this implementation:

1. Ensure all tests pass
2. Add tests for new functionality
3. Follow existing error handling patterns
4. Update documentation for changes
5. Test with both testnet and mainnet configurations

---
**Note**: This implementation replaces all previous mock data with real blockchain interactions. Ensure proper configuration before use in production environments.
