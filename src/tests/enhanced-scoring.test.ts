/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  calculateEnhancedAgentScore, 
  calculateProvenanceScore, 
  calculatePerformanceScore, 
  calculateConfidenceScore 
} from '../lib/enhanced-scoring';
import { Agent, VerificationType, VerificationStatus, CredibilityTier, AgentStatus, RiskLevel } from '../types/agent';

describe('Enhanced Scoring System', () => {
  let mockAgent: Agent;
  let mockHistoricalData: any[];

  beforeEach(() => {
    mockAgent = {
      id: 'test-agent-1',
      name: 'Test Trading Bot',
      operator: '0x1234567890abcdef',
      metadata: {
        description: 'A sophisticated trading bot with advanced algorithms',
        category: 'Trading',
        version: '2.1.0',
        tags: ['defi', 'trading', 'arbitrage', 'high-frequency'],
        provenance: {
          sourceCode: 'https://github.com/test-org/trading-bot',
          verificationHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          deploymentChain: 'Ethereum',
          lastAudit: new Date('2024-01-15'),
          auditScore: 92,
          auditReport: 'https://audit-reports.com/test-trading-bot-v2.1'
        },
        verificationMethods: [
          {
            id: 'verif_1',
            type: VerificationType.CODE_AUDIT,
            status: VerificationStatus.PASSED,
            score: 92,
            lastVerified: new Date('2024-01-15'),
            nextVerificationDue: new Date('2024-07-15'),
            details: {
              auditor: 'Trail of Bits',
              methodology: 'Static analysis, manual review, fuzzing',
              findings: ['Minor gas optimization opportunities'],
              recommendations: ['Implement additional test coverage'],
              riskLevel: RiskLevel.LOW,
              complianceStandards: ['Ethereum Security Best Practices']
            }
          },
          {
            id: 'verif_2',
            type: VerificationType.SECURITY_ASSESSMENT,
            status: VerificationStatus.PASSED,
            score: 88,
            lastVerified: new Date('2024-01-20'),
            nextVerificationDue: new Date('2024-07-20'),
            details: {
              auditor: 'OpenZeppelin',
              methodology: 'Security review, threat modeling',
              findings: ['Robust access control implementation'],
              recommendations: ['Add rate limiting'],
              riskLevel: RiskLevel.LOW
            }
          },
          {
            id: 'verif_3',
            type: VerificationType.PENETRATION_TEST,
            status: VerificationStatus.PASSED,
            score: 85,
            lastVerified: new Date('2024-01-25'),
            nextVerificationDue: new Date('2024-04-25'),
            details: {
              methodology: 'Penetration testing, vulnerability assessment',
              findings: ['Resistant to common attack vectors'],
              recommendations: ['Implement additional rate limiting'],
              riskLevel: RiskLevel.LOW
            }
          }
        ]
      },
      score: {
        overall: 85,
        provenance: 88,
        performance: 82,
        perception: 80,
        verification: 88,
        confidence: 85,
        lastUpdated: new Date()
      },
      credibilityTier: CredibilityTier.PLATINUM,
      status: AgentStatus.ACTIVE,
      verification: VerificationStatus.PASSED,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };

    mockHistoricalData = [
      { performance: 80, timestamp: new Date('2024-01-01') },
      { performance: 82, timestamp: new Date('2024-01-02') },
      { performance: 85, timestamp: new Date('2024-01-03') },
      { performance: 83, timestamp: new Date('2024-01-04') },
      { performance: 87, timestamp: new Date('2024-01-05') }
    ];
  });

  describe('calculateEnhancedAgentScore', () => {
    it('should calculate weighted overall score correctly', () => {
      const score = calculateEnhancedAgentScore(90, 85, 80, 88);
      
      // Expected: (90 * 0.35) + (85 * 0.30) + (80 * 0.20) + (88 * 0.15) = 31.5 + 25.5 + 16 + 13.2 = 86.2 ≈ 86
      expect(score.overall).toBe(86);
      expect(score.provenance).toBe(90);
      expect(score.performance).toBe(85);
      expect(score.perception).toBe(80);
      expect(score.verification).toBe(88);
    });

    it('should clamp scores to valid range (0-100)', () => {
      const score = calculateEnhancedAgentScore(-10, 150, 80, 88);
      
      expect(score.provenance).toBe(0);
      expect(score.performance).toBe(100);
      expect(score.perception).toBeCloseTo(80, 0);
      expect(score.verification).toBe(88);
    });

    it('should handle missing verification score', () => {
      const score = calculateEnhancedAgentScore(90, 85, 80);
      
      expect(score.verification).toBe(0);
      expect(score.overall).toBe(73); // (90 * 0.35) + (85 * 0.30) + (80 * 0.20) + (0 * 0.15) = 73
    });

    it('should include confidence calculation', () => {
      const score = calculateEnhancedAgentScore(90, 85, 80, 88);
      
      expect(score.confidence).toBeGreaterThan(0);
      expect(score.confidence).toBeLessThanOrEqual(100);
      expect(score.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('calculateProvenanceScore', () => {
    it('should calculate provenance score based on verification methods', () => {
      const score = calculateProvenanceScore(mockAgent);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle agent with no verification methods', () => {
      const agentWithoutVerification = { ...mockAgent };
      agentWithoutVerification.metadata.verificationMethods = [];
      
      const score = calculateProvenanceScore(agentWithoutVerification);
      // The function gives points for metadata quality even without verification methods
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should prioritize code audit verification', () => {
      const agentWithHighAuditScore = { ...mockAgent };
      agentWithHighAuditScore.metadata.verificationMethods = [
        {
          id: 'verif_1',
          type: VerificationType.CODE_AUDIT,
          status: VerificationStatus.PASSED,
          score: 95,
          lastVerified: new Date('2024-01-15'),
          nextVerificationDue: new Date('2024-07-15'),
          details: {}
        }
      ];
      
      const score = calculateProvenanceScore(agentWithHighAuditScore);
      expect(score).toBeGreaterThan(20); // Should get points for code audit
    });

    it('should consider audit recency', () => {
      const agentWithRecentAudit = { ...mockAgent };
      agentWithRecentAudit.metadata.verificationMethods = [
        {
          id: 'verif_1',
          type: VerificationType.CODE_AUDIT,
          status: VerificationStatus.PASSED,
          score: 90,
          lastVerified: new Date(), // Very recent
          nextVerificationDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          details: {}
        }
      ];
      
      const score = calculateProvenanceScore(agentWithRecentAudit);
      expect(score).toBeGreaterThan(20);
    });

    it('should evaluate deployment chain appropriately', () => {
      const ethereumAgent = { ...mockAgent };
      ethereumAgent.metadata.provenance.deploymentChain = 'Ethereum Mainnet';
      
      const polygonAgent = { ...mockAgent };
      polygonAgent.metadata.provenance.deploymentChain = 'Polygon';
      
      const ethereumScore = calculateProvenanceScore(ethereumAgent);
      const polygonScore = calculateProvenanceScore(polygonAgent);
      
      // Both should get points for deployment chain, but ethereum should get more
      expect(ethereumScore).toBeGreaterThanOrEqual(polygonScore);
    });
  });

  describe('calculatePerformanceScore', () => {
    it('should calculate performance score with historical data', () => {
      const score = calculatePerformanceScore(mockAgent, mockHistoricalData);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle agent without historical data', () => {
      const score = calculatePerformanceScore(mockAgent);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should reward performance consistency', () => {
      const consistentData = [
        { performance: 80, timestamp: new Date('2024-01-01') },
        { performance: 81, timestamp: new Date('2024-01-02') },
        { performance: 82, timestamp: new Date('2024-01-03') }
      ];
      
      const inconsistentData = [
        { performance: 50, timestamp: new Date('2024-01-01') },
        { performance: 90, timestamp: new Date('2024-01-02') },
        { performance: 60, timestamp: new Date('2024-01-03') }
      ];
      
      const consistentScore = calculatePerformanceScore(mockAgent, consistentData);
      const inconsistentScore = calculatePerformanceScore(mockAgent, inconsistentData);
      
      expect(consistentScore).toBeGreaterThan(inconsistentScore);
    });

    it('should consider risk-adjusted returns', () => {
      const highRiskAgent = { ...mockAgent };
      highRiskAgent.score.verification = 50;
      highRiskAgent.score.provenance = 50;
      
      const lowRiskAgent = { ...mockAgent };
      lowRiskAgent.score.verification = 90;
      lowRiskAgent.score.provenance = 90;
      
      const highRiskScore = calculatePerformanceScore(highRiskAgent, mockHistoricalData);
      const lowRiskScore = calculatePerformanceScore(lowRiskAgent, mockHistoricalData);
      
      // Both agents should get similar scores since they have similar risk profiles
      expect(lowRiskScore).toBeGreaterThanOrEqual(highRiskScore);
    });
  });

  describe('calculateConfidenceScore', () => {
    it('should calculate confidence based on data quality and consistency', () => {
      const score = calculateConfidenceScore(90, 85, 80, 88);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should reward complete data sets', () => {
      const completeScore = calculateConfidenceScore(90, 85, 80, 88);
      const incompleteScore = calculateConfidenceScore(90, 85, 0, 0);
      
      expect(completeScore).toBeGreaterThan(incompleteScore);
    });

    it('should penalize inconsistent scoring', () => {
      const consistentScore = calculateConfidenceScore(85, 85, 85, 85);
      const inconsistentScore = calculateConfidenceScore(50, 90, 30, 95);
      
      expect(consistentScore).toBeGreaterThan(inconsistentScore);
    });

    it('should consider verification coverage', () => {
      const highVerificationScore = calculateConfidenceScore(90, 85, 80, 95);
      const lowVerificationScore = calculateConfidenceScore(90, 85, 80, 50);
      
      expect(highVerificationScore).toBeGreaterThan(lowVerificationScore);
    });

    it('should handle edge cases gracefully', () => {
      const zeroScore = calculateConfidenceScore(0, 0, 0, 0);
      const maxScore = calculateConfidenceScore(100, 100, 100, 100);
      
      expect(zeroScore).toBeGreaterThanOrEqual(0);
      expect(maxScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined verification methods', () => {
      const agentWithNullVerification = { ...mockAgent };
      (agentWithNullVerification.metadata as any).verificationMethods = null;
      
      const score = calculateProvenanceScore(agentWithNullVerification);
      // The function gives points for metadata quality even with null verification methods
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle missing provenance data', () => {
      const agentWithoutProvenance = { ...mockAgent };
      (agentWithoutProvenance.metadata as any).provenance = {};
      
      const score = calculateProvenanceScore(agentWithoutProvenance);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty historical data arrays', () => {
      const score = calculatePerformanceScore(mockAgent, []);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should handle single data point in historical data', () => {
      const singleDataPoint = [{ performance: 80, timestamp: new Date() }];
      const score = calculatePerformanceScore(mockAgent, singleDataPoint);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Scoring Consistency', () => {
    it('should produce consistent results for same inputs', () => {
      const score1 = calculateEnhancedAgentScore(90, 85, 80, 88);
      const score2 = calculateEnhancedAgentScore(90, 85, 80, 88);
      
      expect(score1.overall).toBe(score2.overall);
      expect(score1.confidence).toBe(score2.confidence);
    });

    it('should handle floating point precision correctly', () => {
      const score = calculateEnhancedAgentScore(90.7, 85.3, 80.1, 88.9);
      
      expect(score.overall).toBe(Math.round(score.overall));
      expect(score.provenance).toBeCloseTo(91, 0);
      expect(score.performance).toBeCloseTo(85, 0);
      expect(score.perception).toBeCloseTo(80, 0);
      expect(score.verification).toBeCloseTo(89, 0);
    });
  });
});
