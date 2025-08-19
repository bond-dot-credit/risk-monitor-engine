'use client';

import { useState, useEffect } from 'react';
import { Agent } from '@/types/agent';
import { ReputationEvent, ReputationEventType } from '@/types/reputation';
import { ReputationSummary } from '@/types/reputation';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [reputationSummary, setReputationSummary] = useState<ReputationSummary | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgentId) {
      fetchReputationSummary(selectedAgentId);
    }
  }, [selectedAgentId]);

  const fetchAgents = async () => {
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
  };

  const fetchReputationSummary = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agentbeat?agentId=${agentId}`);
      const data = await response.json();
      setReputationSummary(data);
    } catch (error) {
      console.error('Error fetching reputation summary:', error);
    }
  };

  const postReputationEvent = async (event: Omit<ReputationEvent, 'id' | 'timestamp'>) => {
    try {
      const response = await fetch('/api/agentbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Refresh reputation summary
        if (selectedAgentId) {
          fetchReputationSummary(selectedAgentId);
        }
      }
    } catch (error) {
      console.error('Error posting reputation event:', error);
    }
  };

  if (!isMounted) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">AgentBeat: Agent Reputation & Scoring</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Selection */}
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
                  <div className="text-sm text-gray-600">{agent.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Status: {agent.status} • Uptime: {agent.metadata.uptime}%
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reputation Summary */}
        <div className="lg:col-span-2">
          {reputationSummary ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Reputation Summary for {agents.find(a => a.id === selectedAgentId)?.name}
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{reputationSummary.totalEvents}</div>
                  <div className="text-sm text-gray-600">Total Events</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{reputationSummary.positiveEvents}</div>
                  <div className="text-sm text-gray-600">Positive</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{reputationSummary.negativeEvents}</div>
                  <div className="text-sm text-gray-600">Negative</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{reputationSummary.trend}</div>
                  <div className="text-sm text-gray-600">Trend</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Score Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(reputationSummary.breakdown).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize">{key}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{value.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Recent Events</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {reputationSummary.recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        event.impact > 0
                          ? 'border-l-green-500 bg-green-50'
                          : 'border-l-red-500 bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{event.type.replace(/_/g, ' ')}</div>
                          <div className="text-sm text-gray-600">{event.description}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${event.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {event.impact > 0 ? '+' : ''}{event.impact}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              Select an agent to view reputation summary
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
