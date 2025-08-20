'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent } from '@/types/agent';
import { ReputationSummary } from '@/types/reputation';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [reputationSummary, setReputationSummary] = useState<ReputationSummary | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<{[key: string]: any}>({});

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success && data.data) {
        setAgents(data.data);
        if (data.data.length > 0 && !selectedAgentId) {
          setSelectedAgentId(data.data[0].id);
        }
      } else {
        console.error('Failed to fetch agents:', data.error);
        setAgents([]);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    }
  }, [selectedAgentId]);

  const fetchReputationSummary = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agentbeat?agentId=${agentId}`);
      if (response.ok) {
        const data = await response.json();
        setReputationSummary(data);
      } else {
        console.error('Failed to fetch reputation summary');
        setReputationSummary(null);
      }
    } catch (error) {
      console.error('Error fetching reputation summary:', error);
      setReputationSummary(null);
    }
  };

  const fetchPerformanceMetrics = async (agentId: string) => {
    try {
      const response = await fetch(`/api/performance?agentId=${agentId}`);
      if (response.ok) {
        const data = await response.json();
        setPerformanceMetrics(prev => ({ ...prev, [agentId]: data }));
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (selectedAgentId) {
      fetchReputationSummary(selectedAgentId);
      fetchPerformanceMetrics(selectedAgentId);
    }
  }, [selectedAgentId]);

  if (!isMounted) {
    return <div className="p-6">Loading...</div>;
  }

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);
  const currentMetrics = performanceMetrics[selectedAgentId];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Performance & Reputation</h1>
          <p className="mt-2 text-gray-600">
            Monitor agent performance metrics and reputation scores
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Agent Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Select Agent</h2>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedAgent && (
              <div className="space-y-6">
                {/* Agent Overview */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{selectedAgent.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedAgent.credibilityTier === 'PLATINUM' ? 'bg-slate-100 text-slate-800' :
                      selectedAgent.credibilityTier === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                      selectedAgent.credibilityTier === 'SILVER' ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {selectedAgent.credibilityTier}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{selectedAgent.metadata.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedAgent.score.overall}</div>
                      <div className="text-sm text-gray-500">Overall Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedAgent.score.performance}</div>
                      <div className="text-sm text-gray-500">Performance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedAgent.score.provenance}</div>
                      <div className="text-sm text-gray-500">Provenance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{selectedAgent.score.perception}</div>
                      <div className="text-sm text-gray-500">Perception</div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                {currentMetrics && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {currentMetrics.apr ? `${currentMetrics.apr}%` : 'N/A'}
                        </div>
                        <div className="text-sm text-blue-600">APR</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {currentMetrics.ltv ? `${currentMetrics.ltv}%` : 'N/A'}
                        </div>
                        <div className="text-sm text-green-600">LTV</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-600">
                          {currentMetrics.aum ? `$${currentMetrics.aum.toLocaleString()}` : 'N/A'}
                        </div>
                        <div className="text-sm text-purple-600">AUM</div>
                      </div>
                    </div>

                    {/* Additional Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-700">
                          {currentMetrics.volatility ? `${currentMetrics.volatility}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Volatility</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-700">
                          {currentMetrics.sharpeRatio ? currentMetrics.sharpeRatio.toFixed(2) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Sharpe Ratio</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-700">
                          {currentMetrics.maxDrawdown ? `${currentMetrics.maxDrawdown}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Max Drawdown</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500">Last Updated</div>
                        <div className="text-xs font-medium text-gray-700">
                          {currentMetrics.lastUpdated ? new Date(currentMetrics.lastUpdated).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Performance Chart Placeholder */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Performance Trend (Last 30 Days)</h4>
                      <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="text-2xl mb-2">📈</div>
                          <div className="text-sm">Performance Chart</div>
                          <div className="text-xs">Historical data visualization</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reputation Summary */}
                {reputationSummary && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Reputation Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{reputationSummary.totalEvents}</div>
                        <div className="text-sm text-gray-500">Total Events</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{reputationSummary.positiveEvents}</div>
                        <div className="text-sm text-gray-500">Positive</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{reputationSummary.negativeEvents}</div>
                        <div className="text-sm text-gray-500">Negative</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{reputationSummary.breakdown.overall}</div>
                        <div className="text-sm text-gray-500">Reputation Score</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Trend</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reputationSummary.trend === 'improving' ? 'bg-green-100 text-green-800' :
                          reputationSummary.trend === 'declining' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {reputationSummary.trend}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Recent Events</h4>
                      {reputationSummary.recentEvents.slice(0, 3).map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">{event.description}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(event.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.impact > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {event.impact > 0 ? '+' : ''}{event.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance Comparison */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Performance Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Agent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Overall Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Performance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tier
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {agents.slice(0, 5).map((agent) => (
                          <tr key={agent.id} className={agent.id === selectedAgentId ? 'bg-blue-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{agent.score.overall}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{agent.score.performance}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                agent.credibilityTier === 'PLATINUM' ? 'bg-slate-100 text-slate-800' :
                                agent.credibilityTier === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                                agent.credibilityTier === 'SILVER' ? 'bg-gray-100 text-gray-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {agent.credibilityTier}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                agent.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                agent.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                                agent.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {agent.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
