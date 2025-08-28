# NEAR Protocol Rewards Implementation

## Overview

This document describes the complete implementation of the NEAR Protocol Rewards system within the Risk Monitor Engine. The implementation enables tracking of on-chain metrics and calculation of potential rewards based on the NEAR Protocol Rewards scoring system.

## Features Implemented

1. **HD Wallet Derivation**: Derive 100+ unique wallets from a single seed phrase using BIP44 derivation
2. **Bulk Transaction Processing**: Execute 10,000+ transactions across multiple wallets
3. **On-Chain Metrics Collection**: Track transaction volume, smart contract calls, and unique wallets
4. **Reward Calculation**: Calculate reward tier and monetary reward based on scoring system
5. **Dashboard UI**: Visualize metrics and rewards in a user-friendly interface
6. **API Integration**: REST API endpoints for metrics collection and reward calculation

## Architecture

```
src/
├── app/
│   ├── api/
│   │   └── near-protocol-rewards/
│   │       └── route.ts          # API endpoint for reward metrics
│   └── protocol-rewards/
│       └── page.tsx              # Protocol Rewards dashboard page
├── components/
│   └── ProtocolRewardsDashboard.tsx  # UI component for reward visualization
├── lib/
│   └── near-intents/
│       ├── onchain-metrics.ts    # On-chain metrics collection
│       ├── wallet-integration.ts # HD wallet derivation
│       ├── bulk-operations.ts    # Bulk transaction processing
│       └── PROTOCOL_REWARDS.md   # Documentation
└── tests/
    └── near-protocol-rewards.test.ts # Test suite
```

## Components

### 1. HD Wallet Derivation (`wallet-integration.ts`)

The system derives multiple wallets from a single seed phrase using the BIP44 derivation path for NEAR Protocol:
- Path: `m/44'/397'/0'/0/${index}`
- Supports derivation of 100+ unique wallets
- Each wallet has a unique account ID, private key, and public key

### 2. Bulk Transaction Processing (`bulk-operations.ts`)

Enables high-volume transaction processing:
- Supports 10,000+ transactions across multiple wallets
- Configurable transaction parameters (tokens, amounts, delays)
- Error handling and retry mechanisms
- Batch processing for memory efficiency

### 3. On-Chain Metrics Collection (`onchain-metrics.ts`)

Collects the three key metrics required for Protocol Rewards:
- **Transaction Volume**: Total value of transactions in USD
- **Smart Contract Calls**: Number of unique contract interactions
- **Unique Wallets**: Number of distinct wallets interacting

### 4. API Endpoint (`/api/near-protocol-rewards/route.ts`)

REST API for collecting metrics and calculating rewards:
- `collectMetrics`: Collect on-chain metrics for a date range
- `getAccountInfo`: Get account balance and state information

### 5. Dashboard UI (`ProtocolRewardsDashboard.tsx`)

User interface for visualizing rewards data:
- Current reward tier display
- Metric progress tracking
- Date range selection
- Export functionality

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

# NearBlocks API Key (for production)
NEARBLOCKS_API_KEY=your-api-key
```

### 2. Dependencies

Ensure you have the required dependencies installed:

```bash
npm install near-api-js near-seed-phrase near-hd-key
```

## Usage

### Web Interface

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit the Protocol Rewards dashboard:
   ```
   http://localhost:3000/protocol-rewards
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

## Testing

Run the test suite to ensure everything is working correctly:

```bash
npm run test
```

The test suite includes:
- HD wallet derivation tests
- Bulk operation processing tests
- On-chain metrics collection tests
- Protocol rewards calculation tests
- Dashboard component tests

## Production Deployment

1. Set up proper indexer integration (NearBlocks API recommended)
2. Configure environment variables for production
3. Implement proper error handling and logging
4. Set up monitoring and alerting
5. Test with a small subset of data before full deployment

## Security Considerations

1. **Private Key Management**: Never expose private keys in client-side code
2. **Environment Variables**: Store sensitive information in environment variables
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Input Validation**: Validate all API inputs
5. **Error Handling**: Don't expose sensitive information in error messages

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