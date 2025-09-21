import { utils, Contract } from 'near-api-js';
import { intentLogger, logIntentExecution } from '../logger/index.js';
import { EXECUTOR_CONFIG, STRATEGY_CONFIG } from '../config/index.js';

/**
 * Intent Executor - Executes NEAR Intents to move capital into chosen opportunities
 */
export class IntentExecutor {
  constructor(nearConnection) {
    this.near = nearConnection.near;
    this.account = nearConnection.account;
    this.activeIntents = new Map();
    this.performanceMetrics = {
      totalIntents: 0,
      successfulIntents: 0,
      failedIntents: 0,
      totalGasUsed: 0,
      totalLatency: 0,
      startTime: Date.now(),
    };
  }

  /**
   * Execute allocation intent to move capital into an opportunity
   */
  async executeAllocationIntent(intentData) {
    const {
      accountId,
      opportunityId,
      opportunityContract,
      amount,
      tokenType,
      strategy,
    } = intentData;

    const intentHash = this.generateIntentHash(intentData);
    const startTime = Date.now();

    intentLogger.info('Executing allocation intent', {
      intentHash,
      accountId,
      opportunityId,
      opportunityContract,
      amount: amount.toString(),
      tokenType,
      strategy,
    });

    try {
      // Track active intent
      this.activeIntents.set(intentHash, {
        ...intentData,
        intentHash,
        startTime,
        status: 'executing',
      });

      // Execute the intent based on strategy
      let result;
      switch (strategy.toLowerCase()) {
        case 'staking':
          result = await this.executeStakingIntent(opportunityContract, accountId, amount, intentHash);
          break;
        case 'lending':
          result = await this.executeLendingIntent(opportunityContract, accountId, amount, intentHash);
          break;
        case 'liquidity':
          result = await this.executeLiquidityIntent(opportunityContract, accountId, amount, intentHash);
          break;
        default:
          throw new Error(`Unsupported strategy: ${strategy}`);
      }

      const endTime = Date.now();
      const latencyMs = endTime - startTime;

      // Update performance metrics
      this.updatePerformanceMetrics(true, latencyMs, result.gasUsed);

      // Log successful execution
      const executionData = {
        intentHash,
        success: true,
        gasUsed: result.gasUsed,
        latencyMs,
        opportunityId,
        accountId,
        amount,
        strategy,
      };

      logIntentExecution(executionData);

      // Update active intent
      this.activeIntents.set(intentHash, {
        ...this.activeIntents.get(intentHash),
        status: 'completed',
        endTime,
        result,
      });

      // Emit IntentExecuted event
      await this.emitIntentExecutedEvent(executionData);

      return result;

    } catch (error) {
      const endTime = Date.now();
      const latencyMs = endTime - startTime;

      // Update performance metrics
      this.updatePerformanceMetrics(false, latencyMs, 0);

      // Log failed execution
      const executionData = {
        intentHash,
        success: false,
        gasUsed: 0,
        latencyMs,
        errorMessage: error.message,
        opportunityId,
        accountId,
        amount,
        strategy,
      };

      logIntentExecution(executionData);

      // Update active intent
      this.activeIntents.set(intentHash, {
        ...this.activeIntents.get(intentHash),
        status: 'failed',
        endTime,
        error: error.message,
      });

      // Emit IntentExecuted event
      await this.emitIntentExecutedEvent(executionData);

      throw error;
    }
  }

  /**
   * Execute withdrawal intent to pull funds back from an opportunity
   */
  async executeWithdrawalIntent(intentData) {
    const {
      accountId,
      opportunityId,
      opportunityContract,
      amount,
      tokenType,
      strategy,
    } = intentData;

    const intentHash = this.generateIntentHash(intentData);
    const startTime = Date.now();

    intentLogger.info('Executing withdrawal intent', {
      intentHash,
      accountId,
      opportunityId,
      opportunityContract,
      amount: amount.toString(),
      tokenType,
      strategy,
    });

    try {
      // Track active intent
      this.activeIntents.set(intentHash, {
        ...intentData,
        intentHash,
        startTime,
        status: 'executing',
      });

      // Execute withdrawal based on strategy
      let result;
      switch (strategy.toLowerCase()) {
        case 'staking':
          result = await this.executeStakingWithdrawal(opportunityContract, accountId, amount, intentHash);
          break;
        case 'lending':
          result = await this.executeLendingWithdrawal(opportunityContract, accountId, amount, intentHash);
          break;
        case 'liquidity':
          result = await this.executeLiquidityWithdrawal(opportunityContract, accountId, amount, intentHash);
          break;
        default:
          throw new Error(`Unsupported strategy: ${strategy}`);
      }

      const endTime = Date.now();
      const latencyMs = endTime - startTime;

      // Update performance metrics
      this.updatePerformanceMetrics(true, latencyMs, result.gasUsed);

      // Log successful execution
      const executionData = {
        intentHash,
        success: true,
        gasUsed: result.gasUsed,
        latencyMs,
        opportunityId,
        accountId,
        amount,
        strategy,
      };

      logIntentExecution(executionData);

      // Update active intent
      this.activeIntents.set(intentHash, {
        ...this.activeIntents.get(intentHash),
        status: 'completed',
        endTime,
        result,
      });

      // Emit IntentExecuted event
      await this.emitIntentExecutedEvent(executionData);

      return result;

    } catch (error) {
      const endTime = Date.now();
      const latencyMs = endTime - startTime;

      // Update performance metrics
      this.updatePerformanceMetrics(false, latencyMs, 0);

      // Log failed execution
      const executionData = {
        intentHash,
        success: false,
        gasUsed: 0,
        latencyMs,
        errorMessage: error.message,
        opportunityId,
        accountId,
        amount,
        strategy,
      };

      logIntentExecution(executionData);

      // Update active intent
      this.activeIntents.set(intentHash, {
        ...this.activeIntents.get(intentHash),
        status: 'failed',
        endTime,
        error: error.message,
      });

      // Emit IntentExecuted event
      await this.emitIntentExecutedEvent(executionData);

      throw error;
    }
  }

  /**
   * Execute staking intent
   */
  async executeStakingIntent(contractAddress, accountId, amount, intentHash) {
    const strategyConfig = STRATEGY_CONFIG.staking;
    
    try {
      const contract = new Contract(
        this.account,
        contractAddress,
        {
          changeMethods: ['allocate'],
          viewMethods: [],
        }
      );

      const result = await contract.allocate({
        amount: amount.toString(),
      }, {
        gas: strategyConfig.gasLimit,
        attachedDeposit: 0,
      });

      return {
        success: true,
        gasUsed: strategyConfig.gasLimit,
        transactionHash: result.transaction.hash,
      };
    } catch (error) {
      intentLogger.error('Staking intent execution failed', {
        contractAddress,
        accountId,
        amount: amount.toString(),
        intentHash,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Execute lending intent
   */
  async executeLendingIntent(contractAddress, accountId, amount, intentHash) {
    const strategyConfig = STRATEGY_CONFIG.lending;
    
    try {
      const contract = new Contract(
        this.account,
        contractAddress,
        {
          changeMethods: ['allocate'],
          viewMethods: [],
        }
      );

      const result = await contract.allocate({
        amount: amount.toString(),
      }, {
        gas: strategyConfig.gasLimit,
        attachedDeposit: 0,
      });

      return {
        success: true,
        gasUsed: strategyConfig.gasLimit,
        transactionHash: result.transaction.hash,
      };
    } catch (error) {
      intentLogger.error('Lending intent execution failed', {
        contractAddress,
        accountId,
        amount: amount.toString(),
        intentHash,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Execute liquidity intent
   */
  async executeLiquidityIntent(contractAddress, accountId, amount, intentHash) {
    const strategyConfig = STRATEGY_CONFIG.liquidity;
    
    try {
      const contract = new Contract(
        this.account,
        contractAddress,
        {
          changeMethods: ['allocate'],
          viewMethods: [],
        }
      );

      const result = await contract.allocate({
        amount: amount.toString(),
      }, {
        gas: strategyConfig.gasLimit,
        attachedDeposit: 0,
      });

      return {
        success: true,
        gasUsed: strategyConfig.gasLimit,
        transactionHash: result.transaction.hash,
      };
    } catch (error) {
      intentLogger.error('Liquidity intent execution failed', {
        contractAddress,
        accountId,
        amount: amount.toString(),
        intentHash,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Execute staking withdrawal
   */
  async executeStakingWithdrawal(contractAddress, accountId, amount, intentHash) {
    const strategyConfig = STRATEGY_CONFIG.staking;
    
    try {
      const contract = new Contract(
        this.account,
        contractAddress,
        {
          changeMethods: ['withdraw'],
          viewMethods: [],
        }
      );

      const result = await contract.withdraw({
        amount: amount.toString(),
      }, {
        gas: strategyConfig.gasLimit,
        attachedDeposit: 0,
      });

      return {
        success: true,
        gasUsed: strategyConfig.gasLimit,
        transactionHash: result.transaction.hash,
      };
    } catch (error) {
      intentLogger.error('Staking withdrawal execution failed', {
        contractAddress,
        accountId,
        amount: amount.toString(),
        intentHash,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Execute lending withdrawal
   */
  async executeLendingWithdrawal(contractAddress, accountId, amount, intentHash) {
    const strategyConfig = STRATEGY_CONFIG.lending;
    
    try {
      const contract = new Contract(
        this.account,
        contractAddress,
        {
          changeMethods: ['withdraw'],
          viewMethods: [],
        }
      );

      const result = await contract.withdraw({
        amount: amount.toString(),
      }, {
        gas: strategyConfig.gasLimit,
        attachedDeposit: 0,
      });

      return {
        success: true,
        gasUsed: strategyConfig.gasLimit,
        transactionHash: result.transaction.hash,
      };
    } catch (error) {
      intentLogger.error('Lending withdrawal execution failed', {
        contractAddress,
        accountId,
        amount: amount.toString(),
        intentHash,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Execute liquidity withdrawal
   */
  async executeLiquidityWithdrawal(contractAddress, accountId, amount, intentHash) {
    const strategyConfig = STRATEGY_CONFIG.liquidity;
    
    try {
      const contract = new Contract(
        this.account,
        contractAddress,
        {
          changeMethods: ['withdraw'],
          viewMethods: [],
        }
      );

      const result = await contract.withdraw({
        amount: amount.toString(),
      }, {
        gas: strategyConfig.gasLimit,
        attachedDeposit: 0,
      });

      return {
        success: true,
        gasUsed: strategyConfig.gasLimit,
        transactionHash: result.transaction.hash,
      };
    } catch (error) {
      intentLogger.error('Liquidity withdrawal execution failed', {
        contractAddress,
        accountId,
        amount: amount.toString(),
        intentHash,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Generate unique intent hash
   */
  generateIntentHash(intentData) {
    const { accountId, opportunityId, amount, strategy } = intentData;
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2);
    return `${accountId}-${opportunityId}-${amount}-${strategy}-${timestamp}-${nonce}`;
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(success, latencyMs, gasUsed) {
    this.performanceMetrics.totalIntents++;
    this.performanceMetrics.totalLatency += latencyMs;
    this.performanceMetrics.totalGasUsed += gasUsed;

    if (success) {
      this.performanceMetrics.successfulIntents++;
    } else {
      this.performanceMetrics.failedIntents++;
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const uptime = Math.floor((Date.now() - this.performanceMetrics.startTime) / 1000);
    
    return {
      ...this.performanceMetrics,
      averageLatency: this.performanceMetrics.totalIntents > 0 
        ? Math.floor(this.performanceMetrics.totalLatency / this.performanceMetrics.totalIntents)
        : 0,
      averageGasUsed: this.performanceMetrics.totalIntents > 0
        ? Math.floor(this.performanceMetrics.totalGasUsed / this.performanceMetrics.totalIntents)
        : 0,
      uptime,
    };
  }

  /**
   * Get active intents
   */
  getActiveIntents() {
    return Array.from(this.activeIntents.values());
  }

  /**
   * Clean up completed intents
   */
  cleanupCompletedIntents() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [intentHash, intent] of this.activeIntents.entries()) {
      if (intent.status === 'completed' || intent.status === 'failed') {
        if (now - intent.startTime > maxAge) {
          this.activeIntents.delete(intentHash);
        }
      }
    }
  }

  /**
   * Emit IntentExecuted event
   */
  async emitIntentExecutedEvent(executionData) {
    // In a real implementation, this would emit events to a message queue
    // or call a webhook to notify external systems
    intentLogger.info('IntentExecuted event emitted', executionData);
    
    // For v0, we'll just log the event
    // In production, this could integrate with:
    // - Message queues (Redis, RabbitMQ)
    // - Webhooks
    // - Database events
    // - Real-time notifications
  }
}
