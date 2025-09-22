import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { globalStatsService, GlobalStats, CategoryStats } from '@/services/global-stats-service';

interface GlobalStatsDashboardProps {
  className?: string;
}

export const GlobalStatsDashboard: React.FC<GlobalStatsDashboardProps> = ({
  className = ''
}) => {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize with mock data if no stats exist
    if (!globalStatsService.getStats()) {
      globalStatsService.initializeWithMockData();
    }

    setStats(globalStatsService.getStats());
    setCategoryStats(globalStatsService.getCategoryStats());
    setIsLoading(false);

    // Update stats periodically
    const interval = setInterval(() => {
      const mockStats = globalStatsService.generateMockStats();
      globalStatsService.updateStats(mockStats);
      setStats(globalStatsService.getStats());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number, decimals: number = 0) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(decimals)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(decimals)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(decimals)}K`;
    }
    return num.toFixed(decimals);
  };

  const formatCurrency = (amount: number) => {
    return `$${formatNumber(amount, 1)}`;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600 dark:text-green-400';
    if (growth < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '📈';
    if (growth < 0) return '📉';
    return '➡️';
  };

  const getRiskLevelBadge = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low':
        return <StatusBadge status="success" text="🛡️ Low Risk" />;
      case 'medium':
        return <StatusBadge status="warning" text="⚠️ Medium Risk" />;
      case 'high':
        return <StatusBadge status="error" text="🚨 High Risk" />;
    }
  };

  if (isLoading || !stats) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading global statistics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const insights = globalStatsService.getPerformanceInsights();
  const riskDistribution = globalStatsService.getRiskDistribution();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌍 Global Platform Statistics
            <StatusBadge status="success" text="Live" />
          </CardTitle>
          <CardDescription>
            Real-time platform metrics and performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* TVL */}
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(stats.totalValueLocked)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Value Locked</div>
              <div className={`text-xs mt-1 ${getGrowthColor(stats.weeklyGrowth)}`}>
                {getGrowthIcon(stats.weeklyGrowth)} {stats.weeklyGrowth.toFixed(1)}% (7d)
              </div>
            </div>

            {/* Users */}
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatNumber(stats.totalUsers)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
              <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                +{stats.newUsersToday} today
              </div>
            </div>

            {/* Active Vaults */}
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.activeVaults}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Vaults</div>
              <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                +{stats.newVaultsToday} today
              </div>
            </div>

            {/* Average APY */}
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.averageApy.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average APY</div>
              <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                {stats.topPerformingOpportunity}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance & Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Score</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {stats.averageScore.toFixed(1)}/100
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {stats.successRate.toFixed(1)}%
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Daily Volume</span>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {formatCurrency(stats.dailyVolume)}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</span>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {formatNumber(stats.totalTransactions)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🛡️ Risk Assessment
              {getRiskLevelBadge(insights.riskLevel)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">High Risk</span>
              <Badge variant="destructive">
                {riskDistribution.high}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Medium Risk</span>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {riskDistribution.medium}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Low Risk</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {riskDistribution.low}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Incidents</span>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {stats.totalIncidents}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 Category Performance
          </CardTitle>
          <CardDescription>
            Performance breakdown by investment category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryStats.map((category) => (
              <div key={category.category} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold capitalize">{category.category}</h4>
                  <Badge variant="outline">
                    {category.opportunities} opportunities
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">TVL</span>
                    <span className="font-medium">{formatCurrency(category.tvl)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Users</span>
                    <span className="font-medium">{formatNumber(category.users)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">APY</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {category.averageApy.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Score</span>
                    <span className="font-medium">{category.averageScore.toFixed(1)}/100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌐 Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.averageBlockTime.toFixed(2)}s
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Block Time</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.networkCongestion.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Congestion</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(stats.gasPrice / 1000000000000000000, 2)} NEAR
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Gas Price</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.activeValidators}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Validators</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
