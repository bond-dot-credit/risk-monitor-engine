#!/usr/bin/env ts-node

/**
 * Real Transaction Executor for NEAR Protocol Rewards
 * 
 * This script executes actual transactions on the NEAR blockchain to earn protocol rewards.
 * 
 * ⚠️  WARNING: This script will execute REAL transactions that cost NEAR tokens!
 * ⚠️  Make sure you understand what you're doing and have configured everything correctly.
 */

// Load environment variables from .env.local file
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { deriveMultipleWallets } from './src/lib/near-intents/wallet-integration';
import { BulkOperationsManager, BulkOperationConfig } from './src/lib/near-intents/bulk-operations';
import { OnChainMetricsCollector } from './src/lib/near-intents/onchain-metrics';

interface TransactionResult {
  success: boolean;
  message: string;
  transactionHash?: string;
  error?: string;
}

class RealTransactionExecutor {
  private bulkManager: BulkOperationsManager;
  
  constructor() {
    this.bulkManager = new BulkOperationsManager();
  }
  
  async executeProtocolRewardsTransactions(): Promise<void> {
    console.log('🚀 NEAR Protocol Rewards - Real Transaction Executor');
    console.log('====================================================');
    
    // Safety confirmation
    const confirmation = await this.getUserConfirmation();
    if (!confirmation) {
      console.log('❌ Transaction execution cancelled by user.');
      return;
    }
    
    try {
      // Step 1: Derive 100+ wallets as required for Diamond tier
      console.log('\n1️⃣  Deriving 100+ wallets for NEAR Protocol Rewards...');
      const wallets = await deriveMultipleWallets(
        process.env.NEAR_NETWORK_ID || 'mainnet',
        100
      );
      console.log(`✅ Successfully derived ${wallets.length} wallets`);
      
      // Convert derived wallets to NearAccountConfig format
      const accountConfigs = wallets.map(wallet => ({
        accountId: wallet.accountId,
        privateKey: wallet.privateKey,
        networkId: process.env.NEAR_NETWORK_ID || 'mainnet',
        nodeUrl: process.env.NEAR_NODE_URL || 'https://free.rpc.fastnear.com'
      }));
      
      // Step 2: Configure bulk operations for high-volume transactions
      console.log('\n2️⃣  Configuring bulk operations...');
      const config: BulkOperationConfig = {
        wallets: accountConfigs,
        transactionsPerWallet: 10, // Start with 10 transactions per wallet to avoid rate limiting
        tokens: [
          { from: 'NEAR', to: 'USDC' },
          { from: 'USDC', to: 'NEAR' },
          { from: 'NEAR', to: 'USDT' },
          { from: 'USDT', to: 'NEAR' }
        ],
        amountRange: {
          min: parseFloat(process.env.MIN_TRANSACTION_AMOUNT || '0.1'),
          max: parseFloat(process.env.MAX_TRANSACTION_AMOUNT || '1.0')
        },
        delayBetweenTransactions: parseInt(process.env.TRANSACTION_DELAY || '5000'), // Increase delay to 5 seconds to avoid rate limiting
        agentId: 'near-protocol-rewards-executor'
      };
      
      const totalTransactions = config.wallets.length * config.transactionsPerWallet;
      console.log(`📊 Configured to execute ${totalTransactions.toLocaleString()} transactions`);
      
      // Step 3: Show cost estimation
      await this.showCostEstimation(totalTransactions);
      
      // Step 4: Execute transactions
      console.log('\n3️⃣  Executing transactions...');
      console.log('⏳ This may take several minutes. Please be patient...\n');
      
      // Execute high-volume transactions
      const result = await this.bulkManager.executeBulkSwaps(config);
      
      // Step 5: Show results
      console.log('\n4️⃣  Transaction Results');
      console.log('=====================');
      console.log(`✅ Successful transactions: ${result.successfulTransactions}`);
      console.log(`❌ Failed transactions: ${result.failedTransactions}`);
      console.log(`💰 Success rate: ${(result.successfulTransactions/totalTransactions*100).toFixed(2)}%`);
      
      if (result.errors.length > 0) {
        console.log('\n⚠️  First 5 errors:');
        result.errors.slice(0, 5).forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.wallet}: ${error.error}`);
        });
      }
      
      // Step 6: Collect metrics for rewards calculation
      console.log('\n5️⃣  Collecting on-chain metrics...');
      await this.collectAndDisplayMetrics(wallets.map(w => w.accountId));
      
      console.log('\n🎉 Transaction execution completed successfully!');
      console.log('📊 Monitor your rewards on the Protocol Rewards Dashboard');
      
    } catch (error) {
      console.error('❌ Error executing transactions:', error);
      if (error instanceof Error) {
        console.error('📝 Error details:', error.message);
      }
    }
  }
  
  private async getUserConfirmation(): Promise<boolean> {
    console.log('\n⚠️  WARNING: This script will execute REAL transactions on the NEAR blockchain!');
    console.log('⚠️  These transactions will cost NEAR tokens for gas fees!');
    console.log('⚠️  Make sure you have configured your environment variables correctly!');
    
    // In a real implementation, we would ask for user confirmation
    // For now, we'll simulate this with a simple return
    console.log('\n✅ Proceeding with transaction execution...');
    return true;
  }
  
  private async showCostEstimation(totalTransactions: number): Promise<void> {
    // Average gas cost per transaction (in NEAR)
    const avgGasCost = 0.001;
    const estimatedCost = totalTransactions * avgGasCost;
    
    console.log(`\n💰 Cost Estimation:`);
    console.log(`   Total transactions: ${totalTransactions.toLocaleString()}`);
    console.log(`   Average gas cost per transaction: ${avgGasCost} NEAR`);
    console.log(`   Estimated total cost: ${estimatedCost.toFixed(2)} NEAR`);
    
    // Check if we should proceed based on environment
    if (process.env.NEAR_NETWORK_ID === 'mainnet') {
      console.log('💎 Executing on MAINNET - Real NEAR tokens will be spent!');
    } else {
      console.log('🧪 Executing on TESTNET - Test tokens will be used (no real value)');
    }
  }
  
  private async collectAndDisplayMetrics(walletIds: string[]): Promise<void> {
    try {
      const config = {
        networkId: process.env.NEAR_NETWORK_ID || 'mainnet',
        nodeUrl: process.env.NEAR_NODE_URL || 'https://free.rpc.fastnear.com',
        walletUrl: process.env.NEAR_WALLET_URL || 'https://wallet.near.org',
        helperUrl: process.env.NEAR_HELPER_URL || 'https://helper.mainnet.near.org',
        accountId: process.env.NEAR_ACCOUNT_ID || 'bctemp.near',
        privateKey: process.env.NEAR_PRIVATE_KEY || ''
      };
      
      const collector = new OnChainMetricsCollector(config);
      await collector.initialize();
      
      // Collect metrics for the last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const metrics = await collector.collectMetrics(startDate, endDate, walletIds);
      
      console.log('\n📊 On-Chain Metrics for NEAR Protocol Rewards:');
      console.log(`   💰 Transaction Volume: $${metrics.transactionVolume.toLocaleString(undefined, {maximumFractionDigits: 2})}`);
      console.log(`   🔧 Smart Contract Calls: ${metrics.smartContractCalls}`);
      console.log(`   👥 Unique Wallets: ${metrics.uniqueWallets}`);
      
      // Calculate reward tier
      const rewardTier = this.calculateRewardTier(metrics);
      const monetaryReward = this.calculateMonetaryReward(rewardTier);
      
      console.log(`\n🏆 Reward Tier: ${rewardTier}`);
      console.log(`💵 Potential Reward: $${monetaryReward.toLocaleString()}`);
      
    } catch (error) {
      console.error('❌ Error collecting metrics:', error);
    }
  }
  
  private calculateRewardTier(metrics: any): string {
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
  
  private calculateMonetaryReward(tier: string): number {
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
}

// Main execution function
async function main() {
  // Check if required environment variables are set
  const requiredEnvVars = ['NEAR_ACCOUNT_ID', 'NEAR_PRIVATE_KEY'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
    console.error('\n📝 Please set these variables in your .env.local file');
    process.exit(1);
  }
  
  const executor = new RealTransactionExecutor();
  await executor.executeProtocolRewardsTransactions();
}

// Run the executor
if (require.main === module) {
  main().catch(console.error);
}