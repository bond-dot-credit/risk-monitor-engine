'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface AccountInfo {
  accountId: string;
  networkId: string;
  balance: {
    total: string;
    available: string;
    staked: string;
    locked: string;
  };
  storage: {
    used: number;
    paid: number;
  };
}

interface SwapResult {
  success: boolean;
  transactionHash?: string;
  amountIn?: string;
  amountOut?: string;
  error?: string;
  agentId?: string;
}

interface BulkOperationResult {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  useHighVolumeProcessor: boolean;
  errors: Array<{ wallet: string; error: string }>;
}

interface ProtocolRewardsData {
  transactionVolume: number;
  smartContractCalls: number;
  uniqueWallets: number;
  period: string;
}

const NearIntentsDashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [swapResult, setSwapResult] = useState<SwapResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromToken, setFromToken] = useState('NEAR');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('1.0');
  const [bulkOperationResult, setBulkOperationResult] = useState<BulkOperationResult | null>(null);
  const [isBulkOperationRunning, setIsBulkOperationRunning] = useState(false);
  const [protocolRewardsData, setProtocolRewardsData] = useState<ProtocolRewardsData | null>(null);
  const [isRewardsCollectionRunning, setIsRewardsCollectionRunning] = useState(false);
  const [configurationStatus, setConfigurationStatus] = useState<Record<string, unknown> | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  // Check configuration status on component mount
  useEffect(() => {
    checkConfigurationStatus();
  }, []);

  const checkConfigurationStatus = async () => {
    try {
      const response = await fetch('/api/near-intents');
      const result = await response.json();
      setConfigurationStatus(result.configuration);
    } catch (error) {
      console.error('Failed to check configuration status:', error);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Check if configuration is valid first
      if (!configurationStatus?.configured) {
        setError('NEAR Intents is not properly configured. Please check your environment variables.');
        setIsLoading(false);
        return;
      }

      // Make real API call to get account info
      const response = await fetch('/api/near-intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getAccountInfo',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsConnected(true);
        setAccountInfo(result.data);
        console.log('Successfully connected to NEAR account:', result.data);
      } else {
        if (result.configRequired) {
          setError('Configuration required: ' + result.error);
        } else {
          setError(result.error || 'Failed to connect to NEAR account');
        }
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect to NEAR wallet');
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAccountInfo(null);
    setSwapResult(null);
    setBulkOperationResult(null);
    setProtocolRewardsData(null);
  };

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSwapResult(null);
    
    try {
      // Make real API call to execute token swap
      const response = await fetch('/api/near-intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'swapTokens',
          fromToken,
          toToken,
          amount,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSwapResult(result.data);
        console.log('Swap executed successfully:', result.data);
        
        // Refresh account info after successful swap
        setTimeout(() => {
          handleConnect();
        }, 2000);
      } else {
        setError(result.error || 'Failed to execute swap');
        setSwapResult({
          success: false,
          error: result.error,
        });
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Swap error:', err);
      setError('Failed to execute swap');
      setSwapResult({
        success: false,
        error: 'Network error occurred',
      });
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleBulkOperation = async () => {
    setIsBulkOperationRunning(true);
    setError(null);
    setBulkOperationResult(null);
    
    try {
      // Configuration for bulk operation (you can make this configurable via UI)
      const bulkConfig = {
        wallets: [], // Will use default account from configuration
        transactionsPerWallet: 10, // Small number for demo
        tokens: [
          { from: 'NEAR', to: 'USDC' },
          { from: 'NEAR', to: 'USDT' },
        ],
        amountRange: {
          min: 0.1,
          max: 1.0,
        },
        delayBetweenTransactions: 1000, // 1 second delay
      };

      const response = await fetch('/api/near-intents-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'executeBulkSwaps',
          config: bulkConfig,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setBulkOperationResult(result.data);
        console.log('Bulk operation completed:', result.data);
      } else {
        setError(result.error || 'Failed to execute bulk operation');
        setBulkOperationResult({
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          useHighVolumeProcessor: false,
          errors: [{ wallet: 'unknown', error: result.error }],
        });
      }
      
      setIsBulkOperationRunning(false);
    } catch (err) {
      console.error('Bulk operation error:', err);
      setError('Failed to execute bulk operation');
      setIsBulkOperationRunning(false);
    }
  };

  const handleCollectProtocolRewards = async () => {
    setIsRewardsCollectionRunning(true);
    setError(null);
    try {
      // Make real API call to collect protocol rewards data
      const response = await fetch('/api/near-protocol-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'collectMetrics',
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setProtocolRewardsData(result.data);
      } else {
        setError(result.error || 'Failed to collect protocol rewards data');
      }
      
      setIsRewardsCollectionRunning(false);
    } catch (err) {
      console.error('Protocol rewards collection error:', err);
      setError('Failed to collect protocol rewards data');
      setIsRewardsCollectionRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>NEAR Intents Integration</CardTitle>
          <CardDescription>
            Execute cross-chain transactions using the NEAR Intents protocol
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration Status */}
          {configurationStatus && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="font-medium">Configuration Status</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Network: {(configurationStatus as Record<string, unknown>).networkId as string} | Node: {new URL((configurationStatus as Record<string, unknown>).nodeUrl as string).hostname}
                </p>
              </div>
              <Badge variant={(configurationStatus as Record<string, unknown>).configured ? "default" : "destructive"}>
                {(configurationStatus as Record<string, unknown>).configured ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>
          )}
          
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <p className="text-gray-600 dark:text-gray-400">
                {configurationStatus?.configured 
                  ? 'Connect to your NEAR account to get started'
                  : 'Please configure your environment variables first'
                }
              </p>
              {configurationStatus?.configured ? (
                <Button onClick={handleConnect} disabled={isLoading}>
                  {isLoading ? 'Connecting...' : 'Connect NEAR Account'}
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                    Missing required environment variables
                  </p>
                  <p className="text-xs text-gray-500">
                    Please check your .env file and restart the application
                  </p>
                </div>
              )}
              {error && (
                <div className="max-w-md">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Connected Account</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {accountInfo?.accountId} ({accountInfo?.networkId})
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <Badge variant="secondary">{accountInfo?.balance?.available}</Badge>
                    {accountInfo?.balance?.staked && accountInfo.balance.staked !== '0.0000 NEAR' && (
                      <Badge variant="outline" className="ml-1">
                        Staked: {accountInfo.balance.staked}
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                </div>
              </div>

              {/* Account Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Total Balance</p>
                  <p className="font-medium">{accountInfo?.balance?.total}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Available</p>
                  <p className="font-medium">{accountInfo?.balance?.available}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Staked</p>
                  <p className="font-medium">{accountInfo?.balance?.staked}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Locked</p>
                  <p className="font-medium">{accountInfo?.balance?.locked}</p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Swap</CardTitle>
                    <CardDescription>
                      Swap tokens using the NEAR Intents protocol
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">From</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={fromToken}
                          onChange={(e) => setFromToken(e.target.value)}
                          className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <input
                          type="text"
                          value={amount}
                          onChange={handleInputChange}
                          placeholder="Amount"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">To</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={toToken}
                          onChange={(e) => setToToken(e.target.value)}
                          className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <input
                          type="text"
                          placeholder="Amount"
                          disabled
                          value={(parseFloat(amount || '0') * 0.97).toFixed(2)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <Button onClick={handleSwap} disabled={isLoading} className="w-full">
                      {isLoading ? 'Executing Swap...' : 'Swap Tokens'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Status</CardTitle>
                    <CardDescription>
                      View the status of your transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {swapResult ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Status</span>
                          <Badge variant={swapResult.success ? 'default' : 'destructive'}>
                            {swapResult.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                        {swapResult.success ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Transaction Hash</span>
                              <span className="text-sm font-mono text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                                {swapResult.transactionHash}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Amount In</span>
                              <span className="text-sm">{swapResult.amountIn}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Amount Out</span>
                              <span className="text-sm">{swapResult.amountOut}</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-red-500 dark:text-red-400">{swapResult.error}</div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No transactions yet. Execute a swap to see the status here.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Operations Section */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Operations</CardTitle>
          <CardDescription>
            Execute large-scale transactions across multiple wallets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-200">500 Calls</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Execute 500 API calls simultaneously
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-800 dark:text-green-200">100 Wallets</h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Process transactions for 100 different wallets
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 className="font-medium text-purple-800 dark:text-purple-200">10K Transactions</h3>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                Execute up to 10,000 transactions in batch
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleBulkOperation} 
              disabled={isBulkOperationRunning}
              className="flex-1"
            >
              {isBulkOperationRunning ? 'Executing Bulk Operations...' : 'Execute Bulk Transactions'}
            </Button>
          </div>

          {bulkOperationResult && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-3">Bulk Operation Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white dark:bg-gray-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
                  <p className="text-xl font-bold">{bulkOperationResult.totalTransactions.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Successful</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {bulkOperationResult.successfulTransactions.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {bulkOperationResult.failedTransactions.toLocaleString()}
                  </p>
                </div>
              </div>
              
              {bulkOperationResult.errors && bulkOperationResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Errors:</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {bulkOperationResult.errors.slice(0, 5).map((error: { wallet: string; error: string }, index: number) => (
                      <div key={index} className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded mb-1">
                        <span className="font-medium">{error.wallet}:</span> {error.error}
                      </div>
                    ))}
                    {bulkOperationResult.errors.length > 5 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ... and {bulkOperationResult.errors.length - 5} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* NEAR Protocol Rewards Section */}
      <Card>
        <CardHeader>
          <CardTitle>NEAR Protocol Rewards</CardTitle>
          <CardDescription>
            Track on-chain metrics and calculate potential rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-200">Transaction Volume</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Total value of transactions on NEAR Blockchain
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-800 dark:text-green-200">Smart Contract Calls</h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Number of unique contract interactions
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 className="font-medium text-purple-800 dark:text-purple-200">Unique Wallets</h3>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                Number of distinct wallets interacting
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleCollectProtocolRewards} 
              disabled={isRewardsCollectionRunning}
              className="flex-1"
            >
              {isRewardsCollectionRunning ? 'Collecting Metrics...' : 'Collect Protocol Rewards Data'}
            </Button>
          </div>

          {protocolRewardsData && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-3">Protocol Rewards Data</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-white dark:bg-gray-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Transaction Volume</p>
                  <p className="text-xl font-bold">${((protocolRewardsData as unknown) as Record<string, unknown>).transactionVolume?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Smart Contract Calls</p>
                  <p className="text-xl font-bold">{String(((protocolRewardsData as unknown) as Record<string, unknown>).smartContractCalls || '0')}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-700 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unique Wallets</p>
                  <p className="text-xl font-bold">{String(((protocolRewardsData as unknown) as Record<string, unknown>).uniqueWallets || '0')}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-sm text-blue-600 dark:text-blue-400">Reward Tier</p>
                  <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{String(((protocolRewardsData as unknown) as Record<string, unknown>).rewardTier || 'None')}</p>
                </div>
                <div className="flex-1 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <p className="text-sm text-green-600 dark:text-green-400">Potential Reward</p>
                  <p className="text-xl font-bold text-green-800 dark:text-green-200">${String(((protocolRewardsData as unknown) as Record<string, unknown>).monetaryReward || '0')}</p>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>Period: {String((((protocolRewardsData as unknown) as Record<string, unknown>).period as Record<string, unknown>)?.startDate || 'N/A')} to {String((((protocolRewardsData as unknown) as Record<string, unknown>).period as Record<string, unknown>)?.endDate || 'N/A')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About NEAR Intents</CardTitle>
          <CardDescription>
            Cross-chain transaction protocol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              NEAR Intents is a system for executing multichain transactions. An intent represents a user&apos;s desired state change (e.g., &quot;I want to swap X NEAR for Y USDC&quot;) rather than a specific execution path. This allows for more flexible and efficient execution of financial operations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Flexible Execution</h4>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Intent-based transactions adapt to market conditions
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200">Multi-chain</h4>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Execute transactions across multiple blockchain networks
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-medium text-purple-800 dark:text-purple-200">Secure</h4>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  On-chain verification ensures transaction integrity
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NearIntentsDashboard;