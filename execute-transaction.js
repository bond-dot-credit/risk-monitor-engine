const { deriveMultipleWallets } = require('./dist/lib/near-intents/wallet-integration');

async function testTransaction() {
  console.log('Testing transaction execution for NEAR Protocol Rewards...');
  
  try {
    // First, let's build the project to ensure we have the dist files
    console.log('Please run "npm run build" first to generate dist files');
    
    // Then we can test wallet derivation
    console.log('Deriving wallets...');
    const wallets = await deriveMultipleWallets('testnet', 5);
    console.log(`Derived ${wallets.length} wallets:`);
    wallets.forEach((wallet, index) => {
      console.log(`  ${index + 1}. ${wallet.accountId}`);
    });
    
    console.log('Transaction test setup complete. To execute real transactions, you would need to:');
    console.log('1. Configure your environment variables with real NEAR account credentials');
    console.log('2. Use the BulkOperationsManager to execute transactions');
    console.log('3. Monitor the results through the Protocol Rewards Dashboard');
    
  } catch (error) {
    console.error('Error during transaction test:', error);
  }
}

testTransaction();