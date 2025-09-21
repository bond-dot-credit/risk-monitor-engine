'use client';

import React, { useState } from 'react';
import { useNearWallet } from '@/hooks/useNearWallet';
import { useContractData } from '@/hooks/useContractData';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { OpportunityCard } from '@/components/OpportunityCard';
import { ErrorManager } from '@/components/ErrorManager';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { LoadingStates } from '@/components/ui/LoadingStates';
import { reportNetworkError, reportContractError, reportWalletError } from '@/services/error-handling-service';

export const RealContractDashboard: React.FC = () => {
  return (
    <ErrorBoundary>
      <RealContractDashboardContent />
    </ErrorBoundary>
  );
};

const RealContractDashboardContent: React.FC = () => {
  const { 
    account, 
    isConnected, 
    isLoading, 
    error, 
    connect, 
    disconnect 
  } = useNearWallet();

  const {
    opportunities,
    globalStats,
    vaultData,
    isLoadingOpportunities,
    isLoadingGlobalStats,
    isLoadingVaultData,
    opportunitiesError,
    globalStatsError,
    vaultDataError,
    contractHealth,
    refreshOpportunities,
    refreshGlobalStats,
    refreshVaultData,
    checkContractHealth
  } = useContractData(account?.accountId);

  const {
    depositState,
    withdrawState,
    allocateState,
    deposit,
    withdraw,
    allocate,
    withdrawFromOpportunity,
    clearError,
    clearAllErrors
  } = useTransactions(account?.accountId);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (err: any) {
      console.error('Connection error:', err);
      reportWalletError(
        `Failed to connect wallet: ${err.message || 'Unknown error'}`,
        { error: err, timestamp: Date.now() }
      );
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
    } catch (err: any) {
      console.error('Disconnection error:', err);
      reportWalletError(
        `Failed to disconnect wallet: ${err.message || 'Unknown error'}`,
        { error: err, timestamp: Date.now() }
      );
    }
  };

  // Refresh all data
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    clearAllErrors();
    try {
      await Promise.all([
        refreshOpportunities(),
        refreshGlobalStats(),
        checkContractHealth()
      ]);
      
      if (account?.accountId) {
        await refreshVaultData(account.accountId);
      }
    } catch (err: any) {
      console.error('Refresh error:', err);
      reportNetworkError(
        `Failed to refresh data: ${err.message || 'Unknown error'}`,
        { error: err, timestamp: Date.now(), accountId: account?.accountId }
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  // Transaction handlers
  const handleDeposit = async (opportunityId: number) => {
    try {
      await deposit('WNEAR', '1.0');
      // Refresh vault data after successful deposit
      if (depositState.result?.success && account?.accountId) {
        await refreshVaultData(account.accountId);
      }
    } catch (error) {
      console.error('Deposit error:', error);
    }
  };

  const handleAllocate = async (opportunityId: number) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity?.contractAddress) {
      return;
    }
    
    try {
      await allocate(opportunity.contractAddress, '1.0');
      // Refresh vault data after successful allocation
      if (allocateState.result?.success && account?.accountId) {
        await refreshVaultData(account.accountId);
      }
    } catch (error) {
      console.error('Allocation error:', error);
    }
  };

  const handleWithdraw = async (opportunityId: number) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity?.contractAddress) {
      return;
    }
    
    try {
      await withdrawFromOpportunity(opportunity.contractAddress, '1.0');
      // Refresh vault data after successful withdrawal
      if (allocateState.result?.success && account?.accountId) {
        await refreshVaultData(account.accountId);
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner 
          size="xl" 
          color="primary" 
          text="Initializing wallet connection..."
          className="py-20"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200">❌ Wallet Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <Button onClick={handleConnectWallet} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Contract health indicator
  const getContractHealthStatus = () => {
    if (!contractHealth) return null;
    
    const totalChecks = Object.values(contractHealth).length;
    const passedChecks = Object.values(contractHealth).filter(Boolean).length;
    
    if (passedChecks === totalChecks) {
      return <StatusBadge status="success" text="All Contracts Online" />;
    } else if (passedChecks > 0) {
      return <StatusBadge status="warning" text="Partial Contract Access" />;
    } else {
      return <StatusBadge status="error" text="No Contract Access" />;
    }
  };

  // Not connected state - Show opportunities and connect button
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Bond.Credit
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Connect your NEAR wallet to access real on-chain investment opportunities
          </p>
          
          {/* Contract Health */}
          <div className="mb-6">
            {getContractHealthStatus()}
          </div>
          
          {/* Connect Wallet Button */}
          <Button 
            onClick={handleConnectWallet}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            🔗 Connect NEAR Wallet
          </Button>
          
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">
            Real on-chain data from NEAR testnet contracts
          </p>
        </div>

        {/* Global Stats */}
        {globalStats && !isLoadingGlobalStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Value Locked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(globalStats.tvl)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {formatNumber(globalStats.users)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Vaults</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {formatNumber(globalStats.activeVaults)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Average APY</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {globalStats.averageApy.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading Global Stats */}
        {isLoadingGlobalStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <LoadingSpinner size="sm" color="gray" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Global Stats Error */}
        {globalStatsError && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 mb-12">
            <CardHeader>
              <CardTitle className="text-red-800 dark:text-red-200">❌ Failed to Load Global Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 dark:text-red-300 mb-4">{globalStatsError}</p>
              <Button onClick={refreshGlobalStats} variant="outline" size="sm">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error Manager (for connected users) */}
        {isConnected && (
          <ErrorManager />
        )}

        {/* Opportunities Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Investment Opportunities
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Real opportunities from NEAR Registry contracts - Connect wallet to interact
              </p>
            </div>
            <Button onClick={handleRefreshAll} variant="outline" disabled={isRefreshing}>
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>

          {/* Loading Opportunities */}
          {isLoadingOpportunities && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
                  <CardContent className="p-6">
                    <LoadingSpinner size="md" color="gray" text="Loading opportunity..." />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Opportunities Error */}
          {opportunitiesError && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardHeader>
                <CardTitle className="text-red-800 dark:text-red-200">❌ Failed to Load Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 dark:text-red-300 mb-4">{opportunitiesError}</p>
                <Button onClick={refreshOpportunities} variant="outline" size="sm">
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Opportunities Grid */}
          {!isLoadingOpportunities && !opportunitiesError && opportunities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  isConnected={false}
                />
              ))}
            </div>
          )}

          {/* No Opportunities */}
          {!isLoadingOpportunities && !opportunitiesError && opportunities.length === 0 && (
            <EmptyState
              icon="📋"
              title="No Opportunities Found"
              description="No investment opportunities are currently available from the Registry contract."
              actionText="Check Again"
              onAction={refreshOpportunities}
            />
          )}
        </div>
      </div>
    );
  }

  // Connected state - Show user dashboard
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back, {account?.accountId}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Real on-chain data from NEAR testnet contracts
          </p>
        </div>
        <div className="flex items-center gap-4">
          {getContractHealthStatus()}
          <Button onClick={handleRefreshAll} variant="outline" size="sm" disabled={isRefreshing}>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={handleDisconnectWallet} variant="outline" size="sm">
            Disconnect
          </Button>
        </div>
      </div>

      {/* Account Balance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your NEAR Account</CardTitle>
          <CardDescription>Real-time account information from NEAR testnet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {account?.balance || '0'} NEAR
              </p>
              <p className="text-slate-800 dark:text-slate-400">Total Balance</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                testnet
              </p>
              <p className="text-slate-800 dark:text-slate-400">Network</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {account?.tokens?.length || 0}
              </p>
              <p className="text-slate-800 dark:text-slate-400">Tokens</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ✅ Active
              </p>
              <p className="text-slate-800 dark:text-slate-400">Status</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Vault Section */}
      {vaultData && !isLoadingVaultData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Vault</CardTitle>
            <CardDescription>Your deposits, shares, and yield from Vault contract</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {vaultData.userDeposits} NEAR
                </p>
                <p className="text-slate-800 dark:text-slate-400">Total Deposits</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatNumber(vaultData.userShares)}
                </p>
                <p className="text-slate-800 dark:text-slate-400">Vault Shares</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {vaultData.totalValue} NEAR
                </p>
                <p className="text-slate-800 dark:text-slate-400">Total Value</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +{vaultData.yield} NEAR
                </p>
                <p className="text-slate-800 dark:text-slate-400">Yield Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vault Loading */}
      {isLoadingVaultData && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vault Error */}
      {vaultDataError && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 mb-8">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200">❌ Failed to Load Vault Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-300 mb-4">{vaultDataError}</p>
            <Button onClick={() => refreshVaultData(account?.accountId || '')} variant="outline" size="sm">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Interactive Opportunities */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Investment Opportunities
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Allocate funds to high-yield opportunities with real blockchain transactions
            </p>
          </div>
        </div>

        {/* Transaction Errors */}
        {(depositState.error || withdrawState.error || allocateState.error) && (
          <div className="mb-6 space-y-2">
            {depositState.error && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-red-700 dark:text-red-300">❌ Deposit Error: {depositState.error}</p>
                    <Button onClick={() => clearError('deposit')} variant="outline" size="sm">Dismiss</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {withdrawState.error && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-red-700 dark:text-red-300">❌ Withdrawal Error: {withdrawState.error}</p>
                    <Button onClick={() => clearError('withdraw')} variant="outline" size="sm">Dismiss</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {allocateState.error && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-red-700 dark:text-red-300">❌ Allocation Error: {allocateState.error}</p>
                    <Button onClick={() => clearError('allocate')} variant="outline" size="sm">Dismiss</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Transaction Success Messages */}
        {(depositState.result?.success || withdrawState.result?.success || allocateState.result?.success) && (
          <div className="mb-6 space-y-2">
            {depositState.result?.success && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-green-700 dark:text-green-300">
                      ✅ Deposit successful! TX: {depositState.result.txHash?.slice(0, 10)}...
                    </p>
                    <Button onClick={() => clearError('deposit')} variant="outline" size="sm">Dismiss</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {withdrawState.result?.success && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-green-700 dark:text-green-300">
                      ✅ Withdrawal successful! TX: {withdrawState.result.txHash?.slice(0, 10)}...
                    </p>
                    <Button onClick={() => clearError('withdraw')} variant="outline" size="sm">Dismiss</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {allocateState.result?.success && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-green-700 dark:text-green-300">
                      ✅ Allocation successful! TX: {allocateState.result.txHash?.slice(0, 10)}...
                    </p>
                    <Button onClick={() => clearError('allocate')} variant="outline" size="sm">Dismiss</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Opportunities Grid */}
        {!isLoadingOpportunities && !opportunitiesError && opportunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                isConnected={true}
                onDeposit={handleDeposit}
                onAllocate={handleAllocate}
                onWithdraw={handleWithdraw}
              />
            ))}
          </div>
        )}
      </div>

      {/* Transaction History */}
      {vaultData?.events && vaultData.events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent deposits, withdrawals, and allocations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vaultData.events.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant={
                      event.type === 'deposit' ? 'default' : 
                      event.type === 'allocation' ? 'secondary' : 'destructive'
                    }>
                      {event.type === 'deposit' ? '📥' : 
                       event.type === 'allocation' ? '🔄' : '📤'} {event.type}
                    </Badge>
                    <div>
                      <p className="font-bold">{event.amount} NEAR</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(event.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {event.txHash && (
                    <Button variant="outline" size="sm">
                      View on Explorer
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
