'use client';

import { useState } from 'react';
import { Agent, CredibilityTier, AgentStatus } from '@/types/agent';
import { AgentCard } from './AgentCard';
import { StatsOverview } from './StatsOverview';

// Mock data for demonstration
const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'TradingBot Alpha',
    operator: '0x742d35Cc6640C178fFfbDD5B5e3d6480',
    metadata: {
      description: 'High-frequency trading agent for DeFi protocols',
      category: 'Trading',
      version: '2.1.0',
      tags: ['defi', 'trading', 'arbitrage'],
      provenance: {
        sourceCode: 'https://github.com/agent-dev/trading-alpha',
        verificationHash: '0xa1b2c3d4e5f6...',
        deploymentChain: 'Ethereum',
        lastAudit: new Date('2024-01-15')
      }
    },
    score: {
      overall: 87,
      provenance: 92,
      performance: 85,
      perception: 83,
      confidence: 89,
      lastUpdated: new Date()
    },
    credibilityTier: CredibilityTier.PLATINUM,
    status: AgentStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Oracle Sentinel',
    operator: '0x123e4567e89b12d3a456426614174000',
    metadata: {
      description: 'Real-time price oracle with ML predictions',
      category: 'Oracle',
      version: '1.8.2',
      tags: ['oracle', 'price-feed', 'ml'],
      provenance: {
        sourceCode: 'https://github.com/oracle-labs/sentinel',
        verificationHash: '0xb2c3d4e5f6a7...',
        deploymentChain: 'Arbitrum',
        lastAudit: new Date('2024-02-01')
      }
    },
    score: {
      overall: 76,
      provenance: 88,
      performance: 72,
      perception: 68,
      confidence: 78,
      lastUpdated: new Date()
    },
    credibilityTier: CredibilityTier.GOLD,
    status: AgentStatus.ACTIVE,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Yield Optimizer',
    operator: '0x456789abcdef0123456789abcdef0123',
    metadata: {
      description: 'Automated yield farming optimization',
      category: 'DeFi',
      version: '3.0.1',
      tags: ['yield', 'farming', 'optimization'],
      provenance: {
        sourceCode: 'https://github.com/yield-protocol/optimizer',
        verificationHash: '0xc3d4e5f6a7b8...',
        deploymentChain: 'Polygon',
      }
    },
    score: {
      overall: 65,
      provenance: 70,
      performance: 68,
      perception: 58,
      confidence: 72,
      lastUpdated: new Date()
    },
    credibilityTier: CredibilityTier.SILVER,
    status: AgentStatus.ACTIVE,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date()
  }
];

export function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success) {
        setAgents(data.data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const [selectedTier, setSelectedTier] = useState<string>('all');

  const filteredAgents = agents.filter(agent => {
    const categoryMatch = selectedCategory === 'all' || agent.metadata.category.toLowerCase() === selectedCategory;
    const tierMatch = selectedTier === 'all' || agent.credibilityTier === selectedTier;
    return categoryMatch && tierMatch;
  });

  const categories = ['all', ...new Set(agents.map(agent => agent.metadata.category.toLowerCase()))];
  const tiers = ['all', ...Object.values(CredibilityTier)];

  if (!isMounted) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <StatsOverview agents={agents} />

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Filter Agents</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Credibility Tier
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              {tiers.map(tier => (
                <option key={tier} value={tier}>
                  {tier === 'all' ? 'All Tiers' : tier.charAt(0).toUpperCase() + tier.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            No agents found matching the selected filters.
          </p>
        </div>
      )}
    </div>
  );
}
