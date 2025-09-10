#!/usr/bin/env ts-node

/**
 * Execute NEAR Protocol Rewards transactions using the main account
 * This script will execute real transactions to increase on-chain activity
 */

// Load environment variables from .env.local file
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { BulkOperationsManager, BulkOperationConfig } from './src/lib/near-intents/bulk-operations';
import { NearAccountConfig } from './src/lib/near-intents/ai-agent';

async function executeRewardsWithMainAccount() {
  console.log('🚀 NEAR Protocol Rewards - Main Account Transaction Executor');
  console.log('========================================================');
  
  try {
    // Use the main account from environment variables
    const mainAccountConfig: NearAccountConfig = {
      accountId: process.env.NEAR_ACCOUNT_ID || 'bctemp.near',
      privateKey: process.env.NEAR_PRIVATE_KEY || '',
      networkId: process.env.NEAR_NETWORK_ID || 'mainnet',
      nodeUrl: process.env.NEAR_NODE_URL || 'https://rpc.mainnet.near.org'
    };
    
    console.log(`\n1️⃣  Using main account: ${mainAccountConfig.accountId}`);
    
    // Configure bulk operations with the main account
    console.log('\n2️⃣  Configuring bulk operations...');
    const config: BulkOperationConfig = {
      wallets: [mainAccountConfig], // Just use the main account for now
      transactionsPerWallet: 5, // Execute 5 transactions
      tokens: [
        { from: 'NEAR', to: 'USDC' },
        { from: 'USDC', to: 'NEAR' },
        { from: 'NEAR', to: 'USDT' },
        { from: 'USDT', to: 'NEAR' }
      ],
      amountRange: {
        min: parseFloat(process.env.MIN_TRANSACTION_AMOUNT || '0.1'),
        max: parseFloat(process.env.MAX_TRANSACTION_AMOUNT || '0.5')
      },
      delayBetweenTransactions: parseInt(process.env.TRANSACTION_DELAY || '5000'), // 5 second delay
      agentId: 'near-protocol-rewards-main'
    };
    
    const totalTransactions = config.wallets.length * config.transactionsPerWallet;
    console.log(`📊 Configured to execute ${totalTransactions} transactions`);
    
    // Show cost estimation
    const avgGasCost = 0.001;
    const estimatedCost = totalTransactions * avgGasCost;
    console.log(`\n💰 Cost Estimation: ${estimatedCost.toFixed(4)} NEAR`);
    
    // Execute transactions
    console.log('\n3️⃣  Executing transactions...');
    console.log('⏳ This may take a few minutes. Please be patient...\n');
    
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
      result.results.forEach((res, index) => {
        if (res.success) {
          console.log(`  ${index + 1}. SUCCESS - Hash: ${res.transactionHash}`);
        } else {
          console.log(`  ${index + 1}. FAILED - Error: ${res.error}`);
        }
      });
    }
    
    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.wallet}: ${error.error}`);
      });
    }
    
    console.log('\n🎉 Transaction execution completed!');
    
  } catch (error) {
    console.error('❌ Error executing transactions:', error);
    if (error instanceof Error) {
      console.error('📝 Error details:', error.message);
    }
  }
}

// Run the executor
if (require.main === module) {
  executeRewardsWithMainAccount().catch(console.error);
}