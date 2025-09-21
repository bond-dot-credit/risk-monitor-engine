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
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  // Handle wallet disconnection
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

  const formatNumber = (num: number | string) => {
    return new Intl.NumberFormat('en-US').format(typeof num === 'string' ? parseFloat(num) : num);
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
          <CardTitle className="flex items-center gap-2">
            💰 Real Blockchain Balance
            <Button onClick={handleRefreshAll} variant="outline" size="sm" disabled={isRefreshing}>
              {isRefreshing ? 'Refreshing...' : '🔄 Refresh Data'}
            </Button>
          </CardTitle>
          <CardDescription>Real-time account information from NEAR testnet</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Main Account Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 truncate" title={`${account?.balance || '0'} NEAR`}>
                {account?.balance || '0'} NEAR
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Total Balance</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">💰 Native Token</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                testnet
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Network</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">🌐 NEAR Protocol</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {account?.tokens?.length || 0}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">Token Types</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">🪙 FT Holdings</p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ✅ Active
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">Status</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">🟢 Connected</p>
            </div>
          </div>

          {/* Token Holdings */}
          {account?.tokens && account.tokens.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                🪙 Token Holdings
                <StatusBadge status="success" text="Active" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {account.tokens.map((token, index) => {
                  // Format token balance with standard crypto notation
                  const formatTokenBalance = (balance: string, tokenName: string) => {
                    const balanceStr = balance.toString();
                    let decimals = 24; // Default for wNEAR
                    
                    if (tokenName === 'wNEAR') {
                      decimals = 24;
                    } else if (tokenName === 'USDC' || tokenName === 'USDT') {
                      decimals = 6;
                    } else if (tokenName === 'DAI') {
                      decimals = 18;
                    }
                    
                    try {
                      const bigIntBalance = BigInt(balanceStr);
                      const divisor = BigInt(10 ** decimals);
                      const quotient = bigIntBalance / divisor;
                      const remainder = bigIntBalance % divisor;
                      
                      // Convert to decimal representation
                      const decimalPart = remainder.toString().padStart(decimals, '0');
                      const trimmedDecimal = decimalPart.replace(/0+$/, '');
                      
                      let result;
                      if (trimmedDecimal === '') {
                        result = quotient.toString();
                      } else {
                        result = `${quotient}.${trimmedDecimal}`;
                      }
                      
                      const num = parseFloat(result);
                      
                      // Handle extremely large numbers with scientific notation
                      if (num >= 1e15) {
                        return `${num.toExponential(2)}`;
                      } else if (num >= 1e12) {
                        return `${(num / 1e12).toFixed(2)}T`;
                      } else if (num >= 1e9) {
                        return `${(num / 1e9).toFixed(2)}B`;
                      } else if (num >= 1e6) {
                        return `${(num / 1e6).toFixed(2)}M`;
                      } else if (num >= 1e3) {
                        return `${(num / 1e3).toFixed(2)}K`;
                      } else if (num >= 1) {
                        return num.toFixed(2);
                      } else if (num >= 0.01) {
                        return num.toFixed(4);
                      } else {
                        return num.toFixed(6);
                      }
                    } catch (error) {
                      // Fallback for very large numbers - use scientific notation
                      const num = Number(balanceStr);
                      if (num > Number.MAX_SAFE_INTEGER) {
                        return (num / (10 ** decimals)).toExponential(2);
                      }
                      return (num / (10 ** decimals)).toFixed(6);
                    }
                  };

                  const formattedBalance = formatTokenBalance(token.balance, token.token);
                  const isLargeBalance = parseFloat(token.balance) > 1e20;

                  return (
                    <Card key={index} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                              {token.token.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900 dark:text-slate-100">{token.token}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-32" title={token.contract}>
                                {token.contract}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status="success" text="Active" />
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex flex-col space-y-1">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Balance:</span>
                            <span className="font-bold text-lg text-slate-900 dark:text-slate-100 break-all" title={`${formattedBalance} ${token.token}`}>
                              {formattedBalance} {token.token}
                            </span>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Raw Balance:</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono" title={token.balance}>
                              {token.balance.length > 20 
                                ? `${token.balance.slice(0, 8)}...${token.balance.slice(-8)}` 
                                : token.balance}
                            </span>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Contract:</span>
                            <div className="flex flex-col space-y-1">
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono break-all" title={token.contract}>
                                {token.contract}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-blue-500 hover:text-blue-700 w-fit"
                                onClick={() => window.open(`https://testnet.nearblocks.io/address/${token.contract}`, '_blank')}
                                title="View on NEAR Explorer"
                              >
                                🔗 Explorer
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Tokens Message */}
          {(!account?.tokens || account.tokens.length === 0) && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🪙</div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No Token Holdings</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Your account doesn't have any fungible token holdings yet.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Vault Section */}
      {vaultData && !isLoadingVaultData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏦 My Vault Portfolio
              <StatusBadge status="success" text="Active" />
            </CardTitle>
            <CardDescription>Your complete vault holdings, performance, and transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Main Portfolio Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 truncate" title={`${vaultData.userDeposits} NEAR`}>
                  {vaultData.userDeposits} NEAR
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">Total Deposits</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">💰 Principal</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 truncate" title={formatNumber(vaultData.userShares.toString())}>
                  {formatNumber(vaultData.userShares.toString())}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">Vault Shares</div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">📊 LP Tokens</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 truncate" title={`${vaultData.totalValue} NEAR`}>
                  {vaultData.totalValue} NEAR
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1">Total Value</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">💎 Current Worth</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 truncate" title={`+${vaultData.yield} NEAR`}>
                  +{vaultData.yield} NEAR
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300 mt-1">Yield Generated</div>
                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">📈 Earnings</div>
              </div>
            </div>

            {/* Additional Portfolio Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Portfolio Breakdown */}
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    📊 Portfolio Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Principal Amount:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate ml-2" title={`${vaultData.userDeposits} NEAR`}>
                      {vaultData.userDeposits} NEAR
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Yield Earned:</span>
                    <span className="font-medium text-green-600 dark:text-green-400 truncate ml-2" title={`+${vaultData.yield} NEAR`}>
                      +{vaultData.yield} NEAR
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Value:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400 truncate ml-2" title={`${vaultData.totalValue} NEAR`}>
                      {vaultData.totalValue} NEAR
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Vault Shares:</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400 truncate ml-2" title={formatNumber(vaultData.userShares.toString())}>
                      {formatNumber(vaultData.userShares.toString())}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    📈 Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">ROI:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {vaultData.userDeposits > 0 ? ((parseFloat(vaultData.yield) / parseFloat(vaultData.userDeposits)) * 100).toFixed(2) : '0.00'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Yield Rate:</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      {vaultData.userDeposits > 0 ? ((parseFloat(vaultData.yield) / parseFloat(vaultData.userDeposits)) * 365).toFixed(2) : '0.00'}% APY
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Share Ratio:</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      {vaultData.userDeposits > 0 ? (parseFloat(vaultData.userShares) / parseFloat(vaultData.userDeposits)).toFixed(4) : '0.0000'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Value Growth:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {vaultData.userDeposits > 0 ? (((parseFloat(vaultData.totalValue) - parseFloat(vaultData.userDeposits)) / parseFloat(vaultData.userDeposits)) * 100).toFixed(2) : '0.00'}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => {/* Add deposit functionality */}} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={depositState.loading}
                >
                  {depositState.loading ? 'Processing...' : '💰 Deposit More'}
                </Button>
                <Button 
                  onClick={() => {/* Add withdraw functionality */}} 
                  variant="outline"
                  disabled={withdrawState.loading}
                >
                  {withdrawState.loading ? 'Processing...' : '📤 Withdraw'}
                </Button>
                <Button 
                  onClick={() => refreshVaultData(account?.accountId || '')} 
                  variant="outline"
                  disabled={isRefreshing}
                >
                  {isRefreshing ? 'Refreshing...' : '🔄 Refresh Data'}
                </Button>
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

      {/* Enhanced Transaction History */}
      {vaultData?.events && vaultData.events.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Transaction History
              <Badge variant="outline">{vaultData.events.length} transactions</Badge>
            </CardTitle>
            <CardDescription>Complete history of your vault interactions and blockchain transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {vaultData.events.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Badge 
                      variant={
                        event.type === 'deposit' ? 'default' : 
                        event.type === 'allocation' ? 'secondary' : 'destructive'
                      }
                      className="flex-shrink-0"
                    >
                      {event.type === 'deposit' ? '📥' : 
                       event.type === 'allocation' ? '🔄' : '📤'} {event.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {event.amount} NEAR
                        </p>
                        {event.opportunity && (
                          <Badge variant="outline" className="text-xs truncate max-w-32">
                            {event.opportunity}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          🕒 {new Date(event.timestamp).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          ⏰ {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className={`text-sm font-medium ${
                      event.type === 'deposit' ? 'text-green-600 dark:text-green-400' : 
                      event.type === 'withdraw' ? 'text-red-600 dark:text-red-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`}>
                      {event.type === 'deposit' ? '+' : event.type === 'withdraw' ? '-' : '→'}{event.amount} NEAR
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-500 dark:text-slate-500 font-mono truncate max-w-24" title={event.txHash}>
                        {event.txHash ? `${event.txHash.slice(0, 8)}...` : 'No hash'}
                      </p>
                      {event.txHash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                          onClick={() => window.open(`https://explorer.near.org/transactions/${event.txHash}`, '_blank')}
                          title="View on NEAR Explorer"
                        >
                          🔗
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Transaction Summary */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {vaultData.events.filter(e => e.type === 'deposit').length}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Deposits</div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">
                    {vaultData.events.filter(e => e.type === 'withdraw').length}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">Withdrawals</div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {vaultData.events.filter(e => e.type === 'allocation').length}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Allocations</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
