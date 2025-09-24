/**
 * Transaction History Service
 * Manages transaction history with proper event tracking and filtering
 */

export interface TransactionEvent {
  id: string;
  type: 'deposit' | 'withdraw' | 'allocate' | 'deallocate' | 'yield_claim' | 'fee_payment';
  user: string;
  token: string;
  amount: string;
  txHash: string;
  blockHeight: number;
  timestamp: number;
  gasUsed: string;
  status: 'pending' | 'success' | 'failed';
  opportunity?: string;
  apy?: number;
  fee?: string;
  metadata?: Record<string, any>;
}

export interface TransactionHistoryFilter {
  type?: string;
  token?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  opportunity?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionHistoryStats {
  totalTransactions: number;
  totalVolume: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageGasUsed: number;
  totalFees: number;
  byToken: Record<string, { count: number; volume: number }>;
  byType: Record<string, { count: number; volume: number }>;
}

export class TransactionHistoryService {
  private transactions: TransactionEvent[] = [];
  private readonly STORAGE_KEY = 'bond_credit_transaction_history';
  private readonly MAX_TRANSACTIONS = 1000;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Add a new transaction event
   */
  addTransaction(transaction: Omit<TransactionEvent, 'id' | 'timestamp'>): TransactionEvent {
    const newTransaction: TransactionEvent = {
      ...transaction,
      id: this.generateTransactionId(),
      timestamp: Date.now()
    };

    this.transactions.unshift(newTransaction);
    
    // Keep only the latest transactions
    if (this.transactions.length > this.MAX_TRANSACTIONS) {
      this.transactions = this.transactions.slice(0, this.MAX_TRANSACTIONS);
    }

    this.saveToStorage();
    return newTransaction;
  }

  /**
   * Update transaction status
   */
  updateTransactionStatus(txHash: string, status: 'pending' | 'success' | 'failed', gasUsed?: string): boolean {
    const transaction = this.transactions.find(tx => tx.txHash === txHash);
    if (transaction) {
      transaction.status = status;
      if (gasUsed) {
        transaction.gasUsed = gasUsed;
      }
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Get transactions with filtering and pagination
   */
  getTransactions(
    filter: TransactionHistoryFilter = {},
    page: number = 1,
    limit: number = 50
  ): { transactions: TransactionEvent[]; total: number; hasMore: boolean } {
    let filteredTransactions = [...this.transactions];

    // Apply filters
    if (filter.type) {
      filteredTransactions = filteredTransactions.filter(tx => tx.type === filter.type);
    }

    if (filter.token) {
      filteredTransactions = filteredTransactions.filter(tx => tx.token === filter.token);
    }

    if (filter.status) {
      filteredTransactions = filteredTransactions.filter(tx => tx.status === filter.status);
    }

    if (filter.opportunity) {
      filteredTransactions = filteredTransactions.filter(tx => tx.opportunity === filter.opportunity);
    }

    if (filter.dateFrom) {
      filteredTransactions = filteredTransactions.filter(tx => 
        new Date(tx.timestamp) >= filter.dateFrom!
      );
    }

    if (filter.dateTo) {
      filteredTransactions = filteredTransactions.filter(tx => 
        new Date(tx.timestamp) <= filter.dateTo!
      );
    }

    if (filter.minAmount !== undefined) {
      filteredTransactions = filteredTransactions.filter(tx => 
        parseFloat(tx.amount) >= filter.minAmount!
      );
    }

    if (filter.maxAmount !== undefined) {
      filteredTransactions = filteredTransactions.filter(tx => 
        parseFloat(tx.amount) <= filter.maxAmount!
      );
    }

    const total = filteredTransactions.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    return {
      transactions: paginatedTransactions,
      total,
      hasMore: endIndex < total
    };
  }

  /**
   * Get transaction statistics
   */
  getTransactionStats(filter: TransactionHistoryFilter = {}): TransactionHistoryStats {
    const { transactions } = this.getTransactions(filter, 1, this.MAX_TRANSACTIONS);
    
    const stats: TransactionHistoryStats = {
      totalTransactions: transactions.length,
      totalVolume: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      averageGasUsed: 0,
      totalFees: 0,
      byToken: {},
      byType: {}
    };

    let totalGasUsed = 0;
    let gasCount = 0;

    transactions.forEach(tx => {
      const amount = parseFloat(tx.amount);
      stats.totalVolume += amount;

      if (tx.status === 'success') {
        stats.successfulTransactions++;
      } else if (tx.status === 'failed') {
        stats.failedTransactions++;
      }

      if (tx.gasUsed) {
        totalGasUsed += parseFloat(tx.gasUsed);
        gasCount++;
      }

      if (tx.fee) {
        stats.totalFees += parseFloat(tx.fee);
      }

      // By token
      if (!stats.byToken[tx.token]) {
        stats.byToken[tx.token] = { count: 0, volume: 0 };
      }
      stats.byToken[tx.token].count++;
      stats.byToken[tx.token].volume += amount;

      // By type
      if (!stats.byType[tx.type]) {
        stats.byType[tx.type] = { count: 0, volume: 0 };
      }
      stats.byType[tx.type].count++;
      stats.byType[tx.type].volume += amount;
    });

    stats.averageGasUsed = gasCount > 0 ? totalGasUsed / gasCount : 0;

    return stats;
  }

  /**
   * Get transactions by user
   */
  getUserTransactions(
    user: string,
    filter: TransactionHistoryFilter = {},
    page: number = 1,
    limit: number = 50
  ): { transactions: TransactionEvent[]; total: number; hasMore: boolean } {
    return this.getTransactions({ ...filter, user }, page, limit);
  }

  /**
   * Search transactions
   */
  searchTransactions(
    query: string,
    filter: TransactionHistoryFilter = {},
    page: number = 1,
    limit: number = 50
  ): { transactions: TransactionEvent[]; total: number; hasMore: boolean } {
    const { transactions, total, hasMore } = this.getTransactions(filter, 1, this.MAX_TRANSACTIONS);
    
    const searchResults = transactions.filter(tx => 
      tx.txHash.toLowerCase().includes(query.toLowerCase()) ||
      tx.user.toLowerCase().includes(query.toLowerCase()) ||
      tx.token.toLowerCase().includes(query.toLowerCase()) ||
      (tx.opportunity && tx.opportunity.toLowerCase().includes(query.toLowerCase()))
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = searchResults.slice(startIndex, endIndex);

    return {
      transactions: paginatedResults,
      total: searchResults.length,
      hasMore: endIndex < searchResults.length
    };
  }

  /**
   * Clear transaction history
   */
  clearHistory(): void {
    this.transactions = [];
    this.saveToStorage();
  }

  /**
   * Export transaction history
   */
  exportHistory(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['ID', 'Type', 'User', 'Token', 'Amount', 'TX Hash', 'Block Height', 'Timestamp', 'Gas Used', 'Status', 'Opportunity', 'APY', 'Fee'];
      const rows = this.transactions.map(tx => [
        tx.id,
        tx.type,
        tx.user,
        tx.token,
        tx.amount,
        tx.txHash,
        tx.blockHeight,
        new Date(tx.timestamp).toISOString(),
        tx.gasUsed,
        tx.status,
        tx.opportunity || '',
        tx.apy || '',
        tx.fee || ''
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      return csvContent;
    }
    
    return JSON.stringify(this.transactions, null, 2);
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load transactions from localStorage
   */
  private loadFromStorage(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          this.transactions = JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Failed to load transaction history from storage:', error);
      this.transactions = [];
    }
  }

  /**
   * Save transactions to localStorage
   */
  private saveToStorage(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.transactions));
      }
    } catch (error) {
      console.error('Failed to save transaction history to storage:', error);
    }
  }
}

// Export singleton instance
export const transactionHistoryService = new TransactionHistoryService();
