import { utils } from 'near-api-js';
import { withdrawalLogger } from '../logger/index.js';
import { CONTRACT_CONFIG } from '../config/index.js';

/**
 * Withdrawal Monitor - Watches for withdrawal events and pulls funds back
 */
export class WithdrawalMonitor {
  constructor(nearConnection, intentExecutor) {
    this.near = nearConnection.near;
    this.account = nearConnection.account;
    this.intentExecutor = intentExecutor;
    this.vaultContractId = CONTRACT_CONFIG.vaultContractId;
    this.lastProcessedBlock = null;
    this.isMonitoring = false;
    this.monitoringInterval = null;
  }

  /**
   * Start monitoring for withdrawal events
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      withdrawalLogger.warn('Withdrawal monitoring already started');
      return;
    }

    withdrawalLogger.info('Starting withdrawal monitoring', {
      vaultContract: this.vaultContractId,
    });

    this.isMonitoring = true;
    
    // Get initial block height
    await this.initializeLastBlock();
    
    // Start polling for new events
    this.monitoringInterval = setInterval(
      () => this.pollForWithdrawalEvents(),
      5000 // Poll every 5 seconds
    );

    withdrawalLogger.info('Withdrawal monitoring started successfully');
  }

  /**
   * Stop monitoring for withdrawal events
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      withdrawalLogger.warn('Withdrawal monitoring not running');
      return;
    }

    withdrawalLogger.info('Stopping withdrawal monitoring');
    
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    withdrawalLogger.info('Withdrawal monitoring stopped');
  }

  /**
   * Initialize the last processed block height
   */
  async initializeLastBlock() {
    try {
      const block = await this.near.connection.provider.block({
        finality: 'final'
      });
      
      this.lastProcessedBlock = block.header.height;
      
      withdrawalLogger.info('Initialized last processed block for withdrawals', {
        blockHeight: this.lastProcessedBlock,
      });
    } catch (error) {
      withdrawalLogger.error('Failed to initialize last processed block for withdrawals', error);
      throw error;
    }
  }

  /**
   * Poll for new withdrawal events
   */
  async pollForWithdrawalEvents() {
    try {
      const currentBlock = await this.near.connection.provider.block({
        finality: 'final'
      });

      if (this.lastProcessedBlock >= currentBlock.header.height) {
        return; // No new blocks
      }

      withdrawalLogger.debug('Polling for withdrawal events', {
        fromBlock: this.lastProcessedBlock + 1,
        toBlock: currentBlock.header.height,
      });

      // Process blocks from lastProcessedBlock + 1 to current block
      for (let blockHeight = this.lastProcessedBlock + 1; blockHeight <= currentBlock.header.height; blockHeight++) {
        await this.processBlockForWithdrawals(blockHeight);
      }

      this.lastProcessedBlock = currentBlock.header.height;
    } catch (error) {
      withdrawalLogger.error('Error polling for withdrawal events', error);
    }
  }

  /**
   * Process a specific block for withdrawal events
   */
  async processBlockForWithdrawals(blockHeight) {
    try {
      const block = await this.near.connection.provider.block({
        blockId: blockHeight
      });

      // Get all transactions in the block
      for (const chunk of block.chunks) {
        const chunkDetails = await this.near.connection.provider.chunk(chunk.chunk_hash);
        
        for (const txHash of chunkDetails.transactions) {
          await this.processTransactionForWithdrawals(txHash);
        }
      }
    } catch (error) {
      withdrawalLogger.error(`Error processing block ${blockHeight} for withdrawals`, error);
    }
  }

  /**
   * Process a transaction for withdrawal events
   */
  async processTransactionForWithdrawals(txHash) {
    try {
      const txResult = await this.near.connection.provider.txStatus(txHash, this.vaultContractId);
      
      if (!txResult.receipts_outcome) {
        return;
      }

      // Check for withdrawal events in transaction logs
      for (const receipt of txResult.receipts_outcome) {
        if (receipt.outcome.logs) {
          for (const log of receipt.outcome.logs) {
            await this.processLogForWithdrawalEvent(log, txHash);
          }
        }
      }
    } catch (error) {
      withdrawalLogger.debug(`Error processing transaction ${txHash} for withdrawals`, error);
    }
  }

  /**
   * Process a log entry for withdrawal events
   */
  async processLogForWithdrawalEvent(log, txHash) {
    try {
      // Look for withdrawal events in the format: EVENT_JSON:{"standard":"bond-credit-vault","event":"withdraw",...}
      if (log.startsWith('EVENT_JSON:')) {
        const eventJson = log.substring('EVENT_JSON:'.length);
        const event = JSON.parse(eventJson);

        if (event.standard === 'bond-credit-vault' && event.event === 'withdraw') {
          for (const withdrawalData of event.data) {
            await this.handleWithdrawalEvent(withdrawalData, txHash);
          }
        }
      }
    } catch (error) {
      withdrawalLogger.debug(`Error processing log for withdrawal event: ${log}`, error);
    }
  }

  /**
   * Handle a withdrawal event
   */
  async handleWithdrawalEvent(withdrawalData, txHash) {
    try {
      const {
        account_id,
        token_type,
        amount,
        vault_shares_burned,
        timestamp,
      } = withdrawalData;

      // Log the withdrawal event
      withdrawalLogger.info('Withdrawal detected', {
        accountId: account_id,
        tokenType: token_type,
        amount: amount.toString(),
        vaultSharesBurned: vault_shares_burned.toString(),
        timestamp,
        txHash,
      });

      // Process withdrawal - pull funds back from opportunities
      await this.processWithdrawalForDeallocation(account_id, amount, token_type);

    } catch (error) {
      withdrawalLogger.error('Error handling withdrawal event', {
        withdrawalData,
        txHash,
        error: error.message,
      });
    }
  }

  /**
   * Process withdrawal for deallocation from opportunities
   */
  async processWithdrawalForDeallocation(accountId, amount, tokenType) {
    try {
      withdrawalLogger.info('Processing withdrawal for deallocation', {
        accountId,
        amount,
        tokenType,
      });

      // Get user's allocations from registry
      const userAllocations = await this.getUserAllocations(accountId);
      
      if (userAllocations.length === 0) {
        withdrawalLogger.warn('No allocations found for user', { accountId });
        return;
      }

      // For v0, we'll deallocate from all opportunities proportionally
      // In production, this would be based on user preferences or optimization algorithms
      const totalAllocated = userAllocations.reduce((sum, allocation) => sum + allocation.amount, 0);
      
      for (const allocation of userAllocations) {
        const proportionalAmount = Math.floor((allocation.amount * amount) / totalAllocated);
        
        if (proportionalAmount > 0) {
          withdrawalLogger.info('Deallocating from opportunity', {
            accountId,
            opportunityId: allocation.opportunityId,
            opportunityContract: allocation.opportunityContract,
            amount: proportionalAmount,
            strategy: allocation.strategy,
          });

          // Execute intent to withdraw funds from opportunity
          await this.intentExecutor.executeWithdrawalIntent({
            accountId,
            opportunityId: allocation.opportunityId,
            opportunityContract: allocation.opportunityContract,
            amount: proportionalAmount,
            tokenType,
            strategy: allocation.strategy,
          });
        }
      }

    } catch (error) {
      withdrawalLogger.error('Error processing withdrawal for deallocation', {
        accountId,
        amount,
        tokenType,
        error: error.message,
      });
    }
  }

  /**
   * Get user's allocations from registry
   */
  async getUserAllocations(accountId) {
    try {
      // In a real implementation, this would query the registry contract
      // to get the user's active allocations across all opportunities
      
      // For v0, we'll return mock data based on the sample opportunities
      // In production, this would be a registry contract call
      const mockAllocations = [
        {
          opportunityId: 1,
          opportunityContract: 'staking-opportunity-contract-v0.your-account.testnet',
          amount: 5000000000000000000000000, // 5 NEAR
          strategy: 'Staking',
        },
        {
          opportunityId: 2,
          opportunityContract: 'lending-opportunity-contract-v0.your-account.testnet',
          amount: 3000000000000000000000000, // 3 NEAR
          strategy: 'Lending',
        },
        {
          opportunityId: 3,
          opportunityContract: 'liquidity-opportunity-contract-v0.your-account.testnet',
          amount: 2000000000000000000000000, // 2 NEAR
          strategy: 'Liquidity',
        },
      ];

      return mockAllocations;
    } catch (error) {
      withdrawalLogger.error('Error getting user allocations', {
        accountId,
        error: error.message,
      });
      return [];
    }
  }
}
