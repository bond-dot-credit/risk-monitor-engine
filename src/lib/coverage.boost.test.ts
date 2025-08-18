import { calculateLTV, calculateRiskMetrics, calculateAgentScore } from './scoring';
import { CredibilityTier } from '@/types/agent';

describe('coverage boost tests for scoring', () => {
  test('performance premium adjustment applied when performance >> overall', () => {
    const agent = {
      score: { overall: 60, provenance: 60, performance: 75, perception: 45, confidence: 50 } as any,
      credibilityTier: CredibilityTier.SILVER
    } as any;

    const ltv = calculateLTV(agent);
    // performance 75 > overall 60 + 10 => performance_premium applied
    expect(ltv.adjustments.some(a => a.factor === 'performance_premium')).toBe(true);
  });

  test('default tier fallback in base LTV and market exposure when tier unknown', () => {
    const agent = {
      score: { overall: 50, provenance: 50, performance: 50, perception: 50, confidence: 50 } as any,
      // @ts-ignore force invalid tier
      credibilityTier: undefined
    } as any;

    const ltv = calculateLTV(agent);
    expect(ltv.baseLTV).toBe(30);

    const metrics = calculateRiskMetrics(agent);
    expect(metrics.marketExposure).toBe(100);
  });

  test('calculateAgentScore with extremes produces bounded overall and confidence', () => {
    const s1 = calculateAgentScore(0, 0, 0);
    expect(s1.overall).toBeGreaterThanOrEqual(0);
    expect(s1.confidence).toBeGreaterThanOrEqual(0);

    const s2 = calculateAgentScore(100, 100, 100);
    expect(s2.overall).toBeLessThanOrEqual(100);
    expect(s2.confidence).toBeLessThanOrEqual(100);
  });
});

describe('route error branches', () => {
  // import route dynamically to avoid mocks from other tests
  let route: any;
  beforeAll(async () => {
    route = await import('../app/api/agents/route');
  });

  test('GET handles invalid request object and returns error', async () => {
    const res = await route.GET({} as any);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  test('POST handles json() throwing and returns error', async () => {
    const badReq = { url: 'http://localhost/api/agents', json: async () => { throw new Error('boom'); } } as any;
    const res = await route.POST(badReq);
    const json = await res.json();
    expect(json.success).toBe(false);
  });
});
