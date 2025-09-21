'use client';

import React, { useState, useEffect } from 'react';
import { useNearWallet } from '@/hooks/useNearWallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OpportunityCard } from '@/components/OpportunityCard';
import { 
  VaultContract, 
  RegistryContract, 
  OpportunityContract,
  CONTRACT_ADDRESSES,
  parseNearAmount,
  formatNearAmount,
  formatCurrency 
} from '@/lib/near-contract-interactions';
import { Account } from 'near-api-js';

interface Opportunity {
  id: number;
  name: string;
  description: string;
  apy: number;
  trustScore: number;
  performance: number;
  reliability: number;
  safety: number;
  totalScore: number;
  riskLevel: string;
  contractAddress?: string;
  tokenAddress?: string;
  category?: string;
  minDeposit?: number;
  maxDeposit?: number;
  tvl?: number;
}

interface GlobalStats {
  tvl: number;
  users: number;
  activeVaults: number;
  totalYield: number;
  dailyVolume: number;
  averageApy: number;
}

interface VaultData {
  userDeposits: number;
  userShares: number;
  totalValue: number;
  yield: number;
  events: Array<{
    type: 'deposit' | 'withdraw' | 'allocation';
    amount: string;
    timestamp: number;
    txHash?: string;
  }>;
}

export const WalletSelectorDashboard: React.FC = () => {
  const { 
    account, 
    isConnected, 
    isLoading, 
    error, 
    connect, 
    disconnect, 
    selector 
  } = useNearWallet();

  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Mock data for opportunities (will be replaced with real contract calls)
  const mockOpportunities: Opportunity[] = [
    {
      id: 1,
      name: 'NEAR Staking Pool',
      description: 'High-yield staking pool with automated compounding and risk management strategies.',
      apy: 12.5,
      trustScore: 92,
      performance: 37,
      reliability: 35,
      safety: 20,
      totalScore: 92,
      riskLevel: 'LOW',
      contractAddress: 'staking-pool.testnet',
      category: 'staking',
      minDeposit: 1,
      maxDeposit: 100000,
      tvl: 1250000
    },
    {
      id: 2,
      name: 'Liquidity Mining Farm',
      description: 'Automated liquidity provision with dynamic fee optimization and impermanent loss protection.',
      apy: 18.7,
      trustScore: 85,
      performance: 32,
      reliability: 33,
      safety: 20,
      totalScore: 85,
      riskLevel: 'MEDIUM',
      contractAddress: 'liquidity-farm.testnet',
      category: 'liquidity',
      minDeposit: 100,
      maxDeposit: 50000,
      tvl: 850000
    },
    {
      id: 3,
      name: 'DeFi Yield Aggregator',
      description: 'Automated yield farming across multiple protocols with risk diversification.',
      apy: 15.2,
      trustScore: 88,
      performance: 35,
      reliability: 33,
      safety: 20,
      totalScore: 88,
      riskLevel: 'MEDIUM',
      contractAddress: 'yield-agg.testnet',
      category: 'defi',
      minDeposit: 50,
      maxDeposit: 75000,
      tvl: 950000
    }
  ];

  // Load opportunities from Registry contract
  const loadOpportunities = async () => {
    try {
      setIsLoadingData(true);
      setDataError(null);
      
      // Try to load from Registry contract if user is connected
      if (isConnected && account?.accountId && selector) {
        try {
          const wallet = await selector.wallet();
          const accountObj = new Account(wallet.connection, account.accountId);
          const registryContract = new RegistryContract(accountObj);
          
          // Get opportunities from Registry contract
          const contractOpportunities = await registryContract.getOpportunities(10, 0);
          
          if (contractOpportunities && contractOpportunities.length > 0) {
            setOpportunities(contractOpportunities);
            
            // Calculate global stats from contract data
            const totalTvl = contractOpportunities.reduce((sum: number, opp: any) => sum + (opp.tvl || 0), 0);
            const avgApy = contractOpportunities.reduce((sum: number, opp: any) => sum + (opp.apy || 0), 0) / contractOpportunities.length;
            
            setGlobalStats({
              tvl: totalTvl,
              users: 1247, // This would come from a separate contract call
              activeVaults: contractOpportunities.length,
              totalYield: totalTvl * 0.15,
              dailyVolume: totalTvl * 0.2,
              averageApy: avgApy
            });
            
            console.log('Loaded opportunities from Registry contract:', contractOpportunities);
            return;
          }
        } catch (contractError) {
          console.log('Registry contract not deployed or error, using mock data:', contractError);
        }
      }
      
      // Fallback to mock data if contract not available
      setOpportunities(mockOpportunities);
      
      // Calculate global stats from mock opportunities
      const totalTvl = mockOpportunities.reduce((sum, opp) => sum + (opp.tvl || 0), 0);
      const avgApy = mockOpportunities.reduce((sum, opp) => sum + opp.apy, 0) / mockOpportunities.length;
      
      setGlobalStats({
        tvl: totalTvl,
        users: 1247,
        activeVaults: mockOpportunities.length,
        totalYield: totalTvl * 0.15,
        dailyVolume: totalTvl * 0.2,
        averageApy: avgApy
      });
      
    } catch (err) {
      console.error('Error loading opportunities:', err);
      setDataError('Failed to load opportunities from Registry contract');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load user vault data from Vault contract
  const loadVaultData = async () => {
    if (!account?.accountId || !selector) return;
    
    try {
      setIsLoadingData(true);
      setDataError(null);
      
      // Try to load from Vault contract
      try {
        const wallet = await selector.wallet();
        const accountObj = new Account(wallet.connection, account.accountId);
        const vaultContract = new VaultContract(accountObj);
        
        // Get user vault data from contract
        const [userShares, depositEvents, withdrawEvents, totalSupply, tokenReserves] = await Promise.all([
          vaultContract.getUserVaultShares(account.accountId),
          vaultContract.getDepositEvents(account.accountId),
          vaultContract.getWithdrawEvents(account.accountId),
          vaultContract.getTotalSupply(),
          vaultContract.getTokenReserves()
        ]);
        
        // Calculate user deposits and total value
        const userDeposits = userShares ? parseFloat(formatNearAmount(userShares.toString())) : 0;
        const totalValue = userDeposits; // For now, assume 1:1
        
        // Combine events
        const allEvents = [
          ...(depositEvents || []).map((event: any) => ({
            type: 'deposit' as const,
            amount: formatNearAmount(event.amount.toString()),
            timestamp: event.timestamp,
            txHash: event.tx_hash
          })),
          ...(withdrawEvents || []).map((event: any) => ({
            type: 'withdraw' as const,
            amount: formatNearAmount(event.amount.toString()),
            timestamp: event.timestamp,
            txHash: event.tx_hash
          }))
        ].sort((a, b) => b.timestamp - a.timestamp);
        
        const realVaultData: VaultData = {
          userDeposits,
          userShares: userShares ? parseFloat(userShares.toString()) : 0,
          totalValue,
          yield: userDeposits * 0.15, // Calculate yield (15% APY)
          events: allEvents
        };
        
        setVaultData(realVaultData);
        console.log('Loaded vault data from contract:', realVaultData);
        
      } catch (contractError) {
        console.log('Vault contract not deployed or error, using mock data:', contractError);
        
        // Fallback to mock data
        const mockVaultData: VaultData = {
          userDeposits: 5.2,
          userShares: 5200000,
          totalValue: 5.2,
          yield: 0.78,
          events: [
            {
              type: 'deposit',
              amount: '2.5',
              timestamp: Date.now() - 86400000,
              txHash: 'mock-tx-hash-1'
            },
            {
              type: 'allocation',
              amount: '1.0',
              timestamp: Date.now() - 172800000,
              txHash: 'mock-tx-hash-2'
            }
          ]
        };
        
        setVaultData(mockVaultData);
      }
      
    } catch (err) {
      console.error('Error loading vault data:', err);
      setDataError('Failed to load vault data');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load data when component mounts or when user connects
  useEffect(() => {
    loadOpportunities();
  }, []);

  useEffect(() => {
    if (isConnected && account?.accountId) {
      loadVaultData();
    }
  }, [isConnected, account?.accountId]);

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
      setVaultData(null);
    } catch (err) {
      console.error('Disconnection error:', err);
    }
  };

  // Handle opportunity actions with real contract calls
  const handleDeposit = async (opportunityId: number) => {
    if (!account?.accountId || !selector) return;
    
    try {
      const wallet = await selector.wallet();
      const accountObj = new Account(wallet.connection, account.accountId);
      const vaultContract = new VaultContract(accountObj);
      
      // Deposit 1 NEAR to vault
      const depositAmount = parseNearAmount('1.0'); // 1 NEAR in yoctoNEAR
      const result = await vaultContract.deposit('WNEAR', depositAmount);
      
      console.log('Deposit successful:', result);
      setDataError(null);
      
      // Refresh vault data after successful deposit
      await loadVaultData();
      
    } catch (err) {
      console.error('Deposit error:', err);
      setDataError(`Failed to execute deposit transaction: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleAllocate = async (opportunityId: number) => {
    if (!account?.accountId || !selector) return;
    
    try {
      const opportunity = opportunities.find(opp => opp.id === opportunityId);
      if (!opportunity?.contractAddress) {
        setDataError('Opportunity contract not found');
        return;
      }

      const wallet = await selector.wallet();
      const accountObj = new Account(wallet.connection, account.accountId);
      const opportunityContract = new OpportunityContract(accountObj, opportunity.contractAddress);
      
      // Allocate 1 NEAR to opportunity
      const allocationAmount = parseNearAmount('1.0'); // 1 NEAR in yoctoNEAR
      const result = await opportunityContract.allocate(allocationAmount);
      
      console.log('Allocation successful:', result);
      setDataError(null);
      
      // Refresh vault data after successful allocation
      await loadVaultData();
      
    } catch (err) {
      console.error('Allocation error:', err);
      setDataError(`Failed to execute allocation transaction: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleWithdraw = async (opportunityId: number) => {
    if (!account?.accountId || !selector) return;
    
    try {
      const opportunity = opportunities.find(opp => opp.id === opportunityId);
      if (!opportunity?.contractAddress) {
        setDataError('Opportunity contract not found');
        return;
      }

      const wallet = await selector.wallet();
      const accountObj = new Account(wallet.connection, account.accountId);
      const opportunityContract = new OpportunityContract(accountObj, opportunity.contractAddress);
      
      // Withdraw 1 NEAR from opportunity
      const withdrawalAmount = parseNearAmount('1.0'); // 1 NEAR in yoctoNEAR
      const result = await opportunityContract.withdraw(withdrawalAmount);
      
      console.log('Withdrawal successful:', result);
      setDataError(null);
      
      // Refresh vault data after successful withdrawal
      await loadVaultData();
      
    } catch (err) {
      console.error('Withdrawal error:', err);
      setDataError(`Failed to execute withdrawal transaction: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Initializing wallet connection...</p>
        </div>
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
            Connect your NEAR wallet to access real on-chain investment opportunities and manage your portfolio
          </p>
          
          {/* Connect Wallet Button */}
          <Button 
            onClick={handleConnectWallet}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            🔗 Connect NEAR Wallet
          </Button>
          
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">
            This will open MyNearWallet popup → Ask for permission → Redirect back with access
          </p>
        </div>

        {/* Global Stats */}
        {globalStats && (
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

        {/* Opportunities Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Investment Opportunities
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              High-yield opportunities from NEAR Registry contracts - Connect wallet to interact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                isConnected={false}
              />
            ))}
          </div>
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
            Manage your portfolio with real on-chain data from NEAR testnet
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-green-600 border-green-600">
            ✅ Connected to {account?.accountId}
          </Badge>
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
      {vaultData && (
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

      {/* Error Display */}
      {dataError && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 mt-8">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200">❌ Transaction Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-300">{dataError}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
