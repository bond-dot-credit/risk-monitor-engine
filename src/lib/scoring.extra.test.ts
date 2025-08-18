import { calculateConfidence as _calcConfidence, calculateAgentScore, calculateLTV, calculateRiskMetrics } from './scoring';
import { CredibilityTier } from '@/types/agent';

describe('scoring edge cases', () => {
  test('calculateConfidence handles identical scores (low variance => high confidence)', () => {
    // access private function via trick: calculateAgentScore uses it; but we can test via known inputs
    const score = calculateAgentScore(90, 90, 90);
    expect(score.confidence).toBeGreaterThanOrEqual(80);
  });

  test('calculateConfidence handles divergent scores (high variance => lower confidence)', () => {
    const score = calculateAgentScore(100, 0, 50);
    expect(score.confidence).toBeLessThan(80);
  });

  test('getBaseLTV and adjustments for different tiers and caps', () => {
    const agentHigh = {
      score: { overall: 96, provenance: 96, performance: 99, perception: 93, confidence: 95 } as any,
      credibilityTier: CredibilityTier.DIAMOND
    } as any;
    const ltvHigh = calculateLTV(agentHigh as any);
    expect(ltvHigh.baseLTV).toBe(80);
    expect(ltvHigh.finalLTV).toBeLessThanOrEqual(95);

    const agentLow = {
      score: { overall: 45, provenance: 40, performance: 40, perception: 55, confidence: 30 } as any,
      credibilityTier: CredibilityTier.BRONZE
    } as any;
    const ltvLow = calculateLTV(agentLow as any);
    expect(ltvLow.baseLTV).toBe(40);
    expect(ltvLow.finalLTV).toBeGreaterThanOrEqual(40);
  });

  test('calculateRiskMetrics boundaries for volatility and liquidationRisk', () => {
    const agent = {
      score: { overall: 100, performance: 100, confidence: 100 } as any,
      credibilityTier: CredibilityTier.DIAMOND
    } as any;
    const metrics = calculateRiskMetrics(agent);
    expect(metrics.volatility).toBeGreaterThanOrEqual(0);
    expect(metrics.volatility).toBeLessThanOrEqual(100);
    expect(metrics.liquidationRisk).toBe(0);
  });
});
