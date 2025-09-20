# Parallel Account Transfers Executor

This script executes parallel transfers from multiple accounts ([simpleapp7f5194.near](file:///D:/github/risk-monitor-engine/src/types/agent.ts#L21-L21) and [sickpp1064.near](file:///D:/github/risk-monitor-engine/src/types/agent.ts#L21-L21)) to the target wallet [bctemp.near](file:///D:/github/risk-monitor-engine/src/types/agent.ts#L21-L21) on the NEAR blockchain, running the transfers in parallel from each account with exactly 1 transaction per second from each account simultaneously.

## ⚠️ Important Security Warning

**Never commit your private keys to version control.** The `.env.local` file is included in `.gitignore` to prevent accidental commits.

## Setup Instructions

1. Update your `.env.local` file in the project root with the private keys for all wallets:
   ```env
   # NEAR Network Configuration
   NEAR_NETWORK_ID=mainnet
   NEAR_NODE_URL=https://free.rpc.fastnear.com
   
   # Target account for transfers
   TARGET_ACCOUNT_ID=bctemp.near
   
   # Transfer configuration
   TRANSFER_AMOUNT_NEAR=0.001
   TRANSFERS_PER_ACCOUNT=100
   TRANSFER_INTERVAL_MS=1000
   
   # Account 1 Credentials
   NEAR_ACCOUNT_ID_1=simpleapp7f5194.near
   NEAR_PRIVATE_KEY_1=your-private-key-for-simpleapp7f5194.near
   
   # Account 2 Credentials
   NEAR_ACCOUNT_ID_2=sickpp1064.near
   NEAR_PRIVATE_KEY_2=your-private-key-for-sickpp1064.near
   ```

2. Ensure all accounts have sufficient NEAR tokens for the transfers and gas fees.

## Running the Executor

```bash
npx tsx parallel-account-transfers.ts
```

## Configuration

The script is configured through environment variables:

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NEAR_NETWORK_ID` | Yes | NEAR network ID (mainnet/testnet) | mainnet |
| `NEAR_NODE_URL` | Yes | RPC endpoint URL | https://free.rpc.fastnear.com |
| `TARGET_ACCOUNT_ID` | Yes | Target account for transfers | bctemp.near |
| `TRANSFER_AMOUNT_NEAR` | No | Amount to transfer in NEAR | 0.001 |
| `TRANSFERS_PER_ACCOUNT` | No | Number of transfers per account | 100 |
| `TRANSFER_INTERVAL_MS` | No | Interval between transfers in milliseconds | 1000 |
| `NEAR_ACCOUNT_ID_*` | Yes | Account IDs for source accounts | - |
| `NEAR_PRIVATE_KEY_*` | Yes | Private keys for source accounts | - |

The script dynamically loads wallet configurations based on the numbered environment variables. You can add more accounts by continuing the pattern (NEAR_ACCOUNT_ID_3, NEAR_PRIVATE_KEY_3, etc.).

## Expected Behavior

- Each account sends 1 transaction per second (1000ms interval)
- Transfers from different accounts happen simultaneously
- Each account executes its transfers sequentially with the specified interval
- Detailed logging shows transfer progress for each account
- Summary statistics at the end show success/failure rates

## Expected Output

The script will show:
- Wallet initialization status
- Transfer progress for each wallet (current/total)
- Success/failure status for each transfer
- Transaction hashes for successful transfers
- Summary statistics at the end

## Troubleshooting

Common issues:
1. "No wallets configured" - Check your `.env.local` file for proper account configuration
2. "Insufficient balance" - Fund your accounts with more NEAR tokens
3. Network errors - Check your internet connection and RPC endpoint
4. Rate limiting - Increase the delay between transactions

## Architecture

The script uses a parallel execution model:
1. Initialize connections to all wallets concurrently
2. Execute sequential transfers from each wallet with exactly 1-second delay between transfers
3. Run transfers from different wallets in parallel to maximize throughput
4. Collect and report results from all wallets

This approach allows for high transaction throughput while respecting rate limits for each individual wallet.