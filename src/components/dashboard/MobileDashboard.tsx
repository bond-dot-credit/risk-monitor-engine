'use client';

import React, { useState } from 'react';
import { useNearWallet } from '@/hooks/useNearWallet';
import { useContractData } from '@/hooks/useContractData';
import { useTransactions } from '@/hooks/useTransactions';
import { useResponsive } from '@/hooks/useResponsive';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { OpportunityCard } from '@/components/OpportunityCard';

export const MobileDashboard: React.FC = () => {
  return (
    <ErrorBoundary>
      <MobileDashboardContent />
    </ErrorBoundary>
  );
};

const MobileDashboardContent: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();
  
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
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Disconnection error:', err);
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
    } finally {
      setIsRefreshing(false);
    }
  };

  // Transaction handlers
  const handleDeposit = async (opportunityId: number) => {
    try {
      await deposit('WNEAR', '1.0');
      if (depositState.result?.success && account?.accountId) {
        await refreshVaultData(account.accountId);
      }
    } catch (error) {
      console.error('Deposit error:', error);
    }
  };

  const handleAllocate = async (opportunityId: number) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity?.contractAddress) return;
    
    try {
      await allocate(opportunity.contractAddress, '1.0');
      if (allocateState.result?.success && account?.accountId) {
        await refreshVaultData(account.accountId);
      }
    } catch (error) {
      console.error('Allocation error:', error);
    }
  };

  const handleWithdraw = async (opportunityId: number) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity?.contractAddress) return;
    
    try {
      await withdrawFromOpportunity(opportunity.contractAddress, '1.0');
      if (allocateState.result?.success && account?.accountId) {
        await refreshVaultData(account.accountId);
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            icon="❌"
            title="Connection Error"
            description={error}
            actionText="Try Again"
            onAction={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Header */}
      <MobileHeader
        accountId={account?.accountId}
        isConnected={isConnected}
        contractHealth={contractHealth}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefreshing}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Global Stats */}
        {globalStats && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Global Statistics
                {isLoadingGlobalStats && <LoadingSpinner size="sm" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {globalStatsError ? (
                <div className="text-red-600 dark:text-red-400">
                  ❌ {globalStatsError}
                </div>
              ) : (
                <ResponsiveGrid mobileCols={2} tabletCols={4} desktopCols={6} gap="sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${globalStats.tvl?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">TVL</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {globalStats.users?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {globalStats.activeVaults || '0'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Vaults</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {globalStats.averageApy?.toFixed(1) || '0'}%
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Avg APY</div>
                  </div>
                </ResponsiveGrid>
              )}
            </CardContent>
          </Card>
        )}

        {/* User Vault (when connected) */}
        {isConnected && account?.accountId && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏦 My Vault
                {isLoadingVaultData && <LoadingSpinner size="sm" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vaultDataError ? (
                <div className="text-red-600 dark:text-red-400">
                  ❌ {vaultDataError}
                </div>
              ) : vaultData ? (
                <div className="space-y-4">
                  <ResponsiveGrid mobileCols={2} tabletCols={4} desktopCols={4} gap="sm">
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {vaultData.userDeposits?.toFixed(2) || '0'} NEAR
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Deposits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {vaultData.userShares?.toFixed(4) || '0'}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Shares</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {vaultData.totalValue?.toFixed(2) || '0'} NEAR
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Total Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {vaultData.yield?.toFixed(2) || '0'} NEAR
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Yield</div>
                    </div>
                  </ResponsiveGrid>
                </div>
              ) : (
                <EmptyState
                  icon="🏦"
                  title="No Vault Data"
                  description="Your vault information will appear here once you make a deposit."
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Opportunities */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💎 Investment Opportunities
              {isLoadingOpportunities && <LoadingSpinner size="sm" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {opportunitiesError ? (
              <div className="text-red-600 dark:text-red-400">
                ❌ {opportunitiesError}
              </div>
            ) : opportunities.length > 0 ? (
              <ResponsiveGrid 
                mobileCols={1} 
                tabletCols={2} 
                desktopCols={3} 
                gap="md"
                className="justify-items-center"
              >
                {opportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    isConnected={isConnected}
                    onDeposit={handleDeposit}
                    onAllocate={handleAllocate}
                    onWithdraw={handleWithdraw}
                  />
                ))}
              </ResponsiveGrid>
            ) : (
              <EmptyState
                icon="💎"
                title="No Opportunities Available"
                description="Check back later for new investment opportunities."
              />
            )}
          </CardContent>
        </Card>

        {/* Transaction Status Messages */}
        {(depositState.result?.success || withdrawState.result?.success || allocateState.result?.success) && (
          <div className="space-y-2">
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

        {/* Transaction Errors */}
        {(depositState.error || withdrawState.error || allocateState.error) && (
          <div className="space-y-2">
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
      </main>
    </div>
  );
};
