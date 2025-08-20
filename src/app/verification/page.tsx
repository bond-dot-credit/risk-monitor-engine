'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent, VerificationType, VerificationStatus, RiskLevel } from '@/types/agent';

export default function CredibilityVerificationPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success && data.data) {
        setAgents(data.data);
        if (data.data.length > 0 && !selectedAgentId) {
          setSelectedAgentId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  }, [selectedAgentId]);

  useEffect(() => {
    setIsMounted(true);
    fetchAgents();
  }, [fetchAgents]);

  const getVerificationStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.PASSED: return 'bg-green-100 text-green-800';
      case VerificationStatus.FAILED: return 'bg-red-100 text-red-800';
      case VerificationStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
      case VerificationStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case VerificationStatus.EXPIRED: return 'bg-orange-100 text-orange-800';
      case VerificationStatus.UNDER_REVIEW: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case RiskLevel.LOW: return 'bg-green-100 text-green-800';
      case RiskLevel.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case RiskLevel.HIGH: return 'bg-orange-100 text-orange-800';
      case RiskLevel.CRITICAL: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationTypeIcon = (type: VerificationType) => {
    switch (type) {
      case VerificationType.CODE_AUDIT: return '🔍';
      case VerificationType.PENETRATION_TEST: return '🛡️';
      case VerificationType.PERFORMANCE_BENCHMARK: return '📊';
      case VerificationType.SECURITY_ASSESSMENT: return '🔒';
      case VerificationType.COMPLIANCE_CHECK: return '✅';
      case VerificationType.REPUTATION_VERIFICATION: return '⭐';
      case VerificationType.ON_CHAIN_ANALYSIS: return '⛓️';
      case VerificationType.SOCIAL_PROOF: return '👥';
      default: return '📋';
    }
  };

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  if (!isMounted) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Credibility Verification</h1>
          <p className="mt-2 text-gray-600">
            Multi-factor agent verification and scoring system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Agent Selection</h2>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select an agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.credibilityTier})
                  </option>
                ))}
              </select>
            </div>

            {selectedAgent && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Verification Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedAgent.score.verification}</div>
                      <div className="text-sm text-gray-500">Verification Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedAgent.score.overall}</div>
                      <div className="text-sm text-gray-500">Overall Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedAgent.score.confidence}</div>
                      <div className="text-sm text-gray-500">Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{selectedAgent.verification}</div>
                      <div className="text-sm text-gray-500">Status</div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${selectedAgent.score.verification}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Verification Methods</h3>
                  <div className="space-y-4">
                    {selectedAgent.metadata.verificationMethods?.map((method) => (
                      <div key={method.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getVerificationTypeIcon(method.type)}</span>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {method.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Last verified: {new Date(method.lastVerified).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(method.status)}`}>
                              {method.status.replace('_', ' ')}
                            </span>
                            <span className="text-lg font-semibold text-gray-900">{method.score}</span>
                          </div>
                        </div>

                        {method.details && (
                          <div className="border-t pt-3 space-y-2">
                            {method.details.auditor && (
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Auditor:</span> {method.details.auditor}
                              </div>
                            )}
                            {method.details.riskLevel && (
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Risk Level:</span>
                                <span className={`ml-2 px-2 py-1 rounded text-xs ${getRiskLevelColor(method.details.riskLevel)}`}>
                                  {method.details.riskLevel}
                                </span>
                              </div>
                            )}
                            {method.details.findings && method.details.findings.length > 0 && (
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Key Findings:</span>
                                <ul className="mt-1 space-y-1">
                                  {method.details.findings.slice(0, 3).map((finding, index) => (
                                    <li key={index} className="text-gray-600">• {finding}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-3 text-xs text-gray-500">
                          Next verification due: {new Date(method.nextVerificationDue).toLocaleDateString()}
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        No verification methods found for this agent.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Provenance Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Source Code</div>
                      <div className="font-medium text-blue-600 hover:underline">
                        <a href={selectedAgent.metadata.provenance.sourceCode} target="_blank" rel="noopener noreferrer">
                          {selectedAgent.metadata.provenance.sourceCode}
                        </a>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Deployment Chain</div>
                      <div className="font-medium">{selectedAgent.metadata.provenance.deploymentChain}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Last Audit</div>
                      <div className="font-medium">{new Date(selectedAgent.metadata.provenance.lastAudit).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Verification Hash</div>
                      <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                        {selectedAgent.metadata.provenance.verificationHash}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Verification Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Initiate New Verification
                </button>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Schedule Audit
                </button>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  Update Compliance
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">System Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Agents</span>
                  <span className="font-medium">{agents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Verified Agents</span>
                  <span className="font-medium">
                    {agents.filter(a => a.verification === VerificationStatus.PASSED).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending Verification</span>
                  <span className="font-medium">
                    {agents.filter(a => a.verification === VerificationStatus.PENDING).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Failed Verification</span>
                  <span className="font-medium">
                    {agents.filter(a => a.verification === VerificationStatus.FAILED).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
