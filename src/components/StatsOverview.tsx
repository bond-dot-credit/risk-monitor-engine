'use client';

import { Agent, CredibilityTier } from '@/types/agent';

interface StatsOverviewProps {
  agents: Agent[];
}

export function StatsOverview({ agents }: StatsOverviewProps) {
  const totalAgents = agents.length;
  const activeAgents = agents.filter(agent => agent.status === 'active').length;
  const averageScore = Math.round(
    agents.reduce((sum, agent) => sum + agent.score.overall, 0) / totalAgents
  );
  
  // Count agents by tier
  const tierCounts = agents.reduce((acc, agent) => {
    acc[agent.credibilityTier] = (acc[agent.credibilityTier] || 0) + 1;
    return acc;
  }, {} as Record<CredibilityTier, number>);

  // Calculate total credit available (mock calculation)
  const totalCreditAvailable = agents.reduce((sum, agent) => {
    const baseLTV = getBaseLTVForTier(agent.credibilityTier);
    return sum + (baseLTV * 1000); // Mock calculation
  }, 0);

  // Mock additional stats
  const totalValueLocked = 24567890;

  function getBaseLTVForTier(tier: CredibilityTier): number {
    switch (tier) {
      case CredibilityTier.DIAMOND: return 80;
      case CredibilityTier.PLATINUM: return 70;
      case CredibilityTier.GOLD: return 60;
      case CredibilityTier.SILVER: return 50;
      case CredibilityTier.BRONZE: return 40;
      default: return 30;
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Agents */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Agents</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalAgents}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 text-xl">🤖</span>
          </div>
        </div>
        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
          +{activeAgents} active
        </p>
      </div>

      {/* Average Score */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Avg Score</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{averageScore}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <span className="text-green-600 dark:text-green-400 text-xl">📊</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Network quality
        </p>
      </div>

      {/* Total Value Locked */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">TVL</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {formatNumber(totalValueLocked)}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 dark:text-purple-400 text-xl">💎</span>
          </div>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
          +12.5% this week
        </p>
      </div>

      {/* Credit Available */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Credit Available</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {formatNumber(totalCreditAvailable)}
            </p>
          </div>
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
            <span className="text-orange-600 dark:text-orange-400 text-xl">🏦</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Across all tiers
        </p>
      </div>

      {/* Tier Distribution */}
      <div className="col-span-full bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Credibility Tier Distribution
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {Object.values(CredibilityTier).map(tier => {
            const count = tierCounts[tier] || 0;
            const percentage = totalAgents > 0 ? (count / totalAgents) * 100 : 0;
            
            return (
              <div key={tier} className="text-center">
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full ${getTierColorClass(tier)}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                  {tier}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {count} agents
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getTierColorClass(tier: CredibilityTier): string {
  switch (tier) {
    case CredibilityTier.DIAMOND: return 'bg-cyan-400';
    case CredibilityTier.PLATINUM: return 'bg-slate-400';
    case CredibilityTier.GOLD: return 'bg-yellow-400';
    case CredibilityTier.SILVER: return 'bg-gray-400';
    case CredibilityTier.BRONZE: return 'bg-orange-400';
    default: return 'bg-slate-300';
  }
}
