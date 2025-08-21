'use client';

import { useState, useEffect } from 'react';
import { Agent, VerificationType, VerificationStatus, RiskLevel } from '@/types/agent';

interface VerificationDashboardProps {
  agents: Agent[];
}

export function VerificationDashboard({ agents }: VerificationDashboardProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
    // intentionally run only when agents change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents]);

  const getVerificationStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.PASSED:
        return 'bg-green-100 text-green-800';
      case VerificationStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case VerificationStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case VerificationStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800';
      case VerificationStatus.PENDING:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW:
        return 'bg-green-100 text-green-800';
      case RiskLevel.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case RiskLevel.HIGH:
        return 'bg-orange-100 text-orange-800';
      case RiskLevel.CRITICAL:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    if (!agent.metadata.verificationMethods || agent.metadata.verificationMethods.length === 0) {
      return 0;
    }

    const totalScore = agent.metadata.verificationMethods.reduce((sum, method) => {
      if (method.status === VerificationStatus.PASSED) {
        return sum + method.score;
      }
      return sum;
    }, 0);

    return Math.round(totalScore / agent.metadata.verificationMethods.length);
  };

  if (!selectedAgent) {
    return <div className="p-6 text-center text-gray-500">Select an agent to view verification details</div>;
  }

  const overallScore = calculateOverallVerificationScore(selectedAgent);
  const passedVerifications = selectedAgent.metadata.verificationMethods.filter(
    m => m.status === VerificationStatus.PASSED
  ).length;
  const totalVerifications = selectedAgent.metadata.verificationMethods.length;

  return (
    <div className="space-y-6">
      {/* Agent Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{selectedAgent.name}</h2>
            <p className="text-sm text-gray-600">{selectedAgent.metadata.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{overallScore}%</div>
            <div className="text-sm text-gray-500">Verification Score</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{totalVerifications}</div>
            <div className="text-xs text-gray-500">Total Methods</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{passedVerifications}</div>
            <div className="text-xs text-green-600">Passed</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">
              {totalVerifications - passedVerifications}
            </div>
            <div className="text-xs text-yellow-600">Pending/Failed</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {Math.round((passedVerifications / totalVerifications) * 100)}%
            </div>
            <div className="text-xs text-blue-600">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Verification Methods */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Verification Methods</h3>
        <div className="space-y-4">
          {selectedAgent.metadata.verificationMethods.map((method) => (
            <div key={method.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getVerificationTypeIcon(method.type)}</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {method.type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-gray-500">
                      Score: {method.score}/100
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(method.status)}`}>
                    {method.status.replace('_', ' ')}
                  </span>
                  {method.details?.riskLevel && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(method.details.riskLevel)}`}>
                      {method.details.riskLevel}
                    </span>
                  )}
                </div>
              </div>

              {method.details && (
                <div className="space-y-2 text-sm">
                  {method.details.auditor && (
                    <div className="text-gray-600">
                      <span className="font-medium">Auditor:</span> {method.details.auditor}
                    </div>
                  )}
                  {method.details.methodology && (
                    <div className="text-gray-600">
                      <span className="font-medium">Methodology:</span> {method.details.methodology}
                    </div>
                  )}
                  {method.details.findings && method.details.findings.length > 0 && (
                    <div className="text-gray-600">
                      <span className="font-medium">Findings:</span>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        {method.details.findings.map((finding: string, index: number) => (
                          <li key={index}>{finding}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {method.details.recommendations && method.details.recommendations.length > 0 && (
                    <div className="text-gray-600">
                      <span className="font-medium">Recommendations:</span>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        {method.details.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Last Verified: {method.lastVerified.toLocaleDateString()}</span>
                  <span>Next Due: {method.nextVerificationDue.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
