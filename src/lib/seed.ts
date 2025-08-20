import { store } from './store';
import { Agent, AgentStatus, CredibilityTier, VerificationStatus, VerificationType, RiskLevel } from '../types/agent';
import { ReputationEvent, ReputationEventType } from '../types/reputation';
import { calculateAgentScore, calculateVerificationScore } from './scoring';

export function ensureSeeded() {
  if (store.getAgents().length === 0) {
    const agents: Agent[] = [
      {
        id: '1',
        name: 'Alpha Trading Bot',
        operator: '0x742d35Cc6640C178fFfbDD5B5e3d6480',
        metadata: {
          description: 'High-frequency trading bot for DeFi protocols',
          category: 'Trading',
          version: '2.1.0',
          tags: ['defi', 'trading', 'arbitrage'],
          provenance: {
            sourceCode: 'https://github.com/agent-dev/trading-alpha',
            verificationHash: '0x1234567890abcdef...',
            deploymentChain: 'Ethereum',
            lastAudit: new Date('2024-01-15'),
            auditScore: 92,
            auditReport: 'https://audit-reports.com/alpha-trading-bot-v2.1'
          },
          verificationMethods: [
            {
              id: 'verif_1_1',
              type: VerificationType.CODE_AUDIT,
              status: VerificationStatus.PASSED,
              score: 92,
              lastVerified: new Date('2024-01-15'),
              nextVerificationDue: new Date('2024-07-15'),
              details: {
                auditor: 'Trail of Bits',
                methodology: 'Static analysis, manual review, fuzzing',
                findings: ['Minor gas optimization opportunities', 'No critical vulnerabilities found'],
                recommendations: ['Implement additional test coverage', 'Consider formal verification'],
                riskLevel: RiskLevel.LOW,
                complianceStandards: ['Ethereum Security Best Practices']
              }
            },
            {
              id: 'verif_1_2',
              type: VerificationType.SECURITY_ASSESSMENT,
              status: VerificationStatus.PASSED,
              score: 88,
              lastVerified: new Date('2024-01-20'),
              nextVerificationDue: new Date('2024-07-20'),
              details: {
                auditor: 'OpenZeppelin',
                methodology: 'Security review, threat modeling',
                findings: ['Robust access control implementation', 'Secure upgrade pattern'],
                recommendations: ['Add rate limiting', 'Implement circuit breakers'],
                riskLevel: RiskLevel.LOW
              }
            },
            {
              id: 'verif_1_3',
              type: VerificationType.PERFORMANCE_BENCHMARK,
              status: VerificationStatus.PASSED,
              score: 95,
              lastVerified: new Date('2024-01-25'),
              nextVerificationDue: new Date('2024-04-25'),
              details: {
                methodology: 'Gas optimization testing, execution time analysis',
                findings: ['Efficient gas usage', 'Fast execution times'],
                recommendations: ['Monitor gas costs in production', 'Optimize for high-frequency scenarios']
              }
            }
          ]
        },
        score: calculateAgentScore(95, 85, 83, 92),
        credibilityTier: CredibilityTier.PLATINUM,
        status: AgentStatus.ACTIVE,
        verification: VerificationStatus.PASSED,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Yield Optimizer Pro',
        operator: '0x123e4567e89b12d3a456426614174000',
        metadata: {
          description: 'Automated yield farming across multiple chains',
          category: 'DeFi',
          version: '1.8.3',
          tags: ['yield', 'farming', 'optimization'],
          provenance: {
            sourceCode: 'https://github.com/yield-protocol/optimizer',
            verificationHash: '0xabcdef1234567890...',
            deploymentChain: 'Polygon',
            lastAudit: new Date('2024-01-10'),
            auditScore: 78,
            auditReport: 'https://audit-reports.com/yield-optimizer-v1.8'
          },
          verificationMethods: [
            {
              id: 'verif_2_1',
              type: VerificationType.CODE_AUDIT,
              status: VerificationStatus.PASSED,
              score: 78,
              lastVerified: new Date('2024-01-10'),
              nextVerificationDue: new Date('2024-07-10'),
              details: {
                auditor: 'Consensys Diligence',
                methodology: 'Automated analysis, manual review',
                findings: ['Some medium-risk findings', 'Good overall architecture'],
                recommendations: ['Fix medium-risk issues', 'Add more test coverage'],
                riskLevel: RiskLevel.MEDIUM
              }
            },
            {
              id: 'verif_2_2',
              type: VerificationType.COMPLIANCE_CHECK,
              status: VerificationStatus.IN_PROGRESS,
              score: 65,
              lastVerified: new Date('2024-01-15'),
              nextVerificationDue: new Date('2024-02-15'),
              details: {
                methodology: 'Regulatory compliance review',
                findings: ['Pending regulatory review', 'Basic compliance framework in place'],
                recommendations: ['Complete regulatory review', 'Implement compliance monitoring'],
                riskLevel: RiskLevel.MEDIUM
              }
            }
          ]
        },
        score: calculateAgentScore(92, 72, 68, 72),
        credibilityTier: CredibilityTier.GOLD,
        status: AgentStatus.ACTIVE,
        verification: VerificationStatus.IN_PROGRESS,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Arbitrage Hunter',
        operator: '0x456789abcdef0123456789abcdef0123',
        metadata: {
          description: 'Cross-exchange arbitrage detection and execution',
          category: 'Trading',
          version: '3.0.1',
          tags: ['arbitrage', 'trading', 'cross-exchange'],
          provenance: {
            sourceCode: 'https://github.com/arbitrage-labs/hunter',
            verificationHash: '0x7890abcdef123456...',
            deploymentChain: 'Arbitrum',
            lastAudit: new Date('2024-01-20'),
            auditScore: 85,
            auditReport: 'https://audit-reports.com/arbitrage-hunter-v3.0'
          },
          verificationMethods: [
            {
              id: 'verif_3_1',
              type: VerificationType.CODE_AUDIT,
              status: VerificationStatus.PASSED,
              score: 85,
              lastVerified: new Date('2024-01-20'),
              nextVerificationDue: new Date('2024-07-20'),
              details: {
                auditor: 'Quantstamp',
                methodology: 'Automated analysis, manual review, formal verification',
                findings: ['Good security practices', 'Minor optimization opportunities'],
                recommendations: ['Implement additional safety checks', 'Add circuit breakers'],
                riskLevel: RiskLevel.LOW
              }
            },
            {
              id: 'verif_3_2',
              type: VerificationType.PENETRATION_TEST,
              status: VerificationStatus.PASSED,
              score: 82,
              lastVerified: new Date('2024-01-25'),
              nextVerificationDue: new Date('2024-04-25'),
              details: {
                methodology: 'Penetration testing, vulnerability assessment',
                findings: ['Resistant to common attack vectors', 'Good input validation'],
                recommendations: ['Implement additional rate limiting', 'Add anomaly detection'],
                riskLevel: RiskLevel.LOW
              }
            }
          ]
        },
        score: calculateAgentScore(89, 78, 76, 84),
        credibilityTier: CredibilityTier.GOLD,
        status: AgentStatus.ACTIVE,
        verification: VerificationStatus.PASSED,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date()
      }
    ];

    agents.forEach(agent => store.addAgent(agent));

    const events: ReputationEvent[] = [
      {
        id: 'evt_1',
        agentId: '1',
        type: ReputationEventType.PERFORMANCE_IMPROVEMENT,
        timestamp: new Date('2024-01-25T10:30:00Z'),
        description: 'Trading algorithm update resulted in 15% better returns',
        impact: 25,
        metadata: {
          previousValue: 141.2,
          newValue: 156.7,
          changePercentage: 15.5
        }
      },
      {
        id: 'evt_2',
        agentId: '1',
        type: ReputationEventType.CREDIT_LINE_INCREASE,
        timestamp: new Date('2024-01-24T14:15:00Z'),
        description: 'Credit line increased from $500K to $750K due to performance',
        impact: 20,
        metadata: {
          previousValue: 500000,
          newValue: 750000,
          changePercentage: 50
        }
      },
      {
        id: 'evt_3',
        agentId: '2',
        type: ReputationEventType.APR_IMPROVEMENT,
        timestamp: new Date('2024-01-23T09:45:00Z'),
        description: 'APR improved from 8.2% to 9.1% through strategy updates',
        impact: 15,
        metadata: {
          previousValue: 8.2,
          newValue: 9.1,
          changePercentage: 11.0
        }
      },
      {
        id: 'evt_4',
        agentId: '3',
        type: ReputationEventType.LTV_OPTIMIZATION,
        timestamp: new Date('2024-01-22T16:20:00Z'),
        description: 'LTV ratio updated from 65% to 72% while maintaining risk profile',
        impact: 18,
        metadata: {
          previousValue: 65,
          newValue: 72,
          changePercentage: 10.8
        }
      }
    ];

    events.forEach(event => store.addReputationEvent(event));
  }
}
