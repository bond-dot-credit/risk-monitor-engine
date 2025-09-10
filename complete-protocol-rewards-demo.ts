/**
 * Complete NEAR Protocol Rewards Demo
 * This script demonstrates how to execute real transactions to earn NEAR Protocol Rewards
 */

import { deriveMultipleWallets } from './src/lib/near-intents/wallet-integration';
import { BulkOperationsManager, BulkOperationConfig } from './src/lib/near-intents/bulk-operations';
import { OnChainMetricsCollector } from './src/lib/near-intents/onchain-metrics';

async function runProtocolRewardsDemo() {
  console.log('🚀 Starting NEAR Protocol Rewards Demo');
  console.log('=====================================');
  
  try {
    // Step 1: Derive multiple wallets (requirement for 100+ unique wallets)
    console.log('Step 1: Deriving 100+ wallets from seed phrase...');
    const wallets = await deriveMultipleWallets('testnet', 100);
    console.log(`✅ Successfully derived ${wallets.length} wallets`);
    
    // Step 2: Initialize bulk operations manager
    console.log('\nStep 2: Initializing bulk operations manager...');
    const bulkManager = new BulkOperationsManager();
    
    // Step 3: Configure bulk operations for high-volume transactions
    console.log('\nStep 3: Configuring bulk operations...');
    const config: BulkOperationConfig = {
      wallets: wallets.slice(0, 10), // Use first 10 wallets for demo
      transactionsPerWallet: 5, // 5 transactions per wallet
      tokens: [
        { from: 'NEAR', to: 'USDC' },
        { from: 'USDC', to: 'NEAR' },
        { from: 'NEAR', to: 'USDT' },
        { from: 'USDT', to: 'NEAR' }
      ],
      amountRange: { min: 0.1, max: 1.0 }, // Small amounts for testing
      delayBetweenTransactions: 1000, // 1 second delay between transactions
      agentId: 'protocol-rewards-demo'
    };
    
    const totalTransactions = config.wallets.length * config.transactionsPerWallet;
    console.log(`📊 Configured to execute ${totalTransactions} transactions across ${config.wallets.length} wallets`);
    
    // Step 4: Execute bulk transactions (this is where real blockchain interactions happen)
    console.log('\nStep 4: Executing bulk transactions...');
    console.log('⚠️  Note: This would execute real transactions on the NEAR blockchain');
    console.log('⚠️  For testing, we are using mocked implementations');
    
    // In a real implementation, this would execute actual blockchain transactions:
    /*
    const result = await bulkManager.executeBulkSwaps(config);
    
    console.log('\nStep 5: Transaction Results');
    console.log(`✅ Successful transactions: ${result.successfulTransactions}`);
    console.log(`❌ Failed transactions: ${result.failedTransactions}`);
    console.log(`💰 Success rate: ${(result.successfulTransactions/totalTransactions*100).toFixed(2)}%`);
    
    // Step 5: Collect on-chain metrics for rewards calculation
    console.log('\nStep 6: Collecting on-chain metrics...');
    const metricsCollector = new OnChainMetricsCollector({
      networkId: process.env.NEAR_NETWORK_ID || 'testnet',
      nodeUrl: process.env.NEAR_NODE_URL || 'https://rpc.testnet.near.org',
      walletUrl: process.env.NEAR_WALLET_URL || 'https://wallet.testnet.near.org',
      helperUrl: process.env.NEAR_HELPER_URL || 'https://helper.testnet.near.org',
      accountId: process.env.NEAR_ACCOUNT_ID || 'test-account.testnet',
      privateKey: process.env.NEAR_PRIVATE_KEY || 'ed25519:test-key'
    });
    
    await metricsCollector.initialize();
    
    // Collect metrics for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const metrics = await metricsCollector.collectMetrics(startDate, endDate, 
      config.wallets.map(w => w.accountId));
    
    console.log('\nStep 7: On-Chain Metrics for NEAR Protocol Rewards');
    console.log(`💰 Transaction Volume: $${metrics.transactionVolume.toLocaleString()}`);
    console.log(`🔧 Smart Contract Calls: ${metrics.smartContractCalls}`);
    console.log(`👥 Unique Wallets: ${metrics.uniqueWallets}`);
    
    // Calculate reward tier
    const rewardTier = calculateRewardTier(metrics);
    const monetaryReward = calculateMonetaryReward(rewardTier);
    
    console.log(`\n🏆 Reward Tier: ${rewardTier}`);
    console.log(`💵 Potential Reward: $${monetaryReward.toLocaleString()}`);
    */
    
    // Since we're in a demo environment, let's show what the results would look like:
    console.log('\n📋 DEMO RESULTS (Mock Data)');
    console.log('===========================');
    console.log('💰 Transaction Volume: $15,420');
    console.log('🔧 Smart Contract Calls: 627');
    console.log('👥 Unique Wallets: 100');
    console.log('🏆 Reward Tier: Diamond');
    console.log('💵 Potential Reward: $10,000');
    
    console.log('\n🎉 Protocol Rewards Demo Complete!');
    console.log('To execute real transactions, you would need to:');
    console.log('1. Configure real NEAR account credentials in environment variables');
    console.log('2. Ensure sufficient NEAR token balance in your wallets');
    console.log('3. Run the bulk operations with the configuration above');
    console.log('4. Monitor the Protocol Rewards Dashboard for results');
    
  } catch (error) {
    console.error('❌ Error in Protocol Rewards Demo:', error);
  }
}

/**
 * Calculate reward tier based on NEAR Protocol Rewards scoring system
 */
function calculateRewardTier(metrics: any): string {
  let score = 0;
  
  // Transaction Volume (8 points)
  if (metrics.transactionVolume >= 10000) {
    score += 8;
  } else if (metrics.transactionVolume >= 5000) {
    score += 6;
  } else if (metrics.transactionVolume >= 1000) {
    score += 4;
  } else if (metrics.transactionVolume >= 100) {
    score += 2;
  }
  
  // Smart Contract Calls (8 points)
  if (metrics.smartContractCalls >= 500) {
    score += 8;
  } else if (metrics.smartContractCalls >= 250) {
    score += 6;
  } else if (metrics.smartContractCalls >= 100) {
    score += 4;
  } else if (metrics.smartContractCalls >= 50) {
    score += 2;
  }
  
  // Unique Wallets (4 points)
  if (metrics.uniqueWallets >= 100) {
    score += 4;
  } else if (metrics.uniqueWallets >= 50) {
    score += 3;
  } else if (metrics.uniqueWallets >= 25) {
    score += 2;
  } else if (metrics.uniqueWallets >= 10) {
    score += 1;
  }
  
  // Determine tier based on total score (0-20 points for on-chain metrics)
  if (score >= 17) return 'Diamond';
  if (score >= 14) return 'Gold';
  if (score >= 11) return 'Silver';
  if (score >= 8) return 'Bronze';
  if (score >= 4) return 'Contributor';
  if (score >= 1) return 'Explorer';
  return 'No Tier';
}

/**
 * Calculate monetary reward based on tier
 */
function calculateMonetaryReward(tier: string): number {
  switch (tier) {
    case 'Diamond': return 10000;
    case 'Gold': return 6000;
    case 'Silver': return 3000;
    case 'Bronze': return 1000;
    case 'Contributor': return 500;
    case 'Explorer': return 100;
    default: return 0;
  }
}

// Run the demo
runProtocolRewardsDemo();