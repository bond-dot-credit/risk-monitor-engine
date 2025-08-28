import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { AIAgent, NearAccountConfig } from './ai-agent';
import { IntentExecutionResult } from './near-intents';
import { nearIntentsConfig } from './config';

// Reload the config after loading environment variables
nearIntentsConfig.reloadConfig();

export interface BulkOperationConfig {
  wallets: NearAccountConfig[];
  transactionsPerWallet: number;
  tokens: Array<{ from: string; to: string }>;
  amountRange: { min: number; max: number };
  delayBetweenTransactions?: number; // ms
  agentId?: string;
}

export interface BulkOperationResult {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  results: IntentExecutionResult[];
  errors: Array<{ wallet: string; error: string }>;
}

export class BulkOperationsManager {
  private agents: Map<string, AIAgent> = new Map();
  private initializationPromises: Map<string, Promise<void>> = new Map();

  /**
   * Initialize agents for all wallets with proper error handling
   */
  async initializeAgents(wallets: NearAccountConfig[]): Promise<void> {
    const initializationTasks = wallets.map(async (wallet) => {
      try {
        // Check if agent is already being initialized
        if (this.initializationPromises.has(wallet.accountId)) {
          await this.initializationPromises.get(wallet.accountId);
          return;
        }

        // Create initialization promise
        const initPromise = this.initializeAgent(wallet);
        this.initializationPromises.set(wallet.accountId, initPromise);
        
        await initPromise;
        console.log(`Successfully initialized agent for wallet: ${wallet.accountId}`);
      } catch (error) {
        console.error(`Failed to initialize agent for wallet ${wallet.accountId}:`, error);
        // Don't throw here - we'll handle failed agents later
      }
    });

    await Promise.allSettled(initializationTasks);
  }

  /**
   * Initialize a single agent
   */
  private async initializeAgent(wallet: NearAccountConfig): Promise<void> {
    const agent = new AIAgent(wallet);
    await agent.initialize();
    this.agents.set(wallet.accountId, agent);
  }

  /**
   * Execute bulk token swaps across multiple wallets with real blockchain interactions
   */
  async executeBulkSwaps(config: BulkOperationConfig): Promise<BulkOperationResult> {
    const results: IntentExecutionResult[] = [];
    const errors: Array<{ wallet: string; error: string }> = [];
    let successfulTransactions = 0;
    let failedTransactions = 0;
    const totalTransactions = config.wallets.length * config.transactionsPerWallet;

    console.log(`Starting bulk swap operation: ${config.wallets.length} wallets, ${config.transactionsPerWallet} transactions each`);

    // Validate configuration first
    const configValidation = nearIntentsConfig.validateConfig();
    if (!configValidation.valid) {
      throw new Error(`Invalid NEAR configuration: ${configValidation.errors.join(', ')}`);
    }

    // Initialize all agents
    await this.initializeAgents(config.wallets);

    // Check which agents were successfully initialized
    const initializedAgents = config.wallets.filter(wallet => this.agents.has(wallet.accountId));
    const failedAgents = config.wallets.filter(wallet => !this.agents.has(wallet.accountId));

    // Record failed initializations
    for (const wallet of failedAgents) {
      errors.push({ wallet: wallet.accountId, error: 'Failed to initialize agent' });
      failedTransactions += config.transactionsPerWallet;
    }

    console.log(`Successfully initialized ${initializedAgents.length}/${config.wallets.length} agents`);

    // Process each initialized wallet
    for (const wallet of initializedAgents) {
      const agent = this.agents.get(wallet.accountId);
      if (!agent) {
        errors.push({ wallet: wallet.accountId, error: 'Agent not found after initialization' });
        failedTransactions += config.transactionsPerWallet;
        continue;
      }

      console.log(`Processing wallet: ${wallet.accountId}`);

      // Execute transactions for this wallet with proper error handling
      for (let i = 0; i < config.transactionsPerWallet; i++) {
        try {
          // Select a random token pair
          const tokenPair = config.tokens[Math.floor(Math.random() * config.tokens.length)];
          
          // Generate a random amount within the specified range
          const amount = Math.random() * (config.amountRange.max - config.amountRange.min) + config.amountRange.min;
          
          // Round to 4 decimal places to avoid precision issues
          const roundedAmount = Math.round(amount * 10000) / 10000;
          
          console.log(`Executing transaction ${i + 1}/${config.transactionsPerWallet} for ${wallet.accountId}: ${roundedAmount} ${tokenPair.from} -> ${tokenPair.to}`);
          
          // Execute the real swap
          const result = await agent.swapNearToToken(
            tokenPair.to,
            roundedAmount,
            config.agentId
          );
          
          results.push(result);
          
          if (result.success) {
            successfulTransactions++;
            console.log(`✅ Transaction ${i + 1}/${config.transactionsPerWallet} for ${wallet.accountId}: SUCCESS (Hash: ${result.transactionHash})`);
          } else {
            failedTransactions++;
            errors.push({ wallet: wallet.accountId, error: result.error || 'Unknown error' });
            console.log(`❌ Transaction ${i + 1}/${config.transactionsPerWallet} for ${wallet.accountId}: FAILED (${result.error})`);
          }
          
          // Add delay between transactions if specified
          if (config.delayBetweenTransactions && config.delayBetweenTransactions > 0) {
            await new Promise(resolve => setTimeout(resolve, config.delayBetweenTransactions));
          }
        } catch (error) {
          failedTransactions++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ wallet: wallet.accountId, error: errorMessage });
          console.error(`❌ Error in transaction ${i + 1} for ${wallet.accountId}:`, error);
          
          // For blockchain errors, we might want to add a longer delay before retrying
          if (errorMessage.includes('rate limit') || errorMessage.includes('timeout')) {
            console.log('Rate limit or timeout detected, adding extra delay...');
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
          }
        }
      }
    }

    const result = {
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      results,
      errors
    };

    console.log(`Bulk operation completed: ${successfulTransactions} successful, ${failedTransactions} failed`);
    return result;
  }

  /**
   * Execute a large volume of transactions (10k+) with optimized processing
   */
  async executeHighVolumeTransactions(config: BulkOperationConfig): Promise<BulkOperationResult> {
    // For high volume operations, we process in smaller batches
    // to avoid memory issues and provide better progress tracking
    
    const batchSize = Math.min(10, Math.ceil(config.wallets.length / 10)); // Process 10 wallets at a time, or 1/10th of total
    const results: IntentExecutionResult[] = [];
    const errors: Array<{ wallet: string; error: string }> = [];
    let successfulTransactions = 0;
    let failedTransactions = 0;
    
    console.log(`Starting high-volume transaction execution for ${config.wallets.length} wallets (batch size: ${batchSize})`);

    // Validate configuration
    const configValidation = nearIntentsConfig.validateConfig();
    if (!configValidation.valid) {
      throw new Error(`Invalid NEAR configuration: ${configValidation.errors.join(', ')}`);
    }

    // Process wallets in batches
    for (let i = 0; i < config.wallets.length; i += batchSize) {
      const batch = config.wallets.slice(i, i + batchSize);
      const batchNumber = Math.floor(i/batchSize) + 1;
      const totalBatches = Math.ceil(config.wallets.length/batchSize);
      
      console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} wallets)`);
      
      // Create a batch config
      const batchConfig: BulkOperationConfig = {
        ...config,
        wallets: batch
      };
      
      try {
        const batchResult = await this.executeBulkSwaps(batchConfig);
        results.push(...batchResult.results);
        errors.push(...batchResult.errors);
        successfulTransactions += batchResult.successfulTransactions;
        failedTransactions += batchResult.failedTransactions;
        
        console.log(`Batch ${batchNumber} completed: ${batchResult.successfulTransactions} successful, ${batchResult.failedTransactions} failed`);
        
        // Cleanup agents from this batch to free memory
        for (const wallet of batch) {
          this.agents.delete(wallet.accountId);
          this.initializationPromises.delete(wallet.accountId);
        }
      } catch (error) {
        console.error(`Error processing batch ${batchNumber}:`, error);
        // Add all wallets in this batch to errors
        for (const wallet of batch) {
          errors.push({ 
            wallet: wallet.accountId, 
            error: error instanceof Error ? error.message : 'Batch processing error' 
          });
          failedTransactions += config.transactionsPerWallet;
        }
      }
      
      // Add a longer delay between batches for high-volume operations
      if (i + batchSize < config.wallets.length) {
        console.log('Waiting before processing next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between batches
      }
    }

    const result = {
      totalTransactions: config.wallets.length * config.transactionsPerWallet,
      successfulTransactions,
      failedTransactions,
      results,
      errors
    };

    console.log(`High-volume operation completed: ${successfulTransactions} successful, ${failedTransactions} failed`);
    return result;
  }
}