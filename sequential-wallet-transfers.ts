#!/usr/bin/env tsx

/**
 * Sequential Wallet Transfer Executor
 * Sends 100 sequential transfers from poornecktie5469.near to bctemp.near
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Account } from '@near-js/accounts';
import { KeyPair } from '@near-js/crypto';
import { InMemoryKeyStore } from '@near-js/keystores';
import { JsonRpcProvider } from '@near-js/providers';
import { KeyPairSigner } from '@near-js/signers';

interface TransferResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

class SequentialWalletTransferExecutor {
  private sourceAccountId: string;
  private targetAccountId: string;
  private networkId: string;
  private nodeUrl: string;
  private account: Account | null = null;

  constructor() {
    this.sourceAccountId = 'wrongegg6207.near';
    this.targetAccountId = 'bctemp.near';
    this.networkId = process.env.NEAR_NETWORK_ID || 'mainnet';
    this.nodeUrl = process.env.NEAR_NODE_URL || 'https://free.rpc.fastnear.com';
  }

  async initialize(): Promise<boolean> {
    try {
      console.log(`Initializing wallet connection for ${this.sourceAccountId}...`);
      
      // Get private key from environment variables
      const privateKey = process.env.NEAR_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('NEAR_PRIVATE_KEY environment variable is required');
      }

      // Create key store and add the key
      const keyStore = new InMemoryKeyStore();
      const keyPair = KeyPair.fromString(privateKey);
      await keyStore.setKey(this.networkId, this.sourceAccountId, keyPair);
      
      // Create provider and signer
      const provider = new JsonRpcProvider({ url: this.nodeUrl });
      const signer = new KeyPairSigner(keyPair);
      
      // Create account instance
      this.account = new Account(this.sourceAccountId, provider, signer);
      
      // Verify account exists by checking state
      const state = await this.account.state();
      console.log(`Account verified. Balance: ${(parseFloat(state.amount) / 1e24).toFixed(4)} NEAR`);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      return false;
    }
  }

  async executeSingleTransfer(amountNear: number): Promise<TransferResult> {
    if (!this.account) {
      return {
        success: false,
        error: 'Account not initialized'
      };
    }

    try {
      // Convert to yoctoNEAR using BigInt to avoid precision issues
      const yoctoAmount = BigInt(Math.round(amountNear * 1e24)).toString();
      
      console.log(`Sending ${amountNear} NEAR from ${this.sourceAccountId} to ${this.targetAccountId}...`);
      
      const result = await (this.account as any).sendMoney(
        this.targetAccountId,
        yoctoAmount
      );
      
      return {
        success: true,
        transactionHash: result.transaction.hash
      };
    } catch (error) {
      console.error('Transfer failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async executeSequentialTransfers(
    count: number = 100, 
    amountNear: number = 0.001,
    delayMs: number = 50
  ): Promise<void> {
    console.log(`🚀 Starting sequential transfers: ${count} transfers of ${amountNear} NEAR each`);
    console.log(`   From: ${this.sourceAccountId}`);
    console.log(`   To: ${this.targetAccountId}`);
    console.log(`   Network: ${this.networkId}`);
    console.log('=====================================================');

    if (!this.account) {
      console.error('❌ Account not initialized. Please initialize first.');
      return;
    }

    let successfulTransfers = 0;
    let failedTransfers = 0;
    const results: TransferResult[] = [];

    for (let i = 1; i <= count; i++) {
      console.log(`\n🔄 Executing transfer ${i}/${count}...`);
      
      try {
        const result = await this.executeSingleTransfer(amountNear);
        results.push(result);
        
        if (result.success) {
          successfulTransfers++;
          console.log(`✅ Transfer ${i} successful! Hash: ${result.transactionHash}`);
        } else {
          failedTransfers++;
          console.log(`❌ Transfer ${i} failed: ${result.error}`);
        }
      } catch (error) {
        failedTransfers++;
        console.log(`❌ Transfer ${i} failed with exception:`, error);
      }
      
      // Add delay between transfers to avoid rate limiting
      if (i < count) {
        console.log(`⏳ Waiting ${delayMs/1000} seconds before next transfer...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    // Summary
    console.log('\n=====================================================');
    console.log('📊 TRANSFER SUMMARY');
    console.log('=====================================================');
    console.log(`Total transfers: ${count}`);
    console.log(`Successful: ${successfulTransfers}`);
    console.log(`Failed: ${failedTransfers}`);
    console.log(`Success rate: ${(successfulTransfers/count*100).toFixed(2)}%`);
    console.log(`Total amount transferred: ${(successfulTransfers * amountNear).toFixed(4)} NEAR`);
    
    // Show first few transaction hashes
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length > 0) {
      console.log('\n📋 First 5 successful transaction hashes:');
      successfulResults.slice(0, 5).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.transactionHash}`);
      });
    }
    
    if (failedTransfers > 0) {
      console.log(`\n⚠️  ${failedTransfers} transfers failed. Check error messages above.`);
    }
    
    console.log('\n🎉 Sequential transfer execution completed!');
  }
}

async function main() {
  // Check required environment variables
  if (!process.env.NEAR_PRIVATE_KEY) {
    console.error('❌ NEAR_PRIVATE_KEY environment variable is required');
    console.error('Please set it in your .env.local file');
    process.exit(1);
  }

  const executor = new SequentialWalletTransferExecutor();
  
  const initialized = await executor.initialize();
  if (!initialized) {
    console.error('❌ Failed to initialize wallet connection');
    process.exit(1);
  }
  
  // Execute 100 sequential transfers of 0.001 NEAR each
  await executor.executeSequentialTransfers(100, 0.001, 20);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { SequentialWalletTransferExecutor };