import { useState, useEffect, useCallback } from 'react';
import { 
  transactionHistoryService, 
  TransactionEvent, 
  TransactionHistoryFilter, 
  TransactionHistoryStats 
} from '@/services/transaction-history-service';

export interface UseTransactionHistoryReturn {
  transactions: TransactionEvent[];
  stats: TransactionHistoryStats;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  
  // Actions
  addTransaction: (transaction: Omit<TransactionEvent, 'id' | 'timestamp'>) => void;
  updateTransactionStatus: (txHash: string, status: 'pending' | 'success' | 'failed', gasUsed?: string) => boolean;
  loadMore: () => void;
  refresh: () => void;
  search: (query: string) => void;
  setFilter: (filter: TransactionHistoryFilter) => void;
  clearHistory: () => void;
  exportHistory: (format: 'json' | 'csv') => string;
}

export function useTransactionHistory(
  user?: string,
  initialFilter: TransactionHistoryFilter = {}
): UseTransactionHistoryReturn {
  const [transactions, setTransactions] = useState<TransactionEvent[]>([]);
  const [stats, setStats] = useState<TransactionHistoryStats>({
    totalTransactions: 0,
    totalVolume: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    averageGasUsed: 0,
    totalFees: 0,
    byToken: {},
    byType: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<TransactionHistoryFilter>(initialFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const LIMIT = 20;

  // Load transactions
  const loadTransactions = useCallback(async (page: number = 1, append: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      
      if (searchQuery) {
        result = transactionHistoryService.searchTransactions(
          searchQuery,
          user ? { ...filter, user } : filter,
          page,
          LIMIT
        );
      } else if (user) {
        result = transactionHistoryService.getUserTransactions(
          user,
          filter,
          page,
          LIMIT
        );
      } else {
        result = transactionHistoryService.getTransactions(
          filter,
          page,
          LIMIT
        );
      }

      if (append) {
        setTransactions(prev => [...prev, ...result.transactions]);
      } else {
        setTransactions(result.transactions);
      }

      setHasMore(result.hasMore);
      setCurrentPage(page);

      // Update stats
      const newStats = transactionHistoryService.getTransactionStats(
        user ? { ...filter, user } : filter
      );
      setStats(newStats);

    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [user, filter, searchQuery]);

  // Add transaction
  const addTransaction = useCallback((transaction: Omit<TransactionEvent, 'id' | 'timestamp'>) => {
    try {
      const newTransaction = transactionHistoryService.addTransaction(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Update stats
      const newStats = transactionHistoryService.getTransactionStats(
        user ? { ...filter, user } : filter
      );
      setStats(newStats);
    } catch (err: any) {
      setError(err.message || 'Failed to add transaction');
    }
  }, [user, filter]);

  // Update transaction status
  const updateTransactionStatus = useCallback((
    txHash: string, 
    status: 'pending' | 'success' | 'failed', 
    gasUsed?: string
  ) => {
    const updated = transactionHistoryService.updateTransactionStatus(txHash, status, gasUsed);
    
    if (updated) {
      setTransactions(prev => 
        prev.map(tx => 
          tx.txHash === txHash 
            ? { ...tx, status, ...(gasUsed && { gasUsed }) }
            : tx
        )
      );
      
      // Update stats
      const newStats = transactionHistoryService.getTransactionStats(
        user ? { ...filter, user } : filter
      );
      setStats(newStats);
    }
    
    return updated;
  }, [user, filter]);

  // Load more transactions
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadTransactions(currentPage + 1, true);
    }
  }, [isLoading, hasMore, currentPage, loadTransactions]);

  // Refresh transactions
  const refresh = useCallback(() => {
    loadTransactions(1, false);
  }, [loadTransactions]);

  // Search transactions
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Set filter
  const setFilterCallback = useCallback((newFilter: TransactionHistoryFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    transactionHistoryService.clearHistory();
    setTransactions([]);
    setStats({
      totalTransactions: 0,
      totalVolume: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      averageGasUsed: 0,
      totalFees: 0,
      byToken: {},
      byType: {}
    });
  }, []);

  // Export history
  const exportHistory = useCallback((format: 'json' | 'csv' = 'json') => {
    return transactionHistoryService.exportHistory(format);
  }, []);

  // Load initial transactions
  useEffect(() => {
    loadTransactions(1, false);
  }, [loadTransactions]);

  // Reload when filter or search changes
  useEffect(() => {
    loadTransactions(1, false);
  }, [filter, searchQuery, loadTransactions]);

  return {
    transactions,
    stats,
    isLoading,
    error,
    hasMore,
    currentPage,
    addTransaction,
    updateTransactionStatus,
    loadMore,
    refresh,
    search,
    setFilter: setFilterCallback,
    clearHistory,
    exportHistory
  };
}
