#!/usr/bin/env ts-node

/**
 * Test Transaction Execution for NEAR Protocol Rewards
 * 
 * This script demonstrates how transaction execution works without
 * actually spending any tokens. It's useful for testing and understanding
 * the process before executing real transactions.
 */

import { deriveMultipleWallets } from './src/lib/near-intents/wallet-integration';

interface MockTransactionResult {
  transactionHash: string;
  success: boolean;
  gasUsed: string;
  timestamp: number;
}

class TransactionExecutionTester {
  async runTest(): Promise<void> {
    console.log('🧪 Testing NEAR Protocol Rewards Transaction Execution');
    console.log('====================================================');
    
    try {
      // Step 1: Demonstrate wallet derivation
      console.log('\n1️⃣  Wallet Derivation Demonstration');
      console.log('   Deriving 100+ wallets from seed phrase...');
      
      const wallets = await deriveMultipleWallets('testnet', 100);
      console.log(`   ✅ Successfully derived ${wallets.length} wallets`);
      console.log(`   📋 First 5 wallets:`);
      wallets.slice(0, 5).forEach((wallet, index) => {
        console.log(`     ${index + 1}. ${wallet.accountId}`);
      });
      
      // Step 2: Demonstrate transaction configuration
      console.log('\n2️⃣  Transaction Configuration Demonstration');
      const config = {
        wallets: wallets.slice(0, 10), // Use first 10 for demo
        transactionsPerWallet: 5,
        tokens: [
          { from: 'NEAR', to: 'USDC' },
          { from: 'USDC', to: 'NEAR' }
        ],
        amountRange: { min: 0.1, max: 1.0 },
        delayBetweenTransactions: 1000
      };
      
      const totalTransactions = config.wallets.length * config.transactionsPerWallet;
      console.log(`   📊 Configured to execute ${totalTransactions} transactions`);
      console.log(`   💰 Transaction amounts: ${config.amountRange.min} - ${config.amountRange.max} NEAR`);
      console.log(`   ⏱️  Delay between transactions: ${config.delayBetweenTransactions}ms`);
      
      // Step 3: Demonstrate mock transaction execution
      console.log('\n3️⃣  Mock Transaction Execution Demonstration');
      console.log('   Executing transactions (mocked - no real tokens spent)...');
      
      const results: MockTransactionResult[] = [];
      for (let i = 0; i < totalTransactions; i++) {
        // Simulate transaction execution
        const result: MockTransactionResult = {
          transactionHash: `mock-tx-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
          success: Math.random() > 0.05, // 95% success rate
          gasUsed: `${(0.001 + Math.random() * 0.001).toFixed(4)} NEAR`,
          timestamp: Date.now()
        };
        
        results.push(result);
        
        // Show progress
        if ((i + 1) % 10 === 0 || i === totalTransactions - 1) {
          const successful = results.filter(r => r.success).length;
          const failed = results.length - successful;
          console.log(`   Progress: ${i + 1}/${totalTransactions} (${successful} successful, ${failed} failed)`);
        }
        
        // Simulate delay
        await this.sleep(config.delayBetweenTransactions);
      }
      
      // Step 4: Show results
      console.log('\n4️⃣  Mock Transaction Results');
      console.log('========================');
      const successfulTransactions = results.filter(r => r.success).length;
      const failedTransactions = results.length - successfulTransactions;
      const successRate = (successfulTransactions / results.length) * 100;
      
      console.log(`   ✅ Successful transactions: ${successfulTransactions}`);
      console.log(`   ❌ Failed transactions: ${failedTransactions}`);
      console.log(`   💰 Success rate: ${successRate.toFixed(2)}%`);
      
      // Show sample transaction details
      console.log('\n   📋 Sample transaction details:');
      results.slice(0, 3).forEach((result, index) => {
        console.log(`     ${index + 1}. Hash: ${result.transactionHash.substring(0, 20)}...`);
        console.log(`        Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
        console.log(`        Gas used: ${result.gasUsed}`);
      });
      
      // Step 5: Demonstrate metrics collection
      console.log('\n5️⃣  Mock Metrics Collection Demonstration');
      console.log('=====================================');
      
      // Simulate collected metrics
      const mockMetrics = {
        transactionVolume: 12540.75,
        smartContractCalls: 689,
        uniqueWallets: 100
      };
      
      console.log(`   💰 Transaction Volume: $${mockMetrics.transactionVolume.toLocaleString(undefined, {maximumFractionDigits: 2})}`);
      console.log(`   🔧 Smart Contract Calls: ${mockMetrics.smartContractCalls}`);
      console.log(`   👥 Unique Wallets: ${mockMetrics.uniqueWallets}`);
      
      // Calculate reward tier
      const rewardTier = this.calculateRewardTier(mockMetrics);
      const monetaryReward = this.calculateMonetaryReward(rewardTier);
      
      console.log(`\n   🏆 Reward Tier: ${rewardTier}`);
      console.log(`   💵 Potential Reward: $${monetaryReward.toLocaleString()}`);
      
      console.log('\n🎉 Test execution completed successfully!');
      console.log('✅ You can now execute real transactions using the real-transaction-executor.ts script');
      
    } catch (error) {
      console.error('❌ Error during test execution:', error);
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
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution function
async function main() {
  const tester = new TransactionExecutionTester();
  await tester.runTest();
}

// Run the tester
if (require.main === module) {
  main().catch(console.error);
}