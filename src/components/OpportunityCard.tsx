'use client';

interface Opportunity {
  id: number;
  name: string;
  description: string;
  apy: number;
  trustScore: number;
  performance: number;
  reliability: number;
  safety: number;
  totalScore: number;
  riskLevel: string;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  isConnected: boolean;
  onDeposit?: (opportunityId: number) => void;
  onAllocate?: (opportunityId: number) => void;
  onWithdraw?: (opportunityId: number) => void;
}

export function OpportunityCard({ opportunity, isConnected, onDeposit, onAllocate, onWithdraw }: OpportunityCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {opportunity.name}
          </h3>
          <p className="text-slate-800 dark:text-slate-300 text-sm leading-relaxed">
            {opportunity.description}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreBgColor(opportunity.totalScore)} ${getScoreColor(opportunity.totalScore)}`}>
          {opportunity.riskLevel}
        </div>
      </div>

      {/* APY */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-400">APY</span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {opportunity.apy}%
          </span>
        </div>
      </div>

      {/* Trust Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-400">Trust Score</span>
          <span className={`text-lg font-bold ${getScoreColor(opportunity.totalScore)}`}>
            {opportunity.totalScore}/100
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              opportunity.totalScore >= 80 ? 'bg-green-500' : 
              opportunity.totalScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${opportunity.totalScore}%` }}
          ></div>
        </div>
      </div>

      {/* Scoring Breakdown */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-800 dark:text-slate-400">Performance</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {opportunity.performance}/40
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-800 dark:text-slate-400">Reliability</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {opportunity.reliability}/40
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-800 dark:text-slate-400">Safety</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {opportunity.safety}/20
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {isConnected ? (
        <div className="space-y-2">
          <button 
            onClick={() => onDeposit?.(opportunity.id)}
            className="w-full py-2 px-4 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            📥 Deposit
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onAllocate?.(opportunity.id)}
              className="py-2 px-3 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
            >
              🔄 Allocate
            </button>
            <button 
              onClick={() => onWithdraw?.(opportunity.id)}
              className="py-2 px-3 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
            >
              📤 Withdraw
            </button>
          </div>
        </div>
      ) : (
        <button 
          className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          disabled
        >
          Connect Wallet to Allocate
        </button>
      )}
    </div>
  );
}
