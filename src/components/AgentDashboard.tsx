'use client';

import { useState, useEffect } from 'react';
import { Agent, CredibilityTier } from '@/types/agent';
import { AgentCard } from './AgentCard';
import { StatsOverview } from './StatsOverview';



export function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching agents...');
      const response = await fetch('/api/agents');
      const data = await response.json();
      console.log('Agents API response:', data);
      if (data.success) {
        setAgents(data.data);
        console.log('Agents set:', data.data);
      } else {
        console.error('API returned success: false:', data.error);
        setError(data.error || 'Failed to fetch agents');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Failed to fetch agents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('AgentDashboard mounted');
    setIsMounted(true);
    fetchAgents();
  }, []);

  useEffect(() => {
    console.log('Agents state changed:', agents);
  }, [agents]);

  useEffect(() => {
    console.log('Loading state changed:', isLoading);
  }, [isLoading]);

  useEffect(() => {
    console.log('Error state changed:', error);
  }, [error]);

  console.log('AgentDashboard render - agents:', agents.length, 'isLoading:', isLoading, 'isMounted:', isMounted);

  // Simple test version - just show the data
  if (!isMounted || isLoading) {
    return <div className="text-center py-12">Loading... (agents: {agents.length})</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={fetchAgents}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Simple display for now
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
        <div className="space-y-2">
          <p>Total Agents: {agents.length}</p>
          <p>Is Loading: {isLoading.toString()}</p>
          <p>Is Mounted: {isMounted.toString()}</p>
          <p>Error: {error || 'None'}</p>
        </div>
      </div>

      {agents.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Agents Found</h2>
          <div className="space-y-2">
            {agents.map(agent => (
              <div key={agent.id} className="p-3 bg-gray-50 rounded">
                <p><strong>Name:</strong> {agent.name}</p>
                <p><strong>Category:</strong> {agent.metadata.category}</p>
                <p><strong>Tier:</strong> {agent.credibilityTier}</p>
                <p><strong>Status:</strong> {agent.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {agents.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            No agents found. This might indicate an issue with data fetching.
          </p>
        </div>
      )}
    </div>
  );
}
