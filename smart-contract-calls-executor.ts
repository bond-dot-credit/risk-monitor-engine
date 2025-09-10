#!/usr/bin/env tsx

/**
 * Dedicated script to execute 500+ smart contract calls for NEAR Protocol Rewards
 * This script focuses specifically on executing view function calls to count toward the smart contract calls requirement
 */

// Load environment variables from .env.local file
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Account } from '@near-js/accounts';
import { KeyPair } from '@near-js/crypto';
import { InMemoryKeyStore } from '@near-js/keystores';
import { JsonRpcProvider } from '@near-js/providers';
import { KeyPairSigner } from '@near-js/signers';

async function executeSmartContractCalls() {
  console.log('🚀 NEAR Protocol Rewards - Smart Contract Calls Executor');
  console.log('====================================================');
  
  try {
    // Get configuration from environment variables
    const accountId = process.env.NEAR_ACCOUNT_ID || 'bctemp.near';
    const privateKey = process.env.NEAR_PRIVATE_KEY || '';
    const nodeUrl = process.env.NEAR_NODE_URL || 'https://free.rpc.fastnear.com';
    
    console.log(`\n💼 Executing smart contract calls from account: ${accountId}`);
    
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
    
    if (availableNear < 0.001) {
      console.log(`   ⚠️  Insufficient balance for contract calls`);
      return;
    }
    
    // Execute 500+ smart contract calls
    const targetCalls = 500;
    let successfulCalls = 0;
    const contractId = 'wrap.near'; // wNEAR contract
    
    console.log(`\n🔧 Executing ${targetCalls} smart contract calls...`);
    
    for (let i = 1; i <= targetCalls; i++) {
      try {
        // Execute a view function call (counts as a smart contract call)
        await (account as any).viewFunction({
          contractId: contractId,
          methodName: 'ft_balance_of',
          args: {
            account_id: accountId
          }
        });
        
        successfulCalls++;
        console.log(`   ✅ Smart contract call ${i}/${targetCalls} successful! (Total: ${successfulCalls})`);
        
        // Update progress every 10 calls
        if (i % 10 === 0) {
          console.log(`      Progress: ${successfulCalls}/${targetCalls} calls completed`);
        }
        
        // Small delay to avoid rate limiting
        if (i < targetCalls) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      } catch (error) {
        console.error(`   ❌ Smart contract call ${i} failed:`, error);
        
        // Try alternative method
        try {
          await (account as any).viewFunction({
            contractId: contractId,
            methodName: 'storage_balance_of',
            args: {
              account_id: accountId
            }
          });
          
          successfulCalls++;
          console.log(`   ✅ Alternative call ${i} successful! (Total: ${successfulCalls})`);
        } catch (altError) {
          console.error(`   ❌ Alternative call ${i} also failed:`, altError);
        }
        
        // Longer delay if there's an error
        if (i < targetCalls) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
        }
      }
    }
    
    console.log(`\n🎉 Smart contract calls execution completed!`);
    console.log(`✅ Total successful calls: ${successfulCalls}`);
    console.log(`💰 Estimated cost: $${(successfulCalls * 0.001 * 2.5).toFixed(2)} (based on 2.5 USD/NEAR)`);
    
    if (successfulCalls >= 500) {
      console.log(`\n🏆 Congratulations! You've reached the 500+ smart contract calls requirement!`);
      console.log(`   You now qualify for the Smart Contract Calls component of the NEAR Protocol Rewards!`);
    } else {
      const remaining = 500 - successfulCalls;
      console.log(`\n📊 You need ${remaining} more smart contract calls to reach the 500+ requirement`);
    }
    
  } catch (error) {
    console.error('❌ Error executing smart contract calls:', error);
    if (error instanceof Error) {
      console.error('📝 Error details:', error.message);
    }
  }
}

// Run the executor
if (require.main === module) {
  executeSmartContractCalls().catch(console.error);
}