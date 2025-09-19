'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createWalletSelector, createWalletSelectorModal } from '@/lib/wallet-selector-config';

export interface NearAccount {
  accountId: string;
  balance: string;
  isSignedIn: boolean;
}

export interface NearWalletState {
  account: NearAccount | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  selector: any;
  modal: any;
}

export interface NearWalletActions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;
}

export function useNearWallet(): NearWalletState & NearWalletActions {
  const [account, setAccount] = useState<NearAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selector, setSelector] = useState<any>(null);
  const [modal, setModal] = useState<any>(null);
  
  const selectorRef = useRef<any>(null);
  const modalRef = useRef<any>(null);

  // Initialize wallet selector on component mount
  useEffect(() => {
    initializeWalletSelector();
  }, []);

  const initializeWalletSelector = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Initializing NEAR Wallet Selector...');
      
      // Create wallet selector
      const walletSelector = await createWalletSelector();
      console.log('Wallet selector created:', walletSelector);
      selectorRef.current = walletSelector;
      setSelector(walletSelector);
      
      // Create modal
      const walletModal = await createWalletSelectorModal(walletSelector);
      console.log('Wallet modal created:', walletModal);
      modalRef.current = walletModal;
      setModal(walletModal);
      
      // Check if already signed in
      const signedInAccount = walletSelector.store.getState().accounts[0];
      if (signedInAccount) {
        console.log('Found signed in account:', signedInAccount);
        await handleAccountChange(signedInAccount);
      }
      
      // Listen for account changes
      walletSelector.on('accountsChanged', handleAccountChange);
      
      console.log('Wallet selector initialized successfully');
      
    } catch (err) {
      console.error('Error initializing wallet selector:', err);
      setError(`Failed to initialize wallet connection: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAccountChange = useCallback(async (account: any) => {
    if (!account) {
      setAccount(null);
      setIsConnected(false);
      return;
    }

    try {
      // Get account balance
      const balance = await getAccountBalance(account.accountId);
      
      const nearAccount: NearAccount = {
        accountId: account.accountId,
        balance: balance,
        isSignedIn: true,
      };
      
      setAccount(nearAccount);
      setIsConnected(true);
      setError(null);
      
      // Store in localStorage for persistence
      localStorage.setItem('near-wallet-account', JSON.stringify(nearAccount));
      
    } catch (err) {
      console.error('Error handling account change:', err);
      setError('Failed to load account information');
    }
  }, []);

  const getAccountBalance = async (accountId: string): Promise<string> => {
    try {
      const selector = selectorRef.current;
      if (!selector) return '0';
      
      const { network } = selector.options;
      const response = await fetch(`${network.nodeUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            request_type: 'view_account',
            finality: 'final',
            account_id: accountId,
          },
        }),
      });
      
      const data = await response.json();
      const balance = data.result?.amount || '0';
      return (parseFloat(balance) / 1e24).toFixed(4);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  };

  const connect = useCallback(async () => {
    const modal = modalRef.current;
    if (!modal) {
      setError('Wallet selector not initialized. Please refresh the page.');
      console.error('Modal not available:', modalRef.current);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Opening wallet selector modal...');
      // Show wallet selector modal
      modal.show();
      console.log('Wallet selector modal opened');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const selector = selectorRef.current;
    if (!selector) return;

    setIsLoading(true);
    
    try {
      // Sign out from wallet
      const wallet = await selector.wallet();
      await wallet.signOut();
      
      setAccount(null);
      setIsConnected(false);
      localStorage.removeItem('near-wallet-account');
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError('Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async () => {
    // With real wallet selector, sign in happens automatically when connecting
    // This method is kept for compatibility but doesn't need to do anything
    console.log('Sign in is handled automatically by wallet selector');
  }, []);

  const signOut = useCallback(async () => {
    const selector = selectorRef.current;
    if (!selector) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const wallet = await selector.wallet();
      await wallet.signOut();
      
      setAccount(null);
      setIsConnected(false);
      localStorage.removeItem('near-wallet-account');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      setError(errorMessage);
      console.error('Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    const selector = selectorRef.current;
    if (!selector) {
      setError('Wallet selector not initialized');
      return null;
    }

    try {
      const wallet = await selector.wallet();
      const signature = await wallet.signMessage({
        message,
        recipient: account?.accountId || '',
      });
      
      return signature.signature;
    } catch (err) {
      console.error('Error signing message:', err);
      setError('Failed to sign message');
      return null;
    }
  }, [account]);

  return {
    account,
    isLoading,
    error,
    isConnected,
    selector,
    modal,
    connect,
    disconnect,
    signIn,
    signOut,
    signMessage,
  };
}
