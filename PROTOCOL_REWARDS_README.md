# NEAR Protocol Rewards Execution Guide

This guide explains how to execute real transactions to earn rewards in the NEAR Protocol Rewards program.

## Overview

The NEAR Protocol Rewards program incentivizes on-chain activity through a tiered reward system:
- **Diamond Tier** (17-20 points): $10,000
- **Gold Tier** (14-16 points): $6,000
- **Silver Tier** (11-13 points): $3,000
- **Bronze Tier** (8-10 points): $1,000
- **Contributor Tier** (4-7 points): $500
- **Explorer Tier** (1-3 points): $100

## Requirements for Diamond Tier (Maximum Reward)

To achieve the Diamond tier and earn the maximum $10,000 reward, you need:

1. **Transaction Volume**: $10,000+ (8 points)
2. **Smart Contract Calls**: 500+ unique calls (8 points)
3. **Unique Wallets**: 100+ distinct wallets (4 points)

## Available Scripts

### 1. Protocol Rewards Demo (`complete-protocol-rewards-demo.ts`)

A comprehensive demo that shows how the system works without executing real transactions.

```bash
npx tsx complete-protocol-rewards-demo.ts
```

### 2. Transaction Executor (`execute-rewards-transactions.ts`)

Executes real transactions on the NEAR blockchain to earn protocol rewards.

```bash
npx tsx execute-rewards-transactions.ts
```

⚠️ **WARNING**: This script executes real transactions that cost NEAR tokens!

### 3. Dashboard (`src/app/protocol-rewards/page.tsx`)

A web interface to monitor your rewards and on-chain metrics.

Access at: http://localhost:3000/protocol-rewards

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file with your NEAR account credentials:

```env
# NEAR Configuration
NEAR_NETWORK_ID=mainnet
NEAR_NODE_URL=https://rpc.mainnet.near.org
NEAR_WALLET_URL=https://wallet.near.org
NEAR_HELPER_URL=https://helper.mainnet.near.org
NEAR_ACCOUNT_ID=your-account.near
NEAR_PRIVATE_KEY=ed25519:your-private-key

# Optional API Keys
NEARBLOCKS_API_KEY=your-nearblocks-api-key
COINGECKO_API_KEY=your-coingecko-api-key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Project

```bash
npm run build
```

### 4. Start the Development Server

```bash
npm run dev
```

## Testing Process

### 1. Test with NEAR Testnet

Before executing on mainnet, test with NEAR testnet:

```env
NEAR_NETWORK_ID=testnet
NEAR_NODE_URL=https://rpc.testnet.near.org
NEAR_WALLET_URL=https://wallet.testnet.near.org
NEAR_HELPER_URL=https://helper.testnet.near.org
```

Get testnet tokens from the [NEAR Testnet Faucet](https://near-faucet.io/).

### 2. Run the Demo Script

```bash
npx tsx complete-protocol-rewards-demo.ts
```

### 3. Check the Dashboard

Visit http://localhost:3000/protocol-rewards to see the dashboard.

## Executing Real Transactions

### 1. Fund Your Account

Ensure your NEAR account has sufficient tokens for transaction fees.

### 2. Configure for Mainnet

Update your `.env.local` file to use mainnet configuration.

### 3. Run the Transaction Executor

```bash
npx tsx execute-rewards-transactions.ts
```

## Monitoring Rewards

### 1. Via Dashboard

Visit http://localhost:3000/protocol-rewards to monitor your progress.

### 2. Via API

Use the `/api/near-protocol-rewards` endpoint to collect metrics:

```bash
curl -X POST http://localhost:3000/api/near-protocol-rewards \
  -H "Content-Type: application/json" \
  -d '{"action": "collectMetrics", "startDate": "2023-01-01", "endDate": "2023-12-31"}'
```

## Best Practices

1. **Start Small**: Begin with a small number of wallets and transactions
2. **Monitor Costs**: Keep track of transaction fees
3. **Diversify**: Use multiple token pairs and contract interactions
4. **Batch Processing**: Process transactions in batches to manage resources
5. **Error Handling**: Implement proper error handling and retry mechanisms

## Troubleshooting

### Common Issues

1. **Insufficient Balance**: Fund your account with more NEAR tokens
2. **Network Errors**: Check your RPC endpoint configuration
3. **Permission Errors**: Verify your private key is correct
4. **Rate Limiting**: Add delays between transactions

### Getting Help

1. Check the console output for error messages
2. Review the logs in the development server
3. Consult the documentation in `NEAR_PROTOCOL_REWARDS_IMPLEMENTATION.md`
4. Contact the development team for support

## Security Considerations

1. **Private Keys**: Never share your private keys
2. **Environment Variables**: Keep your `.env.local` file secure
3. **Transaction Review**: Always review transactions before execution
4. **Regular Audits**: Regularly audit your code and dependencies

## Additional Resources

- [NEAR Protocol Rewards Documentation](https://near.org/blog/near-protocol-rewards)
- [NEAR Developer Documentation](https://docs.near.org)
- [NEAR Testnet Faucet](https://near-faucet.io/)