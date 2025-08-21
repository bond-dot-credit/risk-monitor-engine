'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent, VerificationStatus } from '@/types/agent';
import { VerificationDashboard } from '@/components/VerificationDashboard';

export default function VerificationPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Credibility Verification</h1>
          <p className="mt-2 text-gray-600">
            Multi-factor agent verification and scoring system
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
                        agent.verification === VerificationStatus.PASSED ? 'bg-green-100 text-green-800' :
                          agent.verification === VerificationStatus.IN_PROGRESS ? 'bg-yellow-100 text-yellow-800' :
                          agent.verification === VerificationStatus.FAILED ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                          {String(agent.verification).replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Verification Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Agents</span>
                  <span className="font-medium">{agents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Verified</span>
                  <span className="font-medium text-green-600">
                    {agents.filter(a => a.verification === VerificationStatus.PASSED).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="font-medium text-yellow-600">
                    {agents.filter(a => a.verification === VerificationStatus.IN_PROGRESS).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Failed</span>
                  <span className="font-medium text-red-600">
                    {agents.filter(a => a.verification === VerificationStatus.FAILED).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedAgent ? (
              <VerificationDashboard agents={agents} />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                Select an agent to view verification details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
