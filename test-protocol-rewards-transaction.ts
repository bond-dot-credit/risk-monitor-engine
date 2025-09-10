import { deriveMultipleWallets } from './src/lib/near-intents/wallet-integration';
import { BulkOperationsManager } from './src/lib/near-intents/bulk-operations';

async function testRealTransaction() {
  console.log('Testing real transaction for NEAR Protocol Rewards...');
  
  try {
    // Derive multiple wallets
    console.log('Deriving wallets...');
    const wallets = await deriveMultipleWallets('testnet', 5);
    console.log(`Derived ${wallets.length} wallets`);
    
    // Initialize bulk operations manager
    const bulkManager = new BulkOperationsManager();
    
    // Configure for a small test transaction
    const config = {
      wallets: wallets.slice(0, 2), // Use just 2 wallets for testing
      transactionsPerWallet: 1,
      tokens: [
        { from: 'NEAR', to: 'USDC' }
      ],
      amountRange: { min: 0.1, max: 0.5 },
      delayBetweenTransactions: 1000
    };
    
    console.log('Executing bulk swaps...');
    const result = await bulkManager.executeBulkSwaps(config);
    
    console.log('Transaction result:', result);
    console.log(`Successful transactions: ${result.successfulTransactions}`);
    console.log(`Failed transactions: ${result.failedTransactions}`);
    
  } catch (error) {
    console.error('Error during transaction test:', error);
  }
}

testRealTransaction();