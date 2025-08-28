'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const NearIntentsDashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [swapResult, setSwapResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
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
    } catch (error) {
      console.error('Connection error:', error);
      setIsLoading(false);
    }
  };

  const handleSwap = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would execute a token swap
      // For demo purposes, we'll simulate a successful swap
      setTimeout(() => {
        setSwapResult({
          success: true,
          transactionHash: 'NEARtx...' + Math.random().toString(36).substr(2, 9),
          amountIn: '1.0 NEAR',
          amountOut: '0.97 USDC',
        });
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Swap error:', error);
      setSwapResult({
        success: false,
        error: 'Failed to execute swap',
      });
      setIsLoading(false);
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
                <Badge variant="secondary">{accountInfo?.balance}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Swap</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">From</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="Amount"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          defaultValue="1.0"
                        />
                        <Badge>NEAR</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">To</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="Amount"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          defaultValue="0.97"
                        />
                        <Badge>USDC</Badge>
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
                  </CardHeader>
                  <CardContent>
                    {swapResult ? (
                      <div className="space-y-2">
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
                              <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
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
                          <div className="text-sm text-red-500">{swapResult.error}</div>
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
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            NEAR Intents is a system for executing multichain transactions. An intent represents a user's desired state change (e.g., "I want to swap X NEAR for Y USDC") rather than a specific execution path. This allows for more flexible and efficient execution of financial operations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NearIntentsDashboard;