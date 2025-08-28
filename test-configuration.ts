/**
 * Configuration Test for NEAR Protocol Rewards
 * 
 * This script tests the configuration and connectivity to NEAR blockchain
 * before executing real transactions for protocol rewards.
 */

import { initializeWalletConnection } from './src/lib/near-intents/wallet-integration';
import { OnChainMetricsCollector } from './src/lib/near-intents/onchain-metrics';

async function testConfiguration() {
  console.log('🧪 Testing NEAR Protocol Rewards Configuration');
  console.log('==============================================');
  
  try {
    // Test 1: Wallet Connection
    console.log('\n1️⃣  Testing Wallet Connection...');
    const wallet = await initializeWalletConnection(
      process.env.NEAR_NETWORK_ID || 'testnet'
    );
    console.log(`✅ Connected to account: ${wallet.accountId}`);
    
    // Test 2: Account Balance
    console.log('\n2️⃣  Checking Account Balance...');
    const balance = await wallet.account.getAccountBalance();
    const nearBalance = parseFloat(balance.available) / 1e24;
    console.log(`💰 Available Balance: ${nearBalance.toFixed(4)} NEAR`);
    
    if (nearBalance < 1) {
      console.log('⚠️  Warning: Low balance. Consider adding more NEAR for transactions.');
    } else {
      console.log('✅ Sufficient balance for transactions');
    }
    
    // Test 3: On-Chain Metrics Collector
    console.log('\n3️⃣  Testing Metrics Collector...');
    const config = {
      networkId: process.env.NEAR_NETWORK_ID || 'testnet',
      nodeUrl: process.env.NEAR_NODE_URL || 'https://rpc.testnet.near.org',
      walletUrl: process.env.NEAR_WALLET_URL || 'https://wallet.testnet.near.org',
      helperUrl: process.env.NEAR_HELPER_URL || 'https://helper.testnet.near.org',
      accountId: process.env.NEAR_ACCOUNT_ID || 'test-account.testnet',
      privateKey: process.env.NEAR_PRIVATE_KEY || 'ed25519:test-key'
    };
    
    const collector = new OnChainMetricsCollector(config);
    await collector.initialize();
    console.log('✅ Metrics collector initialized successfully');
    
    // Test 4: Account Info Retrieval
    console.log('\n4️⃣  Testing Account Information Retrieval...');
    const accountBalance = await collector.getAccountBalance();
    const accountState = await collector.getAccountState();
    
    console.log(`💰 Account Balance: ${(parseFloat(accountBalance.available) / 1e24).toFixed(4)} NEAR`);
    console.log(`📊 Storage Usage: ${accountState.storage_usage} bytes`);
    
    // Test 5: NEAR Price Fetching
    console.log('\n5️⃣  Testing NEAR Price Fetching...');
    const nearPrice = await collector.fetchRealNearPrice();
    console.log(`📈 Current NEAR Price: $${nearPrice.toFixed(2)} USD`);
    
    console.log('\n🎉 All configuration tests passed!');
    console.log('✅ You are ready to execute transactions for NEAR Protocol Rewards');
    
    // Summary
    console.log('\n📋 Configuration Summary');
    console.log('=======================');
    console.log(`Network: ${config.networkId}`);
    console.log(`Account: ${config.accountId}`);
    console.log(`Balance: ${nearBalance.toFixed(4)} NEAR`);
    console.log(`NEAR Price: $${nearPrice.toFixed(2)} USD`);
    
  } catch (error) {
    console.error('❌ Configuration test failed:', error);
    
    // Provide specific error guidance
    if (error instanceof Error) {
      if (error.message.includes('Failed to initialize wallet')) {
        console.log('\n🔧 Troubleshooting Tips:');
        console.log('1. Check your NEAR_PRIVATE_KEY in .env.local');
        console.log('2. Verify your NEAR_ACCOUNT_ID matches the private key');
        console.log('3. Ensure your network configuration is correct');
      } else if (error.message.includes('insufficient balance')) {
        console.log('\n💰 Funding Required:');
        console.log('1. Add NEAR tokens to your account');
        console.log('2. For testnet, use the NEAR Testnet Faucet');
        console.log('3. For mainnet, purchase NEAR on an exchange');
      }
    }
  }
}

// Run the configuration test
testConfiguration();