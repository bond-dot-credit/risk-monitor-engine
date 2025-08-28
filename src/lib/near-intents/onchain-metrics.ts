import { connect, KeyPair, keyStores, Near } from 'near-api-js';
import { Account } from '@near-js/accounts';
import { KeyPair } from '@near-js/crypto';
import { InMemoryKeyStore } from '@near-js/keystores';
import { JsonRpcProvider } from '@near-js/providers';
import { KeyPairSigner } from '@near-js/signers';

export interface OnChainMetricsConfig {
  networkId: string;
  nodeUrl: string;
  walletUrl: string;
  helperUrl: string;
  accountId: string;
  privateKey: string;
}

export interface OnChainMetrics {
  transactionVolume: number; // Total value of transactions in USD
  smartContractCalls: number; // Number of unique contract interactions
  uniqueWallets: number; // Number of distinct wallets interacting
}

export interface TransactionData {
  hash: string;
  signerId: string;
  receiverId: string;
  actions: any[];
  timestamp: number;
  value: number; // in USD
}

export class OnChainMetricsCollector {
  private near: Near | null = null;
  private account: Account | null = null;
  private config: OnChainMetricsConfig;
  private provider: JsonRpcProvider | null = null;

  constructor(config: OnChainMetricsConfig) {
    this.config = config;
  }

  /**
   * Initialize the NEAR connection
   */
  async initialize(): Promise<void> {
    try {
      // Create key store
      const keyStore = new InMemoryKeyStore();
      const keyPair = KeyPair.fromString(this.config.privateKey);
      await keyStore.setKey(this.config.networkId, this.config.accountId, keyPair);

      // Create provider and signer
      this.provider = new JsonRpcProvider({ url: this.config.nodeUrl });
      const signer = new KeyPairSigner(keyPair);

      // Create account instance
      this.account = new Account(this.config.accountId, this.provider, signer);
      
      console.log(`Initialized NEAR connection for account: ${this.config.accountId}`);
    } catch (error) {
      console.error('Error initializing NEAR connection:', error);
      throw new Error('Failed to initialize NEAR connection');
    }
  }

  /**
   * Collect on-chain metrics for a specific time period
   * For NEAR Protocol Rewards, this should track metrics across all derived wallets
   */
  async collectMetrics(startDate: Date, endDate: Date, walletIds?: string[]): Promise<OnChainMetrics> {
    try {
      let allTransactions: TransactionData[] = [];
      
      // If specific wallet IDs are provided, collect metrics for those wallets
      if (walletIds && walletIds.length > 0) {
        console.log(`Collecting metrics for ${walletIds.length} wallets...`);
        for (const walletId of walletIds) {
          try {
            const transactions = await this.getTransactionsForAccount(walletId, startDate, endDate);
            allTransactions = allTransactions.concat(transactions);
            console.log(`Found ${transactions.length} transactions for wallet ${walletId}`);
          } catch (error) {
            console.error(`Error collecting transactions for wallet ${walletId}:`, error);
          }
        }
      } else {
        // Collect transactions for the main account
        console.log(`Collecting metrics for main account: ${this.config.accountId}`);
        allTransactions = await this.getTransactions(startDate, endDate);
      }
      
      // Remove duplicate transactions by hash
      const uniqueTransactions = allTransactions.filter((tx, index, self) => 
        index === self.findIndex(t => t.hash === tx.hash)
      );
      
      console.log(`Total unique transactions: ${uniqueTransactions.length}`);
      
      // Calculate metrics
      const transactionVolume = this.calculateTransactionVolume(uniqueTransactions);
      const smartContractCalls = this.countSmartContractCalls(uniqueTransactions);
      const uniqueWallets = this.countUniqueWallets(uniqueTransactions);
      
      return {
        transactionVolume,
        smartContractCalls,
        uniqueWallets
      };
    } catch (error) {
      console.error('Error collecting on-chain metrics:', error);
      throw new Error('Failed to collect on-chain metrics');
    }
  }

  /**
   * Get transactions for the account within a date range
   * This method connects to the NEAR Indexer to fetch real transaction data
   */
  private async getTransactions(startDate: Date, endDate: Date): Promise<TransactionData[]> {
    return this.getTransactionsForAccount(this.config.accountId, startDate, endDate);
  }

  /**
   * Get transactions for a specific account within a date range
   */
  private async getTransactionsForAccount(accountId: string, startDate: Date, endDate: Date): Promise<TransactionData[]> {
    try {
      // Try to fetch real transaction data from multiple sources
      const transactions = await this.fetchFromNearBlocksForAccount(accountId, startDate, endDate);
      
      if (transactions.length > 0) {
        return transactions;
      }
      
      // Fallback to Pagoda API if NearBlocks fails
      return await this.fetchFromPagodaAPIForAccount(accountId, startDate, endDate);
    } catch (error) {
      console.error(`Error fetching transactions for account ${accountId}:`, error);
      // Return empty array if there's an error fetching transactions
      return [];
    }
  }

  /**
   * Fetch transactions from NearBlocks API for a specific account
   */
  private async fetchFromNearBlocksForAccount(accountId: string, startDate: Date, endDate: Date): Promise<TransactionData[]> {
    try {
      const apiKey = process.env.NEARBLOCKS_API_KEY;
      if (!apiKey) {
        console.warn('NEARBLOCKS_API_KEY not found, skipping NearBlocks API');
        return [];
      }
      
      const response = await fetch(`https://api.nearblocks.io/v1/account/${accountId}/txns`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (!response.ok) {
        console.warn(`NearBlocks API error for account ${accountId}: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      
      // Filter and transform the data to match our TransactionData interface
      return data.txns
        .filter((tx: any) => {
          const txDate = new Date(tx.block_timestamp / 1000000); // Convert nanoseconds to milliseconds
          return txDate >= startDate && txDate <= endDate;
        })
        .map((tx: any) => ({
          hash: tx.transaction_hash,
          signerId: tx.predecessor_account_id || tx.signer_account_id,
          receiverId: tx.receiver_account_id,
          actions: tx.actions || [],
          timestamp: tx.block_timestamp / 1000000, // Convert nanoseconds to milliseconds
          value: this.calculateRealTransactionValue(tx)
        }));
    } catch (error) {
      console.error(`Error fetching from NearBlocks for account ${accountId}:`, error);
      return [];
    }
  }

  /**
   * Fetch transactions from Pagoda API for a specific account
   */
  private async fetchFromPagodaAPIForAccount(accountId: string, startDate: Date, endDate: Date): Promise<TransactionData[]> {
    try {
      // Use NEAR RPC to get recent transactions
      // Note: This is a simplified implementation. In practice, you might need to use
      // enhanced APIs or indexer services for comprehensive transaction history
      
      const provider = new JsonRpcProvider({ url: this.config.nodeUrl });
      const latestBlock = await provider.block({ finality: 'final' });
      const currentHeight = latestBlock.header.height;
      
      // Look back a reasonable number of blocks based on the date range
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const blocksToCheck = Math.min(daysDiff * 720, 10000); // Approximately 720 blocks per day, max 10k
      
      const transactions: TransactionData[] = [];
      
      // Check the last several blocks for transactions involving our account
      for (let i = 0; i < Math.min(blocksToCheck, 100); i++) { // Limit to prevent timeout
        try {
          const blockHeight = currentHeight - i;
          const block = await provider.block({ blockId: blockHeight });
          
          for (const chunk of block.chunks) {
            if (chunk.tx_root === '11111111111111111111111111111111') continue; // Empty chunk
            
            try {
              const chunkData = await provider.chunk(chunk.chunk_hash);
              
              for (const tx of chunkData.transactions) {
                if (tx.signer_id === accountId || tx.receiver_id === accountId) {
                  const blockTimestamp = new Date(block.header.timestamp / 1000000);
                  
                  if (blockTimestamp >= startDate && blockTimestamp <= endDate) {
                    transactions.push({
                      hash: tx.hash,
                      signerId: tx.signer_id,
                      receiverId: tx.receiver_id,
                      actions: tx.actions || [],
                      timestamp: blockTimestamp.getTime(),
                      value: this.calculateRealTransactionValue(tx)
                    });
                  }
                }
              }
            } catch (chunkError) {
              // Skip chunks that can't be retrieved
              continue;
            }
          }
        } catch (blockError) {
          // Skip blocks that can't be retrieved
          continue;
        }
      }
      
      return transactions;
    } catch (error) {
      console.error(`Error fetching from Pagoda API for account ${accountId}:`, error);
      return [];
    }
  }

  /**
   * Calculate total transaction volume in USD
   */
  private calculateTransactionVolume(transactions: TransactionData[]): number {
    return transactions.reduce((total, tx) => total + tx.value, 0);
  }

  /**
   * Count unique smart contract calls
   */
  private countSmartContractCalls(transactions: TransactionData[]): number {
    const contractCalls = transactions.filter(tx => 
      tx.actions.some(action => action.action === 'FUNCTION_CALL' || action.type === 'FunctionCall')
    );
    return contractCalls.length;
  }

  /**
   * Count unique wallets that interacted with the account
   */
  private countUniqueWallets(transactions: TransactionData[]): number {
    const uniqueWallets = new Set<string>();
    
    transactions.forEach(tx => {
      uniqueWallets.add(tx.signerId);
      uniqueWallets.add(tx.receiverId);
    });
    
    return uniqueWallets.size;
  }

  /**
   * Get account balance
   */
  async getAccountBalance(): Promise<any> {
    try {
      if (!this.account) {
        throw new Error('Account not initialized. Call initialize() first.');
      }
      
      return await this.account.getAccountBalance();
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  }

  /**
   * Get account state
   */
  async getAccountState(): Promise<any> {
    try {
      if (!this.account) {
        throw new Error('Account not initialized. Call initialize() first.');
      }
      
      return await this.account.state();
    } catch (error) {
      console.error('Error getting account state:', error);
      throw error;
    }
  }

  /**
   * Fetch real NEAR price from CoinGecko API
   */
  async fetchRealNearPrice(): Promise<number> {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd');
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.near?.usd || 2.5; // Fallback to default price
    } catch (error) {
      console.error('Error fetching NEAR price:', error);
      return 2.5; // Fallback price
    }
  }

  /**
   * Calculate the real USD value of a transaction using NEAR price data
   */
  private calculateRealTransactionValue(tx: any): number {
    try {
      // Get the current NEAR price (this should be cached or fetched periodically)
      const nearPriceUSD = this.getNearPrice();
      
      if (tx.actions && tx.actions.length > 0) {
        let totalValue = 0;
        
        for (const action of tx.actions) {
          if (action.action === 'TRANSFER' && action.deposit) {
            // Direct NEAR transfer
            const nearAmount = parseFloat(action.deposit) / 1e24; // Convert yoctoNEAR to NEAR
            totalValue += nearAmount * nearPriceUSD;
          } else if (action.action === 'FUNCTION_CALL' && action.deposit) {
            // Function call with attached deposit
            const nearAmount = parseFloat(action.deposit) / 1e24;
            totalValue += nearAmount * nearPriceUSD;
          } else if (action.Transfer && action.Transfer.deposit) {
            // Direct NEAR transfer (alternative format)
            const nearAmount = parseFloat(action.Transfer.deposit) / 1e24; // Convert yoctoNEAR to NEAR
            totalValue += nearAmount * nearPriceUSD;
          } else if (action.FunctionCall && action.FunctionCall.deposit) {
            // Function call with attached deposit (alternative format)
            const nearAmount = parseFloat(action.FunctionCall.deposit) / 1e24;
            totalValue += nearAmount * nearPriceUSD;
          }
        }
        
        return totalValue;
      }
      
      // If no specific amount found, try to extract from transaction outcome
      if (tx.outcome && tx.outcome.receipt_ids) {
        // This is a simplified estimation - in practice you'd need to analyze receipts
        return nearPriceUSD * 0.1; // Estimate small transaction
      }
      
      return 0;
    } catch (error) {
      console.error('Error calculating transaction value:', error);
      return 0;
    }
  }

  /**
   * Get current NEAR price in USD
   * In production, this should use a reliable price oracle
   */
  private getNearPrice(): number {
    // In a real implementation, you would:
    // 1. Fetch from a price oracle like Chainlink
    // 2. Use CoinGecko or other price APIs
    // 3. Cache the price to avoid excessive API calls
    
    // For now, return a reasonable estimate
    // You could also fetch this from an API:
    /*
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd');
    const data = await response.json();
    return data.near.usd;
    */
    
    return 2.5; // Approximate NEAR price - replace with real API call
  }

}