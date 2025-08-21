'use client';

import { useState, useEffect } from 'react';
import { Agent, VerificationType, VerificationStatus, RiskLevel } from '@/types/agent';

interface VerificationDashboardProps {
  agents: Agent[];
  selectedAgentId?: string;
}

export function VerificationDashboard({ agents, selectedAgentId }: VerificationDashboardProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (selectedAgentId) {
      const agent = agents.find(a => a.id === selectedAgentId);
      setSelectedAgent(agent || null);
    } else if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgentId, selectedAgent]);

  const getVerificationStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.PASSED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case VerificationStatus.FAILED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case VerificationStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case VerificationStatus.EXPIRED:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      case VerificationStatus.PENDING:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case RiskLevel.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case RiskLevel.HIGH:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case RiskLevel.CRITICAL:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getVerificationTypeIcon = (type: VerificationType) => {
    const icons = {
      [VerificationType.CODE_AUDIT]: '🔍',
      [VerificationType.PENETRATION_TEST]: '🛡️',
      [VerificationType.PERFORMANCE_BENCHMARK]: '📊',
      [VerificationType.SECURITY_ASSESSMENT]: '🔒',
      [VerificationType.COMPLIANCE_CHECK]: '📋',
      [VerificationType.REPUTATION_VERIFICATION]: '⭐',
      [VerificationType.ON_CHAIN_ANALYSIS]: '⛓️',
      [VerificationType.SOCIAL_PROOF]: '👥'
    };
    return icons[type] || '❓';
  };

  const calculateOverallVerificationScore = (agent: Agent) => {
    const methods = agent?.metadata?.verificationMethods || [];
    if (methods.length === 0) {
      return 0;
    }

    const passedMethods = methods.filter(method => method.status === VerificationStatus.PASSED);
    if (passedMethods.length === 0) {
      return 0;
    }

    const totalScore = passedMethods.reduce((sum, method) => sum + (method.score || 0), 0);
    return Math.round(totalScore / passedMethods.length);
  };

  if (!selectedAgent) {
    return (
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
          <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-500 dark:text-slate-400">Select an agent to view verification details</p>
      </div>
    );
  }

  const overallScore = calculateOverallVerificationScore(selectedAgent);
  const verificationMethods = selectedAgent?.metadata?.verificationMethods || [];
  const passedVerifications = verificationMethods.filter(
    m => m?.status === VerificationStatus.PASSED
  ).length;
  const totalVerifications = verificationMethods.length;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Agent Overview */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-4 sm:p-5 lg:p-6 xl:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
          <div className="mb-3 sm:mb-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 dark:text-slate-100">{selectedAgent.name}</h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">{selectedAgent.metadata.description}</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{overallScore}%</div>
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Verification Score</div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="text-center p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-lg sm:rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:shadow-md transition-shadow duration-200">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100">{totalVerifications}</div>
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Total Methods</div>
          </div>
          <div className="text-center p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg sm:rounded-xl border border-green-200/50 dark:border-green-600/30 hover:shadow-md transition-shadow duration-200">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">{passedVerifications}</div>
            <div className="text-xs sm:text-sm text-green-600/70 dark:text-green-400/70 mt-1">Passed</div>
          </div>
          <div className="text-center p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-lg sm:rounded-xl border border-yellow-200/50 dark:border-yellow-600/30 hover:shadow-md transition-shadow duration-200">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {totalVerifications - passedVerifications}
            </div>
            <div className="text-xs sm:text-sm text-yellow-600/70 dark:text-yellow-400/70 mt-1">Pending/Failed</div>
          </div>
          <div className="text-center p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg sm:rounded-xl border border-blue-200/50 dark:border-blue-600/30 hover:shadow-md transition-shadow duration-200">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalVerifications > 0 ? Math.round((passedVerifications / totalVerifications) * 100) : 0}%
            </div>
            <div className="text-xs sm:text-sm text-blue-600/70 dark:text-blue-400/70 mt-1">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Verification Methods */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-4 sm:p-5 lg:p-6 xl:p-8">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 text-slate-900 dark:text-slate-100">Verification Methods</h3>
        {verificationMethods.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
              <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Verification Methods</h4>
            <p className="text-slate-500 dark:text-slate-400">This agent has no verification methods configured yet.</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {verificationMethods.map((method) => (
            <div key={method.id} className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-2 sm:mb-0">
                  <span className="text-2xl sm:text-3xl">{getVerificationTypeIcon(method.type)}</span>
                  <div>
                    <div className="font-medium text-sm sm:text-base lg:text-lg text-slate-900 dark:text-slate-100">
                      {method.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Score: <span className="font-semibold">{method.score}/100</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getVerificationStatusColor(method.status)} dark:bg-opacity-20`}>
                    {method.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  {method.details?.riskLevel && (
                    <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getRiskLevelColor(method.details.riskLevel)} dark:bg-opacity-20`}>
                      {method.details.riskLevel.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {method?.details && (
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                  {method.details.auditor && (
                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-900 dark:text-slate-100">Auditor:</span> {method.details.auditor}
                    </div>
                  )}
                  {method.details.methodology && (
                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-900 dark:text-slate-100">Methodology:</span> {method.details.methodology}
                    </div>
                  )}
                  {method.details.findings && Array.isArray(method.details.findings) && method.details.findings.length > 0 && (
                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-900 dark:text-slate-100">Findings:</span>
                      <ul className="list-disc list-inside ml-2 mt-1 sm:mt-2 space-y-1">
                        {method.details.findings.map((finding: string, index: number) => (
                          <li key={index} className="text-xs sm:text-sm">{finding}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {method.details.recommendations && Array.isArray(method.details.recommendations) && method.details.recommendations.length > 0 && (
                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-900 dark:text-slate-100">Recommendations:</span>
                      <ul className="list-disc list-inside ml-2 mt-1 sm:mt-2 space-y-1">
                        {method.details.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-xs sm:text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-600">
                <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400 space-y-1 sm:space-y-0">
                  <span>Last Verified: <span className="font-medium">{new Date(method.lastVerified).toLocaleDateString()}</span></span>
                  <span>Next Due: <span className="font-medium">{new Date(method.nextVerificationDue).toLocaleDateString()}</span></span>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
