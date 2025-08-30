#!/usr/bin/env tsx

/**
 * Script to execute actual NEAR transactions that spend small amounts of tokens
 * This will help increase transaction volume and smart contract calls for NEAR Protocol Rewards
 */

// Load environment variables from .env.local file
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Account } from '@near-js/accounts';
import { KeyPair } from '@near-js/crypto';
import { InMemoryKeyStore } from '@near-js/keystores';
import { JsonRpcProvider } from '@near-js/providers';
import { KeyPairSigner } from '@near-js/signers';

async function executeActualTransactions() {
  console.log('🚀 NEAR Protocol Rewards - Actual Transactions Executor');
  console.log('====================================================');
  
  try {
    // Get configuration from environment variables
    const accountId = process.env.NEAR_ACCOUNT_ID || 'bctemp.near';
    const privateKey = process.env.NEAR_PRIVATE_KEY || '';
    const nodeUrl = process.env.NEAR_NODE_URL || 'https://free.rpc.fastnear.com';
    
    console.log(`\n💼 Executing actual transactions from account: ${accountId}`);
    
    // Initialize account without deprecated Connection
    const keyStore = new InMemoryKeyStore();
    const keyPair = KeyPair.fromString(privateKey as any);
    await keyStore.setKey('mainnet', accountId, keyPair);
    
    const provider = new JsonRpcProvider({ url: nodeUrl });
    const signer = new KeyPairSigner(keyPair);
    const account = new Account(accountId, provider, signer);
    
    // Check account balance
    const balance = await account.getAccountBalance();
    const availableNear = parseFloat(balance.available) / 1e24;
    console.log(`   Available balance: ${availableNear.toFixed(6)} NEAR`);
    
    if (availableNear < 0.01) {
      console.log(`   ⚠️  Insufficient balance for transactions`);
      return;
    }
    
    // Execute actual transactions (self-transfers that spend a tiny amount)
    const targetTransactions = 100; // Number of transactions to execute
    let successfulTransactions = 0;
    const amountToSend = "1000000000000000000000"; // 0.001 NEAR in yoctoNEAR
    const transactionCost = 0.001; // Approximate cost per transaction
    
    console.log(`\n💸 Executing ${targetTransactions} actual transactions of 0.001 NEAR each...`);
    console.log(`   Total estimated cost: ${(targetTransactions * transactionCost).toFixed(4)} NEAR`);
    
    for (let i = 1; i <= targetTransactions; i++) {
      try {
        console.log(`   Executing transaction ${i}/${targetTransactions}...`);
        
        // Execute actual transaction (self-transfer)
        const result = await (account as any).sendMoney(
          accountId, // Send to self
          amountToSend
        );
        
        successfulTransactions++;
        console.log(`   ✅ Transaction ${i} successful! (Total: ${successfulTransactions})`);
        console.log(`      Transaction hash: ${result.transaction.hash}`);
        
        // Update progress every 10 transactions
        if (i % 10 === 0) {
          console.log(`      Progress: ${successfulTransactions}/${targetTransactions} transactions completed`);
        }
        
        // Delay between transactions to avoid rate limiting
        if (i < targetTransactions) {
          console.log(`      Waiting 3 seconds before next transaction...`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
        }
      } catch (error) {
        console.error(`   ❌ Transaction ${i} failed:`, error);
        
        // Longer delay if there's an error
        if (i < targetTransactions) {
          console.log(`      Waiting 10 seconds before next transaction...`);
          await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
        }
      }
    }
    
    console.log(`\n🎉 Actual transactions execution completed!`);
    console.log(`✅ Total successful transactions: ${successfulTransactions}`);
    console.log(`💰 Total cost: ${(successfulTransactions * transactionCost).toFixed(4)} NEAR`);
    
    // Calculate estimated progress toward rewards
    const estimatedVolumeUSD = successfulTransactions * transactionCost * 2.5; // Assuming 2.5 USD/NEAR
    console.log(`\n📈 Estimated Progress Toward Rewards:`);
    console.log(`   Transaction Volume: $${estimatedVolumeUSD.toFixed(2)}`);
    console.log(`   Smart Contract Calls: ${successfulTransactions} (each transaction counts as a call)`);
    console.log(`   Unique Wallets: 1`);
    
    if (successfulTransactions >= 100) {
      console.log(`\n🏆 Great progress! You're building up your transaction volume and smart contract calls.`);
    }
    
  } catch (error) {
    console.error('❌ Error executing actual transactions:', error);
    if (error instanceof Error) {
      console.error('📝 Error details:', error.message);
    }
  }
}

// Run the executor
if (require.main === module) {
  executeActualTransactions().catch(console.error);
}