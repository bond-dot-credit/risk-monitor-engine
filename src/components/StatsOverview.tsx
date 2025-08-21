'use client';

import { Agent, CredibilityTier } from '@/types/agent';

interface StatsOverviewProps {
  agents: Agent[];
}

export function StatsOverview({ agents }: StatsOverviewProps) {
  const totalAgents = agents.length;
  const activeAgents = agents.filter(agent => 
    agent.status.toLowerCase() === 'active' || agent.status === 'ACTIVE'
  ).length;
  
  const tierBreakdown = Object.values(CredibilityTier).reduce((acc, tier) => {
    acc[tier] = agents.filter(agent => agent.credibilityTier === tier).length;
    return acc;
  }, {} as Record<CredibilityTier, number>);

  const totalCreditAvailable = agents.reduce((sum, agent) => {
    const baseLTV = getBaseLTVForTier(agent.credibilityTier);
    return sum + (baseLTV * 1000);
  }, 0);

  const avgScore = agents.length > 0 
    ? Math.round(agents.reduce((sum, agent) => sum + agent.score.overall, 0) / agents.length)
    : 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Agents</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalAgents}</p>
          </div>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
            <span className="text-green-500 font-medium">{activeAgents}</span>
            <span className="mx-1">active</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-400">{totalAgents - activeAgents} inactive</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Avg Score</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{avgScore}</p>
          </div>
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
            <span className="text-green-500 font-medium">{tierBreakdown[CredibilityTier.PLATINUM] + tierBreakdown[CredibilityTier.DIAMOND]}</span>
            <span className="mx-1">premium</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-400">{tierBreakdown[CredibilityTier.GOLD]} gold</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Credit Available</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatNumber(totalCreditAvailable)}
            </p>
          </div>
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
            <span className="text-green-500 font-medium">{tierBreakdown[CredibilityTier.SILVER] + tierBreakdown[CredibilityTier.BRONZE]}</span>
            <span className="mx-1">basic tier</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-400">limited access</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Risk Level</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">Low</p>
          </div>
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
            <span className="text-green-500 font-medium">85%</span>
            <span className="mx-1">healthy</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-400">15% risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
