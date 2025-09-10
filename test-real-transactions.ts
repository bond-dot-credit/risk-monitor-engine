#!/usr/bin/env ts-node

/**
 * Test script to execute a small number of real transactions
 * to verify the transaction execution system is working properly
 */

// Load environment variables from .env.local file
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { deriveMultipleWallets } from './src/lib/near-intents/wallet-integration';
import { BulkOperationsManager, BulkOperationConfig } from './src/lib/near-intents/bulk-operations';

async function testRealTransactions() {
  console.log('🚀 Testing Real Transaction Execution');
  console.log('====================================');
  
  try {
    // Derive a small number of wallets for testing (5 instead of 100)
    console.log('\n1️⃣  Deriving 5 wallets for testing...');
    const wallets = await deriveMultipleWallets(
      process.env.NEAR_NETWORK_ID || 'mainnet',
      5
    );
    console.log(`✅ Successfully derived ${wallets.length} wallets`);
    
    // Convert derived wallets to NearAccountConfig format
    const accountConfigs = wallets.map(wallet => ({
      accountId: wallet.accountId,
      privateKey: wallet.privateKey,
      networkId: process.env.NEAR_NETWORK_ID || 'mainnet',
      nodeUrl: process.env.NEAR_NODE_URL || 'https://rpc.mainnet.near.org'
    }));
    
    // Configure bulk operations for a small number of transactions
    console.log('\n2️⃣  Configuring bulk operations...');
    const config: BulkOperationConfig = {
      wallets: accountConfigs,
      transactionsPerWallet: 2, // Only 2 transactions per wallet for testing
      tokens: [
        { from: 'NEAR', to: 'USDC' },
        { from: 'USDC', to: 'NEAR' }
      ],
      amountRange: {
        min: parseFloat(process.env.MIN_TRANSACTION_AMOUNT || '0.1'),
        max: parseFloat(process.env.MAX_TRANSACTION_AMOUNT || '0.5')
      },
      delayBetweenTransactions: parseInt(process.env.TRANSACTION_DELAY || '5000'), // 5 second delay
      agentId: 'near-protocol-rewards-test'
    };
    
    const totalTransactions = config.wallets.length * config.transactionsPerWallet;
    console.log(`📊 Configured to execute ${totalTransactions} transactions`);
    
    // Show cost estimation
    const avgGasCost = 0.001;
    const estimatedCost = totalTransactions * avgGasCost;
    console.log(`\n💰 Cost Estimation: ${estimatedCost.toFixed(4)} NEAR`);
    
    // Execute transactions
    console.log('\n3️⃣  Executing test transactions...');
    console.log('⏳ This may take a minute. Please be patient...\n');
    
    const bulkManager = new BulkOperationsManager();
    const result = await bulkManager.executeBulkSwaps(config);
    
    // Show results
    console.log('\n4️⃣  Transaction Results');
    console.log('=====================');
    console.log(`✅ Successful transactions: ${result.successfulTransactions}`);
    console.log(`❌ Failed transactions: ${result.failedTransactions}`);
    console.log(`💰 Success rate: ${(result.successfulTransactions/totalTransactions*100).toFixed(2)}%`);
    
    if (result.results.length > 0) {
      console.log('\n📋 Transaction Details:');
      result.results.slice(0, 3).forEach((res, index) => {
        if (res.success) {
          console.log(`  ${index + 1}. SUCCESS - Hash: ${res.transactionHash?.substring(0, 10)}...`);
        } else {
          console.log(`  ${index + 1}. FAILED - Error: ${res.error}`);
        }
      });
    }
    
    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      result.errors.slice(0, 3).forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.wallet}: ${error.error}`);
      });
    }
    
    console.log('\n🎉 Test transaction execution completed!');
    
  } catch (error) {
    console.error('❌ Error executing test transactions:', error);
    if (error instanceof Error) {
      console.error('📝 Error details:', error.message);
    }
  }
}

// Run the test
if (require.main === module) {
  testRealTransactions().catch(console.error);
}