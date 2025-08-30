'use client';


import { useState, useEffect, useCallback, useMemo } from 'react';
// Agent interface defined locally since we don't have a types file
 

import { Header } from '@/components/Header';
import { ResponsiveHeader } from '@/components/ResponsiveHeader';
import { MobileBottomSheet } from '@/components/MobileBottomSheet';
import { useResponsive, useMobileSheet } from '@/hooks/useResponsive';


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



  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (selectedAgent) {
      generatePerformanceMetrics();
      // Call the generateAlerts function with the selected agent
      const alerts = generateAlerts(selectedAgent);
      // For now, we'll just log the alerts
      console.log('Generated alerts:', alerts);
    }
  }, [selectedAgent, generatePerformanceMetrics]);


  useEffect(() => {
    if (isMonitoring && selectedAgent) {
      const interval = setInterval(() => {
        generatePerformanceMetrics();
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring, selectedAgent, refreshInterval, generatePerformanceMetrics]);

  // Enhanced performance metrics generator
  const generateMetrics = (agent: Agent): PerformanceMetrics => {
    const basePerformance = agent.score.performance / 100;
    const baseOverall = agent.score.overall / 100;
    
    return {
      totalTransactions: Math.floor(5000 + basePerformance * 45000),
      successRate: Math.min(96 + basePerformance * 4, 100),
      avgResponseTime: Math.max(25, 180 - basePerformance * 155),
      uptime: Math.min(99.1 + baseOverall * 0.9, 100),
      errorRate: Math.max(0.05, 3 - basePerformance * 2.95),
      throughput: Math.floor(200 + basePerformance * 800),
      latency: Math.max(10, 100 - basePerformance * 90),
      availability: Math.min(99.5 + baseOverall * 0.5, 100)
    };
  };

  // Generate mock alerts
  const generateAlerts = (agent: Agent): AlertData[] => {
    const alerts: AlertData[] = [];
    const metrics = generateMetrics(agent);
    
    if (metrics.errorRate > 1) {
      alerts.push({
        id: '1',
        type: 'warning',
        message: `Error rate elevated: ${metrics.errorRate.toFixed(2)}%`,
        timestamp: new Date(Date.now() - 300000) // 5 minutes ago
      });
    }
    
    if (metrics.avgResponseTime > 150) {
      alerts.push({
        id: '2',
        type: 'error',
        message: `High response time: ${metrics.avgResponseTime.toFixed(0)}ms`,
        timestamp: new Date(Date.now() - 600000) // 10 minutes ago
      });
    }
    
    if (metrics.uptime < 99.5) {
      alerts.push({
        id: '3',
        type: 'info',
        message: `Uptime below target: ${metrics.uptime.toFixed(2)}%`,
        timestamp: new Date(Date.now() - 900000) // 15 minutes ago
      });
    }
    
    return alerts;
  };

  // Remove the duplicate generateAlerts function that was declared earlier

  const getPerformanceStatus = (score: number) => {
    if (score >= 95) return { label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    if (score >= 85) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    if (score >= 70) return { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
    return { label: 'Poor', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };

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

          <div className="text-center max-w-lg mx-auto px-4">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">System Connection Error</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Retry Connection
                </button>
                <button
                  onClick={() => setError(null)}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all duration-200"
                >
                  Dismiss
                </button>

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Responsive Header */}
      {isMobile || isTablet ? (
        <ResponsiveHeader
          title="Performance Analytics"
          onMenuClick={() => setShowMobileMenu(true)}
          onAgentSelectorClick={agentSheet.open}
          showAgentSelector={agents.length > 0}
          selectedAgentName={selectedAgent?.name}
        />
      ) : (
        <Header />
      )}
      
      {/* Mobile Bottom Sheet for Agent Selection */}
      <MobileBottomSheet
        isOpen={agentSheet.isOpen}
        onClose={agentSheet.close}
        agents={agents}
        selectedAgentId={selectedAgentId}
        onAgentSelect={setSelectedAgentId}
        loading={loading}
      />
      
      {/* Responsive Hero Section - Hidden on mobile */}
      {!isMobile && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-indigo-400/10"></div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          
          <div className={`relative container mx-auto px-4 sm:px-6 lg:px-8 ${
            isTablet ? 'py-12' : 'py-20'
          }`}>
            <div className="text-center max-w-5xl mx-auto">
              <div className={`inline-flex items-center justify-center ${
                isTablet ? 'w-16 h-16' : 'w-24 h-24'
              } bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-full shadow-2xl mb-6 sm:mb-8 relative`}>
                <svg className={`${isTablet ? 'w-8 h-8' : 'w-12 h-12'} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div className="absolute -inset-2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-full opacity-20 animate-ping"></div>
              </div>
              
              <h1 className={`font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight ${
                isTablet ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl'
              }`}>
                Performance Analytics
              </h1>
              
              <p className={`text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-4 ${
                isTablet ? 'text-base sm:text-lg' : 'text-lg sm:text-xl md:text-2xl'
              }`}>
                Enterprise-grade real-time monitoring with advanced analytics and comprehensive performance insights
              </p>
              
              {/* Responsive Stats Grid */}
              <div className={`grid gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto px-4 ${
                isTablet ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              }`}>
              <div className="group bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-3xl transition-all duration-300 hover:scale-105">
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 mb-2 sm:mb-3">
                  {agents.length}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">Total Agents</div>
                <div className="mt-2 sm:mt-3 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300"></div>
              </div>
              
              <div className="group bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-3xl transition-all duration-300 hover:scale-105">
                <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-2 sm:mb-3">
                  {agents.filter(a => a.score.performance >= 90).length}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">High Performance</div>
                <div className="mt-2 sm:mt-3 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full group-hover:from-emerald-600 group-hover:to-emerald-700 transition-all duration-300"></div>
              </div>
              
              <div className="group bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-3xl transition-all duration-300 hover:scale-105">
                <div className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 mb-2 sm:mb-3">
                  {agents.length > 0 ? Math.round(agents.reduce((sum, a) => sum + a.score.performance, 0) / agents.length) : 0}%
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">Avg Performance</div>
                <div className="mt-2 sm:mt-3 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300"></div>
              </div>
              
              <div className="group bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-3xl transition-all duration-300 hover:scale-105">
                <div className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400 mb-2 sm:mb-3">
                  {agents.filter(a => a.status === 'ACTIVE').length}

                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">Active Agents</div>
                <div className="mt-2 sm:mt-3 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
      )}
      
      {/* Mobile Quick Stats - Only shown on mobile */}
      {isMobile && (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                  {agents.length}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Agents</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {agents.filter(a => a.score.performance >= 90).length}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">High Perf</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className={`container mx-auto px-4 pb-20 relative z-10 ${
        isMobile ? 'mt-0' : isTablet ? 'mt-0 sm:px-6' : 'sm:px-6 lg:px-8 -mt-12'
      }`}>
        <div className={`gap-6 md:gap-8 ${
          isMobile ? 'space-y-6' : isTablet ? 'grid grid-cols-1' : 'grid grid-cols-1 xl:grid-cols-12'
        }`}>
          
          {/* Agent Selection - Hidden on mobile, shown as sidebar on larger screens */}
          {!isMobile && (
          <div className={isTablet ? 'mb-8' : 'xl:col-span-4'}>
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-indigo-400/20 p-8 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Agent Selection</h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Live</span>
                  </div>

                </div>
                <p className="text-slate-600 dark:text-slate-400">Choose an agent to monitor performance metrics</p>
              </div>
              
              <div className="p-6">
                {agents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Agents Available</h3>
                    <p className="text-slate-500 dark:text-slate-400">Connect agents to start monitoring</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {agents.map((agent) => {
                      const status = getPerformanceStatus(agent.score.performance);
                      return (
                        <button
                          key={agent.id}
                          onClick={() => setSelectedAgentId(agent.id)}
                          className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                            selectedAgentId === agent.id
                              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-xl'
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-2">
                                {agent.name}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {agent.metadata.description}
                              </p>
                            </div>
                            <div className={`px-4 py-2 text-sm font-bold rounded-full ml-4 ${status.bg} ${status.color}`}>
                              {agent.score.performance}%
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                {agent.credibilityTier}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.bg} ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                            <div className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              agent.status === 'ACTIVE' 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}>
                              {agent.status}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Main Content */}
          <div className={isTablet ? '' : 'xl:col-span-8'}>
            {selectedAgent ? (
              <div className="space-y-8">
                {/* Responsive Control Panel */}
                <div className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 ${
                  isMobile ? 'rounded-2xl p-4' : isTablet ? 'rounded-2xl p-5' : 'rounded-3xl p-6'
                }`}>
                  <div className={`gap-4 md:gap-6 ${
                    isMobile ? 'flex flex-col space-y-4' : 'flex flex-col lg:flex-row lg:items-center lg:justify-between'
                  }`}>
                    <div>
                      <h3 className={`font-bold text-slate-900 dark:text-slate-100 mb-2 ${
                        isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'
                      }`}>Control Panel</h3>
                      {!isMobile && (
                        <p className="text-slate-600 dark:text-slate-400">Configure monitoring settings and time ranges</p>
                      )}
                    </div>
                    
                    <div className={`gap-3 md:gap-4 ${
                      isMobile ? 'flex flex-col space-y-3' : 'flex flex-col sm:flex-row'
                    }`}>
                      {/* Time Range Selector */}
                      <div className={`flex items-center ${
                        isMobile ? 'flex-col space-y-2' : 'space-x-2'
                      }`}>
                        <label className={`font-semibold text-slate-700 dark:text-slate-300 ${
                          isMobile ? 'text-xs self-start' : 'text-sm'
                        }`}>Time Range:</label>
                        <div className={`flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 ${
                          isMobile ? 'w-full space-x-0' : 'space-x-1'
                        }`}>
                          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
                            <button
                              key={range}
                              onClick={() => setTimeRange(range)}
                              className={`font-semibold rounded-lg transition-all duration-200 touch-manipulation ${
                                isMobile ? 'flex-1 px-3 py-2 text-xs' : 'px-4 py-2 text-sm'
                              } ${
                                timeRange === range
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                              }`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Auto Refresh Toggle */}
                      <div className={`flex items-center ${
                        isMobile ? 'justify-between' : 'space-x-3'
                      }`}>
                        <label className={`font-semibold text-slate-700 dark:text-slate-300 ${
                          isMobile ? 'text-xs' : 'text-sm'
                        }`}>Auto Refresh:</label>
                        <button
                          onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                          className={`relative inline-flex items-center rounded-full transition-colors touch-manipulation ${
                            isMobile ? 'h-5 w-9' : 'h-6 w-11'
                          } ${
                            isAutoRefresh ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        >
                          <span
                            className={`inline-block transform rounded-full bg-white transition-transform ${
                              isMobile ? 'h-3 w-3' : 'h-4 w-4'
                            } ${
                              isAutoRefresh ? (isMobile ? 'translate-x-5' : 'translate-x-6') : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Responsive Performance Metrics Dashboard */}
                <div className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden ${
                  isMobile ? 'rounded-2xl' : 'rounded-3xl'
                }`}>
                  <div className={`bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-purple-600/10 dark:from-emerald-400/20 dark:via-blue-400/20 dark:to-purple-400/20 border-b border-slate-200/50 dark:border-slate-700/50 ${
                    isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8'
                  }`}>
                    <div className={`${
                      isMobile ? 'text-center' : 'flex items-center justify-between'
                    }`}>
                      <div className={isMobile ? 'mb-4' : ''}>
                        <h2 className={`font-black text-slate-900 dark:text-slate-100 mb-2 ${
                          isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'
                        }`}>
                          {selectedAgent.name} Performance Monitor
                        </h2>
                        {!isMobile && (
                          <p className="text-slate-600 dark:text-slate-400">
                            Real-time analytics and comprehensive monitoring dashboard
                          </p>
                        )}
                      </div>
                      <div className={`text-center ${
                        isMobile ? '' : 'text-right'
                      }`}>
                        <div className={`text-slate-500 dark:text-slate-400 mb-1 ${
                          isMobile ? 'text-xs' : 'text-sm'
                        }`}>Last Updated</div>
                        <div className={`font-semibold text-slate-900 dark:text-slate-100 ${
                          isMobile ? 'text-sm' : 'text-lg'
                        }`}>
                          {new Date().toLocaleTimeString()}

                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8'}>
                    {(() => {
                      const metrics = generateMetrics(selectedAgent);
                      const alerts = generateAlerts(selectedAgent);
                      
                      return (
                        <>
                          {/* Alerts Section */}
                          {alerts.length > 0 && (
                            <div className={isMobile ? 'mb-6' : 'mb-8'}>
                              <h3 className={`font-bold text-slate-900 dark:text-slate-100 mb-4 ${
                                isMobile ? 'text-lg' : 'text-xl'
                              }`}>System Alerts</h3>
                              <div className="space-y-3">
                                {alerts.map((alert) => (
                                  <div
                                    key={alert.id}
                                    className={`rounded-xl border-l-4 ${
                                      isMobile ? 'p-3' : 'p-4'
                                    } ${
                                      alert.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                                      alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                                      'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                                    }`}
                                  >
                                    <div className={`flex items-center justify-between ${
                                      isMobile ? 'flex-col items-start space-y-2' : ''
                                    }`}>
                                      <span className={`font-semibold ${
                                        alert.type === 'error' ? 'text-red-700 dark:text-red-400' :
                                        alert.type === 'warning' ? 'text-yellow-700 dark:text-yellow-400' :
                                        'text-blue-700 dark:text-blue-400'
                                      } ${isMobile ? 'text-sm' : ''}`}>
                                        {alert.message}
                                      </span>
                                      <span className={`text-slate-500 dark:text-slate-400 ${
                                        isMobile ? 'text-xs self-end' : 'text-sm'
                                      }`}>
                                        {alert.timestamp.toLocaleTimeString()}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Responsive Metrics Grid */}
                          <div className={`grid mb-6 md:mb-8 ${
                            isMobile 
                              ? 'grid-cols-2 gap-3' 
                              : isTablet 
                                ? 'grid-cols-2 md:grid-cols-4 gap-4'
                                : 'grid-cols-2 md:grid-cols-4 gap-6'
                          }`}>
                            <div className={`group text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-lg transition-all duration-300 ${
                              isMobile ? 'p-3 rounded-xl hover:scale-[1.02]' : isTablet ? 'p-4 rounded-xl hover:scale-[1.02]' : 'p-6 rounded-2xl hover:scale-105'
                            }`}>
                              <div className={`font-black text-blue-600 dark:text-blue-400 mb-2 ${
                                isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl'
                              }`}>
                                {metrics.totalTransactions.toLocaleString()}
                              </div>
                              <div className={`font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider ${
                                isMobile ? 'text-xs' : 'text-sm'
                              }`}>Total Transactions</div>
                              {!isMobile && (
                                <div className={`mt-2 text-blue-500 dark:text-blue-400 ${
                                  isTablet ? 'text-xs' : 'text-xs'
                                }`}>+12% from last period</div>
                              )}
                            </div>

                            <div className={`group text-center bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 hover:shadow-lg transition-all duration-300 ${
                              isMobile ? 'p-3 rounded-xl hover:scale-[1.02]' : isTablet ? 'p-4 rounded-xl hover:scale-[1.02]' : 'p-6 rounded-2xl hover:scale-105'
                            }`}>
                              <div className={`font-black text-emerald-600 dark:text-emerald-400 mb-2 ${
                                isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl'
                              }`}>
                                {metrics.successRate.toFixed(1)}%
                              </div>
                              <div className={`font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider ${
                                isMobile ? 'text-xs' : 'text-sm'
                              }`}>Success Rate</div>
                              {!isMobile && (
                                <div className={`mt-2 text-emerald-500 dark:text-emerald-400 ${
                                  isTablet ? 'text-xs' : 'text-xs'
                                }`}>+0.3% from last period</div>
                              )}
                            </div>

                            <div className={`group text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-lg transition-all duration-300 ${
                              isMobile ? 'p-3 rounded-xl hover:scale-[1.02]' : isTablet ? 'p-4 rounded-xl hover:scale-[1.02]' : 'p-6 rounded-2xl hover:scale-105'
                            }`}>
                              <div className={`font-black text-purple-600 dark:text-purple-400 mb-2 ${
                                isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl'
                              }`}>
                                {metrics.avgResponseTime.toFixed(0)}ms
                              </div>
                              <div className={`font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider ${
                                isMobile ? 'text-xs' : 'text-sm'
                              }`}>Avg Response Time</div>
                              {!isMobile && (
                                <div className={`mt-2 text-purple-500 dark:text-purple-400 ${
                                  isTablet ? 'text-xs' : 'text-xs'
                                }`}>-5ms from last period</div>
                              )}
                            </div>

                            <div className={`group text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:shadow-lg transition-all duration-300 ${
                              isMobile ? 'p-3 rounded-xl hover:scale-[1.02]' : isTablet ? 'p-4 rounded-xl hover:scale-[1.02]' : 'p-6 rounded-2xl hover:scale-105'
                            }`}>
                              <div className={`font-black text-orange-600 dark:text-orange-400 mb-2 ${
                                isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl'
                              }`}>
                                {metrics.uptime.toFixed(2)}%
                              </div>
                              <div className={`font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider ${
                                isMobile ? 'text-xs' : 'text-sm'
                              }`}>Uptime</div>
                              {!isMobile && (
                                <div className={`mt-2 text-orange-500 dark:text-orange-400 ${
                                  isTablet ? 'text-xs' : 'text-xs'
                                }`}>Target: 99.9%</div>
                              )}
                            </div>

                            <div className={`group text-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 hover:shadow-lg transition-all duration-300 ${
                              isMobile ? 'p-3 rounded-xl hover:scale-[1.02]' : isTablet ? 'p-4 rounded-xl hover:scale-[1.02]' : 'p-6 rounded-2xl hover:scale-105'
                            }`}>
                              <div className={`font-black text-red-600 dark:text-red-400 mb-2 ${
                                isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl'
                              }`}>
                                {metrics.errorRate.toFixed(2)}%
                              </div>
                              <div className={`font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider ${
                                isMobile ? 'text-xs' : 'text-sm'
                              }`}>Error Rate</div>
                              {!isMobile && (
                                <div className={`mt-2 text-red-500 dark:text-red-400 ${
                                  isTablet ? 'text-xs' : 'text-xs'
                                }`}>Target: &lt;1%</div>
                              )}
                            </div>

                            <div className={`group text-center bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 hover:shadow-lg transition-all duration-300 ${
                              isMobile ? 'p-3 rounded-xl hover:scale-[1.02]' : isTablet ? 'p-4 rounded-xl hover:scale-[1.02]' : 'p-6 rounded-2xl hover:scale-105'
                            }`}>
                              <div className={`font-black text-indigo-600 dark:text-indigo-400 mb-2 ${
                                isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl'
                              }`}>
                                {metrics.throughput}/s
                              </div>
                              <div className={`font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider ${
                                isMobile ? 'text-xs' : 'text-sm'
                              }`}>Throughput</div>
                              {!isMobile && (
                                <div className={`mt-2 text-indigo-500 dark:text-indigo-400 ${
                                  isTablet ? 'text-xs' : 'text-xs'
                                }`}>Peak: {Math.floor(metrics.throughput * 1.3)}/s</div>
                              )}
                            </div>

                            <div className={`group text-center bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 hover:shadow-lg transition-all duration-300 ${
                              isMobile ? 'p-3 rounded-xl hover:scale-[1.02]' : isTablet ? 'p-4 rounded-xl hover:scale-[1.02]' : 'p-6 rounded-2xl hover:scale-105'
                            }`}>
                              <div className={`font-black text-teal-600 dark:text-teal-400 mb-2 ${
                                isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl'
                              }`}>
                                {metrics.latency.toFixed(0)}ms
                              </div>
                              <div className={`font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider ${
                                isMobile ? 'text-xs' : 'text-sm'
                              }`}>Latency</div>
                              {!isMobile && (
                                <div className={`mt-2 text-teal-500 dark:text-teal-400 ${
                                  isTablet ? 'text-xs' : 'text-xs'
                                }`}>P95: {Math.floor(metrics.latency * 1.5)}ms</div>
                              )}
                            </div>

                            <div className={`group text-center bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 hover:shadow-lg transition-all duration-300 ${
                              isMobile ? 'p-3 rounded-xl hover:scale-[1.02]' : isTablet ? 'p-4 rounded-xl hover:scale-[1.02]' : 'p-6 rounded-2xl hover:scale-105'
                            }`}>
                              <div className={`font-black text-pink-600 dark:text-pink-400 mb-2 ${
                                isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl'
                              }`}>
                                {metrics.availability.toFixed(2)}%
                              </div>
                              <div className={`font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider ${
                                isMobile ? 'text-xs' : 'text-sm'
                              }`}>Availability</div>
                              {!isMobile && (
                                <div className={`mt-2 text-pink-500 dark:text-pink-400 ${
                                  isTablet ? 'text-xs' : 'text-xs'
                                }`}>SLA: 99.95%</div>
                              )}
                            </div>
                          </div>

                          {/* Responsive Chart Placeholder */}
                          <div className={`bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-600/50 text-center ${
                            isMobile ? 'rounded-2xl p-8' : isTablet ? 'rounded-3xl p-10' : 'rounded-3xl p-12'
                          }`}>
                            <div className={isMobile ? 'text-5xl mb-4' : 'text-8xl mb-6'}>📊</div>
                            <h3 className={`font-bold text-slate-700 dark:text-slate-300 mb-4 ${
                              isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'
                            }`}>Advanced Performance Charts</h3>
                            <p className={`text-slate-500 dark:text-slate-400 mb-6 max-w-2xl mx-auto leading-relaxed ${
                              isMobile ? 'text-sm' : isTablet ? 'text-lg' : 'text-xl'
                            }`}>
                              Interactive real-time visualization tools with historical data analysis and predictive insights coming soon
                            </p>
                            <div className={`flex text-slate-400 dark:text-slate-500 ${
                              isMobile ? 'flex-col space-y-2 items-center text-xs' : 'flex-col sm:flex-row items-center justify-center gap-4 text-sm'
                            }`}>
                              <span>Time Range: {timeRange}</span>
                              {!isMobile && <span>•</span>}
                              <span>Auto Refresh: {isAutoRefresh ? 'Enabled' : 'Disabled'}</span>
                              {!isMobile && <span>•</span>}
                              <span>Last Updated: {new Date().toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 text-center flex flex-col items-center justify-center ${
                isMobile ? 'rounded-2xl p-12 min-h-[400px]' : isTablet ? 'rounded-3xl p-16 min-h-[500px]' : 'rounded-3xl p-20 min-h-[600px]'
              }`}>
                <div className={`inline-flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full shadow-2xl mb-8 relative ${
                  isMobile ? 'w-20 h-20' : isTablet ? 'w-24 h-24' : 'w-32 h-32'
                }`}>
                  <svg className={`text-slate-400 dark:text-slate-500 ${
                    isMobile ? 'w-10 h-10' : isTablet ? 'w-12 h-12' : 'w-16 h-16'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div className="absolute -inset-4 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-full opacity-20 animate-ping"></div>
                </div>
                
                <h3 className={`font-bold text-slate-700 dark:text-slate-300 mb-4 ${
                  isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl'
                }`}>
                  Performance Analytics Ready
                </h3>
                <p className={`text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed mb-6 ${
                  isMobile ? 'text-sm px-4' : isTablet ? 'text-lg' : 'text-xl'
                }`}>
                  {isMobile 
                    ? 'Tap the "Agent" button above to select an agent for monitoring'
                    : 'Select an agent from the sidebar to begin comprehensive performance monitoring with real-time analytics and advanced insights'
                  }
                </p>
                <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className={isMobile ? 'text-xs' : 'text-sm'}>System ready for monitoring</span>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}