'use client';

import { useState, useEffect } from 'react';
import { Agent, VerificationStatus } from '@/types/agent';

interface ComplianceManagerProps {
  agents: Agent[];
}

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'regulatory' | 'operational' | 'financial';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'pending';
  lastChecked: Date;
  nextCheck: Date;
  requirements: string[];
}

interface ComplianceReport {
  agentId: string;
  agentName: string;
  overallCompliance: number;
  passedRules: number;
  failedRules: number;
  pendingRules: number;
  criticalIssues: number;
  lastAudit: Date;
  nextAudit: Date;
  status: 'compliant' | 'non-compliant' | 'under-review';
}

export function ComplianceManager({ agents }: ComplianceManagerProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
    generateComplianceData();
  }, [agents, selectedAgent]);

  const generateComplianceData = () => {
    // Mock compliance rules
    const rules: ComplianceRule[] = [
      {
        id: 'rule_001',
        name: 'Code Security Standards',
        description: 'Ensures code follows security best practices',
        category: 'security',
        severity: 'high',
        status: 'active',
        lastChecked: new Date('2024-01-15'),
        nextCheck: new Date('2024-04-15'),
        requirements: ['No hardcoded secrets', 'Input validation', 'Secure authentication']
      },
      {
        id: 'rule_002',
        name: 'Regulatory Compliance',
        description: 'Meets financial regulatory requirements',
        category: 'regulatory',
        severity: 'critical',
        status: 'active',
        lastChecked: new Date('2024-01-20'),
        nextCheck: new Date('2024-03-20'),
        requirements: ['KYC/AML compliance', 'Data privacy', 'Audit trails']
      },
      {
        id: 'rule_003',
        name: 'Operational Standards',
        description: 'Operational efficiency and reliability',
        category: 'operational',
        severity: 'medium',
        status: 'active',
        lastChecked: new Date('2024-01-25'),
        nextCheck: new Date('2024-05-25'),
        requirements: ['Uptime monitoring', 'Error handling', 'Performance metrics']
      },
      {
        id: 'rule_004',
        name: 'Financial Controls',
        description: 'Financial risk management and controls',
        category: 'financial',
        severity: 'high',
        status: 'active',
        lastChecked: new Date('2024-01-30'),
        nextCheck: new Date('2024-04-30'),
        requirements: ['Risk limits', 'Position monitoring', 'Liquidity management']
      }
    ];

    setComplianceRules(rules);

    // Generate compliance reports for each agent
    const reports: ComplianceReport[] = agents.map(agent => {
      const passedRules = Math.floor(Math.random() * rules.length);
      const failedRules = Math.floor(Math.random() * 2);
      const pendingRules = rules.length - passedRules - failedRules;
      const criticalIssues = Math.floor(Math.random() * 2);

      return {
        agentId: agent.id,
        agentName: agent.name,
        overallCompliance: Math.round((passedRules / rules.length) * 100),
        passedRules,
        failedRules,
        pendingRules,
        criticalIssues,
        lastAudit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        nextAudit: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: overallCompliance >= 80 ? 'compliant' : overallCompliance >= 60 ? 'under-review' : 'non-compliant'
      };
    });

    setComplianceReports(reports);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'under-review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'security': '🔒',
      'regulatory': '📋',
      'operational': '⚙️',
      'financial': '💰'
    };
    return icons[category as keyof typeof icons] || '📋';
  };

  const filteredRules = selectedCategory === 'all' 
    ? complianceRules 
    : complianceRules.filter(rule => rule.category === selectedCategory);

  if (!selectedAgent) {
    return <div className="p-6 text-center text-gray-500">Select an agent to view compliance details</div>;
  }

  const agentReport = complianceReports.find(r => r.agentId === selectedAgent.id);

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      {agentReport && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Compliance Overview</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agentReport.status)}`}>
              {agentReport.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{agentReport.overallCompliance}%</div>
              <div className="text-sm text-gray-500">Overall Compliance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{agentReport.passedRules}</div>
              <div className="text-sm text-gray-500">Passed Rules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{agentReport.failedRules}</div>
              <div className="text-sm text-gray-500">Failed Rules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{agentReport.criticalIssues}</div>
              <div className="text-sm text-gray-500">Critical Issues</div>
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>Last Audit: {agentReport.lastAudit.toLocaleDateString()}</span>
            <span>Next Audit: {agentReport.nextAudit.toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Compliance Rules */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Compliance Rules</h3>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            <option value="security">Security</option>
            <option value="regulatory">Regulatory</option>
            <option value="operational">Operational</option>
            <option value="financial">Financial</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredRules.map((rule) => (
            <div key={rule.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(rule.category)}</span>
                  <div>
                    <div className="font-medium text-gray-900">{rule.name}</div>
                    <div className="text-sm text-gray-600">{rule.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                    {rule.severity.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rule.status}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Requirements:</div>
                <ul className="list-disc list-inside space-y-1">
                  {rule.requirements.map((req, index) => (
                    <li key={index} className="text-sm text-gray-600">{req}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Last Check: {rule.lastChecked.toLocaleDateString()}</span>
                <span>Next Check: {rule.nextCheck.toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Reports Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">All Agents Compliance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Audit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Critical Issues
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complianceReports.map((report) => (
                <tr key={report.agentId} className={report.agentId === selectedAgent.id ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{report.agentName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.overallCompliance}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                      {report.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.lastAudit.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      report.criticalIssues > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {report.criticalIssues}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
