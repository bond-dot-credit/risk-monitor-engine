'use client';

import { useState, useEffect } from 'react';
import { Agent } from '@/types/agent';
import { Header } from '@/components/Header';

export default function PerformancePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [performanceMetrics, setPerformanceMetrics] = useState<Record<string, unknown>>({});
  const [alerts, setAlerts] = useState<Record<string, unknown>[]>([]);

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        if (response.ok) {
          const data = await response.json();
          setAgents(data.data || []);
          if (data.data.length > 0 && !selectedAgentId) {
            setSelectedAgentId(data.data[0].id);
          }
        } else {
          throw new Error('Failed to fetch agents');
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [selectedAgentId]);

  const generateMetrics = (agent: Agent): Record<string, unknown> => {
    const basePerformance = agent.score.performance / 100;
    const baseOverall = agent.score.overall / 100;
    
    return {
      totalTransactions: Math.floor(5000 + basePerformance * 45000),
      successRate: Math.min(96 + basePerformance * 4, 100),
      avgResponseTime: Math.max(25, 180 - basePerformance * 155),
      errorRate: Math.max(0.1, 5 - basePerformance * 4.9),
      uptime: Math.min(99.5 + baseOverall * 0.5, 100),
      throughput: Math.floor(100 + basePerformance * 900),
      latency: Math.max(10, 100 - basePerformance * 90),
      availability: Math.min(99.5 + baseOverall * 0.5, 100)
    };
  };

  const generateAlerts = (agent: Agent): Record<string, unknown>[] => {
    const alerts: Record<string, unknown>[] = [];
    const metrics = generateMetrics(agent) as Record<string, number>;
    
    if (metrics.errorRate > 1) {
      alerts.push({
        id: '1',
        type: 'warning',
        message: `Error rate elevated: ${metrics.errorRate.toFixed(2)}%`,
        timestamp: new Date(Date.now() - 300000)
      });
    }
    
    if (metrics.avgResponseTime > 150) {
      alerts.push({
        id: '2',
        type: 'warning',
        message: `High response time: ${metrics.avgResponseTime.toFixed(0)}ms`,
        timestamp: new Date(Date.now() - 600000)
      });
    }
    
    if (metrics.uptime < 99.5) {
      alerts.push({
        id: '3',
        type: 'error',
        message: `Uptime below threshold: ${metrics.uptime.toFixed(2)}%`,
        timestamp: new Date(Date.now() - 900000)
      });
    }
    
    return alerts;
  };

  useEffect(() => {
    if (selectedAgent) {
      const metrics = generateMetrics(selectedAgent);
      setPerformanceMetrics(metrics);
      
      const alerts = generateAlerts(selectedAgent);
      setAlerts(alerts);
    }
  }, [selectedAgent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-4">Error Loading Data</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Agent Selection */}
          <div className="xl:col-span-4">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-indigo-400/20 p-8 border-b border-slate-200/50 dark:border-slate-700/50">
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4">Agent Selection</h2>
                <p className="text-slate-600 dark:text-slate-400">Select an agent to view performance metrics</p>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading agents...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agents.map((agent) => {
                      const status = {
                        label: agent.status === 'ACTIVE' ? 'Active' : 'Inactive',
                        bg: agent.status === 'ACTIVE' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-700',
                        color: agent.status === 'ACTIVE' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                      };
                      
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

          {/* Main Content */}
          <div className="xl:col-span-8">
            {selectedAgent ? (
              <div className="space-y-8">
                {/* Control Panel */}
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-2xl">Control Panel</h3>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Configure monitoring settings and time ranges</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                      {/* Time Range Selector */}
                      <div className="flex items-center space-x-2">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Time Range:</label>
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 space-x-1">
                          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
                            <button
                              key={range}
                              onClick={() => setTimeRange(range)}
                              className={`font-semibold rounded-lg transition-all duration-200 px-4 py-2 text-sm ${
                                timeRange === range
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                              }`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Monitoring Toggle */}
                      <button
                        onClick={() => setIsMonitoring(!isMonitoring)}
                        className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
                          isMonitoring
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                        }`}
                      >
                        {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Performance Metrics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {(performanceMetrics.totalTransactions as number)?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300 font-semibold">Total Transactions</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
                      <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                        {(performanceMetrics.successRate as number)?.toFixed(1) || '0'}%
                      </div>
                      <div className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">Success Rate</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                        {(performanceMetrics.avgResponseTime as number)?.toFixed(0) || '0'}ms
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300 font-semibold">Avg Response Time</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                        {(performanceMetrics.uptime as number)?.toFixed(2) || '0'}%
                      </div>
                      <div className="text-sm text-orange-700 dark:text-orange-300 font-semibold">Uptime</div>
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                {alerts.length > 0 && (
                  <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Active Alerts</h3>
                    
                    <div className="space-y-4">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id as string}
                          className={`p-4 rounded-xl border-l-4 ${
                            alert.type === 'error' 
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400'
                              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 dark:border-yellow-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-semibold ${
                                alert.type === 'error' 
                                  ? 'text-red-800 dark:text-red-400'
                                  : 'text-yellow-800 dark:text-yellow-400'
                              }`}>
                                {alert.message as string}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {new Date(alert.timestamp as number).toLocaleString()}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              alert.type === 'error' 
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {alert.type as string}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-12 text-center">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">No Agent Selected</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Please select an agent from the sidebar to view performance metrics.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}