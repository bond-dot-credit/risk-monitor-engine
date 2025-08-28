#!/usr/bin/env ts-node

/**
 * Configuration Verification Script for NEAR Protocol Rewards
 * 
 * This script verifies that your environment is properly configured
 * before executing real transactions for NEAR Protocol Rewards.
 */

// Load environment variables from .env.local file
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { initializeWalletConnection } from './src/lib/near-intents/wallet-integration';
import { deriveMultipleWallets } from './src/lib/near-intents/wallet-integration';

interface VerificationResult {
  success: boolean;
  messages: string[];
  errors: string[];
}

class ConfigurationVerifier {
  async verifyAll(): Promise<VerificationResult> {
    console.log('🧪 Verifying NEAR Protocol Rewards Configuration');
    console.log('==============================================');
    
    const result: VerificationResult = {
      success: true,
      messages: [],
      errors: []
    };
    
    // Check 1: Environment variables
    console.log('\n1️⃣  Checking environment variables...');
    const envCheck = this.checkEnvironmentVariables();
    result.messages.push(...envCheck.messages);
    if (!envCheck.success) {
      result.errors.push(...envCheck.errors);
      result.success = false;
    }
    
    // Check 2: Wallet connection
    console.log('\n2️⃣  Testing wallet connection...');
    try {
      const walletCheck = await this.testWalletConnection();
      result.messages.push(...walletCheck.messages);
      if (!walletCheck.success) {
        result.errors.push(...walletCheck.errors);
        result.success = false;
      }
    } catch (error) {
      result.errors.push(`Wallet connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.success = false;
    }
    
    // Check 3: Wallet derivation
    console.log('\n3️⃣  Testing wallet derivation...');
    try {
      const derivationCheck = await this.testWalletDerivation();
      result.messages.push(...derivationCheck.messages);
      if (!derivationCheck.success) {
        result.errors.push(...derivationCheck.errors);
        result.success = false;
      }
    } catch (error) {
      result.errors.push(`Wallet derivation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.success = false;
    }
    
    // Summary
    console.log('\n📋 Verification Summary');
    console.log('=====================');
    if (result.success) {
      console.log('✅ All configuration checks passed!');
      console.log('🎉 You are ready to execute real transactions for NEAR Protocol Rewards');
    } else {
      console.log('❌ Configuration verification failed');
      console.log('🔧 Please fix the following issues before executing transactions:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    return result;
  }
  
  private checkEnvironmentVariables(): VerificationResult {
    const result: VerificationResult = {
      success: true,
      messages: [],
      errors: []
    };
    
    // Required environment variables
    const requiredEnvVars = ['NEAR_ACCOUNT_ID', 'NEAR_PRIVATE_KEY'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      result.success = false;
      missingEnvVars.forEach(envVar => {
        result.errors.push(`Missing required environment variable: ${envVar}`);
      });
    } else {
      result.messages.push('✅ All required environment variables are set');
    }
    
    // Check network configuration
    const networkId = process.env.NEAR_NETWORK_ID || 'testnet';
    result.messages.push(`🌐 Network configured for: ${networkId}`);
    
    if (networkId === 'mainnet') {
      result.messages.push('💎 MAINNET mode: Real NEAR tokens will be used');
    } else {
      result.messages.push('🧪 TESTNET mode: Test tokens will be used');
    }
    
    return result;
  }
  
  private async testWalletConnection(): Promise<VerificationResult> {
    const result: VerificationResult = {
      success: true,
      messages: [],
      errors: []
    };
    
    try {
      const wallet = await initializeWalletConnection(
        process.env.NEAR_NETWORK_ID || 'testnet'
      );
      
      result.messages.push(`✅ Successfully connected to account: ${wallet.accountId}`);
      
      // Check account balance
      try {
        const balance = await wallet.account.getAccountBalance();
        const nearBalance = parseFloat(balance.available) / 1e24;
        result.messages.push(`💰 Account balance: ${nearBalance.toFixed(4)} NEAR`);
        
        if (nearBalance < 0.1) {
          result.messages.push('⚠️  Low balance warning: Consider adding more NEAR for transactions');
        }
      } catch (balanceError) {
        result.messages.push('⚠️  Could not retrieve account balance (account may be new)');
      }
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Failed to connect to wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return result;
  }
  
  private async testWalletDerivation(): Promise<VerificationResult> {
    const result: VerificationResult = {
      success: true,
      messages: [],
      errors: []
    };
    
    try {
      // Test deriving a small number of wallets first
      console.log('   Deriving 5 test wallets...');
      const wallets = await deriveMultipleWallets(
        process.env.NEAR_NETWORK_ID || 'testnet',
        5
      );
      
      result.messages.push(`✅ Successfully derived ${wallets.length} test wallets`);
      
      // Show first wallet as example
      if (wallets.length > 0) {
        result.messages.push(`   Example wallet: ${wallets[0].accountId}`);
      }
      
      // Test deriving 100 wallets (required for Diamond tier)
      console.log('   Deriving 100 wallets for Diamond tier requirement...');
      const hundredWallets = await deriveMultipleWallets(
        process.env.NEAR_NETWORK_ID || 'testnet',
        100
      );
      
      result.messages.push(`✅ Successfully derived ${hundredWallets.length} wallets (Diamond tier requirement)`);
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Failed to derive wallets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return result;
  }
}

// Main execution function
async function main() {
  const verifier = new ConfigurationVerifier();
  const result = await verifier.verifyAll();
  
  // Exit with appropriate code
  process.exit(result.success ? 0 : 1);
}

// Run the verifier
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unexpected error during configuration verification:', error);
    process.exit(1);
  });
}