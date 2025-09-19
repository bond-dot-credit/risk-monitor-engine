'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useNearWallet } from '@/hooks/useNearWallet';

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
  const { account, isConnected, connect, disconnect, signMessage } = useNearWallet();
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
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  // Convert account info to the format expected by the component
  const accountInfo: AccountInfo | null = account ? {
    accountId: account.accountId,
    networkId: 'testnet', // Default to testnet for now
    balance: {
      total: `${account.balance} NEAR`,
      available: `${account.balance} NEAR`,
      staked: '0.0000 NEAR',
      locked: '0.0000 NEAR',
    },
    storage: {
      used: 0,
      paid: 0,
    },
  } : null;

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await connect();
      console.log('Wallet connection initiated');
    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect to NEAR wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setSwapResult(null);
    setBulkOperationResult(null);
    setProtocolRewardsData(null);
  };

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSwapResult(null);
    
    try {
      // Create swap intent message
      const swapMessage = `Swap ${amount} ${fromToken} to ${toToken}`;
      
      // Sign the swap message
      const signature = await signMessage(swapMessage);
      
      if (signature) {
        // Simulate successful swap for now
        setSwapResult({
          success: true,
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          amountIn: `${amount} ${fromToken}`,
          amountOut: `${(parseFloat(amount) * 0.97).toFixed(4)} ${toToken}`,
        });
        console.log('Swap intent signed successfully:', signature);
      } else {
        setError('Failed to sign swap message');
        setSwapResult({
          success: false,
          error: 'Failed to sign swap message',
        });
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Swap error:', err);
      setError('Failed to execute swap');
      setSwapResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
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
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    setIsBulkOperationRunning(true);
    setError(null);
    setBulkOperationResult(null);
    
    try {
      // Simulate bulk operation with message signing
      const bulkMessage = 'Execute bulk NEAR Intents operations';
      const signature = await signMessage(bulkMessage);
      
      if (signature) {
        // Simulate successful bulk operation
        setBulkOperationResult({
          totalTransactions: 100,
          successfulTransactions: 95,
          failedTransactions: 5,
          useHighVolumeProcessor: true,
          errors: [
            { wallet: 'wallet1.testnet', error: 'Insufficient balance' },
            { wallet: 'wallet2.testnet', error: 'Network timeout' },
          ],
        });
        console.log('Bulk operation intent signed:', signature);
      } else {
        setError('Failed to sign bulk operation message');
      }
      
      setIsBulkOperationRunning(false);
    } catch (err) {
      console.error('Bulk operation error:', err);
      setError('Failed to execute bulk operation');
      setIsBulkOperationRunning(false);
    }
  };

  const handleCollectProtocolRewards = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    setIsRewardsCollectionRunning(true);
    setError(null);
    try {
      // Simulate protocol rewards collection with message signing
      const rewardsMessage = `Collect NEAR Protocol Rewards for ${dateRange.startDate} to ${dateRange.endDate}`;
      const signature = await signMessage(rewardsMessage);
      
      if (signature) {
        // Simulate protocol rewards data
        setProtocolRewardsData({
          transactionVolume: 25000,
          smartContractCalls: 750,
          uniqueWallets: 120,
          period: `${dateRange.startDate} to ${dateRange.endDate}`,
        });
        console.log('Protocol rewards intent signed:', signature);
      } else {
        setError('Failed to sign protocol rewards message');
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
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <p className="text-gray-600 dark:text-gray-400">
                Connect to your NEAR wallet to start using NEAR Intents
              </p>
              <Button onClick={handleConnect} disabled={isLoading}>
                {isLoading ? 'Connecting...' : 'Connect NEAR Wallet'}
              </Button>
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
                    {accountInfo?.accountId} 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      accountInfo?.networkId === 'testnet' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {accountInfo?.networkId === 'testnet' ? '🧪 TESTNET' : '🌐 MAINNET'}
                    </span>
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