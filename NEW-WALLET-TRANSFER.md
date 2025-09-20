# New Wallet Creation and Transfer Demo

This demo shows how to create a new wallet and make a transfer on the NEAR blockchain.

## What This Demo Does

1. **Creates a new wallet** using a seed phrase
2. **Makes a small transfer** from your existing account to the new wallet
3. **Provides instructions** for using the new wallet

## Prerequisites

1. Ensure you have the required environment variables in your `.env.local` file:
   ```
   NEAR_ACCOUNT_ID=your_existing_account_id
   NEAR_PRIVATE_KEY=your_existing_account_private_key
   NEAR_NETWORK_ID=mainnet
   NEAR_NODE_URL=https://free.rpc.fastnear.com
   ```

2. Make sure your existing account has sufficient NEAR balance (at least 0.011 NEAR for testing)

## Running the Demo

```bash
npm run new-wallet-demo
```

## What Happens When You Run the Demo

1. **Wallet Creation**: A new wallet is generated with a unique account ID
2. **Transfer**: 0.001 NEAR is transferred from your existing account to the new wallet
3. **Output**: The demo shows the new wallet's account ID and transaction details

## Understanding Wallet Creation

### Implicit Accounts
- New wallets are created as "implicit accounts" on NEAR
- The account ID is derived from the public key
- These accounts need to be funded before they can be used for most operations

### Security Notes
- **Private Key**: The demo generates a private key that you must store securely
- **Funding**: Implicit accounts must be funded with at least a small amount of NEAR
- **Never Share**: Never share your private keys or commit them to version control

## Using Your New Wallet

After running the demo, you can use your new wallet by:

1. Adding the new wallet's private key to your `.env.local` file:
   ```
   NEAR_ACCOUNT_ID=new_wallet_account_id
   NEAR_PRIVATE_KEY=new_wallet_private_key
   ```

2. Running any of the existing scripts with your new wallet:
   ```bash
   npm run execute-rewards
   npm run parallel-account-transfers
   ```

## Important Considerations

### Account Activation
- Implicit accounts on NEAR are "activated" when they receive their first transfer
- The demo automatically activates your new wallet by sending it NEAR

### Gas Fees
- All transactions on NEAR require gas fees
- The demo includes a small buffer for gas fees in balance checks

### Network
- The demo uses the network specified in your `.env.local` file (mainnet by default)
- For testing, you can use testnet by changing `NEAR_NETWORK_ID` to `testnet`