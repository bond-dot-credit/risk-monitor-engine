'use client';

import { useState, useEffect } from 'react';
import { Agent, CredibilityTier } from '@/types/agent';
import { AgentCard } from './AgentCard';
import { StatsOverview } from './StatsOverview';



export function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching agents...');
      const response = await fetch('/api/agents');
      const data = await response.json();
      console.log('Agents API response:', data);
      if (data.success) {
        setAgents(data.data);
        console.log('Agents set:', data.data);
      } else {
        console.error('API returned success: false:', data.error);
        setError(data.error || 'Failed to fetch agents');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Failed to fetch agents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('AgentDashboard mounted');
    setIsMounted(true);
    fetchAgents();
  }, []);

  console.log('AgentDashboard render - agents:', agents.length, 'isLoading:', isLoading, 'isMounted:', isMounted);

  const filteredAgents = agents.filter(agent => {
    const categoryMatch = selectedCategory === 'all' || agent.metadata.category.toLowerCase() === selectedCategory;
    const tierMatch = selectedTier === 'all' || agent.credibilityTier === selectedTier;
    console.log(`Agent ${agent.name}: categoryMatch=${categoryMatch}, tierMatch=${tierMatch}`);
    return categoryMatch && tierMatch;
  });

  console.log('Filtered agents:', filteredAgents);

  const categories = ['all', ...new Set(agents.map(agent => agent.metadata.category.toLowerCase()))];
  const tiers = ['all', ...Object.values(CredibilityTier)];

  if (!isMounted || isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={fetchAgents}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <StatsOverview agents={agents} />

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Filter Agents</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Credibility Tier
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              {tiers.map(tier => (
                <option key={tier} value={tier}>
                  {tier === 'all' ? 'All Tiers' : tier.charAt(0).toUpperCase() + tier.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            No agents found matching the selected filters.
          </p>
        </div>
      )}
    </div>
  );
}
