'use client';

import { Agent, CredibilityTier } from '@/types/agent';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const getTierColor = (tier: CredibilityTier) => {
    switch (tier) {
      case CredibilityTier.DIAMOND: return 'text-cyan-600 bg-cyan-50';
      case CredibilityTier.PLATINUM: return 'text-slate-600 bg-slate-50';
      case CredibilityTier.GOLD: return 'text-yellow-600 bg-yellow-50';
      case CredibilityTier.SILVER: return 'text-gray-600 bg-gray-50';
      case CredibilityTier.BRONZE: return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
            {agent.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {agent.metadata.category}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(agent.credibilityTier)}`}>
            {agent.credibilityTier.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
            {agent.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        {agent.metadata.description}
      </p>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {agent.score.overall}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Overall Score</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">
            {agent.score.provenance}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Provenance Score</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">Provenance</span>
          <span className="text-xs font-medium">{agent.score.provenance}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1">
          <div 
            className="bg-blue-600 h-1 rounded-full" 
            style={{ width: `${agent.score.provenance}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">Performance</span>
          <span className="text-xs font-medium">{agent.score.performance}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1">
          <div 
            className="bg-green-600 h-1 rounded-full" 
            style={{ width: `${agent.score.performance}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">Perception</span>
          <span className="text-xs font-medium">{agent.score.perception}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1">
          <div 
            className="bg-purple-600 h-1 rounded-full" 
            style={{ width: `${agent.score.perception}%` }}
          ></div>
        </div>
      </div>

      {/* Metadata */}
      <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>v{agent.metadata.version}</span>
          <span>Confidence: {agent.score.confidence}%</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {agent.metadata.tags.slice(0, 3).map(tag => (
            <span 
              key={tag}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
