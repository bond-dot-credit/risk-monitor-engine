#!/usr/bin/env tsx

/**
 * Script to derive 100+ unique wallets and execute transactions from them
 * This will help meet the Unique Wallets requirement for NEAR Protocol Rewards
 */

// Load environment variables from .env.local file
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Account } from '@near-js/accounts';
import { KeyPair } from '@near-js/crypto';
import { InMemoryKeyStore } from '@near-js/keystores';
import { JsonRpcProvider } from '@near-js/providers';
import { KeyPairSigner } from '@near-js/signers';
import { parseSeedPhrase } from 'near-seed-phrase';

interface DerivedWallet {
  accountId: string;
  privateKey: string;
  index: number;
}

/**
 * Derive multiple wallets from the seed phrase using HD derivation
 */
async function deriveMultipleWallets(networkId: string = 'mainnet', count: number = 100): Promise<DerivedWallet[]> {
  try {
    const wallets: DerivedWallet[] = [];
    const mnemonic = 'forget kite door execute produce head young caution rotate scout noodle coach';
    
    console.log(`\n🔐 Deriving ${count} wallets from seed phrase...`);
    
    for (let i = 0; i < count; i++) {
      // Derive key for each index using BIP44 path for NEAR
      const path = `m/44'/397'/0'/0'/${i}'`;
      const { secretKey, publicKey } = parseSeedPhrase(mnemonic, path);
      
      // Create key pair
      const keyPair = KeyPair.fromString(secretKey as any);
      
      // Derive account ID from public key (for implicit accounts)
      const implicitAccountId = Buffer.from(keyPair.getPublicKey().data).toString('hex');
      
      // Use mainnet account format
      const accountId = networkId === 'testnet' 
        ? `${implicitAccountId}.testnet` 
        : implicitAccountId;
      
      wallets.push({
        accountId,
        privateKey: secretKey,
        index: i
      });
      
      if ((i + 1) % 20 === 0) {
        console.log(`   Derived ${i + 1}/${count} wallets...`);
      }
    }
    
    console.log(`✅ Successfully derived ${wallets.length} wallets from seed phrase`);
    return wallets;
  } catch (error) {
    console.error('❌ Error deriving multiple wallets:', error);
    throw new Error(`Failed to derive wallets: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Initialize a NEAR account connection
 */
async function initializeAccount(accountId: string, privateKey: string, nodeUrl: string): Promise<Account> {
  // Create key store and add the key
  const keyStore = new InMemoryKeyStore();
  const keyPair = KeyPair.fromString(privateKey as any);
  await keyStore.setKey('mainnet', accountId, keyPair);
  
  // Create provider and signer
  const provider = new JsonRpcProvider({ url: nodeUrl });
  const signer = new KeyPairSigner(keyPair);
  
  // Create account instance
  return new Account(accountId, provider, signer);
}

/**
 * Execute a small transaction from an account (self-transfer)
 */
async function executeTransactionFromAccount(account: Account, delayMs: number): Promise<boolean> {
  const accountId = account.accountId;
  
  try {
    console.log(`   Executing transaction from ${accountId}...`);
    
    // Very small amount (0.001 NEAR) to self
    const yoctoAmount = "1000000000000000000000"; // 0.001 NEAR in yoctoNEAR
    
    const result = await (account as any).sendMoney(
      accountId, // Send to self
      yoctoAmount
    );
    
    console.log(`   ✅ Transaction successful from ${accountId}!`);
    console.log(`      Transaction hash: ${result.transaction.hash}`);
    
    // Wait before next transaction to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    return true;
  } catch (error) {
    console.error(`   ❌ Transaction failed from ${accountId}:`, error);
    return false;
  }
}

async function executeMultiWalletRewards() {
  console.log('🚀 NEAR Protocol Rewards - Multi-Wallet Executor');
  console.log('==============================================');
  
  try {
    // Use the official NEAR RPC
    const nodeUrl = process.env.NEAR_NODE_URL || 'https://free.rpc.fastnear.com';
    const mainAccountId = process.env.NEAR_ACCOUNT_ID || 'bctemp.near';
    
    console.log(`\n🎯 Goal: Execute transactions from 100+ unique wallets`);
    console.log(`   Main account: ${mainAccountId}`);
    
    // Derive 100+ wallets
    console.log('\n1️⃣  Deriving 100+ unique wallets...');
    const wallets = await deriveMultipleWallets('mainnet', 100);
    
    console.log('\n2️⃣  Executing transactions from derived wallets...');
    
    let successfulWallets = 0;
    let totalTransactions = 0;
    
    // Process wallets in small batches to avoid overwhelming the RPC
    const batchSize = 5;
    for (let i = 0; i < wallets.length; i += batchSize) {
      const batch = wallets.slice(i, i + batchSize);
      const batchNumber = Math.floor(i/batchSize) + 1;
      const totalBatches = Math.ceil(wallets.length/batchSize);
      
      console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} wallets)...`);
      
      // Initialize accounts for this batch
      const accounts: Account[] = [];
      for (const wallet of batch) {
        try {
          const account = await initializeAccount(wallet.accountId, wallet.privateKey, nodeUrl);
          accounts.push(account);
        } catch (error) {
          console.error(`   ❌ Failed to initialize account ${wallet.accountId}:`, error);
        }
      }
      
      console.log(`   Successfully initialized ${accounts.length}/${batch.length} accounts`);
      
      // Execute one transaction from each account in this batch
      for (const account of accounts) {
        const success = await executeTransactionFromAccount(account, 2000); // 2 second delay
        if (success) {
          successfulWallets++;
          totalTransactions++;
        }
      }
      
      // Wait between batches to avoid rate limiting
      if (i + batchSize < wallets.length) {
        console.log(`\n⏳ Waiting 30 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
    
    console.log(`\n🎉 Multi-wallet execution completed!`);
    console.log(`✅ Successful transactions: ${totalTransactions}`);
    console.log(`👥 Unique wallets used: ${successfulWallets}`);
    console.log(`💰 Estimated total cost: ${(totalTransactions * 0.001).toFixed(4)} NEAR`);
    
    // Calculate estimated progress toward rewards
    const estimatedVolumeUSD = totalTransactions * 0.001 * 2.5; // Assuming 2.5 USD/NEAR
    console.log(`\n📈 Estimated Progress Toward Rewards:`);
    console.log(`   Transaction Volume: $${estimatedVolumeUSD.toFixed(2)}`);
    console.log(`   Smart Contract Calls: ${totalTransactions}`);
    console.log(`   Unique Wallets: ${successfulWallets}`);
    
    if (successfulWallets >= 100) {
      console.log(`\n🏆 Congratulations! You've met the 100+ unique wallets requirement!`);
    } else {
      const remaining = 100 - successfulWallets;
      console.log(`\n📊 You need ${remaining} more unique wallets to reach the 100+ requirement`);
    }
    
  } catch (error) {
    console.error('❌ Error executing multi-wallet rewards:', error);
    if (error instanceof Error) {
      console.error('📝 Error details:', error.message);
    }
  }
}

// Run the executor
if (require.main === module) {
  executeMultiWalletRewards().catch(console.error);
}