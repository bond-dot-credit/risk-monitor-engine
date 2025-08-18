'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Agent } from '@/types/agent';

type RiskMetrics = {
  volatility: number;
  liquidationRisk: number;
  performanceVariance: number;
  tierStability: number;
  marketExposure: number;
};

export default function RiskMonitorPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [risk, setRisk] = useState<RiskMetrics | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadAgents() {
      const res = await fetch('/api/agents');
      const json = await res.json();
      if (!cancelled && json?.success) {
        setAgents(json.data);
        if (!selectedAgentId && json.data?.length) setSelectedAgentId(json.data[0].id);
      }
    }
    loadAgents();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let eventSource: EventSource | null = null;

    async function loadRiskOnce(id: string) {
      const res = await fetch(`/api/risk?agentId=${encodeURIComponent(id)}`);
      const json = await res.json();
      if (!cancelled && json?.success) setRisk(json.data);
    }

    function startStream(id: string) {
      eventSource = new EventSource(`/api/risk/stream?agentId=${encodeURIComponent(id)}`);
      eventSource.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          if (payload?.risk && !cancelled) setRisk(payload.risk);
        } catch {}
      };
    }

    if (selectedAgentId) {
      loadRiskOnce(selectedAgentId);
      startStream(selectedAgentId);
    } else {
      setRisk(null);
    }

    return () => {
      cancelled = true;
      if (eventSource) eventSource.close();
    };
  }, [selectedAgentId]);

  const selectedAgent = useMemo(() => agents.find(a => a.id === selectedAgentId) ?? null, [agents, selectedAgentId]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Risk Monitor</h1>
          <p className="text-slate-600 dark:text-slate-300">Real-time risk assessment and monitoring</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Agents</h2>
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
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Risk Snapshot</h2>
                  {selectedAgent && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">{selectedAgent.name}</div>
                  )}
                </div>
              </div>
              {risk ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                  <Metric title="Volatility" value={risk.volatility} suffix="%" />
                  <Metric title="Liquidation Risk" value={risk.liquidationRisk} suffix="%" />
                  <Metric title="Perf Variance" value={risk.performanceVariance} />
                  <Metric title="Tier Stability" value={risk.tierStability} suffix="%" />
                  <Metric title="Market Exposure" value={risk.marketExposure} suffix="%" />
                </div>
              ) : (
                <div className="text-sm text-slate-500 mt-4">Select an agent to view risk metrics</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value, suffix = '' }: { title: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-lg p-4 bg-slate-50 dark:bg-slate-700">
      <div className="text-xs text-slate-500 dark:text-slate-300">{title}</div>
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{Math.round(value)}{suffix}</div>
    </div>
  );
}


