'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent } from '@/types/agent';
import { RiskMetrics } from '@/types/credit';

export default function RiskPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      setAgents(data);
      if (data.length > 0 && !selectedAgentId) {
        setSelectedAgentId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
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
        const data = await response.json();
        setRiskMetrics(data);
      } else {
        console.error('Failed to fetch risk metrics');
      }
    } catch (error) {
      console.error('Error fetching risk metrics:', error);
    }
  };

  if (!isMounted) {
    return <div className="p-6">Loading...</div>;
  }

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Risk Monitor: Agent Performance & Risk Assessment</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Select Agent</h2>
            <div className="space-y-2">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedAgentId === agent.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-sm text-gray-600">{agent.metadata.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
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
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Performance Overview: {selectedAgent.name}
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedAgent.score.overall}</div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedAgent.score.performance}</div>
                    <div className="text-sm text-gray-600">Performance Score</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{selectedAgent.score.provenance}</div>
                    <div className="text-sm text-gray-600">Provenance Score</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedAgent.score.perception}</div>
                    <div className="text-sm text-gray-600">Perception Score</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">LTV & Credit Analysis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Current LTV Status</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Current LTV:</span>
                        <span className="font-medium">{riskMetrics.ltv.current}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maximum LTV:</span>
                        <span className="font-medium">{riskMetrics.ltv.maximum}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LTV Utilization:</span>
                        <span className="font-medium">
                          {((riskMetrics.ltv.current / riskMetrics.ltv.maximum) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Level:</span>
                        <span className={`font-medium px-2 py-1 rounded text-xs ${
                          riskMetrics.ltv.current > riskMetrics.ltv.maximum * 0.8 
                            ? 'bg-red-100 text-red-800' 
                            : riskMetrics.ltv.current > riskMetrics.ltv.maximum * 0.6
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
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
                    <h4 className="font-medium mb-3">Credit Line Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Available Credit:</span>
                        <span className="font-medium">${riskMetrics.creditLine.available.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Used Credit:</span>
                        <span className="font-medium">${riskMetrics.creditLine.used.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Credit:</span>
                        <span className="font-medium">${riskMetrics.creditLine.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>APR Rate:</span>
                        <span className="font-medium">{riskMetrics.creditLine.apr}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Asset Management & Performance</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Asset Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Assets Under Management:</span>
                        <span className="font-medium">${riskMetrics.assetManagement.aum.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Asset Diversity Score:</span>
                        <span className="font-medium">{riskMetrics.assetManagement.diversityScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Liquidation Risk:</span>
                        <span className={`font-medium px-2 py-1 rounded text-xs ${
                          riskMetrics.assetManagement.liquidationRisk > 70 
                            ? 'bg-red-100 text-red-800' 
                            : riskMetrics.assetManagement.liquidationRisk > 40
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
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
                    <h4 className="font-medium mb-3">Performance Variance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Performance Variance:</span>
                        <span className="font-medium">{riskMetrics.performanceVariance}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tier Stability:</span>
                        <span className="font-medium">{riskMetrics.tierStability}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Market Exposure:</span>
                        <span className="font-medium">{riskMetrics.marketExposure}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Risk Alerts & Recommendations</h3>
                
                <div className="space-y-3">
                  {riskMetrics.ltv.current > riskMetrics.ltv.maximum * 0.8 && (
                    <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                      <div className="font-medium text-red-800">High LTV Alert</div>
                      <div className="text-sm text-red-600">
                        Current LTV ({riskMetrics.ltv.current}%) is approaching maximum ({riskMetrics.ltv.maximum}%). 
                        Consider reducing exposure or increasing collateral.
                      </div>
                    </div>
                  )}
                  
                  {riskMetrics.assetManagement.liquidationRisk > 70 && (
                    <div className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
                      <div className="font-medium text-orange-800">Liquidation Risk Warning</div>
                      <div className="text-sm text-orange-600">
                        Liquidation risk is high ({riskMetrics.assetManagement.liquidationRisk}%). 
                        Monitor market conditions closely.
                      </div>
                    </div>
                  )}
                  
                  {riskMetrics.performanceVariance > 20 && (
                    <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                      <div className="font-medium text-yellow-800">Performance Variance Alert</div>
                      <div className="text-sm text-yellow-600">
                        High performance variance ({riskMetrics.performanceVariance}%) detected. 
                        Review strategy consistency.
                      </div>
                    </div>
                  )}
                  
                  {!(riskMetrics.ltv.current > riskMetrics.ltv.maximum * 0.8) && 
                   !(riskMetrics.assetManagement.liquidationRisk > 70) && 
                   !(riskMetrics.performanceVariance > 20) && (
                    <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                      <div className="font-medium text-green-800">All Systems Normal</div>
                      <div className="text-sm text-green-600">
                        No immediate risk alerts. Agent performance is within acceptable parameters.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              Select an agent to view risk metrics and performance data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


