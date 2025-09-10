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
    <div className="space-y-6 lg:space-y-8">
      {/* Enhanced Agent Overview Header */}
      <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-indigo-400/20 p-6 sm:p-8 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100">{selectedAgent.name}</h2>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{selectedAgent.metadata.description}</p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${getVerificationStatusColor(selectedAgent.verification)}`}>
                {String(selectedAgent.verification).replace('_', ' ')}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Tier: <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedAgent.credibilityTier}</span>
              </span>
            </div>
          </div>
          
          {/* Score Display */}
          <div className="text-center lg:text-right">
            <div className="relative inline-block">
              <div className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {overallScore}%
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl -z-10"></div>
            </div>
            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">Overall Verification Score</div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="group text-center p-6 bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-600/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {totalVerifications}
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Methods</div>
          </div>
          
          <div className="group text-center p-6 bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-600/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform">
              {passedVerifications}
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Passed</div>
          </div>
          
          <div className="group text-center p-6 bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-600/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-black text-yellow-600 dark:text-yellow-400 mb-2 group-hover:scale-110 transition-transform">
              {totalVerifications - passedVerifications}
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending/Failed</div>
          </div>
          
          <div className="group text-center p-6 bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-600/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
              {totalVerifications > 0 ? Math.round((passedVerifications / totalVerifications) * 100) : 0}%
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Enhanced Verification Methods */}
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">Verification Methods</h3>
            <p className="text-slate-600 dark:text-slate-400">Detailed analysis of all verification processes</p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Live Data</span>
          </div>
        </div>
        {verificationMethods.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-200/50 to-slate-300/50 dark:from-slate-600/50 dark:to-slate-700/50 rounded-full blur-xl"></div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full">
                <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h4 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-3">No Verification Methods</h4>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-md mx-auto">This agent has no verification methods configured yet. Contact the administrator to set up verification processes.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {verificationMethods.map((method, index) => (
            <div key={method.id} className="group bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-2xl p-6 sm:p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                    {getVerificationTypeIcon(method.type)}
                  </div>
                  <div>
                    <div className="font-bold text-lg lg:text-xl text-slate-900 dark:text-slate-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {method.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Score: <span className="font-bold text-slate-900 dark:text-slate-100">{method.score}/100</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        ID: <span className="font-mono text-xs">{method.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm ${getVerificationStatusColor(method.status)}`}>
                    {method.status.replace('_', ' ')}
                  </span>
                  {method.details?.riskLevel && (
                    <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm ${getRiskLevelColor(method.details.riskLevel)}`}>
                      {method.details.riskLevel} Risk
                    </span>
                  )}
                </div>
              </div>

              {method?.details && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4">
                  {method.details.auditor && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Auditor</span>
                        <span className="text-slate-600 dark:text-slate-400">{method.details.auditor}</span>
                      </div>
                    </div>
                  )}
                  
                  {method.details.methodology && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Methodology</span>
                        <span className="text-slate-600 dark:text-slate-400">{method.details.methodology}</span>
                      </div>
                    </div>
                  )}
                  
                  {method.details.findings && Array.isArray(method.details.findings) && method.details.findings.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block mb-2">Key Findings</span>
                        <div className="space-y-2">
                          {method.details.findings.map((finding: string, index: number) => (
                            <div key={index} className="bg-white dark:bg-slate-700 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-400 border-l-4 border-orange-500">
                              {finding}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {method.details.recommendations && Array.isArray(method.details.recommendations) && method.details.recommendations.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block mb-2">Recommendations</span>
                        <div className="space-y-2">
                          {method.details.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="bg-white dark:bg-slate-700 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-400 border-l-4 border-green-500">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-600">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Last Verified</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{new Date(method.lastVerified).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Next Due</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{new Date(method.nextVerificationDue).toLocaleDateString()}</div>
                    </div>
                  </div>
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
