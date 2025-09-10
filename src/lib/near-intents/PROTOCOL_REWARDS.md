# NEAR Protocol Rewards Integration

This document explains how to set up and use the NEAR Protocol Rewards system integration within the Risk Monitor Engine.

## Overview

The NEAR Protocol Rewards system is a merit-based rewards program that incentivizes development activity and user adoption on the NEAR blockchain. This integration tracks on-chain metrics and calculates potential rewards based on:

1. **Transaction Volume**: Total value of transactions on NEAR Blockchain
2. **Smart Contract Calls**: Number of unique contract interactions
3. **Unique Wallets**: Number of distinct wallets interacting

## Architecture

```
near-intents/
├── onchain-metrics.ts     # On-chain metrics collection
├── near-intents.ts        # Core protocol interactions
├── ai-agent.ts            # High-level interface
├── bulk-operations.ts     # Bulk transaction processing
├── basic-swap.ts          # Usage example
└── index.ts               # Module exports
```

## Components

### OnChainMetricsCollector (onchain-metrics.ts)

The core component for collecting on-chain metrics:

1. **NEAR Connection**: Connects to the NEAR blockchain using near-api-js
2. **Transaction Collection**: Fetches transaction data from indexers
3. **Metric Calculation**: Calculates the three key metrics for Protocol Rewards
4. **Reward Tier Calculation**: Determines reward tier based on scoring system

### API Endpoint (/api/near-protocol-rewards)

REST API endpoint for collecting metrics and calculating rewards:

- `POST /api/near-protocol-rewards` with action `collectMetrics`
- `POST /api/near-protocol-rewards` with action `getAccountInfo`

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# NEAR Configuration
NEAR_NETWORK_ID=mainnet
NEAR_NODE_URL=https://rpc.mainnet.near.org
NEAR_WALLET_URL=https://wallet.near.org
NEAR_HELPER_URL=https://helper.mainnet.near.org
NEAR_ACCOUNT_ID=your-account.near
NEAR_PRIVATE_KEY=ed25519:your-private-key

# Optional: NearBlocks API Key (for production)
NEARBLOCKS_API_KEY=your-api-key
```

### 2. Dependencies

Ensure you have the required dependencies installed:

```bash
npm install near-api-js cross-fetch
```

### 3. Integration with Indexer (Production)

For production use, you should connect to a real indexer:

#### Option A: NearBlocks API
1. Register at [NearBlocks](https://nearblocks.io/)
2. Get an API key
3. Update the [onchain-metrics.ts](onchain-metrics.ts) file to use the NearBlocks API

#### Option B: Custom Indexer
1. Set up a NEAR Indexer following the [official guide](https://github.com/near/near-indexer-for-explorer)
2. Configure database connection in [onchain-metrics.ts](onchain-metrics.ts)

## Usage

### Collecting Metrics

```typescript
import { OnChainMetricsCollector } from './onchain-metrics';

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
```

### API Usage

#### Collect Metrics
```bash
curl -X POST http://localhost:3000/api/near-protocol-rewards \
  -H "Content-Type: application/json" \
  -d '{
    "action": "collectMetrics",
    "startDate": "2023-01-01",
    "endDate": "2023-01-31"
  }'
```

#### Get Account Info
```bash
curl -X POST http://localhost:3000/api/near-protocol-rewards \
  -H "Content-Type: application/json" \
  -d '{
    "action": "getAccountInfo"
  }'
```

## Reward Scoring System

The NEAR Protocol Rewards system uses the following scoring system for on-chain metrics (20 points total):

### Transaction Volume (8 points)
- $10,000+: 8 points
- $5,000+: 6 points
- $1,000+: 4 points
- $100+: 2 points
- < $100: 0 points

### Smart Contract Calls (8 points)
- 500+ calls: 8 points
- 250+ calls: 6 points
- 100+ calls: 4 points
- 50+ calls: 2 points
- < 50 calls: 0 points

### Unique Wallets (4 points)
- 100+ wallets: 4 points
- 50+ wallets: 3 points
- 25+ wallets: 2 points
- 10+ wallets: 1 point
- < 10 wallets: 0 points

### Reward Tiers
- **Diamond** (17-20 points): $10,000
- **Gold** (14-16 points): $6,000
- **Silver** (11-13 points): $3,000
- **Bronze** (8-10 points): $1,000
- **Contributor** (4-7 points): $500
- **Explorer** (1-3 points): $100
- **No Tier** (0 points): $0

## Security Considerations

1. **Private Key Management**: Never expose private keys in client-side code
2. **Environment Variables**: Store sensitive information in environment variables
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Input Validation**: Validate all API inputs
5. **Error Handling**: Don't expose sensitive information in error messages

## Testing

Run the test suite to ensure everything is working correctly:

```bash
npm run test
```

## Production Deployment

1. Set up proper indexer integration
2. Configure environment variables for production
3. Implement proper error handling and logging
4. Set up monitoring and alerting
5. Test with a small subset of data before full deployment

## Troubleshooting

### Common Issues

1. **Connection Errors**: Verify your NEAR node URL and network ID
2. **Authentication Errors**: Check your account ID and private key
3. **Rate Limiting**: If using NearBlocks API, check your rate limits
4. **Data Accuracy**: For production, ensure you're using a reliable indexer

### Debugging

Enable debug logging by setting the environment variable:

```env
DEBUG=near-intents:onchain-metrics
```

## Future Enhancements

1. **Off-chain Metrics**: Integrate GitHub activity tracking
2. **Advanced Analytics**: Add more detailed metrics and visualizations
3. **Automated Rewards**: Implement automatic reward claiming
4. **Multi-account Support**: Track metrics for multiple accounts
5. **Real-time Updates**: Implement WebSocket connections for real-time metrics

## Resources

- [NEAR Protocol Rewards Official Site](https://www.nearprotocolrewards.com/)
- [NEAR Documentation](https://docs.near.org/)
- [NearBlocks API Documentation](https://api.nearblocks.io/api-docs/)
- [NEAR Indexer Setup Guide](https://github.com/near/near-indexer-for-explorer)