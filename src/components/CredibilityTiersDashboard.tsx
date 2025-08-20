'use client';

import { useState, useEffect } from 'react';
import { Agent, CredibilityTier } from '@/types/agent';
import { 
  CREDIBILITY_TIERS, 
  calculateTierBenefits, 
  compareAgentTiers 
} from '../lib/credibility-tiers';

interface CredibilityTiersDashboardProps {
  agents: Agent[];
}

interface TierComparisonData {
  tierDistribution: { [key in CredibilityTier]: number };
  averageScores: { [key in CredibilityTier]: number };
  tierPerformance: { [key in CredibilityTier]: { avgLTV: number; avgScore: number } };
}

export function CredibilityTiersDashboard({ agents }: CredibilityTiersDashboardProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [tierComparison, setTierComparison] = useState<TierComparisonData | null>(null);
  const [selectedTier, setSelectedTier] = useState<CredibilityTier | null>(null);

  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgent]);

  useEffect(() => {
    if (agents.length > 0) {
      const comparison = compareAgentTiers(agents);
      setTierComparison(comparison);
    }
  }, [agents]);

  const getTierColor = (tier: CredibilityTier) => {
    const colors = {
      [CredibilityTier.BRONZE]: 'bg-orange-100 text-orange-800 border-orange-200',
      [CredibilityTier.SILVER]: 'bg-gray-100 text-gray-800 border-gray-200',
      [CredibilityTier.GOLD]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [CredibilityTier.PLATINUM]: 'bg-slate-100 text-slate-800 border-slate-200',
      [CredibilityTier.DIAMOND]: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    };
    return colors[tier] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTierGradient = (tier: CredibilityTier) => {
    const gradients = {
      [CredibilityTier.BRONZE]: 'from-orange-400 to-orange-600',
      [CredibilityTier.SILVER]: 'from-gray-400 to-gray-600',
      [CredibilityTier.GOLD]: 'from-yellow-400 to-yellow-600',
      [CredibilityTier.PLATINUM]: 'from-slate-400 to-slate-600',
      [CredibilityTier.DIAMOND]: 'from-cyan-400 to-cyan-600'
    };
    return gradients[tier] || 'from-gray-400 to-gray-600';
  };

  if (!selectedAgent || !tierComparison) {
    return <div className="p-6 text-center text-gray-500">Loading credibility tiers data...</div>;
  }

  const agentTierInfo = calculateTierBenefits(selectedAgent);

  return (
    <div className="space-y-6">
      {/* Agent Tier Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedAgent.name}</h2>
            <p className="text-gray-600">{selectedAgent.metadata.description}</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${getTierColor(agentTierInfo.currentTier)}`}>
              <span className="text-2xl mr-2">{CREDIBILITY_TIERS[agentTierInfo.currentTier].emoji}</span>
              {CREDIBILITY_TIERS[agentTierInfo.currentTier].name}
            </div>
            <div className="text-sm text-gray-500 mt-1">Current Tier</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{agentTierInfo.maxLTV}%</div>
            <div className="text-sm text-blue-600">Maximum LTV</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{selectedAgent.score.overall}</div>
            <div className="text-sm text-green-600">Overall Score</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {agentTierInfo.upgradePath.nextTier ? 'Available' : 'Max Tier'}
            </div>
            <div className="text-sm text-purple-600">Upgrade Status</div>
          </div>
        </div>
      </div>

      {/* Tier Benefits */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Current Tier Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Requirements Met</h4>
            <ul className="space-y-1">
              {CREDIBILITY_TIERS[agentTierInfo.currentTier].requirements.map((req, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
            <ul className="space-y-1">
              {agentTierInfo.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Upgrade Path */}
      {agentTierInfo.upgradePath.nextTier && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Upgrade to {CREDIBILITY_TIERS[agentTierInfo.upgradePath.nextTier].name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
              <ul className="space-y-2">
                {agentTierInfo.upgradePath.requirements.map((req, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Upgrade Timeline</h4>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{agentTierInfo.upgradePath.estimatedTime}</div>
                <div className="text-sm text-gray-600">Estimated Time</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tier Distribution Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Tier Distribution</h3>
        <div className="space-y-4">
          {Object.entries(tierComparison.tierDistribution).map(([tier, count]) => {
            const tierKey = tier as CredibilityTier;
            const percentage = agents.length > 0 ? (count / agents.length) * 100 : 0;
            const isSelected = selectedTier === tierKey;
            
            return (
              <div 
                key={tier}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTier(isSelected ? null : tierKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{CREDIBILITY_TIERS[tierKey].emoji}</span>
                    <div>
                      <div className="font-medium text-gray-900">{CREDIBILITY_TIERS[tierKey].name}</div>
                      <div className="text-sm text-gray-600">{CREDIBILITY_TIERS[tierKey].description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${getTierGradient(tierKey)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Tier details when selected */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Tier Stats</h5>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Max LTV: {CREDIBILITY_TIERS[tierKey].maxLTV}%</div>
                          <div>Score Range: {CREDIBILITY_TIERS[tierKey].minScore}-{CREDIBILITY_TIERS[tierKey].maxScore}</div>
                          <div>Average Score: {tierComparison.averageScores[tierKey].toFixed(1)}</div>
                          <div>Average LTV: {tierComparison.tierPerformance[tierKey].avgLTV.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Requirements</h5>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {CREDIBILITY_TIERS[tierKey].requirements.map((req, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier Comparison Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Tier Comparison</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max LTV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score Range</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agents</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg LTV</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(CREDIBILITY_TIERS).map(([tier, tierInfo]) => {
                const tierKey = tier as CredibilityTier;
                const count = tierComparison.tierDistribution[tierKey];
                const avgScore = tierComparison.averageScores[tierKey];
                const avgLTV = tierComparison.tierPerformance[tierKey].avgLTV;
                
                return (
                  <tr key={tier} className={tierKey === agentTierInfo.currentTier ? 'bg-blue-50' : ''}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{tierInfo.emoji}</span>
                        <span className="font-medium text-gray-900">{tierInfo.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {tierInfo.maxLTV}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {tierInfo.minScore}-{tierInfo.maxScore}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {count}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {avgScore.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {avgLTV.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
