'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Transaction {
  transaction_hash: string;
  block_timestamp: string;
  predecessor_account_id: string;
  receiver_account_id: string;
  actions: Array<{
    action: string;
    method?: string;
    deposit?: number;
  }>;
}

interface AccountInfo {
  account_id: string;
  amount: string;
  locked: string;
  storage_usage: number;
  transactions_count: number;
}

export function NearBlocksViewer() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState('bctemp.near'); // Default to your wallet

  // Load transactions for bctemp.near when component mounts
  useEffect(() => {
    loadTransactions();
    loadAccountInfo();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/nearblocks-proxy?accountId=${accountId}`);
      const result = await response.json();
      
      if (result.success) {
        setTransactions(result.data.txns || []);
      } else {
        setError(result.message || 'Failed to load transactions');
      }
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAccountInfo = async () => {
    try {
      const response = await fetch('/api/nearblocks-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAccountInfo(result.data);
      } else {
        setError(result.message || 'Failed to load account info');
      }
    } catch (err) {
      setError('Failed to fetch account information');
      console.error('Error fetching account info:', err);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleString();
  };

  const formatAmount = (amount: number | string) => {
    if (!amount) return '0 NEAR';
    // If it's already a number, it's in yoctoNEAR
    if (typeof amount === 'number') {
      const nearAmount = amount / 1e24; // Convert yoctoNEAR to NEAR
      return `${nearAmount.toFixed(4)} NEAR`;
    }
    // If it's a string, convert to number first
    const numericAmount = parseFloat(amount as string);
    if (isNaN(numericAmount)) return '0 NEAR';
    const nearAmount = numericAmount / 1e24; // Convert yoctoNEAR to NEAR
    return `${nearAmount.toFixed(4)} NEAR`;
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ transactions, accountInfo }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nearblocks-data-${accountId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>NEAR Blocks Transaction Viewer</CardTitle>
            <CardDescription>
              View transaction data for wallet: <span className="font-mono">{accountId}</span>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadTransactions} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button onClick={exportData} variant="outline">
              Export Data
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {accountInfo && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="font-medium">{formatAmount(accountInfo.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Locked</p>
              <p className="font-medium">{formatAmount(accountInfo.locked)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Storage Usage</p>
              <p className="font-medium">{accountInfo.storage_usage} bytes</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Transactions</p>
              <p className="font-medium">{accountInfo.transactions_count}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Recent Transactions</h3>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p>Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found for this account.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.transaction_hash} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{tx.transaction_hash.substring(0, 8)}...</span>
                        <Badge variant="secondary">{tx.actions[0]?.action}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        From: <span className="font-mono">{tx.predecessor_account_id}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        To: <span className="font-mono">{tx.receiver_account_id}</span>
                      </p>
                      {tx.actions[0]?.method && (
                        <p className="text-sm text-gray-500">
                          Method: <span className="font-mono">{tx.actions[0].method}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {tx.actions[0]?.deposit ? formatAmount(tx.actions[0].deposit) : '0 NEAR'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(tx.block_timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <a 
                      href={`https://nearblocks.io/txns/${tx.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      View on NearBlocks
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}