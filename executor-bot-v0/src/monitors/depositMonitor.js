import { utils } from 'near-api-js';
import { depositLogger } from '../logger/index.js';
import { CONTRACT_CONFIG } from '../config/index.js';

/**
 * Deposit Monitor - Watches for deposit events from the Vault contract
 */
export class DepositMonitor {
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
   * Start monitoring for deposit events
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      depositLogger.warn('Deposit monitoring already started');
      return;
    }

    depositLogger.info('Starting deposit monitoring', {
      vaultContract: this.vaultContractId,
    });

    this.isMonitoring = true;
    
    // Get initial block height
    await this.initializeLastBlock();
    
    // Start polling for new events
    this.monitoringInterval = setInterval(
      () => this.pollForDepositEvents(),
      5000 // Poll every 5 seconds
    );

    depositLogger.info('Deposit monitoring started successfully');
  }

  /**
   * Stop monitoring for deposit events
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      depositLogger.warn('Deposit monitoring not running');
      return;
    }

    depositLogger.info('Stopping deposit monitoring');
    
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    depositLogger.info('Deposit monitoring stopped');
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
      
      depositLogger.info('Initialized last processed block', {
        blockHeight: this.lastProcessedBlock,
      });
    } catch (error) {
      depositLogger.error('Failed to initialize last processed block', error);
      throw error;
    }
  }

  /**
   * Poll for new deposit events
   */
  async pollForDepositEvents() {
    try {
      const currentBlock = await this.near.connection.provider.block({
        finality: 'final'
      });

      if (this.lastProcessedBlock >= currentBlock.header.height) {
        return; // No new blocks
      }

      depositLogger.debug('Polling for deposit events', {
        fromBlock: this.lastProcessedBlock + 1,
        toBlock: currentBlock.header.height,
      });

      // Process blocks from lastProcessedBlock + 1 to current block
      for (let blockHeight = this.lastProcessedBlock + 1; blockHeight <= currentBlock.header.height; blockHeight++) {
        await this.processBlockForDeposits(blockHeight);
      }

      this.lastProcessedBlock = currentBlock.header.height;
    } catch (error) {
      depositLogger.error('Error polling for deposit events', error);
    }
  }

  /**
   * Process a specific block for deposit events
   */
  async processBlockForDeposits(blockHeight) {
    try {
      const block = await this.near.connection.provider.block({
        blockId: blockHeight
      });

      // Get all transactions in the block
      for (const chunk of block.chunks) {
        const chunkDetails = await this.near.connection.provider.chunk(chunk.chunk_hash);
        
        for (const txHash of chunkDetails.transactions) {
          await this.processTransactionForDeposits(txHash);
        }
      }
    } catch (error) {
      depositLogger.error(`Error processing block ${blockHeight} for deposits`, error);
    }
  }

  /**
   * Process a transaction for deposit events
   */
  async processTransactionForDeposits(txHash) {
    try {
      const txResult = await this.near.connection.provider.txStatus(txHash, this.vaultContractId);
      
      if (!txResult.receipts_outcome) {
        return;
      }

      // Check for deposit events in transaction logs
      for (const receipt of txResult.receipts_outcome) {
        if (receipt.outcome.logs) {
          for (const log of receipt.outcome.logs) {
            await this.processLogForDepositEvent(log, txHash);
          }
        }
      }
    } catch (error) {
      depositLogger.debug(`Error processing transaction ${txHash} for deposits`, error);
    }
  }

  /**
   * Process a log entry for deposit events
   */
  async processLogForDepositEvent(log, txHash) {
    try {
      // Look for deposit events in the format: EVENT_JSON:{"standard":"bond-credit-vault","event":"deposit",...}
      if (log.startsWith('EVENT_JSON:')) {
        const eventJson = log.substring('EVENT_JSON:'.length);
        const event = JSON.parse(eventJson);

        if (event.standard === 'bond-credit-vault' && event.event === 'deposit') {
          for (const depositData of event.data) {
            await this.handleDepositEvent(depositData, txHash);
          }
        }
      }
    } catch (error) {
      depositLogger.debug(`Error processing log for deposit event: ${log}`, error);
    }
  }

  /**
   * Handle a deposit event
   */
  async handleDepositEvent(depositData, txHash) {
    try {
      const {
        account_id,
        token_type,
        amount,
        vault_shares_minted,
        timestamp,
      } = depositData;

      // Log the deposit event
      logDepositEvent({
        accountId: account_id,
        tokenType: token_type,
        amount: amount,
        vaultSharesMinted: vault_shares_minted,
        timestamp,
        txHash,
      });

      // Check if user has chosen an opportunity to allocate to
      // For v0, we'll check the registry for active opportunities and auto-allocate
      await this.processDepositForAllocation(account_id, amount, token_type);

    } catch (error) {
      depositLogger.error('Error handling deposit event', {
        depositData,
        txHash,
        error: error.message,
      });
    }
  }

  /**
   * Process deposit for allocation to opportunities
   */
  async processDepositForAllocation(accountId, amount, tokenType) {
    try {
      depositLogger.info('Processing deposit for allocation', {
        accountId,
        amount,
        tokenType,
      });

      // Get available opportunities from registry
      const opportunities = await this.getActiveOpportunities();
      
      if (opportunities.length === 0) {
        depositLogger.warn('No active opportunities available for allocation');
        return;
      }

      // For v0, we'll allocate to the highest scoring opportunity
      // In production, this would be based on user preferences
      const topOpportunity = opportunities.reduce((top, current) => 
        current.current_score > top.current_score ? current : top
      );

      depositLogger.info('Selected opportunity for allocation', {
        opportunityId: topOpportunity.id,
        opportunityName: topOpportunity.name,
        score: topOpportunity.current_score,
        apy: topOpportunity.apy,
      });

      // Execute intent to allocate funds
      await this.intentExecutor.executeAllocationIntent({
        accountId,
        opportunityId: topOpportunity.id,
        opportunityContract: topOpportunity.contract_address,
        amount,
        tokenType,
        strategy: topOpportunity.category,
      });

    } catch (error) {
      depositLogger.error('Error processing deposit for allocation', {
        accountId,
        amount,
        tokenType,
        error: error.message,
      });
    }
  }

  /**
   * Get active opportunities from registry
   */
  async getActiveOpportunities() {
    try {
      const registryContract = new near.Contract(
        this.account,
        CONTRACT_CONFIG.registryContractId,
        {
          viewMethods: ['get_active_opportunities'],
          changeMethods: [],
        }
      );

      const opportunities = await registryContract.get_active_opportunities({
        limit: 10,
        offset: 0,
      });

      return opportunities;
    } catch (error) {
      depositLogger.error('Error getting active opportunities', error);
      return [];
    }
  }
}
