'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent } from '@/types/agent';
import { CreditVault, VaultStatus } from '@/types/credit';
import { CreditVaultManager } from '@/components/CreditVaultManager';
import { Header } from '@/components/Header';

export default function CreditVaultsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [vaults, setVaults] = useState<CreditVault[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [showCreateVault, setShowCreateVault] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VaultStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'creditLimit' | 'healthFactor' | 'utilization' | 'created'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success && data.data) {
        setAgents(data.data);
        if (data.data.length > 0 && !selectedAgentId) {
          setSelectedAgentId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  }, [selectedAgentId]);

  const fetchVaults = useCallback(async () => {
    try {
      const response = await fetch('/api/credit');
      const data = await response.json();
      if (data.success && data.data) {
        setVaults(data.data);
      }
    } catch (error) {
      console.error('Error fetching vaults:', error);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchAgents();
    fetchVaults();
  }, [fetchAgents, fetchVaults]);

  const handleVaultCreated = () => {
    fetchVaults();
    setShowCreateVault(false);
  };

  // Filter and sort vaults
  const filteredVaults = vaults.filter(vault => {
    const matchesSearch = searchQuery === '' || 
      vault.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agents.find(a => a.id === vault.agentId)?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vault.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedVaults = [...filteredVaults].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'creditLimit':
        aValue = a.creditLimit;
        bValue = b.creditLimit;
        break;
      case 'healthFactor':
        aValue = a.riskMetrics.healthFactor;
        bValue = b.riskMetrics.healthFactor;
        break;
      case 'utilization':
        aValue = a.utilization;
        bValue = b.utilization;
        break;
      case 'created':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status: VaultStatus) => {
    switch (status) {
      case VaultStatus.ACTIVE: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case VaultStatus.PAUSED: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case VaultStatus.LIQUIDATING: return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case VaultStatus.CLOSED: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case VaultStatus.UNDER_REVIEW: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getHealthFactorColor = (healthFactor: number) => {
    if (healthFactor >= 1.5) return 'text-green-600 dark:text-green-400';
    if (healthFactor >= 1.2) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-96 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[1, 2, 3, 4].map(j => (
                            <div key={j}>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Credit Vaults
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Dynamic LTV credit lines and collateral management for AI agents
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Exposure</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${vaults.reduce((sum, v) => sum + v.creditLimit, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Vaults</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vaults.filter(v => v.status === VaultStatus.ACTIVE).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Health Factor</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vaults.length > 0 ? (vaults.reduce((sum, v) => sum + v.riskMetrics.healthFactor, 0) / vaults.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Risk Vaults</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vaults.filter(v => v.riskMetrics.healthFactor < 1.3).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search vaults by ID or agent name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as VaultStatus | 'all')}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value={VaultStatus.ACTIVE}>Active</option>
                <option value={VaultStatus.PAUSED}>Paused</option>
                <option value={VaultStatus.LIQUIDATING}>Liquidating</option>
                <option value={VaultStatus.CLOSED}>Closed</option>
                <option value={VaultStatus.UNDER_REVIEW}>Under Review</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="created">Sort by Created</option>
                <option value="creditLimit">Credit Limit</option>
                <option value="healthFactor">Health Factor</option>
                <option value="utilization">Utilization</option>
              </select>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 flex items-center space-x-2"
            >
              <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
              <span className="hidden sm:inline">Sort</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-600">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Vaults ({sortedVaults.length})
                  </h2>
                  <button
                    onClick={() => setShowCreateVault(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Vault</span>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {sortedVaults.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {searchQuery || statusFilter !== 'all' ? 'No matching vaults found' : 'No credit vaults yet'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {searchQuery || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Create your first vault to start managing credit lines for AI agents.'
                      }
                    </p>
                    {(!searchQuery && statusFilter === 'all') && (
                      <button
                        onClick={() => setShowCreateVault(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Create Your First Vault
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedVaults.map((vault, index) => (
                      <div 
                        key={vault.id} 
                        className="border border-slate-200 dark:border-slate-600 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500 group animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                Vault #{vault.id.slice(-6)}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vault.status)}`}>
                                {vault.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                              Agent: <span className="font-medium">{agents.find(a => a.id === vault.agentId)?.name || 'Unknown'}</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Created: {new Date(vault.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Credit Limit</div>
                            <div className="font-semibold text-gray-900 dark:text-white">${vault.creditLimit.toLocaleString()}</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current LTV</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{vault.currentLTV}%</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Max LTV</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{vault.maxLTV}%</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Utilization</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{vault.utilization}%</div>
                          </div>
                        </div>

                        {/* Health Factor */}
                        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Health Factor</span>
                            <span className={`font-bold text-lg ${getHealthFactorColor(vault.riskMetrics.healthFactor)}`}>
                              {vault.riskMetrics.healthFactor === Infinity ? '∞' : vault.riskMetrics.healthFactor.toFixed(2)}
                            </span>
                          </div>
                          
                          {vault.riskMetrics.healthFactor !== Infinity && (
                            <div className="relative">
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                                <div 
                                  className={`h-3 rounded-full transition-all duration-500 ${
                                    vault.riskMetrics.healthFactor >= 1.5 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                    vault.riskMetrics.healthFactor >= 1.2 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                                    'bg-gradient-to-r from-red-400 to-red-500'
                                  }`}
                                  style={{ width: `${Math.min(100, (vault.riskMetrics.healthFactor / 2) * 100)}%` }}
                                />
                              </div>
                              
                              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                <span>Critical (1.1)</span>
                                <span>Warning (1.5)</span>
                                <span>Safe (2.0+)</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => setShowCreateVault(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create New Vault</span>
                </button>
                
                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>Request Credit Line</span>
                </button>
                
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Manage Collateral</span>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Exposure</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    ${vaults.reduce((sum, v) => sum + v.creditLimit, 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Active Vaults</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {vaults.filter(v => v.status === VaultStatus.ACTIVE).length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Avg Health Factor</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {vaults.length > 0 ? (vaults.reduce((sum, v) => sum + v.riskMetrics.healthFactor, 0) / vaults.length).toFixed(2) : '0.00'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">High Risk Vaults</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {vaults.filter(v => v.riskMetrics.healthFactor < 1.3).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vault Creation Modal */}
      {showCreateVault && (
        <CreditVaultManager
          agents={agents}
          onVaultCreated={handleVaultCreated}
          onClose={() => setShowCreateVault(false)}
        />
      )}
    </div>
  );
}
