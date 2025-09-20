#!/usr/bin/env tsx

/**
 * Parallel Wallet Transfer Executor
 * Sends 100 sequential transfers from multiple wallets to bctemp.near in parallel
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Account } from '@near-js/accounts';
import { KeyPair } from '@near-js/crypto';
import { InMemoryKeyStore } from '@near-js/keystores';
import { JsonRpcProvider } from '@near-js/providers';
import { KeyPairSigner } from '@near-js/signers';

interface WalletConfig {
  accountId: string;
  privateKey: string;
}

interface TransferResult {
  wallet: string;
  success: boolean;
  transactionHash?: string;
  error?: string;
}

class ParallelWalletTransferExecutor {
  private targetAccountId: string = 'bctemp.near';
  private networkId: string;
  private nodeUrl: string;
  private wallets: WalletConfig[];

  constructor() {
    this.networkId = process.env.NEAR_NETWORK_ID || 'mainnet';
    this.nodeUrl = process.env.NEAR_NODE_URL || 'https://free.rpc.fastnear.com';
    
    // Define the wallets we want to use for parallel transfers
    this.wallets = [
      {
        accountId: 'poornecktie5469.near',
        privateKey: process.env.NEAR_PRIVATE_KEY || ''
      },
      {
        accountId: 'simpleapp7f5194.near',
        privateKey: process.env.NEAR_PRIVATE_KEY_2 || ''
      },
      {
        accountId: 'sickpp1064.near',
        privateKey: process.env.NEAR_PRIVATE_KEY_3 || ''
      }
    ];
    
    // Filter out wallets without private keys
    this.wallets = this.wallets.filter(wallet => wallet.privateKey);
  }

  async initializeAccount(walletConfig: WalletConfig): Promise<Account | null> {
    try {
      console.log(`Initializing wallet connection for ${walletConfig.accountId}...`);
      
      // Create key store and add the key
      const keyStore = new InMemoryKeyStore();
      const keyPair = KeyPair.fromString(walletConfig.privateKey);
      await keyStore.setKey(this.networkId, walletConfig.accountId, keyPair);
      
      // Create provider and signer
      const provider = new JsonRpcProvider({ url: this.nodeUrl });
      const signer = new KeyPairSigner(keyPair);
      
      // Create account instance
      const account = new Account(walletConfig.accountId, provider, signer);
      
      // Verify account exists by checking state
      const state = await account.state();
      console.log(`Account ${walletConfig.accountId} verified. Balance: ${(parseFloat(state.amount) / 1e24).toFixed(4)} NEAR`);
      
      return account;
    } catch (error) {
      console.error(`Failed to initialize wallet ${walletConfig.accountId}:`, error);
      return null;
    }
  }

  async executeSingleTransfer(account: Account, amountNear: number): Promise<TransferResult> {
    try {
      // Convert to yoctoNEAR using BigInt to avoid precision issues
      const yoctoAmount = BigInt(Math.round(amountNear * 1e24)).toString();
      
      console.log(`Sending ${amountNear} NEAR from ${account.accountId} to ${this.targetAccountId}...`);
      
      const result = await (account as any).sendMoney(
        this.targetAccountId,
        yoctoAmount
      );
      
      return {
        wallet: account.accountId,
        success: true,
        transactionHash: result.transaction.hash
      };
    } catch (error) {
      console.error(`Transfer failed from ${account.accountId}:`, error);
      return {
        wallet: account.accountId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async executeSequentialTransfersForWallet(
    account: Account,
    count: number = 100,
    amountNear: number = 0.001,
    delayMs: number = 1000
  ): Promise<TransferResult[]> {
    console.log(`🚀 Starting sequential transfers from ${account.accountId}: ${count} transfers of ${amountNear} NEAR each`);
    
    const results: TransferResult[] = [];
    
    for (let i = 1; i <= count; i++) {
      console.log(`🔄 Executing transfer ${i}/${count} from ${account.accountId}...`);
      
      try {
        const result = await this.executeSingleTransfer(account, amountNear);
        results.push(result);
        
        if (result.success) {
          console.log(`✅ Transfer ${i} from ${account.accountId} successful! Hash: ${result.transactionHash}`);
        } else {
          console.log(`❌ Transfer ${i} from ${account.accountId} failed: ${result.error}`);
        }
      } catch (error) {
        console.log(`❌ Transfer ${i} from ${account.accountId} failed with exception:`, error);
        results.push({
          wallet: account.accountId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      // Add delay between transfers to avoid rate limiting
      if (i < count) {
        console.log(`⏳ Waiting ${delayMs/1000} seconds before next transfer from ${account.accountId}...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    return results;
  }

  async executeParallelTransfers(
    count: number = 100,
    amountNear: number = 0.001,
    delayMs: number = 1000
  ): Promise<void> {
    console.log(`🚀 Starting parallel transfers to ${this.targetAccountId}`);
    console.log(`   Network: ${this.networkId}`);
    console.log(`   Wallets: ${this.wallets.map(w => w.accountId).join(', ')}`);
    console.log('=====================================================');

    if (this.wallets.length === 0) {
      console.error('❌ No wallets configured. Please set wallet credentials in .env.local');
      return;
    }

    // Initialize all accounts
    const accounts: Account[] = [];
    for (const walletConfig of this.wallets) {
      const account = await this.initializeAccount(walletConfig);
      if (account) {
        accounts.push(account);
      }
    }

    if (accounts.length === 0) {
      console.error('❌ Failed to initialize any wallets');
      return;
    }

    console.log(`✅ Successfully initialized ${accounts.length} wallets`);

    // Execute transfers in parallel
    const allResults = await Promise.all(
      accounts.map(account => 
        this.executeSequentialTransfersForWallet(account, count, amountNear, delayMs)
      )
    );

    // Flatten results and generate summary
    const flattenedResults = allResults.flat();
    const successfulTransfers = flattenedResults.filter(r => r.success).length;
    const failedTransfers = flattenedResults.length - successfulTransfers;
    
    // Summary
    console.log('\n=====================================================');
    console.log('📊 PARALLEL TRANSFER SUMMARY');
    console.log('=====================================================');
    console.log(`Total wallets: ${accounts.length}`);
    console.log(`Transfers per wallet: ${count}`);
    console.log(`Total transfers: ${flattenedResults.length}`);
    console.log(`Successful: ${successfulTransfers}`);
    console.log(`Failed: ${failedTransfers}`);
    console.log(`Success rate: ${(successfulTransfers/flattenedResults.length*100).toFixed(2)}%`);
    console.log(`Total amount transferred: ${(successfulTransfers * amountNear).toFixed(4)} NEAR`);
    
    // Show first few transaction hashes per wallet
    for (const account of accounts) {
      const walletResults = flattenedResults.filter(r => r.wallet === account.accountId && r.success);
      if (walletResults.length > 0) {
        console.log(`\n📋 First 3 successful transactions from ${account.accountId}:`);
        walletResults.slice(0, 3).forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.transactionHash}`);
        });
      }
    }
    
    if (failedTransfers > 0) {
      console.log(`\n⚠️  ${failedTransfers} transfers failed. Check error messages above.`);
    }
    
    console.log('\n🎉 Parallel transfer execution completed!');
  }
}

async function main() {
  // Check required environment variables
  if (!process.env.NEAR_PRIVATE_KEY) {
    console.error('❌ NEAR_PRIVATE_KEY environment variable is required');
    console.error('Please set it in your .env.local file');
    process.exit(1);
  }

  const executor = new ParallelWalletTransferExecutor();
  
  // Execute 100 sequential transfers of 0.001 NEAR each with 1 second delay
  await executor.executeParallelTransfers(100, 0.001, 1000);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
    process.exit(0);
  });
}

export { ParallelWalletTransferExecutor };