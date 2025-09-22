import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OpportunityScore, ScoreBreakdown } from '@/services/scoring-service';

interface TrustScoreDisplayProps {
  score: OpportunityScore;
  showBreakdown?: boolean;
  showMetrics?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TrustScoreDisplay: React.FC<TrustScoreDisplayProps> = ({
  score,
  showBreakdown = false,
  showMetrics = false,
  size = 'md',
  className = ''
}) => {
  const getScoreColor = (totalScore: number) => {
    if (totalScore >= 90) return 'text-green-600 dark:text-green-400';
    if (totalScore >= 80) return 'text-blue-600 dark:text-blue-400';
    if (totalScore >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (totalScore >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadge = (totalScore: number) => {
    if (totalScore >= 90) return <StatusBadge status="success" text="⭐ Excellent" />;
    if (totalScore >= 80) return <StatusBadge status="success" text="✅ Good" />;
    if (totalScore >= 70) return <StatusBadge status="warning" text="⚠️ Fair" />;
    if (totalScore >= 60) return <StatusBadge status="warning" text="🔶 Poor" />;
    return <StatusBadge status="error" text="🚨 Very Poor" />;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          score: 'text-lg',
          breakdown: 'text-xs',
          metrics: 'text-xs'
        };
      case 'md':
        return {
          score: 'text-2xl',
          breakdown: 'text-sm',
          metrics: 'text-sm'
        };
      case 'lg':
        return {
          score: 'text-3xl',
          breakdown: 'text-base',
          metrics: 'text-base'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            🏆 Trust Score
            {getTrendIcon(score.trend)}
          </span>
          {getScoreBadge(score.currentScore.total)}
        </CardTitle>
        <CardDescription>
          {score.name} • Last updated: {new Date(score.lastUpdated).toLocaleDateString()}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Score Display */}
        <div className="text-center">
          <div className={`font-bold ${sizeClasses.score} ${getScoreColor(score.currentScore.total)}`}>
            {score.currentScore.total}/100
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {score.trend === 'up' && '↗️ Improving'}
            {score.trend === 'down' && '↘️ Declining'}
            {score.trend === 'stable' && '→ Stable'}
          </div>
        </div>

        {/* Score Breakdown */}
        {showBreakdown && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Score Breakdown</h4>
            
            {/* Performance */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>📊</span>
                <span className={sizeClasses.breakdown}>Performance</span>
              </span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(score.currentScore.performance / 40) * 100}%` }}
                  />
                </div>
                <span className={`font-medium ${sizeClasses.breakdown}`}>
                  {score.currentScore.performance}/40
                </span>
              </div>
            </div>

            {/* Reliability */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>🔄</span>
                <span className={sizeClasses.breakdown}>Reliability</span>
              </span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(score.currentScore.reliability / 40) * 100}%` }}
                  />
                </div>
                <span className={`font-medium ${sizeClasses.breakdown}`}>
                  {score.currentScore.reliability}/40
                </span>
              </div>
            </div>

            {/* Safety */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>🛡️</span>
                <span className={sizeClasses.breakdown}>Safety</span>
              </span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(score.currentScore.safety / 20) * 100}%` }}
                  />
                </div>
                <span className={`font-medium ${sizeClasses.breakdown}`}>
                  {score.currentScore.safety}/20
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Metrics */}
        {showMetrics && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Key Metrics</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className={`font-bold ${sizeClasses.metrics} text-green-600 dark:text-green-400`}>
                  {score.metrics.apy.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">APY</div>
              </div>
              
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className={`font-bold ${sizeClasses.metrics} text-blue-600 dark:text-blue-400`}>
                  {score.metrics.successRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
              
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className={`font-bold ${sizeClasses.metrics} text-purple-600 dark:text-purple-400`}>
                  {score.metrics.uptime.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Uptime</div>
              </div>
              
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className={`font-bold ${sizeClasses.metrics} text-orange-600 dark:text-orange-400`}>
                  {score.metrics.age}d
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Age</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                {score.metrics.auditStatus ? '✅' : '❌'}
                <span>Audited</span>
              </span>
              <span className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{score.metrics.incidentCount} incidents</span>
              </span>
            </div>
          </div>
        )}

        {/* Previous Score Comparison */}
        {score.previousScore && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Previous Score:</span>
              <span className={`font-medium ${getScoreColor(score.previousScore.total)}`}>
                {score.previousScore.total}/100
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Change:</span>
              <span className={`font-medium ${
                score.currentScore.total > score.previousScore.total 
                  ? 'text-green-600 dark:text-green-400' 
                  : score.currentScore.total < score.previousScore.total
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {score.currentScore.total > score.previousScore.total ? '+' : ''}
                {score.currentScore.total - score.previousScore.total}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
