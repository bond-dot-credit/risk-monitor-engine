#!/usr/bin/env tsx

/**
 * Parallel Account Transfer Executor
 * Sends transfers from multiple accounts to bctemp.near in parallel
 * Each account sends 1 transaction per second
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

class ParallelAccountTransferExecutor {
  private targetAccountId: string;
  private networkId: string;
  private nodeUrl: string;
  private wallets: WalletConfig[];
  private transferAmount: number;
  private transfersPerAccount: number;
  private transferIntervalMs: number;

  constructor() {
    // Load configuration from environment variables
    this.networkId = process.env.NEAR_NETWORK_ID || 'mainnet';
    this.nodeUrl = process.env.NEAR_NODE_URL || 'https://free.rpc.fastnear.com';
    this.targetAccountId = process.env.TARGET_ACCOUNT_ID || 'bctemp.near';
    this.transferAmount = parseFloat(process.env.TRANSFER_AMOUNT_NEAR || '0.001');
    this.transfersPerAccount = parseInt(process.env.TRANSFERS_PER_ACCOUNT || '100');
    this.transferIntervalMs = parseInt(process.env.TRANSFER_INTERVAL_MS || '1000');
    
    // Load wallet configurations dynamically
    this.wallets = this.loadWalletConfigurations();
  }

  private loadWalletConfigurations(): WalletConfig[] {
    const wallets: WalletConfig[] = [];
    let index = 1;
    
    // Load wallets dynamically from environment variables
    while (true) {
      const accountId = process.env[`NEAR_ACCOUNT_ID_${index}`];
      const privateKey = process.env[`NEAR_PRIVATE_KEY_${index}`];
      
      // Break if we don't have both account ID and private key
      if (!accountId || !privateKey) {
        break;
      }
      
      wallets.push({
        accountId,
        privateKey
      });
      
      index++;
    }
    
    return wallets;
  }

  async initializeAccount(walletConfig: WalletConfig): Promise<Account | null> {
    try {
      console.log(`Initializing wallet connection for ${walletConfig.accountId}...`);
      
      // Check if private key is in the correct format
      if (!walletConfig.privateKey.includes(':')) {
        console.error(`Invalid private key format for ${walletConfig.accountId}. Expected format: <curve>:<encoded key>`);
        console.error(`Current value: ${walletConfig.privateKey}`);
        return null;
      }
      
      // Create key store and add the key
      const keyStore = new InMemoryKeyStore();
      const keyPair = KeyPair.fromString(walletConfig.privateKey as any);
      await keyStore.setKey(this.networkId, walletConfig.accountId, keyPair);
      
      // Create provider and signer
      const provider = new JsonRpcProvider({ url: this.nodeUrl });
      const signer = new KeyPairSigner(keyPair);
      
      // Create account instance
      const account = new Account(walletConfig.accountId, provider, signer);
      
      // Verify account exists by checking state
      const state = await account.state();
      const balanceNear = parseFloat(state.amount.toString()) / 1e24;
      console.log(`Account ${walletConfig.accountId} verified. Balance: ${balanceNear.toFixed(4)} NEAR`);
      
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
    count: number,
    amountNear: number,
    delayMs: number
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
      
      // Add delay between transfers to maintain 1 transaction per second
      if (i < count) {
        console.log(`⏳ Waiting ${delayMs/1000} seconds before next transfer from ${account.accountId}...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    return results;
  }

  async executeParallelTransfers(): Promise<void> {
    console.log(`🚀 Starting parallel transfers to ${this.targetAccountId}`);
    console.log(`   Network: ${this.networkId}`);
    console.log(`   Transfer amount: ${this.transferAmount} NEAR`);
    console.log(`   Transfers per account: ${this.transfersPerAccount}`);
    console.log(`   Interval between transfers: ${this.transferIntervalMs} ms`);
    console.log(`   Wallets: ${this.wallets.map(w => w.accountId).join(', ')}`);
    console.log('=====================================================');

    if (this.wallets.length === 0) {
      console.error('❌ No wallets configured. Please set wallet credentials in .env.local');
      console.error('Required format:');
      console.error('NEAR_ACCOUNT_ID_1=account1.near');
      console.error('NEAR_PRIVATE_KEY_1=private-key-1');
      console.error('NEAR_ACCOUNT_ID_2=account2.near');
      console.error('NEAR_PRIVATE_KEY_2=private-key-2');
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
    const startTime = Date.now();
    const allResults = await Promise.all(
      accounts.map(account => 
        this.executeSequentialTransfersForWallet(
          account, 
          this.transfersPerAccount, 
          this.transferAmount, 
          this.transferIntervalMs
        )
      )
    );
    const endTime = Date.now();

    // Flatten results and generate summary
    const flattenedResults = allResults.flat();
    const successfulTransfers = flattenedResults.filter(r => r.success).length;
    const failedTransfers = flattenedResults.length - successfulTransfers;
    const totalTransfers = flattenedResults.length;
    const totalTimeSeconds = (endTime - startTime) / 1000;
    
    // Summary
    console.log('\n=====================================================');
    console.log('📊 PARALLEL TRANSFER SUMMARY');
    console.log('=====================================================');
    console.log(`Total wallets: ${accounts.length}`);
    console.log(`Transfers per wallet: ${this.transfersPerAccount}`);
    console.log(`Total transfers attempted: ${totalTransfers}`);
    console.log(`Successful: ${successfulTransfers}`);
    console.log(`Failed: ${failedTransfers}`);
    console.log(`Success rate: ${(successfulTransfers/totalTransfers*100).toFixed(2)}%`);
    console.log(`Total amount transferred: ${(successfulTransfers * this.transferAmount).toFixed(4)} NEAR`);
    console.log(`Total execution time: ${totalTimeSeconds.toFixed(2)} seconds`);
    
    // Show transaction hashes per wallet
    for (const account of accounts) {
      const walletResults = flattenedResults.filter(r => r.wallet === account.accountId && r.success);
      if (walletResults.length > 0) {
        console.log(`\n📋 Successful transactions from ${account.accountId}:`);
        walletResults.forEach((result, index) => {
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
  const executor = new ParallelAccountTransferExecutor();
  await executor.executeParallelTransfers();
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

export { ParallelAccountTransferExecutor };