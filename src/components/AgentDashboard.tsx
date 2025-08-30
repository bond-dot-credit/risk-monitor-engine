'use client';
 
import { useState, useEffect } from 'react';
import { AgentCard } from './AgentCard';
import { StatsOverview } from './StatsOverview';
import { CredibilityTier } from '@/types/agent';

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
  const [visibleCount, setVisibleCount] = useState(12); // Lazy loading

  // Categories and tiers for filters
  const categories = ['all', 'trading', 'defi', 'analytics', 'social', 'gaming'];
  const tiers = ['all', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, selectedTier, searchQuery, sortBy, sortOrder]);

  // Get visible agents based on current filters and visible count
  const getVisibleAgents = () => {
    return sortedAgents.slice(0, visibleCount);
  };

  const loadMoreAgents = () => {
    setVisibleCount(prev => prev + 12);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedTier('all');
    setSearchQuery('');
    setSortBy('name');
    setSortOrder('asc');
  };

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
          'BRONZE': 1, 
          'SILVER': 2, 
          'GOLD': 3, 
          'PLATINUM': 4, 
          'DIAMOND': 5 
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

  const visibleAgents = getVisibleAgents();

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

      <section
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50"
        aria-label="Agent search and filtering controls"
      >
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100" id="filter-heading">
          Filter & Search Agents
        </h2>

        {/* Search Bar */}
        <div className="mb-6">
          <label htmlFor="agent-search" className="sr-only">
            Search agents by name, description, or tags
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="agent-search"
              type="text"
              placeholder="Search agents by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 pl-10 sm:pl-12 text-sm sm:text-base border border-slate-300 dark:border-slate-600 rounded-lg sm:rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              aria-describedby="search-help"
            />
          </div>
          <p id="search-help" className="sr-only">
            Search will filter agents by name, description, and tags in real-time
          </p>
        </div>

        {/* Filters and Sorting */}

        <fieldset className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <legend className="sr-only">Filter and sort agents</legend>

          <div className="flex flex-col">
            <label htmlFor="category-filter" className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">
              Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              aria-describedby="category-help"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <p id="category-help" className="sr-only">Filter agents by their category type</p>
          </div>

          <div className="flex flex-col">
            <label htmlFor="tier-filter" className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">
              Credibility Tier
            </label>
            <select
              id="tier-filter"
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              aria-describedby="tier-help"
            >
              {tiers.map(tier => (
                <option key={tier} value={tier}>
                  {tier === 'all' ? 'All Tiers' : tier}
                </option>
              ))}
            </select>
            <p id="tier-help" className="sr-only">Filter agents by their credibility tier level</p>
          </div>

          <div className="flex flex-col">
            <label htmlFor="sort-filter" className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">
              Sort By
            </label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              aria-describedby="sort-help"
            >
              <option value="name">Name</option>
              <option value="overall">Overall Score</option>
              <option value="tier">Credibility Tier</option>
            </select>
            <p id="sort-help" className="sr-only">Choose how to sort the agent list</p>
          </div>

          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">
              Sort Order
            </span>
            <button
              onClick={toggleSortOrder}
              className="px-2 py-1.5 sm:px-3 sm:py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2"
              aria-label={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}, click to toggle`}
              aria-describedby="order-help"
            >
              <span className="text-base sm:text-lg" aria-hidden="true">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              <span className="hidden sm:inline">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
              <span className="sm:hidden">{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
            </button>
            <p id="order-help" className="sr-only">Toggle between ascending and descending sort order</p>
          </div>
        </fieldset>

        {/* Quick Stats */}
        {filteredAgents.length > 0 && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-600">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <div className="text-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {filteredAgents.filter(a => a.credibilityTier === 'PLATINUM' || a.credibilityTier === 'DIAMOND').length}
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
      </section>

      {/* Agents Grid */}
      <section aria-label="Agent cards" role="region">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          role="grid"
          aria-label={`${visibleAgents.length} of ${sortedAgents.length} agents displayed`}
        >
          {visibleAgents.map((agent, index) => (
            <div
              key={agent.id}
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(index * 0.05, 1)}s` }}
              role="gridcell"
            >
              <AgentCard agent={agent} />
            </div>
          ))}
        </div>

         {/* Load More Button */}
        {visibleCount < sortedAgents.length && (
          <div className="text-center mt-8">
            <button
              onClick={loadMoreAgents}
              className="px-6 py-3 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
              aria-label={`Load ${Math.min(12, sortedAgents.length - visibleCount)} more agents`}
            >
              Load More ({sortedAgents.length - visibleCount} remaining)
            </button>
          </div>
        )}

        {/* No Results State */}
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
              onClick={clearFilters}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base"
              aria-label="Clear all filters and search"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}