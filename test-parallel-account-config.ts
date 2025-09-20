#!/usr/bin/env tsx

/**
 * Test script to verify parallel account transfer configuration
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

function testConfiguration() {
  console.log('Testing Parallel Account Transfer Configuration...');
  console.log('=====================================================');
  
  // Check network configuration
  const networkId = process.env.NEAR_NETWORK_ID || 'mainnet';
  const nodeUrl = process.env.NEAR_NODE_URL || 'https://free.rpc.fastnear.com';
  
  console.log(`Network ID: ${networkId}`);
  console.log(`Node URL: ${nodeUrl}`);
  
  // Check target account
  const targetAccountId = process.env.TARGET_ACCOUNT_ID || 'bctemp.near';
  console.log(`Target Account: ${targetAccountId}`);
  
  // Check transfer configuration
  const transferAmount = process.env.TRANSFER_AMOUNT_NEAR || '0.001';
  const transfersPerAccount = process.env.TRANSFERS_PER_ACCOUNT || '100';
  const transferIntervalMs = process.env.TRANSFER_INTERVAL_MS || '1000';
  
  console.log(`Transfer Amount: ${transferAmount} NEAR`);
  console.log(`Transfers Per Account: ${transfersPerAccount}`);
  console.log(`Transfer Interval: ${transferIntervalMs} ms`);
  
  // Check wallet configurations
  console.log('\nWallet Configurations:');
  console.log('----------------------');
  
  let index = 1;
  let walletCount = 0;
  
  while (true) {
    const accountId = process.env[`NEAR_ACCOUNT_ID_${index}`];
    const privateKey = process.env[`NEAR_PRIVATE_KEY_${index}`];
    
    if (!accountId || !privateKey) {
      break;
    }
    
    console.log(`Wallet ${index}:`);
    console.log(`  Account ID: ${accountId}`);
    console.log(`  Private Key: ${privateKey ? 'SET' : 'NOT SET'} (${privateKey ? privateKey.length : 0} characters)`);
    
    walletCount++;
    index++;
  }
  
  if (walletCount === 0) {
    console.log('❌ No wallets configured!');
    console.log('Please set NEAR_ACCOUNT_ID_1 and NEAR_PRIVATE_KEY_1 (and additional wallets as needed) in your .env.local file');
  } else {
    console.log(`\n✅ Found ${walletCount} wallet(s) configured`);
  }
  
  console.log('\nConfiguration test completed.');
}

testConfiguration();