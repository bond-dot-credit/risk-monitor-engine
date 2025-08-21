'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
// Agent interface defined locally since we don't have a types file
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
    verification?: number;
  };
  credibilityTier: string;
  status: string;
}
import { Header } from '@/components/Header';

interface PerformanceMetric {
  agentId: string;
  timestamp: Date;
  apr: number;
  ltv: number;
  aum: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  healthFactor: number;
  utilization: number;
}

interface PerformanceAlert {
  id: string;
  agentId: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export default function PerformancePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);

  // Move all hooks before any conditional returns
  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  const performanceStats = useMemo(() => {
    const total = agents.length;
    const high = agents.filter(a => a.score.performance >= 90).length;
    const good = agents.filter(a => a.score.performance >= 80 && a.score.performance < 90).length;
    const average = agents.filter(a => a.score.performance >= 70 && a.score.performance < 80).length;
    const low = agents.filter(a => a.score.performance < 70).length;
    const avgPerformance = total > 0 ? Math.round(agents.reduce((sum, a) => sum + a.score.performance, 0) / total) : 0;
    
    return { total, high, good, average, low, avgPerformance };
  }, [agents]);

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

  const generatePerformanceMetrics = useCallback(() => {
    if (!selectedAgent) return;

    const metrics: PerformanceMetric[] = [];
    const baseMetrics = {
      apr: 8 + (selectedAgent.score.performance / 100) * 12,
      ltv: 50 + (selectedAgent.score.overall / 100) * 30,
      aum: 100000 + (selectedAgent.score.performance / 100) * 900000,
      volatility: 20 - (selectedAgent.score.overall / 100) * 15,
      sharpeRatio: (selectedAgent.score.performance / 100) * 2 + 0.5,
      maxDrawdown: 30 - (selectedAgent.score.overall / 100) * 20,
      healthFactor: 1.5 + (selectedAgent.score.overall / 100) * 0.5,
      utilization: 40 + (selectedAgent.score.overall / 100) * 40
    };

    // Generate 24 hours of hourly data
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - i);
      
      const variation = (Math.random() - 0.5) * 0.1;
      
      metrics.push({
        agentId: selectedAgent.id,
        timestamp,
        apr: Math.round((baseMetrics.apr * (1 + variation)) * 100) / 100,
        ltv: Math.round((baseMetrics.ltv * (1 + variation)) * 100) / 100,
        aum: Math.round(baseMetrics.aum * (1 + variation)),
        volatility: Math.round((baseMetrics.volatility * (1 + variation)) * 100) / 100,
        sharpeRatio: Math.round((baseMetrics.sharpeRatio * (1 + variation)) * 100) / 100,
        maxDrawdown: Math.round((baseMetrics.maxDrawdown * (1 + variation)) * 100) / 100,
        healthFactor: Math.round((baseMetrics.healthFactor * (1 + variation)) * 100) / 100,
        utilization: Math.round((baseMetrics.utilization * (1 + variation)) * 100) / 100
      });
    }

    setPerformanceMetrics(metrics);
  }, [selectedAgent]);

  const generateAlerts = useCallback(() => {
    if (!selectedAgent) return;

    const newAlerts: PerformanceAlert[] = [];
    
    if (selectedAgent.score.performance < 70) {
      newAlerts.push({
        id: `alert_${Date.now()}_1`,
        agentId: selectedAgent.id,
        type: 'warning',
        message: `Performance score below threshold: ${selectedAgent.score.performance}`,
        timestamp: new Date(),
        resolved: false
      });
    }

    if (selectedAgent.score.overall < 60) {
      newAlerts.push({
        id: `alert_${Date.now()}_2`,
        agentId: selectedAgent.id,
        type: 'critical',
        message: `Overall score critically low: ${selectedAgent.score.overall}`,
        timestamp: new Date(),
        resolved: false
      });
    }

    setAlerts(prev => [...newAlerts, ...prev]);
  }, [selectedAgent]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (selectedAgent) {
      generatePerformanceMetrics();
      generateAlerts();
    }
  }, [selectedAgent, generatePerformanceMetrics, generateAlerts]);

  useEffect(() => {
    if (isMonitoring && selectedAgent) {
      const interval = setInterval(() => {
        generatePerformanceMetrics();
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring, selectedAgent, refreshInterval, generatePerformanceMetrics]);

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800 mx-auto"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl px-8 py-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Loading Performance Data</h3>
              <p className="text-slate-600 dark:text-slate-400">Fetching agent metrics and monitoring data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-6 shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">Connection Error</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">{error}</p>
              <button
                onClick={() => fetchAgents()}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentMetrics = performanceMetrics[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <Header />
      
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-indigo-400/10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl mb-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight tracking-tight">
              Performance
              <span className="block text-3xl sm:text-4xl md:text-5xl mt-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Monitoring
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-3xl mx-auto font-light">
              Real-time monitoring of agent performance metrics, alerts, and comprehensive analytics
            </p>
            
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50 hover:scale-105 transition-all duration-300 group">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {performanceStats.total}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Agents</div>
              </div>
              
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50 hover:scale-105 transition-all duration-300 group">
                <div className="text-2xl sm:text-3xl font-black text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform">
                  {performanceStats.high}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">High Performance</div>
              </div>
              
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50 hover:scale-105 transition-all duration-300 group">
                <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                  {performanceStats.avgPerformance}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Avg Performance</div>
              </div>
              
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50 hover:scale-105 transition-all duration-300 group">
                <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform">
                  {alerts.filter(a => !a.resolved).length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Active Alerts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Enhanced Agent Selection Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-indigo-400/20 p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">Agent Selection</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Choose an agent to monitor</p>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {agents.map((agent, index) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group ${
                        selectedAgentId === agent.id
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-indigo-900/30 shadow-lg scale-[1.02]'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-700/50'
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                            {agent.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {agent.metadata.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${
                            agent.score.performance >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            agent.score.performance >= 80 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            agent.score.performance >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            agent.score.performance >= 60 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {agent.score.performance}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {agent.credibilityTier}
                          </span>
                        </div>
                        <svg className={`w-5 h-5 transition-all duration-300 ${selectedAgentId === agent.id ? 'rotate-90 text-blue-500 scale-110' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Overview Card */}
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden mt-6">
              <div className="bg-gradient-to-r from-green-600/10 via-blue-600/10 to-purple-600/10 dark:from-green-400/20 dark:via-blue-400/20 dark:to-purple-400/20 p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-2">Performance Overview</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">High Performance (90+)</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{performanceStats.high}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Good Performance (80-89)</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{performanceStats.good}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Average Performance (70-79)</span>
                  <span className="font-bold text-yellow-600 dark:text-yellow-400">{performanceStats.average}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Low Performance (&lt;70)</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{performanceStats.low}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Main Content */}
          <div className="lg:col-span-8 xl:col-span-9">
            {selectedAgent ? (
              <div className="space-y-6">
                
                {/* Monitoring Controls */}
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-indigo-400/20 p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">Performance Monitoring</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Real-time metrics for {selectedAgent.name}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Refresh:</span>
                          <select
                            value={refreshInterval}
                            onChange={(e) => setRefreshInterval(Number(e.target.value))}
                            className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value={10}>10s</option>
                            <option value={30}>30s</option>
                            <option value={60}>1m</option>
                            <option value={300}>5m</option>
                          </select>
                        </div>
                        <button
                          onClick={() => setIsMonitoring(!isMonitoring)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${
                            isMonitoring
                              ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white'
                              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                          }`}
                        >
                          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      {isMonitoring ? (
                        <span className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                          Live monitoring active - Refreshing every {refreshInterval} seconds
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 text-sm">Monitoring paused</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Current Metrics */}
                {currentMetrics && (
                  <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600/10 via-blue-600/10 to-purple-600/10 dark:from-green-400/20 dark:via-blue-400/20 dark:to-purple-400/20 p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                      <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Current Performance Metrics</h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-1">
                            {currentMetrics.apr}%
                          </div>
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">APR</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                          <div className="text-2xl font-black text-green-600 dark:text-green-400 mb-1">
                            {currentMetrics.ltv}%
                          </div>
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">LTV</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mb-1">
                            ${(currentMetrics.aum / 1000).toFixed(0)}K
                          </div>
                          <div className="text-sm font-medium text-purple-600 dark:text-purple-400">AUM</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-200/50 dark:border-orange-700/50">
                          <div className="text-2xl font-black text-orange-600 dark:text-orange-400 mb-1">
                            {currentMetrics.healthFactor}
                          </div>
                          <div className="text-sm font-medium text-orange-600 dark:text-orange-400">Health Factor</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                            {currentMetrics.volatility}%
                          </div>
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Volatility</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                            {currentMetrics.sharpeRatio}
                          </div>
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Sharpe Ratio</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                            {currentMetrics.maxDrawdown}%
                          </div>
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Max Drawdown</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                            {currentMetrics.utilization}%
                          </div>
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Utilization</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Alerts */}
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-600/10 via-orange-600/10 to-yellow-600/10 dark:from-red-400/20 dark:via-orange-400/20 dark:to-yellow-400/20 p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Performance Alerts</h3>
                  </div>
                  
                  <div className="p-6">
                    {alerts.filter(alert => !alert.resolved).length === 0 ? (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">All Clear!</h4>
                        <p className="text-slate-600 dark:text-slate-400">No active performance alerts</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {alerts.filter(alert => !alert.resolved).map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-4 rounded-2xl border-2 ${
                              alert.type === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50' :
                              alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/50' :
                              'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className={`font-semibold mb-1 ${
                                  alert.type === 'critical' ? 'text-red-800 dark:text-red-400' :
                                  alert.type === 'warning' ? 'text-yellow-800 dark:text-yellow-400' :
                                  'text-blue-800 dark:text-blue-400'
                                }`}>
                                  {alert.message}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                  {alert.timestamp.toLocaleTimeString()}
                                </div>
                              </div>
                              <button
                                onClick={() => resolveAlert(alert.id)}
                                className="ml-4 px-3 py-1.5 bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
                              >
                                Resolve
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full shadow-xl mb-6">
                  <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
                  Ready for Monitoring
                </h3>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                  Select an agent from the sidebar to begin performance monitoring and view detailed metrics
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
