import { useState, useCallback } from 'react';
import { transactionService, TransactionResult } from '@/services/transaction-service';

export interface TransactionState {
  isLoading: boolean;
  error: string | null;
  result: TransactionResult | null;
}

export interface UseTransactionsReturn {
  // Transaction states
  depositState: TransactionState;
  withdrawState: TransactionState;
  allocateState: TransactionState;
  
  // Transaction functions
  deposit: (tokenType: 'WNEAR' | 'USDC', amount: string) => Promise<void>;
  withdraw: (tokenType: 'WNEAR' | 'USDC', shares: string) => Promise<void>;
  allocate: (opportunityContractId: string, amount: string) => Promise<void>;
  withdrawFromOpportunity: (opportunityContractId: string, amount: string) => Promise<void>;
  
  // Utility functions
  clearError: (type: 'deposit' | 'withdraw' | 'allocate') => void;
  clearAllErrors: () => void;
}

export function useTransactions(accountId?: string): UseTransactionsReturn {
  // Transaction states
  const [depositState, setDepositState] = useState<TransactionState>({
    isLoading: false,
    error: null,
    result: null
  });

  const [withdrawState, setWithdrawState] = useState<TransactionState>({
    isLoading: false,
    error: null,
    result: null
  });

  const [allocateState, setAllocateState] = useState<TransactionState>({
    isLoading: false,
    error: null,
    result: null
  });

  // Deposit function
  const deposit = useCallback(async (tokenType: 'WNEAR' | 'USDC', amount: string) => {
    if (!accountId) {
      setDepositState(prev => ({
        ...prev,
        error: 'No account connected'
      }));
      return;
    }

    setDepositState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const result = await transactionService.depositToVault(accountId, tokenType, amount);
      
      setDepositState(prev => ({
        ...prev,
        isLoading: false,
        result
      }));

      if (!result.success && result.error) {
        setDepositState(prev => ({
          ...prev,
          error: result.error!
        }));
      }

    } catch (error: any) {
      setDepositState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Deposit failed'
      }));
    }
  }, [accountId]);

  // Withdraw function
  const withdraw = useCallback(async (tokenType: 'WNEAR' | 'USDC', shares: string) => {
    if (!accountId) {
      setWithdrawState(prev => ({
        ...prev,
        error: 'No account connected'
      }));
      return;
    }

    setWithdrawState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const result = await transactionService.withdrawFromVault(accountId, tokenType, shares);
      
      setWithdrawState(prev => ({
        ...prev,
        isLoading: false,
        result
      }));

      if (!result.success && result.error) {
        setWithdrawState(prev => ({
          ...prev,
          error: result.error!
        }));
      }

    } catch (error: any) {
      setWithdrawState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Withdrawal failed'
      }));
    }
  }, [accountId]);

  // Allocate function
  const allocate = useCallback(async (opportunityContractId: string, amount: string) => {
    if (!accountId) {
      setAllocateState(prev => ({
        ...prev,
        error: 'No account connected'
      }));
      return;
    }

    setAllocateState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const result = await transactionService.allocateToOpportunity(accountId, opportunityContractId, amount);
      
      setAllocateState(prev => ({
        ...prev,
        isLoading: false,
        result
      }));

      if (!result.success && result.error) {
        setAllocateState(prev => ({
          ...prev,
          error: result.error!
        }));
      }

    } catch (error: any) {
      setAllocateState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Allocation failed'
      }));
    }
  }, [accountId]);

  // Withdraw from opportunity function
  const withdrawFromOpportunity = useCallback(async (opportunityContractId: string, amount: string) => {
    if (!accountId) {
      setAllocateState(prev => ({
        ...prev,
        error: 'No account connected'
      }));
      return;
    }

    setAllocateState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const result = await transactionService.withdrawFromOpportunity(accountId, opportunityContractId, amount);
      
      setAllocateState(prev => ({
        ...prev,
        isLoading: false,
        result
      }));

      if (!result.success && result.error) {
        setAllocateState(prev => ({
          ...prev,
          error: result.error!
        }));
      }

    } catch (error: any) {
      setAllocateState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Opportunity withdrawal failed'
      }));
    }
  }, [accountId]);

  // Clear error functions
  const clearError = useCallback((type: 'deposit' | 'withdraw' | 'allocate') => {
    switch (type) {
      case 'deposit':
        setDepositState(prev => ({ ...prev, error: null }));
        break;
      case 'withdraw':
        setWithdrawState(prev => ({ ...prev, error: null }));
        break;
      case 'allocate':
        setAllocateState(prev => ({ ...prev, error: null }));
        break;
    }
  }, []);

  const clearAllErrors = useCallback(() => {
    setDepositState(prev => ({ ...prev, error: null }));
    setWithdrawState(prev => ({ ...prev, error: null }));
    setAllocateState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // Transaction states
    depositState,
    withdrawState,
    allocateState,
    
    // Transaction functions
    deposit,
    withdraw,
    allocate,
    withdrawFromOpportunity,
    
    // Utility functions
    clearError,
    clearAllErrors,
  };
}