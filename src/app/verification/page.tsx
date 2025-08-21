'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent, VerificationStatus } from '@/types/agent';
import { VerificationDashboard } from '@/components/VerificationDashboard';
import { Header } from '@/components/Header';

export default function VerificationPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    setIsMounted(true);
    fetchAgents();
  }, [fetchAgents]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 xl:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-lg">
              <span className="text-white font-bold text-lg sm:text-xl lg:text-2xl">🔍</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 sm:mb-3 leading-tight">
              Agent Verification
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Multi-factor agent verification and credibility scoring system
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Agent Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-4 sm:p-5 lg:p-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-slate-900 dark:text-slate-100">Select Agent</h2>
              <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                      selectedAgentId === agent.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-700'
                    }`}
                  >
                    <div className="font-medium text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">{agent.name}</div>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate mt-1">{agent.metadata.description}</div>
                    <div className="flex items-center justify-between mt-2 sm:mt-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Tier: {agent.credibilityTier}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        agent.verification === VerificationStatus.PASSED ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          agent.verification === VerificationStatus.IN_PROGRESS ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          agent.verification === VerificationStatus.FAILED ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                          {String(agent.verification).replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Stats */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-4 sm:p-5 lg:p-6 mt-4 sm:mt-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-slate-900 dark:text-slate-100">Verification Overview</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Total Agents</span>
                  <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100">{agents.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Verified</span>
                  <span className="font-semibold text-sm sm:text-base text-green-600 dark:text-green-400">
                    {agents.filter(a => a.verification === VerificationStatus.PASSED).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">In Progress</span>
                  <span className="font-semibold text-sm sm:text-base text-yellow-600 dark:text-yellow-400">
                    {agents.filter(a => a.verification === VerificationStatus.IN_PROGRESS).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Failed</span>
                  <span className="font-semibold text-sm sm:text-base text-red-600 dark:text-red-400">
                    {agents.filter(a => a.verification === VerificationStatus.FAILED).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedAgent ? (
              <VerificationDashboard agents={agents} selectedAgentId={selectedAgentId} />
            ) : (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8 sm:p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                  <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Agent Selected</h3>
                <p className="text-slate-500 dark:text-slate-400">Select an agent from the sidebar to view verification details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
