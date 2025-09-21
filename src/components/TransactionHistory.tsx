import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { TransactionEvent, TransactionHistoryFilter } from '@/services/transaction-history-service';

interface TransactionHistoryProps {
  user?: string;
  className?: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  user,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TransactionHistoryFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  const {
    transactions,
    stats,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    search,
    setFilter: setFilterCallback,
    exportHistory
  } = useTransactionHistory(user, filter);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    search(query);
  };

  const handleFilterChange = (newFilter: TransactionHistoryFilter) => {
    setFilter(newFilter);
    setFilterCallback(newFilter);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '📥';
      case 'withdraw': return '📤';
      case 'allocate': return '🔄';
      case 'deallocate': return '↩️';
      case 'yield_claim': return '💰';
      case 'fee_payment': return '💳';
      default: return '📊';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <StatusBadge status="success" text="Success" />;
      case 'pending': return <StatusBadge status="pending" text="Pending" />;
      case 'failed': return <StatusBadge status="error" text="Failed" />;
      default: return <StatusBadge status="info" text="Unknown" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  };

  const formatAmount = (amount: string, token: string) => {
    const num = parseFloat(amount);
    return `${num.toLocaleString()} ${token}`;
  };

  const handleExport = () => {
    const csvData = exportHistory('csv');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              📋 Transaction History
              {isLoading && <LoadingSpinner size="sm" />}
            </CardTitle>
            <CardDescription>
              {user ? `Transactions for ${user}` : 'All transactions'}
              {stats.totalTransactions > 0 && (
                <span className="ml-2">
                  • {stats.totalTransactions} total • ${stats.totalVolume.toLocaleString()} volume
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
            >
              🔍 Filters
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
            >
              📤 Export
            </Button>
            <Button
              onClick={refresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              ↻ Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by hash, user, token, or opportunity..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <select
                value={filter.type || ''}
                onChange={(e) => handleFilterChange({ ...filter, type: e.target.value || undefined })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="withdraw">Withdraw</option>
                <option value="allocate">Allocate</option>
                <option value="deallocate">Deallocate</option>
                <option value="yield_claim">Yield Claim</option>
                <option value="fee_payment">Fee Payment</option>
              </select>

              <select
                value={filter.token || ''}
                onChange={(e) => handleFilterChange({ ...filter, token: e.target.value || undefined })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="">All Tokens</option>
                <option value="NEAR">NEAR</option>
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
              </select>

              <select
                value={filter.status || ''}
                onChange={(e) => handleFilterChange({ ...filter, status: e.target.value || undefined })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <Button
                onClick={() => handleFilterChange({})}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300">❌ {error}</p>
          </div>
        )}

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{transaction.type}</span>
                        {getStatusBadge(transaction.status)}
                        {transaction.opportunity && (
                          <Badge variant="outline">{transaction.opportunity}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {transaction.user} • {formatAmount(transaction.amount, transaction.token)}
                        {transaction.apy && ` • ${transaction.apy}% APY`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatTimestamp(transaction.timestamp)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                      {transaction.txHash.slice(0, 8)}...
                    </div>
                    {transaction.gasUsed && (
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        Gas: {transaction.gasUsed}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  onClick={loadMore}
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon="📋"
            title="No Transactions Found"
            description="Transaction history will appear here once you start making transactions."
            actionText="Refresh"
            onAction={refresh}
          />
        )}

        {/* Stats Summary */}
        {stats.totalTransactions > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalTransactions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.successfulTransactions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ${stats.totalVolume.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Volume</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.averageGasUsed.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Gas</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
