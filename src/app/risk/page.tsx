'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent } from '@/types/agent';
import { RiskMetrics } from '@/types/credit';
import { Header } from '@/components/Header';

export default function RiskPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch('/api/agents');
      const result = await response.json();
      const data = result.success ? result.data : result;
      const agentsArray = Array.isArray(data) ? data : [];
      setAgents(agentsArray);
      if (agentsArray.length > 0 && !selectedAgentId) {
        setSelectedAgentId(agentsArray[0].id);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    }
  }, [selectedAgentId]);

  useEffect(() => {
    setIsMounted(true);
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (selectedAgentId) {
      fetchRiskMetrics(selectedAgentId);
    }
  }, [selectedAgentId]);

  const fetchRiskMetrics = async (agentId: string) => {
    try {
      const response = await fetch(`/api/risk?agentId=${agentId}`);
      if (response.ok) {
        const result = await response.json();
        const data = result.success ? result.data : result;
        setRiskMetrics(data);
      } else {
        console.error('Failed to fetch risk metrics', response.status);
        setRiskMetrics(null);
      }
    } catch (error) {
      console.error('Error fetching risk metrics:', error);
      setRiskMetrics(null);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Risk Monitor: Agent Performance & Risk Assessment</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded"></div>
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

  const selectedAgent = Array.isArray(agents) ? agents.find(a => a.id === selectedAgentId) : undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Risk Monitor: Agent Performance & Risk Assessment</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor agent performance metrics and risk assessment data
          </p>
        </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select Agent</h2>
              <div className="space-y-2">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedAgentId === agent.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{agent.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{agent.metadata.description}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Status: {agent.status} • Tier: {agent.credibilityTier}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedAgent && riskMetrics ? (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Performance Overview: {selectedAgent.name}
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedAgent.score.overall}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedAgent.score.performance}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Performance Score</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{selectedAgent.score.provenance}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Provenance Score</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedAgent.score.perception}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Perception Score</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">LTV & Credit Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Current LTV Status</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Current LTV:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{riskMetrics.ltv.current}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Maximum LTV:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{riskMetrics.ltv.maximum}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">LTV Utilization:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {((riskMetrics.ltv.current / riskMetrics.ltv.maximum) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Risk Level:</span>
                          <span className={`font-medium px-2 py-1 rounded text-xs ${
                            riskMetrics.ltv.current > riskMetrics.ltv.maximum * 0.8 
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' 
                              : riskMetrics.ltv.current > riskMetrics.ltv.maximum * 0.6
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                              : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                          }`}>
                            {riskMetrics.ltv.current > riskMetrics.ltv.maximum * 0.8 
                              ? 'High' 
                              : riskMetrics.ltv.current > riskMetrics.ltv.maximum * 0.6
                              ? 'Medium'
                              : 'Low'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Credit Line Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Available Credit:</span>
                          <span className="font-medium text-gray-900 dark:text-white">${riskMetrics.creditLine.available.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Used Credit:</span>
                          <span className="font-medium text-gray-900 dark:text-white">${riskMetrics.creditLine.used.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Credit:</span>
                          <span className="font-medium text-gray-900 dark:text-white">${riskMetrics.creditLine.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">APR Rate:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{riskMetrics.creditLine.apr}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Management & Performance</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Asset Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Assets Under Management:</span>
                          <span className="font-medium text-gray-900 dark:text-white">${riskMetrics.assetManagement.aum.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Asset Diversity Score:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{riskMetrics.assetManagement.diversityScore}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Liquidation Risk:</span>
                          <span className={`font-medium px-2 py-1 rounded text-xs ${
                            riskMetrics.assetManagement.liquidationRisk > 70 
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' 
                              : riskMetrics.assetManagement.liquidationRisk > 40
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                              : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                          }`}>
                            {riskMetrics.assetManagement.liquidationRisk > 70 
                              ? 'High' 
                              : riskMetrics.assetManagement.liquidationRisk > 40
                              ? 'Medium'
                              : 'Low'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Performance Variance</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Performance Variance:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{riskMetrics.performanceVariance}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Tier Stability:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{riskMetrics.tierStability}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Market Exposure:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{riskMetrics.marketExposure}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Alerts & Recommendations</h3>
                  
                  <div className="space-y-3">
                    {riskMetrics.ltv.current > riskMetrics.ltv.maximum * 0.8 && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 rounded">
                        <div className="font-medium text-red-800 dark:text-red-400">High LTV Alert</div>
                        <div className="text-sm text-red-600 dark:text-red-300">
                          Current LTV ({riskMetrics.ltv.current}%) is approaching maximum ({riskMetrics.ltv.maximum}%). 
                          Consider reducing exposure or increasing collateral.
                        </div>
                      </div>
                    )}
                    
                    {riskMetrics.assetManagement.liquidationRisk > 70 && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 dark:border-orange-400 rounded">
                        <div className="font-medium text-orange-800 dark:text-orange-400">Liquidation Risk Warning</div>
                        <div className="text-sm text-orange-600 dark:text-orange-300">
                          Liquidation risk is high ({riskMetrics.assetManagement.liquidationRisk}%). 
                          Monitor market conditions closely.
                        </div>
                      </div>
                    )}
                    
                    {riskMetrics.performanceVariance > 20 && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-400 rounded">
                        <div className="font-medium text-yellow-800 dark:text-yellow-400">Performance Variance Alert</div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-300">
                          High performance variance ({riskMetrics.performanceVariance}%) detected. 
                          Review strategy consistency.
                        </div>
                      </div>
                    )}
                    
                    {!(riskMetrics.ltv.current > riskMetrics.ltv.maximum * 0.8) && 
                     !(riskMetrics.assetManagement.liquidationRisk > 70) && 
                     !(riskMetrics.performanceVariance > 20) && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400 rounded">
                        <div className="font-medium text-green-800 dark:text-green-400">All Systems Normal</div>
                        <div className="text-sm text-green-600 dark:text-green-300">
                          No immediate risk alerts. Agent performance is within acceptable parameters.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center text-gray-500 dark:text-gray-400">
                Select an agent to view risk metrics and performance data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}