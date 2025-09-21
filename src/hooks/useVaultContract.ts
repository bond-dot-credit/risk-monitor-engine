'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  VaultConfig, 
  TokenType, 
  DepositEvent, 
  WithdrawEvent, 
  VaultState,
  VaultContractConfig,
  TOKEN_CONTRACTS
} from '@/types/vault';

export interface VaultContractState {
  config: VaultConfig | null;
  state: VaultState | null;
  isLoading: boolean;
  error: string | null;
  events: {
    deposits: DepositEvent[];
    withdrawals: WithdrawEvent[];
  };
}

export interface VaultContractMethods {
  deposit: (tokenType: TokenType, amount: string) => Promise<void>;
  withdraw: (tokenType: TokenType, vaultSharesAmount: string) => Promise<void>;
  refreshData: () => Promise<void>;
  getTokenReserves: (tokenType: TokenType) => Promise<string>;
  getUserShares: (accountId: string, tokenType: TokenType) => Promise<string>;
}

export function useVaultContract(
  contractConfig: VaultContractConfig,
  accountId: string | null
): VaultContractState & VaultContractMethods {
  const [config, setConfig] = useState<VaultConfig | null>(null);
  const [state, setState] = useState<VaultState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState({
    deposits: [] as DepositEvent[],
    withdrawals: [] as WithdrawEvent[],
  });

  // Get NEAR RPC URL based on network
  const getRpcUrl = useCallback(() => {
    return contractConfig.networkId === 'testnet' 
      ? 'https://rpc.testnet.near.org'
      : 'https://rpc.mainnet.near.org';
  }, [contractConfig.networkId]);

  // Call contract view method
  const callViewMethod = useCallback(async (
    methodName: string,
    args: any = {}
  ): Promise<any> => {
    try {
      const response = await fetch(getRpcUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            request_type: 'call_function',
            finality: 'final',
            account_id: contractConfig.contractId,
            method_name: methodName,
            args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
          },
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.result?.result) {
        return JSON.parse(Buffer.from(data.result.result, 'base64').toString());
      }

      return null;
    } catch (err) {
      console.error(`Error calling ${methodName}:`, err);
      throw err;
    }
  }, [contractConfig.contractId, getRpcUrl]);

  // Call contract change method (requires wallet connection)
  const callChangeMethod = useCallback(async (
    methodName: string,
    args: any = {},
    gas: string = '300000000000000',
    deposit: string = '0'
  ): Promise<any> => {
    if (!accountId) {
      throw new Error('Wallet not connected');
    }

    // This would typically use the wallet to sign and send the transaction
    // For now, we'll simulate the call structure
    console.log(`Calling ${methodName} with args:`, args);
    
    // In a real implementation, this would:
    // 1. Create a transaction using the wallet
    // 2. Sign the transaction
    // 3. Send it to the network
    // 4. Wait for completion
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, transactionHash: `0x${Math.random().toString(16).substr(2, 64)}` });
      }, 2000);
    });
  }, [accountId]);

  // Load vault configuration
  const loadConfig = useCallback(async () => {
    try {
      const config = await callViewMethod('get_config');
      setConfig(config);
    } catch (err) {
      console.error('Error loading vault config:', err);
      setError('Failed to load vault configuration');
    }
  }, [callViewMethod]);

  // Load vault state
  const loadState = useCallback(async () => {
    if (!accountId) return;

    try {
      const [totalSupply, wnearReserves, usdcReserves, usdtReserves, userShares, totalShares] = await Promise.all([
        callViewMethod('get_total_supply'),
        callViewMethod('get_token_reserves', { token_type: TokenType.WNEAR }),
        callViewMethod('get_token_reserves', { token_type: TokenType.USDC }),
        callViewMethod('get_token_reserves', { token_type: TokenType.USDT }),
        callViewMethod('get_user_vault_shares', { 
          account_id: accountId,
          token_type: TokenType.WNEAR 
        }),
        callViewMethod('get_user_total_shares', { account_id: accountId }),
      ]);

      const vaultState: VaultState = {
        total_supply: totalSupply || '0',
        token_reserves: {
          [TokenType.WNEAR]: wnearReserves || '0',
          [TokenType.USDC]: usdcReserves || '0',
          [TokenType.USDT]: usdtReserves || '0',
        },
        user_shares: {
          [TokenType.WNEAR]: userShares || '0',
          [TokenType.USDC]: '0', // Would need separate calls for each token
          [TokenType.USDT]: '0',
        },
        total_shares: totalShares || '0',
      };

      setState(vaultState);
    } catch (err) {
      console.error('Error loading vault state:', err);
      setError('Failed to load vault state');
    }
  }, [accountId, callViewMethod]);

  // Load events
  const loadEvents = useCallback(async () => {
    try {
      const [deposits, withdrawals] = await Promise.all([
        callViewMethod('get_deposit_events', { limit: 50 }),
        callViewMethod('get_withdraw_events', { limit: 50 }),
      ]);

      setEvents({
        deposits: deposits || [],
        withdrawals: withdrawals || [],
      });
    } catch (err) {
      console.error('Error loading vault events:', err);
      setError('Failed to load vault events');
    }
  }, [callViewMethod]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadConfig(),
        loadState(),
        loadEvents(),
      ]);
    } catch (err) {
      console.error('Error refreshing vault data:', err);
      setError('Failed to refresh vault data');
    } finally {
      setIsLoading(false);
    }
  }, [loadConfig, loadState, loadEvents]);

  // Deposit function
  const deposit = useCallback(async (tokenType: TokenType, amount: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await callChangeMethod('deposit', {
        token_type: tokenType,
        amount: amount,
      });
      
      // Refresh data after successful deposit
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Deposit failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [callChangeMethod, refreshData]);

  // Withdraw function
  const withdraw = useCallback(async (tokenType: TokenType, vaultSharesAmount: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await callChangeMethod('withdraw', {
        token_type: tokenType,
        vault_shares_amount: vaultSharesAmount,
      });
      
      // Refresh data after successful withdrawal
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Withdrawal failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [callChangeMethod, refreshData]);

  // Get token reserves
  const getTokenReserves = useCallback(async (tokenType: TokenType): Promise<string> => {
    try {
      return await callViewMethod('get_token_reserves', { token_type: tokenType });
    } catch (err) {
      console.error('Error getting token reserves:', err);
      return '0';
    }
  }, [callViewMethod]);

  // Get user shares
  const getUserShares = useCallback(async (accountId: string, tokenType: TokenType): Promise<string> => {
    try {
      return await callViewMethod('get_user_vault_shares', {
        account_id: accountId,
        token_type: tokenType,
      });
    } catch (err) {
      console.error('Error getting user shares:', err);
      return '0';
    }
  }, [callViewMethod]);

  // Load data on mount and when account changes
  useEffect(() => {
    if (accountId) {
      refreshData();
    }
  }, [accountId, refreshData]);

  return {
    config,
    state,
    isLoading,
    error,
    events,
    deposit,
    withdraw,
    refreshData,
    getTokenReserves,
    getUserShares,
  };
}

