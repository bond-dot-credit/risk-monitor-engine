'use client';

import { useState, useEffect } from 'react';
import { AgentCard } from './AgentCard';
import { StatsOverview } from './StatsOverview';

interface Agent {
  id: string;
  name: string;
  metadata: {
    category: string;
    description: string;
    version: string;
    tags: string[];
  };
  score: {
    overall: number;
    provenance: number;
    performance: number;
    perception: number;
  };
  credibilityTier: string;
  status: string;
}

enum CredibilityTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND'
}

const categories = ['all', 'trading', 'defi', 'analytics', 'security', 'governance'];
const tiers = ['all', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];

// Loading Skeleton Component
function AgentCardSkeleton() {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
      </div>

      {/* Description Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
      </div>

      {/* Score Skeleton */}
      <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-24"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-600 rounded w-12"></div>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2"></div>
      </div>

      {/* Score Breakdown Skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="text-center">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-8 mx-auto mb-1"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto"></div>
          </div>
        ))}
      </div>

      {/* Tags Skeleton */}
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="h-6 w-14 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
    </div>
  );
}

export function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/agents');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          setAgents(result.data);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch agents');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(agent => {
    const categoryMatch = selectedCategory === 'all' || agent.metadata.category.toLowerCase() === selectedCategory;
    const tierMatch = selectedTier === 'all' || agent.credibilityTier === selectedTier;
    const searchMatch = searchQuery === '' || 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.metadata.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && tierMatch && searchMatch;
  });

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'overall':
        aValue = a.score.overall;
        bValue = b.score.overall;
        break;
      case 'tier':
        const tierOrder: Record<string, number> = { 
          [CredibilityTier.BRONZE]: 1, 
          [CredibilityTier.SILVER]: 2, 
          [CredibilityTier.GOLD]: 3, 
          [CredibilityTier.PLATINUM]: 4, 
          [CredibilityTier.DIAMOND]: 5 
        };
        aValue = tierOrder[a.credibilityTier] || 0;
        bValue = tierOrder[b.credibilityTier] || 0;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading Skeleton */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6"></div>
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2"></div>
                <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Skeleton for Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <AgentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-red-500 text-lg mb-4">Error loading agents: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

      {/* Search and Filters */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Filter & Search Agents</h2>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search agents by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
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
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {tiers.map(tier => (
                <option key={tier} value={tier}>
                  {tier === 'all' ? 'All Tiers' : tier}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="name">Name</option>
              <option value="overall">Overall Score</option>
              <option value="tier">Credibility Tier</option>
            </select>
          </div>

          <button
            onClick={toggleSortOrder}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 flex items-center space-x-2"
          >
            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
            <span>Sort Order</span>
          </button>
        </div>

        {/* Quick Stats */}
        {filteredAgents.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {filteredAgents.filter(a => a.credibilityTier === CredibilityTier.PLATINUM || a.credibilityTier === CredibilityTier.DIAMOND).length}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Premium</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {filteredAgents.filter(a => a.status === 'ACTIVE').length}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Active</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {filteredAgents.length > 0 ? Math.round(filteredAgents.reduce((sum, a) => sum + a.score.overall, 0) / filteredAgents.length) : 0}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Avg Score</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {filteredAgents.filter(a => a.metadata.category === 'trading').length}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Trading</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedAgents.map((agent, index) => (
          <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <AgentCard agent={agent} />
          </div>
        ))}
      </div>

      {sortedAgents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {searchQuery ? `No agents found matching "${searchQuery}"` : 'No agents found matching the selected filters.'}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  );
}