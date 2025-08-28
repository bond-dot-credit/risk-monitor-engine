'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const NearIntentsDashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [swapResult, setSwapResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromToken, setFromToken] = useState('NEAR');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('1.0');

  // Initialize with mock data for demo purposes
  useEffect(() => {
    // In a real implementation, you might want to check if the user is already connected
    // and restore their session
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real implementation, this would connect to the NEAR wallet
      // For demo purposes, we'll simulate a successful connection
      setTimeout(() => {
        setIsConnected(true);
        setAccountInfo({
          accountId: 'user.near',
          balance: '100.5 NEAR',
        });
        setIsLoading(false);
      }, 1000);
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
  };

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // In a real implementation, this would execute a token swap
      // For demo purposes, we'll simulate a successful swap
      setTimeout(() => {
        setSwapResult({
          success: true,
          transactionHash: 'NEARtx...' + Math.random().toString(36).substr(2, 9),
          amountIn: `${amount} ${fromToken}`,
          amountOut: `${(parseFloat(amount) * 0.97).toFixed(2)} ${toToken}`, // 3% fee
        });
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      console.error('Swap error:', err);
      setError('Failed to execute swap');
      setSwapResult({
        success: false,
        error: 'Failed to execute swap',
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
                Connect your NEAR wallet to get started
              </p>
              <Button onClick={handleConnect} disabled={isLoading}>
                {isLoading ? 'Connecting...' : 'Connect NEAR Wallet'}
              </Button>
              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Connected Account</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {accountInfo?.accountId}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{accountInfo?.balance}</Badge>
                  <Button variant="outline" size="sm" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
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
              NEAR Intents is a system for executing multichain transactions. An intent represents a user's desired state change (e.g., "I want to swap X NEAR for Y USDC") rather than a specific execution path. This allows for more flexible and efficient execution of financial operations.
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