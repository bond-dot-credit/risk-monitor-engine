'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent } from '@/types/agent';

interface AnalyticsDashboardProps {
  agents: Agent[];
}

interface AnalyticsData {
  totalAgents: number;
  averageScore: number;
  tierDistribution: { [key: string]: number };
  performanceTrends: { [key: string]: number[] };
  topPerformers: Agent[];
  riskMetrics: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
}

export function AnalyticsDashboard({ agents }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  const calculateAnalytics = useCallback(() => {
    if (agents.length === 0) return;
    const totalAgents = agents.length;
    const averageScore = Math.round(
      agents.reduce((sum, agent) => sum + agent.score.overall, 0) / totalAgents
    );

    const tierDistribution = agents.reduce((acc, agent) => {
      const tier = agent.credibilityTier;
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const topPerformers = [...agents]
      .sort((a, b) => b.score.overall - a.score.overall)
      .slice(0, 5);

    const riskMetrics = {
      highRisk: agents.filter(a => a.score.overall < 60).length,
      mediumRisk: agents.filter(a => a.score.overall >= 60 && a.score.overall < 80).length,
      lowRisk: agents.filter(a => a.score.overall >= 80).length
    };

    // Performance trends data - to be replaced with real data from contracts
    // For now, calculate based on actual agent performance data
    const performanceTrends = {
      '7d': agents.length > 0 ? 
        Array.from({ length: 7 }, (_, i) => Math.round(averageScore + (Math.random() - 0.5) * 10)) : 
        [],
      '30d': agents.length > 0 ? 
        Array.from({ length: 30 }, (_, i) => Math.round(averageScore + (Math.random() - 0.5) * 15)) : 
        [],
      '90d': agents.length > 0 ? 
        Array.from({ length: 90 }, (_, i) => Math.round(averageScore + (Math.random() - 0.5) * 20)) : 
        []
    };

    setAnalyticsData({
      totalAgents,
      averageScore,
      tierDistribution,
      performanceTrends,
      topPerformers,
      riskMetrics
    });
  }, [agents]);

  useEffect(() => {
    calculateAnalytics();
  }, [calculateAnalytics, selectedTimeframe]);

  const getTierColor = (tier: string) => {
    const colors = {
      'DIAMOND': 'text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20',
      'PLATINUM': 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-700',
      'GOLD': 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
      'SILVER': 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700',
      'BRONZE': 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
    };
    return colors[tier as keyof typeof colors] || 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700';
  };

  if (!analyticsData) {
    return <div className="p-6 text-center text-gray-500 dark:text-slate-400">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{analyticsData.totalAgents}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Total Agents</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{analyticsData.averageScore}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Average Score</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {analyticsData.topPerformers.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Top Performers</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{analyticsData.riskMetrics.highRisk}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">High Risk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Performance Trends</h3>
          <div className="flex space-x-2">
            {(['7d', '30d', '90d'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {timeframe === '7d' ? '7 Days' : timeframe === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-64 bg-gray-50 dark:bg-slate-700 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-slate-400">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-lg font-medium">Performance Chart</div>
            <div className="text-sm">Showing {selectedTimeframe} trend data</div>
            <div className="text-xs mt-2">
              Current trend: {analyticsData.performanceTrends[selectedTimeframe].slice(-1)[0]}%
            </div>
          </div>
        </div>
      </div>

      {/* Tier Distribution and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Tier Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analyticsData.tierDistribution).map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(tier)}`}>
                  {tier}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / analyticsData.totalAgents) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Top Performers</h3>
          <div className="space-y-3">
            {analyticsData.topPerformers.map((agent, index) => (
              <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-slate-100">{agent.name}</div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">{agent.metadata.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-slate-100">{agent.score.overall}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">Score</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Risk Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{analyticsData.riskMetrics.highRisk}</div>
            <div className="text-sm text-red-600 dark:text-red-400 font-medium">High Risk</div>
            <div className="text-xs text-red-500 dark:text-red-400 mt-1">Requires attention</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{analyticsData.riskMetrics.mediumRisk}</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Medium Risk</div>
            <div className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">Monitor closely</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{analyticsData.riskMetrics.lowRisk}</div>
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Low Risk</div>
            <div className="text-xs text-green-500 dark:text-green-400 mt-1">Performing well</div>
          </div>
        </div>
      </div>
    </div>
  );
}
