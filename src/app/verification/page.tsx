'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Agent, VerificationStatus } from '@/types/agent';
import { VerificationDashboard } from '@/components/VerificationDashboard';
import { Header } from '@/components/Header';

export default function VerificationPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success && data.data) {
        setAgents(data.data);
        if (data.data.length > 0 && !selectedAgentId) {
          setSelectedAgentId(data.data[0].id);
        }
      } else {
        throw new Error('Failed to fetch agents');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  }, [selectedAgentId]);

  // Move all hooks before any conditional returns
  // Filtered agents based on search and filter
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.metadata.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || agent.verification === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [agents, searchQuery, filterStatus]);

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  // Statistics
  const stats = useMemo(() => {
    const total = agents.length;
    const verified = agents.filter(a => a.verification === VerificationStatus.PASSED).length;
    const pending = agents.filter(a => a.verification === VerificationStatus.IN_PROGRESS).length;
    const failed = agents.filter(a => a.verification === VerificationStatus.FAILED).length;
    const successRate = total > 0 ? Math.round((verified / total) * 100) : 0;

    return { total, verified, pending, failed, successRate };
  }, [agents]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading verification data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Error Loading Data</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => fetchAgents()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <Header />

      {/* Modern Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-indigo-400/10">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center max-w-5xl mx-auto">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl mb-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:rotate-3">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 sm:mb-8 leading-tight tracking-tight">
              Verification
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mt-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Command Center
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-600 dark:text-slate-300 mb-10 sm:mb-12 leading-relaxed max-w-4xl mx-auto font-light">
              Enterprise-grade multi-factor verification and credibility scoring system for autonomous agents
            </p>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50 hover:scale-105 transition-all duration-300 group">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {stats.total}
                </div>
                <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">Total Agents</div>
              </div>

              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50 hover:scale-105 transition-all duration-300 group">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform">
                  {stats.verified}
                </div>
                <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">Verified</div>
              </div>

              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50 hover:scale-105 transition-all duration-300 group">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-yellow-600 dark:text-yellow-400 mb-2 group-hover:scale-110 transition-transform">
                  {stats.pending}
                </div>
                <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">Pending</div>
              </div>

              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50 hover:scale-105 transition-all duration-300 group">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                  {stats.successRate}%
                </div>
                <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20 -mt-8 relative z-10">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10">
          {/* Enhanced Agent Selection Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-indigo-400/20 p-6 sm:p-8 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">Agent Selection</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Choose an agent to verify</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Live</span>
                  </div>
                </div>

                {/* Enhanced Search Bar */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search agents by name or description..."
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'All', count: stats.total },
                    { key: VerificationStatus.PASSED, label: 'Verified', count: stats.verified },
                    { key: VerificationStatus.IN_PROGRESS, label: 'Pending', count: stats.pending },
                    { key: VerificationStatus.FAILED, label: 'Failed', count: stats.failed }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setFilterStatus(filter.key)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${filterStatus === filter.key
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent List */}
              <div className="p-6 sm:p-8">
                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {filteredAgents.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No agents found</h3>
                      <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filter criteria</p>
                    </div>
                  ) : (
                    filteredAgents.map((agent, index) => (
                      <button
                        key={agent.id}
                        onClick={() => setSelectedAgentId(agent.id)}
                        className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${selectedAgentId === agent.id
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-indigo-900/30 shadow-xl scale-[1.02]'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-700/50'
                          }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                              {agent.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {agent.metadata.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2 ml-4">
                            <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm uppercase tracking-wide ${agent.verification === VerificationStatus.PASSED ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                agent.verification === VerificationStatus.IN_PROGRESS ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  agent.verification === VerificationStatus.FAILED ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                              }`}>
                              {String(agent.verification).replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                {agent.credibilityTier}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Score: {agent.score.overall}
                              </span>
                            </div>
                          </div>
                          <svg className={`w-5 h-5 transition-all duration-300 ${selectedAgentId === agent.id ? 'rotate-90 text-blue-500 scale-110' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Main Content */}
          <div className="lg:col-span-7 xl:col-span-8">
            {selectedAgent ? (
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <VerificationDashboard agents={agents} selectedAgentId={selectedAgentId} />
              </div>
            ) : (
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-12 sm:p-16 lg:p-20 text-center min-h-[600px] flex flex-col items-center justify-center">
                {/* Animated Icon */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full shadow-xl">
                    <svg className="w-12 h-12 sm:w-14 sm:h-14 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-300 mb-4">
                  Ready for Verification
                </h3>
                <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-md leading-relaxed">
                  Select an agent from the sidebar to begin the verification process and view detailed analysis
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{filteredAgents.length}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Available</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{stats.verified}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Verified</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
