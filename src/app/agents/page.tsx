'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Agent } from '@/types/agent';

type ReputationSummary = {
  agentId: string;
  currentOverall: number;
  trend24h: number;
  lastUpdated: string;
  breakdown: { provenance: number; performance: number; perception: number };
  totalsByType: Record<string, number>;
  eventsCount: number;
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReputationSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const selectedAgent = useMemo(() => agents.find(a => a.id === selectedAgentId) ?? null, [agents, selectedAgentId]);

  useEffect(() => {
    let cancelled = false;
    async function loadAgents() {
      try {
        setLoadingAgents(true);
        const res = await fetch('/api/agents');
        const json = await res.json();
        if (!cancelled && json?.success) {
          setAgents(json.data);
          if (json.data.length && !selectedAgentId) setSelectedAgentId(json.data[0].id);
        }
      } finally {
        if (!cancelled) setLoadingAgents(false);
      }
    }
    loadAgents();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadSummary(agentId: string) {
      try {
        setLoadingSummary(true);
        const res = await fetch(`/api/agentbeat?agentId=${encodeURIComponent(agentId)}`);
        const json = await res.json();
        if (!cancelled && json?.success) setSummary(json.data);
      } finally {
        if (!cancelled) setLoadingSummary(false);
      }
    }
    if (selectedAgentId) loadSummary(selectedAgentId);
    else setSummary(null);
    return () => {
      cancelled = true;
    };
  }, [selectedAgentId]);

  async function sendEvent(type: string, impact: number, weight?: number) {
    if (!selectedAgentId) return;
    const res = await fetch('/api/agentbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: selectedAgentId, type, impact, weight })
    });
    const json = await res.json();
    if (json?.success) setSummary(json.data.summary);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">AgentBeat</h1>
          <p className="text-slate-600 dark:text-slate-300">Agent scoring and reputation tracking system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Agents</h2>
              {loadingAgents && <span className="text-xs text-slate-500">Loading…</span>}
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {agents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedAgentId === agent.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="font-medium text-slate-900 dark:text-slate-100">{agent.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Tier: {agent.credibilityTier.toUpperCase()} • Score: {agent.score.overall}
                  </div>
                </button>
              ))}
              {!agents.length && !loadingAgents && (
                <div className="text-sm text-slate-500">No agents</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Reputation Summary</h2>
                  {selectedAgent && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">{selectedAgent.name}</div>
                  )}
                </div>
                {loadingSummary && <span className="text-xs text-slate-500">Refreshing…</span>}
              </div>
              {summary ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <Metric title="Overall" value={summary.currentOverall} suffix="" highlight />
                  <Metric title="Provenance" value={summary.breakdown.provenance} />
                  <Metric title="Performance" value={summary.breakdown.performance} />
                  <Metric title="Perception" value={summary.breakdown.perception} />
                </div>
              ) : (
                <div className="text-sm text-slate-500 mt-4">Select an agent to view summary</div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-md font-semibold mb-3">Quick Reputation Events</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => sendEvent('performance', 5)} className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm">+5 Performance</button>
                <button onClick={() => sendEvent('verification', 6)} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">+6 Verification</button>
                <button onClick={() => sendEvent('incident', -10)} className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm">-10 Incident</button>
                <button onClick={() => sendEvent('peer_feedback', 4)} className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm">+4 Peer Feedback</button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Events immediately update the scoring breakdown and overall.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value, suffix = '', highlight = false }: { title: string; value: number; suffix?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-4 ${highlight ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-slate-50 dark:bg-slate-700'}`}>
      <div className="text-xs text-slate-500 dark:text-slate-300">{title}</div>
      <div className={`text-2xl font-bold ${highlight ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'}`}>{Math.round(value)}{suffix}</div>
    </div>
  );
}


