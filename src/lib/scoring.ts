import { Agent, AgentScore, CredibilityTier } from '@/types/agent';
import { ReputationEvent, ReputationEventType, ReputationSummary } from '@/types/reputation';
import { store } from './store';
import { LTVCalculation, LTVAdjustment, RiskMetrics } from '@/types/credit';

/**
 * Calculate overall agent score based on provenance, performance, and perception
 */
export function calculateAgentScore(
  provenance: number,
  performance: number,
  perception: number
): AgentScore {
  // Weighted scoring: provenance (40%), performance (40%), perception (20%)
  const overall = Math.round(
    provenance * 0.4 + performance * 0.4 + perception * 0.2
  );
  
  // Confidence based on data consistency and completeness
  const confidence = calculateConfidence(provenance, performance, perception);
  
  return {
    overall,
    provenance,
    performance,
    perception,
    confidence,
    lastUpdated: new Date()
  };
}

/**
 * Calculate confidence score based on score consistency
 */
function calculateConfidence(
  provenance: number,
  performance: number,
  perception: number
): number {
  const scores = [provenance, performance, perception];
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Lower variance = higher confidence (inverse relationship)
  const confidenceFromVariance = Math.max(0, 100 - (standardDeviation * 2));
  
  // Factor in absolute score levels (higher scores = more confidence in general)
  const confidenceFromLevel = mean * 0.8;
  
  return Math.round((confidenceFromVariance + confidenceFromLevel) / 2);
}

/**
 * Determine credibility tier based on overall score
 */
export function determineCredibilityTier(score: number): CredibilityTier {
  if (score >= 90) return CredibilityTier.DIAMOND;
  if (score >= 80) return CredibilityTier.PLATINUM;
  if (score >= 70) return CredibilityTier.GOLD;
  if (score >= 60) return CredibilityTier.SILVER;
  return CredibilityTier.BRONZE;
}

/**
 * Calculate LTV (Loan-to-Value) ratio based on agent score and tier
 */
export function calculateLTV(agent: Agent): LTVCalculation {
  const baseLTV = getBaseLTVForTier(agent.credibilityTier);
  const adjustments: LTVAdjustment[] = [];
  
  // Score-based adjustment
  if (agent.score.overall > 85) {
    adjustments.push({
      factor: 'high_score',
      description: 'High overall score bonus',
      impact: 5,
      reason: `Score of ${agent.score.overall} exceeds 85`
    });
  }
  
  // Confidence adjustment
  if (agent.score.confidence > 80) {
    adjustments.push({
      factor: 'high_confidence',
      description: 'High confidence bonus',
      impact: 3,
      reason: `Confidence of ${agent.score.confidence}% exceeds 80%`
    });
  }
  
  // Performance consistency
  if (agent.score.performance > agent.score.overall + 10) {
    adjustments.push({
      factor: 'performance_premium',
      description: 'Performance exceeds overall score',
      impact: 2,
      reason: 'Strong performance track record'
    });
  }
  
  const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.impact, 0);
  const finalLTV = Math.min(baseLTV + totalAdjustment, 95); // Cap at 95%
  
  return {
    agentScore: agent.score.overall,
    tier: agent.credibilityTier,
    baseLTV,
    adjustments,
    finalLTV,
    confidence: agent.score.confidence
  };
}

/**
 * Get base LTV for credibility tier
 */
function getBaseLTVForTier(tier: CredibilityTier): number {
  switch (tier) {
    case CredibilityTier.DIAMOND: return 80;
    case CredibilityTier.PLATINUM: return 70;
    case CredibilityTier.GOLD: return 60;
    case CredibilityTier.SILVER: return 50;
    case CredibilityTier.BRONZE: return 40;
    default: return 30;
  }
}

/**
 * Calculate risk metrics for an agent
 */
export function calculateRiskMetrics(agent: Agent): RiskMetrics {
  const scoreDelta = Math.abs(agent.score.performance - agent.score.overall);
  
  return {
    volatility: Math.min(scoreDelta * 2, 100),
    liquidationRisk: Math.max(0, 100 - agent.score.overall),
    performanceVariance: scoreDelta,
    tierStability: agent.score.confidence,
    marketExposure: getMarketExposureByTier(agent.credibilityTier)
  };
}

/**
 * Get market exposure level by tier
 */
function getMarketExposureByTier(tier: CredibilityTier): number {
  switch (tier) {
    case CredibilityTier.DIAMOND: return 20;
    case CredibilityTier.PLATINUM: return 30;
    case CredibilityTier.GOLD: return 40;
    case CredibilityTier.SILVER: return 60;
    case CredibilityTier.BRONZE: return 80;
    default: return 100;
  }
}

/**
 * AgentBeat reputation: fold events into a running breakdown and overall score
 * This is a naive deterministic mapper for MVP; can be replaced with ML later.
 */
export function applyReputationEventToBreakdown(
  current: { provenance: number; performance: number; perception: number },
  event: ReputationEvent
): { provenance: number; performance: number; perception: number } {
  const weight = event.weight ?? 1;
  const impact = event.impact * weight; // -100..+100 scaled by weight

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  switch (event.type) {
    case ReputationEventType.VERIFICATION:
    case ReputationEventType.SECURITY_AUDIT:
    case ReputationEventType.BUG_BOUNTY:
      return {
        provenance: clamp(current.provenance + impact * 0.6),
        performance: clamp(current.performance + impact * 0.2),
        perception: clamp(current.perception + impact * 0.2)
      };
    case ReputationEventType.PERFORMANCE:
    case ReputationEventType.UPTIME:
    case ReputationEventType.ONCHAIN_TX:
      return {
        provenance: clamp(current.provenance + impact * 0.2),
        performance: clamp(current.performance + impact * 0.6),
        perception: clamp(current.perception + impact * 0.2)
      };
    case ReputationEventType.PEER_FEEDBACK:
      return {
        provenance: clamp(current.provenance + impact * 0.2),
        performance: clamp(current.performance + impact * 0.2),
        perception: clamp(current.perception + impact * 0.6)
      };
    case ReputationEventType.INCIDENT:
    case ReputationEventType.SLASH:
      return {
        provenance: clamp(current.provenance + impact * 0.4),
        performance: clamp(current.performance + impact * 0.4),
        perception: clamp(current.perception + impact * 0.2)
      };
    default:
      return {
        provenance: clamp(current.provenance),
        performance: clamp(current.performance),
        perception: clamp(current.perception)
      };
  }
}

export function buildReputationSummary(agentId: string): ReputationSummary | null {
  const agent = store.getAgent(agentId);
  if (!agent) return null;

  const events = store.getReputationEvents(agentId).sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Start from the current score breakdown
  let breakdown = {
    provenance: agent.score.provenance,
    performance: agent.score.performance,
    perception: agent.score.perception
  };

  const totalsByType: Record<string, number> = {};
  const now = Date.now();
  let past24hOverall: number | null = null;

  for (const ev of events) {
    breakdown = applyReputationEventToBreakdown(breakdown, ev);
    totalsByType[ev.type] = (totalsByType[ev.type] ?? 0) + ev.impact * (ev.weight ?? 1);

    const overallAtEvent = Math.round(
      breakdown.provenance * 0.4 +
      breakdown.performance * 0.4 +
      breakdown.perception * 0.2
    );
    // Track the overall as of ~24h ago by nearest event before threshold
    if (past24hOverall === null && ev.timestamp.getTime() > now - 24 * 60 * 60 * 1000) {
      past24hOverall = overallAtEvent;
    }
  }

  const currentOverall = Math.round(
    breakdown.provenance * 0.4 +
    breakdown.performance * 0.4 +
    breakdown.perception * 0.2
  );

  return {
    agentId,
    currentOverall,
    trend24h: past24hOverall === null ? 0 : currentOverall - past24hOverall,
    lastUpdated: new Date(),
    breakdown,
    totalsByType,
    eventsCount: events.length
  };
}

