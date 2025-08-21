'use client';

import { useState, useEffect } from 'react';
import { Agent, CredibilityTier } from '@/types/agent';
import { AgentCard } from './AgentCard';
import { StatsOverview } from './StatsOverview';

// Loading Skeleton Component
function AgentCardSkeleton() {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0 pr-2">
          <div className="h-4 sm:h-5 lg:h-6 bg-slate-200 dark:bg-slate-700 rounded mb-1 sm:mb-2 w-3/4"></div>
          <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="flex flex-col items-end space-y-1 flex-shrink-0">
          <div className="h-5 sm:h-6 w-12 sm:w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          <div className="h-5 sm:h-6 w-14 sm:w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
      </div>

      {/* Description Skeleton */}
      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
        <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
      </div>

      {/* Score Skeleton */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2 sm:p-3">
          <div className="h-4 sm:h-5 lg:h-6 bg-slate-200 dark:bg-slate-600 rounded w-8 sm:w-12 mb-1"></div>
          <div className="h-2 sm:h-3 bg-slate-200 dark:bg-slate-600 rounded w-12 sm:w-16"></div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2 sm:p-3">
          <div className="h-4 sm:h-5 lg:h-6 bg-slate-200 dark:bg-slate-600 rounded w-8 sm:w-12 mb-1"></div>
          <div className="h-2 sm:h-3 bg-slate-200 dark:bg-slate-600 rounded w-12 sm:w-16"></div>
        </div>
      </div>

      {/* Score Breakdown Skeleton */}
      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
        {[1, 2].map(i => (
          <div key={i}>
            <div className="flex justify-between items-center mb-1">
              <div className="h-2 sm:h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 sm:w-20"></div>
              <div className="h-2 sm:h-3 bg-slate-200 dark:bg-slate-700 rounded w-6 sm:w-8"></div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 sm:h-2"></div>
          </div>
        ))}
      </div>

      {/* Tags Skeleton */}
      <div className="border-t border-slate-200/70 dark:border-slate-600/70 pt-3 sm:pt-4">
        <div className="flex justify-between mb-2 sm:mb-3">
          <div className="h-2 sm:h-3 bg-slate-200 dark:bg-slate-700 rounded w-8 sm:w-12"></div>
          <div className="h-2 sm:h-3 bg-slate-200 dark:bg-slate-700 rounded w-12 sm:w-16"></div>
        </div>
        <div className="flex gap-1 sm:gap-1.5">
          <div className="h-5 sm:h-6 w-12 sm:w-16 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-5 sm:h-6 w-14 sm:w-20 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-5 sm:h-6 w-8 sm:w-12 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        </div>
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
  const [isMounted, setIsMounted] = useState(false);

  // Categories and tiers for filters
  const categories = ['all', 'trading', 'defi', 'analytics', 'social', 'gaming'];
  const tiers = ['all', CredibilityTier.BRONZE, CredibilityTier.SILVER, CredibilityTier.GOLD, CredibilityTier.PLATINUM, CredibilityTier.DIAMOND];

  useEffect(() => {
    setIsMounted(true);
    
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
    let aValue: any, bValue: unknown;
    
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
        const tierOrder = { 
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

  if (!isMounted) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Loading Skeleton for Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 sm:w-24 mb-2"></div>
                  <div className="h-6 sm:h-8 bg-slate-200 dark:bg-slate-700 rounded w-12 sm:w-16"></div>
                </div>
                <div className="p-2 sm:p-3 bg-slate-200 dark:bg-slate-700 rounded-lg sm:rounded-xl w-8 h-8 sm:w-12 sm:h-12"></div>
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 sm:w-32"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Skeleton for Filters */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 animate-pulse">
          <div className="h-5 sm:h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 sm:w-48 mb-4 sm:mb-6"></div>
          <div className="h-10 sm:h-12 bg-slate-200 dark:bg-slate-700 rounded-lg sm:rounded-xl w-full mb-4 sm:mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 sm:w-20 mb-1 sm:mb-2"></div>
                <div className="h-8 sm:h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-full"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Loading Skeleton for Agent Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <AgentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Loading Skeleton for Agent Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <AgentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-4 sm:mb-6">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-red-600 dark:text-red-400 mb-2 sm:mb-3">
          Error Loading Agents
        </h3>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed">
          {error}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base"
        >
          Try Again
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
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 pl-10 sm:pl-12 text-sm sm:text-base border border-slate-300 dark:border-slate-600 rounded-lg sm:rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex flex-col">
            <label className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">
              Tier
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {tiers.map(tier => (
                <option key={tier} value={tier}>
                  {tier === 'all' ? 'All Tiers' : tier}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="name">Name</option>
              <option value="overall">Score</option>
              <option value="tier">Tier</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">
              Order
            </label>
            <button
              onClick={toggleSortOrder}
              className="px-2 py-1.5 sm:px-3 sm:py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2"
            >
              <span className="text-base sm:text-lg">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              <span className="hidden sm:inline">Sort</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {filteredAgents.length > 0 && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-600">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <div className="text-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {filteredAgents.filter(a => a.credibilityTier === CredibilityTier.PLATINUM || a.credibilityTier === CredibilityTier.DIAMOND).length}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Premium</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                  {filteredAgents.filter(a => a.status === 'ACTIVE').length}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Active</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {filteredAgents.length > 0 ? Math.round(filteredAgents.reduce((sum, a) => sum + a.score.overall, 0) / filteredAgents.length) : 0}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Avg Score</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {filteredAgents.filter(a => a.metadata.category.toLowerCase() === 'trading').length}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Trading</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {sortedAgents.map((agent, index) => (
          <div key={agent.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <AgentCard agent={agent} />
          </div>
        ))}
      </div>

      {sortedAgents.length === 0 && (
        <div className="text-center py-8 sm:py-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">
            No Agents Found
          </h3>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-2 sm:mb-3 max-w-md mx-auto leading-relaxed">
            {searchQuery ? (
              <>No agents found matching <span className="font-medium text-slate-700 dark:text-slate-300">"{searchQuery}"</span></>
            ) : (
              'No agents found matching the selected filters.'
            )}
          </p>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mb-4 sm:mb-6">
            Try adjusting your search criteria or filters.
          </p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedTier('all');
            }}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}