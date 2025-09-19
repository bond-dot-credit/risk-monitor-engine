'use client';

import { useState, useEffect, useCallback } from 'react';

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
}

export interface NearWalletActions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useNearWallet(): NearWalletState & NearWalletActions {
  const [account, setAccount] = useState<NearAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize wallet connection on component mount
  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    try {
      // Check if wallet is already connected
      const walletData = localStorage.getItem('near-wallet-account');
      if (walletData) {
        const parsedAccount = JSON.parse(walletData);
        setAccount(parsedAccount);
        setIsConnected(true);
      }
    } catch (err) {
      console.error('Error initializing wallet:', err);
      setError('Failed to initialize wallet connection');
    }
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For development, we'll simulate a wallet connection
      // In production, this would integrate with NEAR Wallet Selector
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate connection delay
      
      // Mock account data for development
      const mockAccount: NearAccount = {
        accountId: 'user.near',
        balance: '1.2345',
        isSignedIn: true,
      };

      setAccount(mockAccount);
      setIsConnected(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('near-wallet-account', JSON.stringify(mockAccount));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setIsLoading(true);
    
    try {
      setAccount(null);
      setIsConnected(false);
      localStorage.removeItem('near-wallet-account');
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate NEAR Wallet authentication flow
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate wallet interaction
      
      if (account) {
        const updatedAccount = { ...account, isSignedIn: true };
        setAccount(updatedAccount);
        localStorage.setItem('near-wallet-account', JSON.stringify(updatedAccount));
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (account) {
        const updatedAccount = { ...account, isSignedIn: false };
        setAccount(updatedAccount);
        localStorage.setItem('near-wallet-account', JSON.stringify(updatedAccount));
      }
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  return {
    account,
    isLoading,
    error,
    isConnected,
    connect,
    disconnect,
    signIn,
    signOut,
  };
}
