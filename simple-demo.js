/**
 * Simple Demo for NEAR Protocol Rewards
 * This script demonstrates the key components without executing real transactions
 */

// Import required modules
const fs = require('fs');

// Function to simulate wallet derivation
function deriveWallets(count) {
  console.log(`Deriving ${count} wallets from seed phrase...`);
  const wallets = [];
  for (let i = 0; i < count; i++) {
    wallets.push({
      accountId: `wallet-${i}.testnet`,
      privateKey: `ed25519:private-key-${i}`,
      publicKey: `public-key-${i}`,
      index: i
    });
  }
  console.log(`✅ Successfully derived ${wallets.length} wallets`);
  return wallets;
}

// Function to simulate transaction execution
function executeTransactions(wallets, transactionsPerWallet) {
  console.log(`\nExecuting ${transactionsPerWallet} transactions for each of ${wallets.length} wallets...`);
  const totalTransactions = wallets.length * transactionsPerWallet;
  console.log(`Total transactions to execute: ${totalTransactions}`);
  
  // Simulate transaction execution
  let successful = 0;
  let failed = 0;
  
  for (let i = 0; i < totalTransactions; i++) {
    // Simulate 95% success rate
    if (Math.random() > 0.05) {
      successful++;
    } else {
      failed++;
    }
    
    // Show progress every 100 transactions
    if ((i + 1) % 100 === 0 || i === totalTransactions - 1) {
      console.log(`Progress: ${i + 1}/${totalTransactions} (${successful} successful, ${failed} failed)`);
    }
  }
  
  return { successful, failed };
}

// Function to simulate metrics collection
function collectMetrics() {
  console.log('\nCollecting on-chain metrics...');
  const metrics = {
    transactionVolume: Math.random() * 20000, // $0-$20,000
    smartContractCalls: Math.floor(Math.random() * 1000), // 0-1000 calls
    uniqueWallets: Math.floor(Math.random() * 150) // 0-150 wallets
  };
  
  console.log(`💰 Transaction Volume: $${metrics.transactionVolume.toFixed(2)}`);
  console.log(`🔧 Smart Contract Calls: ${metrics.smartContractCalls}`);
  console.log(`👥 Unique Wallets: ${metrics.uniqueWallets}`);
  
  return metrics;
}

// Function to calculate reward tier
function calculateRewardTier(metrics) {
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

// Function to calculate monetary reward
function calculateMonetaryReward(tier) {
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

// Main function
async function main() {
  console.log('🚀 NEAR Protocol Rewards - Simple Demo');
  console.log('=====================================');
  
  // Step 1: Derive wallets (100+ required for Diamond tier)
  const wallets = deriveWallets(100);
  
  // Step 2: Execute transactions
  const transactionResults = executeTransactions(wallets, 100);
  
  // Step 3: Collect metrics
  const metrics = collectMetrics();
  
  // Step 4: Calculate reward tier
  const rewardTier = calculateRewardTier(metrics);
  const monetaryReward = calculateMonetaryReward(rewardTier);
  
  // Step 5: Display results
  console.log('\n🏆 Reward Calculation Results');
  console.log('===========================');
  console.log(`Reward Tier: ${rewardTier}`);
  console.log(`Potential Reward: $${monetaryReward.toLocaleString()}`);
  
  console.log('\n🎉 Demo completed successfully!');
  console.log('\nTo execute real transactions:');
  console.log('1. Configure your .env.local file with real NEAR account credentials');
  console.log('2. Run: npm run execute-rewards');
  console.log('3. Or use the interactive scripts:');
  console.log('   - run-rewards-demo.bat (Windows)');
  console.log('   - run-rewards.ps1 (PowerShell)');
}

// Run the demo
main().catch(console.error);