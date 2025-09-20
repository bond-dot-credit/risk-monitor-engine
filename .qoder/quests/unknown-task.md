# Parallel Account Transfers to bctemp.near

## Overview

This document describes the implementation approach for executing parallel transfers from multiple accounts (`simpleapp7f5194.near` and `sickpp1064.near`) to the target account `bctemp.near` simultaneously. The implementation leverages the existing parallel wallet transfer executor in the risk-monitor-engine project.

## Architecture

The solution uses a parallel execution model that:
1. Initializes connections to all specified wallets concurrently
2. Executes sequential transfers from each wallet with configurable delays
3. Runs transfers from different wallets in parallel to maximize throughput
4. Collects and reports results from all wallets

## Implementation Details

### Environment Configuration

To execute parallel transfers, the `.env.local` file must be configured with the private keys for all wallets involved:

```env
# NEAR Network Configuration
NEAR_NETWORK_ID=mainnet
NEAR_NODE_URL=https://free.rpc.fastnear.com

# Primary Account Credentials
NEAR_ACCOUNT_ID=poornecktie5469.near
NEAR_PRIVATE_KEY=your-private-key-for-poornecktie5469.near

# Additional Wallet Credentials for Parallel Transfers
NEAR_PRIVATE_KEY_2=your-private-key-for-simpleapp7f5194.near
NEAR_PRIVATE_KEY_3=your-private-key-for-sickpp1064.near
```

### Wallet Configuration in Code

The parallel transfer executor is already configured to use these accounts:

```typescript
this.wallets = [
  {
    accountId: 'poornecktie5469.near',
    privateKey: process.env.NEAR_PRIVATE_KEY || ''
  },
  {
    accountId: 'simpleapp7f5194.near',
    privateKey: process.env.NEAR_PRIVATE_KEY_2 || ''
  },
  {
    accountId: 'sickpp1064.near',
    privateKey: process.env.NEAR_PRIVATE_KEY_3 || ''
  }
];
```

### Execution Process

1. **Initialization**: All wallet connections are established concurrently
2. **Parallel Execution**: Sequential transfers are executed from each wallet in parallel
3. **Rate Limiting**: 1-second delays between transfers within each wallet to avoid rate limiting
4. **Monitoring**: Progress is tracked for each wallet separately
5. **Reporting**: Results are aggregated and summarized at the end

## Usage Instructions

### Prerequisites

1. Ensure all accounts have sufficient NEAR tokens for transfers and gas fees
2. Configure the `.env.local` file with the private keys for all wallets
3. Verify network connectivity to the NEAR RPC endpoint

### Running the Transfers

Execute the parallel transfer script:

```bash
npx tsx parallel-wallet-transfers.ts
```

### Configuration Options

The transfer parameters can be modified in the `main()` function:

```typescript
// Execute 100 sequential transfers of 0.001 NEAR each with 1 second delay
await executor.executeParallelTransfers(100, 0.001, 1000);
```

Parameters:
- Count: Number of transfers per wallet (default: 100)
- Amount: NEAR amount per transfer (default: 0.001 NEAR)
- Delay: Milliseconds between transfers within a wallet (default: 1000ms)

## Expected Output

The script provides real-time feedback during execution:

1. Wallet initialization status
2. Transfer progress for each wallet (current/total)
3. Success/failure status for each transfer
4. Transaction hashes for successful transfers
5. Summary statistics at the end

Example output:
```
🚀 Starting parallel transfers to bctemp.near
   Network: mainnet
   Wallets: poornecktie5469.near, simpleapp7f5194.near, sickpp1064.near
=====================================================
Initializing wallet connection for poornecktie5469.near...
Account poornecktie5469.near verified. Balance: 10.5000 NEAR
Initializing wallet connection for simpleapp7f5194.near...
Account simpleapp7f5194.near verified. Balance: 5.2500 NEAR
Initializing wallet connection for sickpp1064.near...
Account sickpp1064.near verified. Balance: 7.8000 NEAR
✅ Successfully initialized 3 wallets
```

## Error Handling

The implementation includes robust error handling:

1. **Wallet Initialization Errors**: Failed wallet connections are logged and excluded from transfers
2. **Transfer Failures**: Individual transfer failures don't stop the overall process
3. **Network Issues**: Retries and proper error reporting for network-related problems
4. **Insufficient Funds**: Clear error messages when accounts lack sufficient balance

## Security Considerations

1. **Private Key Management**: Private keys are stored in `.env.local` which is gitignored
2. **No Hardcoded Secrets**: All sensitive information is loaded from environment variables
3. **Secure Connections**: Uses official NEAR RPC endpoints for network communication

## Performance Characteristics

1. **Concurrency**: Transfers from different wallets run in parallel
2. **Rate Limiting**: Sequential transfers within each wallet respect network limits
3. **Resource Usage**: Minimal memory footprint with efficient batch processing
4. **Scalability**: Can be extended to include more wallets with minimal changes

## Troubleshooting

Common issues and solutions:

1. **"NEAR_PRIVATE_KEY environment variable is required"**
   - Solution: Ensure `.env.local` is properly configured with all required keys

2. **"Insufficient balance"**
   - Solution: Fund accounts with additional NEAR tokens

3. **Network errors**
   - Solution: Check internet connectivity and RPC endpoint status

4. **Rate limiting**
   - Solution: Increase the delay between transactions in the configuration