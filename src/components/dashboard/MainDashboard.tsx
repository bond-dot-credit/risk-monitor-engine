'use client';

import React, { useState, useEffect } from 'react';
import { useNearWallet } from '@/hooks/useNearWallet';
import { NearLoginButton } from '@/components/NearLoginButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OpportunityCard } from '@/components/OpportunityCard';
import VaultDashboard from '@/components/VaultDashboard';

// Mock data for opportunities - in real implementation this would come from NEAR Registry contract
const mockOpportunities = [
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
    riskLevel: 'LOW'
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
    riskLevel: 'MEDIUM'
  },
  {
    id: 3,
    name: 'Cross-Chain Bridge Vault',
    description: 'Multi-chain yield farming with bridge rewards and cross-chain arbitrage opportunities.',
    apy: 15.2,
    trustScore: 78,
    performance: 30,
    reliability: 28,
    safety: 20,
    totalScore: 78,
    riskLevel: 'MEDIUM'
  },
  {
    id: 4,
    name: 'DeFi Index Fund',
    description: 'Diversified portfolio of top-performing DeFi protocols with automated rebalancing.',
    apy: 14.8,
    trustScore: 88,
    performance: 35,
    reliability: 33,
    safety: 20,
    totalScore: 88,
    riskLevel: 'LOW'
  }
];

// Mock global stats
const mockGlobalStats = {
  tvl: 2847592.45,
  users: 1247,
  activeVaults: 156,
  totalYield: 89234.67
};

export const MainDashboard: React.FC = () => {
  const { account, isConnected } = useNearWallet();
  const [globalStats, setGlobalStats] = useState(mockGlobalStats);
  const [opportunities, setOpportunities] = useState(mockOpportunities);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<number | null>(null);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch global stats
        const statsResponse = await fetch('/api/global-stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setGlobalStats(statsData.data);
          }
        }

        // Fetch opportunities
        const opportunitiesResponse = await fetch('/api/opportunities');
        if (opportunitiesResponse.ok) {
          const opportunitiesData = await opportunitiesResponse.json();
          if (opportunitiesData.success) {
            setOpportunities(opportunitiesData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep using mock data as fallback
      }
    };

    fetchData();
  }, []);

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

  // Handle opportunity actions
  const handleDeposit = (opportunityId: number) => {
    setSelectedOpportunity(opportunityId);
    setShowDepositModal(true);
  };

  const handleAllocate = async (opportunityId: number) => {
    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'allocate',
          opportunityId,
          accountId: account?.accountId
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('Allocation successful:', result);
        // TODO: Show success notification
      } else {
        console.error('Allocation failed:', result.error);
        // TODO: Show error notification
      }
    } catch (error) {
      console.error('Error allocating to opportunity:', error);
      // TODO: Show error notification
    }
  };

  const handleWithdraw = async (opportunityId: number) => {
    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'withdraw',
          opportunityId,
          accountId: account?.accountId
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('Withdrawal successful:', result);
        // TODO: Show success notification
      } else {
        console.error('Withdrawal failed:', result.error);
        // TODO: Show error notification
      }
    } catch (error) {
      console.error('Error withdrawing from opportunity:', error);
      // TODO: Show error notification
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Bond.Credit
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover high-yield opportunities and manage your crypto portfolio with institutional-grade risk management
          </p>
        </div>

        {/* Connect Wallet Section */}
        <div className="text-center mb-12">
          <NearLoginButton className="mx-auto" />
        </div>

        {/* Global Stats */}
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
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Yield Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(globalStats.totalYield)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opportunities Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Investment Opportunities
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Discover curated yield farming opportunities from the NEAR Registry with institutional-grade risk assessment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                isConnected={false}
              />
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8">
            Why Choose Bond.Credit?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl">
              <div className="text-4xl mb-4">🛡️</div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Risk Management
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Advanced risk assessment and automated protection mechanisms
              </p>
            </div>
            <div className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl">
              <div className="text-4xl mb-4">📈</div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                High Yield
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Access to the best yield farming opportunities across DeFi
              </p>
            </div>
            <div className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl">
              <div className="text-4xl mb-4">🔗</div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                NEAR Native
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Built on NEAR Protocol with seamless wallet integration
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in user view
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back, {account?.accountId}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your portfolio and discover new opportunities
          </p>
        </div>
        <NearLoginButton />
      </div>

      {/* My Vault Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          My Vault
        </h2>
        <VaultDashboard />
      </div>

      {/* Interactive Opportunities */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Investment Opportunities
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Allocate funds to high-yield opportunities with one click
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Transaction History
        </h2>
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent deposits, withdrawals, and allocations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock transaction history */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400">📥</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Deposit</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">NEAR Staking Pool</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 dark:text-green-400">+1,000 NEAR</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400">🔄</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Allocation</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Liquidity Mining Farm</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600 dark:text-blue-400">500 USDC</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">1 day ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 dark:text-yellow-400">📤</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Withdrawal</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">DeFi Index Fund</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-600 dark:text-yellow-400">-250 USDT</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
