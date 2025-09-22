import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useRealTimeData } from '@/hooks/useRealTimeData';

interface ActivityItem {
  id: string;
  type: 'deposit' | 'withdraw' | 'allocate' | 'yield_claim' | 'price_update';
  user: string;
  amount: string;
  token: string;
  timestamp: number;
  txHash?: string;
  opportunity?: string;
  apy?: number;
}

export const RealTimeActivityFeed: React.FC = () => {
  const { data, isConnected, isConnecting, lastMessage } = useRealTimeData();
  const [filter, setFilter] = useState<'all' | 'deposits' | 'withdrawals' | 'allocations'>('all');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '📥';
      case 'withdraw': return '📤';
      case 'allocate': return '🔄';
      case 'yield_claim': return '💰';
      case 'price_update': return '📈';
      default: return '📊';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'withdraw': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'allocate': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'yield_claim': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'price_update': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  const getAllActivities = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    
    // Add deposits
    data.deposits.forEach((deposit, index) => {
      activities.push({
        id: `deposit-${index}`,
        type: 'deposit',
        user: deposit.user || 'Unknown',
        amount: deposit.amount || '0',
        token: deposit.token || 'NEAR',
        timestamp: deposit.timestamp || Date.now(),
        txHash: deposit.txHash
      });
    });

    // Add withdrawals
    data.withdrawals.forEach((withdrawal, index) => {
      activities.push({
        id: `withdrawal-${index}`,
        type: 'withdraw',
        user: withdrawal.user || 'Unknown',
        amount: withdrawal.amount || '0',
        token: withdrawal.token || 'NEAR',
        timestamp: withdrawal.timestamp || Date.now(),
        txHash: withdrawal.txHash
      });
    });

    // Add allocations
    data.allocations.forEach((allocation, index) => {
      activities.push({
        id: `allocation-${index}`,
        type: 'allocate',
        user: allocation.user || 'Unknown',
        amount: allocation.amount || '0',
        token: allocation.token || 'NEAR',
        timestamp: allocation.timestamp || Date.now(),
        txHash: allocation.txHash,
        opportunity: allocation.opportunity,
        apy: allocation.apy
      });
    });

    // Add price updates
    data.priceUpdates.forEach((priceUpdate, index) => {
      activities.push({
        id: `price-${index}`,
        type: 'price_update',
        user: 'Market',
        amount: priceUpdate.price || '0',
        token: priceUpdate.token || 'NEAR',
        timestamp: priceUpdate.timestamp || Date.now()
      });
    });

    // Sort by timestamp (newest first)
    return activities.sort((a, b) => b.timestamp - a.timestamp);
  };

  const filteredActivities = getAllActivities().filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              🔴 Live Activity Feed
              {isConnected && <StatusBadge status="success" text="Live" />}
              {isConnecting && <StatusBadge status="pending" text="Connecting..." />}
              {!isConnected && !isConnecting && <StatusBadge status="error" text="Offline" />}
            </CardTitle>
          </div>
          <div className="flex gap-1">
            {(['all', 'deposits', 'withdrawals', 'allocations'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <CardDescription>
          Real-time blockchain events and market updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className={`p-3 rounded-lg border ${getActivityColor(activity.type)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                    <div>
                      <div className="font-medium">
                        {activity.user} {activity.type === 'deposit' ? 'deposited' : 
                                       activity.type === 'withdraw' ? 'withdrew' :
                                       activity.type === 'allocate' ? 'allocated' :
                                       activity.type === 'yield_claim' ? 'claimed yield' :
                                       'price updated'}
                      </div>
                      <div className="text-sm opacity-75">
                        {activity.amount} {activity.token}
                        {activity.opportunity && ` to ${activity.opportunity}`}
                        {activity.apy && ` (${activity.apy}% APY)`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-75">
                      {formatTimestamp(activity.timestamp)}
                    </div>
                    {activity.txHash && (
                      <div className="text-xs opacity-60 font-mono">
                        {activity.txHash.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">📊</div>
              <p>No activity to show</p>
              <p className="text-sm">Activity will appear here in real-time</p>
            </div>
          )}
        </div>
        
        {lastMessage && (
          <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
            Last update: {formatTimestamp(lastMessage.timestamp)} - {lastMessage.type}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
