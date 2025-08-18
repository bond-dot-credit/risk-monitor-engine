import { calculateAgentScore, determineCredibilityTier, calculateLTV, calculateRiskMetrics } from './scoring';
import { CredibilityTier } from '@/types/agent';

describe('scoring utilities', () => {
  test('calculateAgentScore returns expected structure and values', () => {
    const score = calculateAgentScore(80, 90, 70);
    expect(score).toHaveProperty('overall');
    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(100);
    expect(score.confidence).toBeGreaterThanOrEqual(0);
    expect(score.confidence).toBeLessThanOrEqual(100);
  });

  test('determineCredibilityTier maps scores correctly', () => {
    expect(determineCredibilityTier(95)).toBe(CredibilityTier.DIAMOND);
    expect(determineCredibilityTier(85)).toBe(CredibilityTier.PLATINUM);
    expect(determineCredibilityTier(75)).toBe(CredibilityTier.GOLD);
    expect(determineCredibilityTier(65)).toBe(CredibilityTier.SILVER);
    expect(determineCredibilityTier(50)).toBe(CredibilityTier.BRONZE);
  });

  test('calculateLTV applies adjustments and caps', () => {
    const agent = {
      id: 'a1',
      name: 'Test Agent',
      operator: 'op',
      metadata: {
        description: '',
        category: 'test',
        version: '1',
        tags: [],
        provenance: { sourceCode: '', verificationHash: '', deploymentChain: '' }
      },
      score: {
        overall: 90,
        provenance: 90,
        performance: 95,
        perception: 85,
        confidence: 90,
        lastUpdated: new Date()
      },
      credibilityTier: CredibilityTier.PLATINUM,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    const ltv = calculateLTV(agent);
    expect(ltv.finalLTV).toBeLessThanOrEqual(95);
    expect(ltv.baseLTV).toBeGreaterThan(0);
    expect(ltv.adjustments.length).toBeGreaterThanOrEqual(0);
  });

  test('calculateRiskMetrics returns bounded metrics', () => {
    const agent = {
      score: { overall: 70, performance: 85, confidence: 60 } as any,
      credibilityTier: CredibilityTier.GOLD
    } as any;

    const metrics = calculateRiskMetrics(agent);
    expect(metrics.volatility).toBeGreaterThanOrEqual(0);
    expect(metrics.volatility).toBeLessThanOrEqual(100);
    expect(metrics.liquidationRisk).toBeGreaterThanOrEqual(0);
  });
});
