'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent } from '@/types/agent';
import { ScoringDashboard } from '@/components/ScoringDashboard';

export default function ScoringPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

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

  useEffect(() => {
    setIsMounted(true);
    fetchAgents();
  }, [fetchAgents]);

  if (!isMounted) {
    return <div className="p-6">Loading...</div>;
  }

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Scoring System</h1>
          <p className="mt-2 text-gray-600">
            Enhanced multi-factor scoring with provenance, performance, and perception analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Agent Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Select Agent</h2>
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
                    <div className="font-medium text-gray-900">{agent.name}</div>
                    <div className="text-sm text-gray-600">{agent.metadata.description}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        Tier: {agent.credibilityTier}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        agent.score.overall >= 90 ? 'bg-green-100 text-green-800' :
                        agent.score.overall >= 80 ? 'bg-blue-100 text-blue-800' :
                        agent.score.overall >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        agent.score.overall >= 60 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {agent.score.overall}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scoring Overview */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Scoring Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Agents</span>
                  <span className="font-medium">{agents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">High Score (90+)</span>
                  <span className="font-medium text-green-600">
                    {agents.filter(a => a.score.overall >= 90).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Good Score (80-89)</span>
                  <span className="font-medium text-blue-600">
                    {agents.filter(a => a.score.overall >= 80 && a.score.overall < 90).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Score (70-79)</span>
                  <span className="font-medium text-yellow-600">
                    {agents.filter(a => a.score.overall >= 70 && a.score.overall < 80).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Low Score (<70)</span>
                  <span className="font-medium text-red-600">
                    {agents.filter(a => a.score.overall < 70).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Scoring Algorithm Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Scoring Algorithm</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Provenance</span>
                  <span className="font-medium">35%</span>
                </div>
                <div className="flex justify-between">
                  <span>Performance</span>
                  <span className="font-medium">30%</span>
                </div>
                <div className="flex justify-between">
                  <span>Perception</span>
                  <span className="font-medium">20%</span>
                </div>
                <div className="flex justify-between">
                  <span>Verification</span>
                  <span className="font-medium">15%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Confidence calculation includes data quality, scoring consistency, verification coverage, and historical stability.
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedAgent ? (
              <ScoringDashboard agents={agents} />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                Select an agent to view enhanced scoring details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
