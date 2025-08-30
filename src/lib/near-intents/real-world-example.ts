import { initializeWalletConnection, getAccountBalance, transferNear, swapTokensOnRef, demonstrateWalletUsage } from './wallet-integration';
import { AIAgent } from './ai-agent';
import { OnChainMetricsCollector } from './onchain-metrics';
import { BulkOperationsManager } from './bulk-operations';
import { NearIntentsErrorHandler, RetryUtils } from './utils';

/**
 * Comprehensive example demonstrating real NEAR blockchain integration
 * with your mnemonic phrase for actual on-chain transactions
 */
export class RealWorldNearIntentsDemo {
  private wallet: any;
  private agent: AIAgent | null = null;
  private metricsCollector: OnChainMetricsCollector | null = null;

  constructor() {
    this.wallet = null;
  }

  /**
   * Initialize all components with real wallet connection
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Real World NEAR Intents Demo...');
      
      // Step 1: Initialize wallet connection with your mnemonic
      this.wallet = await initializeWalletConnection('testnet');
      console.log(`✅ Wallet connected: ${this.wallet.accountId}`);
      
      // Step 2: Initialize AI Agent with real account
      this.agent = new AIAgent({
        accountId: this.wallet.accountId,
        privateKey: this.wallet.keyPair.toString(),
        networkId: 'testnet',
      });
      
      await this.agent.initialize();
      console.log('✅ AI Agent initialized');
      
      // Step 3: Initialize metrics collector
      this.metricsCollector = new OnChainMetricsCollector({
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        accountId: this.wallet.accountId,
        privateKey: this.wallet.keyPair.toString(),
      });
      
      await this.metricsCollector.initialize();
      console.log('✅ Metrics collector initialized');
      
    } catch (error) {
      const nearError = NearIntentsErrorHandler.parseError(error);
      console.error('❌ Initialization failed:', NearIntentsErrorHandler.formatUserMessage(nearError));
      throw error;
    }
  }

  /**
   * Demonstrate real account operations
   */
  async demonstrateAccountOperations(): Promise<void> {
    try {
      console.log('\n📊 === Account Operations Demo ===');
      
      if (!this.wallet || !this.agent) {
        throw new Error('Components not initialized');
      }
      
      // Get real account balance
      const balance = await getAccountBalance(this.wallet.account);
      console.log(`💰 Current Balance:`);
      console.log(`   Total: ${balance.totalInNear.toFixed(4)} NEAR`);
      console.log(`   Available: ${balance.availableInNear.toFixed(4)} NEAR`);
      
      // Get detailed account state using AI Agent
      const accountState = await this.agent.getAccountState();
      console.log(`📈 Account Details:`);
      console.log(`   Storage Used: ${accountState.storage.used} bytes`);
      console.log(`   Storage Paid: ${accountState.storage.paid}`);
      
      // Check if account needs funding
      if (balance.availableInNear < 0.1) {
        console.log('⚠️  Low balance detected!');
        console.log('🔗 Please fund your account at: https://near-faucet.io/');
        console.log(`📝 Account to fund: ${this.wallet.accountId}`);
        return;
      }
      
      console.log('✅ Account has sufficient balance for operations');
      
    } catch (error) {
      const nearError = NearIntentsErrorHandler.parseError(error);
      console.error('❌ Account operations failed:', nearError.message);
    }
  }

  /**
   * Demonstrate real token swap operations
   */
  async demonstrateTokenSwap(): Promise<void> {
    try {
      console.log('\n🔄 === Token Swap Demo ===');
      
      if (!this.agent) {
        throw new Error('AI Agent not initialized');
      }
      
      const swapAmount = 0.1; // 0.1 NEAR
      console.log(`🎯 Attempting to swap ${swapAmount} NEAR to USDC...`);
      
      // Execute real token swap with retry logic
      const swapResult = await RetryUtils.withRetry(async () => {
        return await this.agent!.swapNearToToken('USDC', swapAmount);
      }, 3, 5000);
      
      if (swapResult.success) {
        console.log('✅ Swap successful!');
        console.log(`📋 Transaction Hash: ${swapResult.transactionHash}`);
        if (swapResult.agentId) {
          console.log(`🤖 Agent ID: ${swapResult.agentId}`);
        }
      } else {
        console.log('❌ Swap failed:', swapResult.error);
        
        // Check if it's a retryable error
        const error = NearIntentsErrorHandler.parseError(swapResult.error);
        if (NearIntentsErrorHandler.isRetryable(error)) {
          console.log(`🔄 Error is retryable. Retry in ${NearIntentsErrorHandler.getRetryDelay(error)} seconds`);
        }
      }
      
    } catch (error) {
      const nearError = NearIntentsErrorHandler.parseError(error);
      console.error('❌ Token swap demo failed:', nearError.message);
    }
  }

  /**
   * Demonstrate metrics collection from real blockchain data
   */
  async demonstrateMetricsCollection(): Promise<void> {
    try {
      console.log('\n📈 === Metrics Collection Demo ===');
      
      if (!this.metricsCollector) {
        throw new Error('Metrics collector not initialized');
      }
      
      // Collect metrics for the last 7 days
      const endDate = new Date();
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      console.log(`📊 Collecting metrics from ${startDate.toDateString()} to ${endDate.toDateString()}...`);
      
      const metrics = await this.metricsCollector.collectMetrics(startDate, endDate);
      
      console.log('📊 On-Chain Metrics:');
      console.log(`   💸 Transaction Volume: $${metrics.transactionVolume.toFixed(2)}`);
      console.log(`   🔗 Smart Contract Calls: ${metrics.smartContractCalls}`);
      console.log(`   👥 Unique Wallets: ${metrics.uniqueWallets}`);
      
      // Get current NEAR price
      const nearPrice = await this.metricsCollector.fetchRealNearPrice();
      console.log(`💰 Current NEAR Price: $${nearPrice.toFixed(2)}`);
      
    } catch (error) {
      const nearError = NearIntentsErrorHandler.parseError(error);
      console.error('❌ Metrics collection failed:', nearError.message);
    }
  }

  /**
   * Demonstrate bulk operations (small scale for testing)
   */
  async demonstrateBulkOperations(): Promise<void> {
    try {
      console.log('\n🚀 === Bulk Operations Demo ===');
      
      if (!this.wallet) {
        throw new Error('Wallet not initialized');
      }
      
      const bulkManager = new BulkOperationsManager();
      
      // Create a small bulk operation config for testing
      const bulkConfig = {
        wallets: [{
          accountId: this.wallet.accountId,
          privateKey: this.wallet.keyPair.toString(),
          networkId: 'testnet',
        }],
        transactionsPerWallet: 2, // Small number for testing
        tokens: [
          { from: 'NEAR', to: 'USDC' },
        ],
        amountRange: {
          min: 0.01, // Very small amounts for testing
          max: 0.05,
        },
        delayBetweenTransactions: 5000, // 5 seconds between transactions
      };
      
      console.log(`⚡ Executing bulk operations: ${bulkConfig.transactionsPerWallet} transactions...`);
      
      const result = await bulkManager.executeBulkSwaps(bulkConfig);
      
      console.log('📊 Bulk Operation Results:');
      console.log(`   ✅ Successful: ${result.successfulTransactions}`);
      console.log(`   ❌ Failed: ${result.failedTransactions}`);
      console.log(`   📈 Total: ${result.totalTransactions}`);
      
      if (result.errors.length > 0) {
        console.log('⚠️  Errors encountered:');
        result.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error.wallet}: ${error.error}`);
        });
      }
      
    } catch (error) {
      const nearError = NearIntentsErrorHandler.parseError(error);
      console.error('❌ Bulk operations failed:', nearError.message);
    }
  }

  /**
   * Demonstrate NEAR transfer operation
   */
  async demonstrateTransfer(): Promise<void> {
    try {
      console.log('\n💸 === Transfer Demo ===');
      
      if (!this.wallet) {
        throw new Error('Wallet not initialized');
      }
      
      // Get current balance first
      const balance = await getAccountBalance(this.wallet.account);
      
      if (balance.availableInNear < 0.01) {
        console.log('⚠️  Insufficient balance for transfer demo');
        return;
      }
      
      // Demo: Transfer a very small amount to a testnet faucet address
      const transferAmount = 0.001; // 0.001 NEAR
      const recipientId = 'faucet.testnet'; // Safe recipient
      
      console.log(`💰 Transferring ${transferAmount} NEAR to ${recipientId}...`);
      
      const result = await transferNear(this.wallet.account, recipientId, transferAmount);
      
      console.log('✅ Transfer successful!');
      console.log(`📋 Transaction Hash: ${result.transaction.hash}`);
      
    } catch (error) {
      const nearError = NearIntentsErrorHandler.parseError(error);
      console.error('❌ Transfer failed:', nearError.message);
    }
  }

  /**
   * Run the complete demonstration
   */
  async runDemo(): Promise<void> {
    try {
      console.log('🎬 Starting Real World NEAR Intents Demonstration');
      console.log('=' .repeat(50));
      
      await this.initialize();
      await this.demonstrateAccountOperations();
      await this.demonstrateMetricsCollection();
      
      // Only run operations that require balance if account is funded
      const balance = await getAccountBalance(this.wallet.account);
      if (balance.availableInNear > 0.1) {
        await this.demonstrateTransfer();
        await this.demonstrateTokenSwap();
        await this.demonstrateBulkOperations();
      } else {
        console.log('\n⚠️  Skipping transaction demos due to low balance');
        console.log('🔗 Fund your account at: https://near-faucet.io/');
        console.log(`📝 Account: ${this.wallet.accountId}`);
      }
      
      console.log('\n🎉 Demo completed successfully!');
      
    } catch (error) {
      const nearError = NearIntentsErrorHandler.parseError(error);
      console.error('\n❌ Demo failed:', nearError.message);
      
      if (nearError.type === 'CONFIGURATION_ERROR') {
        console.log('\n🔧 Configuration Help:');
        console.log('1. Make sure you have a testnet account');
        console.log('2. Fund your account with testnet NEAR tokens');
        console.log('3. Check your internet connection');
      }
    }
  }
}

/**
 * Export function to run the demo
 */
export async function runRealWorldDemo(): Promise<void> {
  const demo = new RealWorldNearIntentsDemo();
  await demo.runDemo();
}

// Auto-run demo if this file is executed directly
if (require.main === module) {
  runRealWorldDemo().catch(console.error);
}

/**
 * Quick test functions for individual operations
 */
export async function quickBalanceCheck(): Promise<void> {
  try {
    const wallet = await initializeWalletConnection('testnet');
    const balance = await getAccountBalance(wallet.account);
    console.log(`Account: ${wallet.accountId}`);
    console.log(`Balance: ${balance.availableInNear.toFixed(4)} NEAR`);
  } catch (error) {
    console.error('Balance check failed:', error);
  }
}

export async function quickWalletDemo(): Promise<void> {
  await demonstrateWalletUsage();
}