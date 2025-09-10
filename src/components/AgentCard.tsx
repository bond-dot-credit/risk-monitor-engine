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
    <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 xl:p-7 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 lg:mb-5">
        <div className="flex-1 min-w-0 pr-2 sm:pr-3">
          <h3 className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl text-slate-900 dark:text-slate-100 truncate leading-tight">
            {agent.name}
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 truncate mt-0.5 sm:mt-1">
            {agent.metadata.category}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-1 sm:space-y-1.5 flex-shrink-0">
          <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-2.5 md:py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${getTierColor(agent.credibilityTier)} shadow-sm`}>
            {agent.credibilityTier}
          </span>
          <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-2.5 md:py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${getStatusColor(agent.status)} shadow-sm`}>
            {agent.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 mb-3 sm:mb-4 lg:mb-5 line-clamp-2 leading-relaxed">
        {agent.metadata.description}
      </p>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-5 mb-3 sm:mb-4 lg:mb-5">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-lg md:rounded-xl p-2 sm:p-3 md:p-4 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-sm transition-shadow duration-200">
          <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-none">
            {agent.score.overall}
          </div>
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">Overall</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg md:rounded-xl p-2 sm:p-3 md:p-4 border border-blue-200/50 dark:border-blue-600/30 hover:shadow-sm transition-shadow duration-200">
          <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-blue-600 dark:text-blue-400 leading-none">
            {agent.score.provenance}
          </div>
          <div className="text-xs sm:text-sm text-blue-600/70 dark:text-blue-400/70 mt-1 sm:mt-1.5">Provenance</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Performance</span>
          <span className="text-xs font-semibold text-green-600 dark:text-green-400">{agent.score.performance}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 sm:h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${agent.score.performance}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Perception</span>
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">{agent.score.perception}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 sm:h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${agent.score.perception}%` }}
          ></div>
        </div>
      </div>

      {/* Metadata */}
      <div className="border-t border-slate-200/70 dark:border-slate-600/70 pt-3 sm:pt-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 sm:mb-3">
          <span className="font-medium">v{agent.metadata.version}</span>
          <span className="font-medium">
            <span className="hidden sm:inline">Confidence: </span>
            <span className="sm:hidden">Conf: </span>
            {agent.score.confidence}%
          </span>
        </div>
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          {agent.metadata.tags.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium truncate max-w-[80px] sm:max-w-none"
              title={tag}
            >
              {tag}
            </span>
          ))}
          {agent.metadata.tags.length > 2 && (
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400 rounded-md text-xs font-medium">
              +{agent.metadata.tags.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
