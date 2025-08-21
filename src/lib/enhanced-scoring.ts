import { Agent, AgentScore, CredibilityTier, VerificationType, VerificationStatus } from '@/types/agent';

// Enhanced scoring weights
const SCORING_WEIGHTS = {
  PROVENANCE: 0.35,
  PERFORMANCE: 0.30,
  PERCEPTION: 0.20,
  VERIFICATION: 0.15
};

// Confidence calculation weights
const CONFIDENCE_WEIGHTS = {
  DATA_QUALITY: 0.40,
  SCORING_CONSISTENCY: 0.30,
  VERIFICATION_COVERAGE: 0.20,
  HISTORICAL_STABILITY: 0.10
};

export function calculateEnhancedAgentScore(
  provenance: number,
  performance: number,
  perception: number,
  verification: number = 0
): AgentScore {
  // Validate input ranges
  const validatedProvenance = Math.max(0, Math.min(100, provenance));
  const validatedPerformance = Math.max(0, Math.min(100, performance));
  const validatedPerception = Math.max(0, Math.min(100, perception));
  const validatedVerification = Math.max(0, Math.min(100, verification));

  // Calculate weighted overall score
  const overall = Math.round(
    (validatedProvenance * SCORING_WEIGHTS.PROVENANCE) +
    (validatedPerformance * SCORING_WEIGHTS.PERFORMANCE) +
    (validatedPerception * SCORING_WEIGHTS.PERCEPTION) +
    (validatedVerification * SCORING_WEIGHTS.VERIFICATION)
  );

  // Calculate confidence score
  const confidence = calculateConfidenceScore(
    validatedProvenance,
    validatedPerformance,
    validatedPerception,
    validatedVerification
  );

  return {
    overall: Math.max(0, Math.min(100, overall)),
    provenance: validatedProvenance,
    performance: validatedPerformance,
    perception: validatedPerception,
    verification: validatedVerification,
    confidence: Math.max(0, Math.min(100, confidence)),
    lastUpdated: new Date()
  };
}

export function calculateProvenanceScore(agent: Agent): number {
  let score = 0;
  let maxScore = 0;

  // Code verification (30 points)
  const codeVerificationScore = calculateCodeVerificationScore(agent);
  score += codeVerificationScore * 0.30;
  maxScore += 30;

  // Audit history (25 points)
  const auditHistoryScore = calculateAuditHistoryScore(agent);
  score += auditHistoryScore * 0.25;
  maxScore += 25;

  // Deployment provenance (25 points)
  const deploymentScore = calculateDeploymentProvenanceScore(agent);
  score += deploymentScore * 0.25;
  maxScore += 25;

  // Source code quality (20 points)
  const sourceCodeScore = calculateSourceCodeQualityScore(agent);
  score += sourceCodeScore * 0.20;
  maxScore += 20;

  return Math.round((score / maxScore) * 100);
}

function calculateCodeVerificationScore(agent: Agent): number {
  const verificationMethods = agent.metadata.verificationMethods || [];
  let score = 0;

  // Code audit verification
  const codeAudit = verificationMethods.find(m => m.type === VerificationType.CODE_AUDIT);
  if (codeAudit && codeAudit.status === VerificationStatus.PASSED) {
    score += Math.min(30, codeAudit.score);
  }

  // Security assessment
  const securityAssessment = verificationMethods.find(m => m.type === VerificationType.SECURITY_ASSESSMENT);
  if (securityAssessment && securityAssessment.status === VerificationStatus.PASSED) {
    score += Math.min(20, securityAssessment.score * 0.2);
  }

  // Penetration testing
  const penetrationTest = verificationMethods.find(m => m.type === VerificationType.PENETRATION_TEST);
  if (penetrationTest && penetrationTest.status === VerificationStatus.PASSED) {
    score += Math.min(15, penetrationTest.score * 0.15);
  }

  return Math.min(30, score);
}

function calculateAuditHistoryScore(agent: Agent): number {
  const verificationMethods = agent.metadata.verificationMethods || [];
  let score = 0;

  // Recent audit score
  const recentAudits = verificationMethods
    .filter(m => m.type === VerificationType.CODE_AUDIT && m.status === VerificationStatus.PASSED)
    .sort((a, b) => new Date(b.lastVerified).getTime() - new Date(a.lastVerified).getTime());

  if (recentAudits.length > 0) {
    const mostRecent = recentAudits[0];
    const daysSinceAudit = Math.floor((Date.now() - mostRecent.lastVerified.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceAudit <= 90) score += 15; // Recent audit
    else if (daysSinceAudit <= 180) score += 10; // Moderately recent
    else if (daysSinceAudit <= 365) score += 5; // Older but still valid
  }

  // Audit frequency
  if (recentAudits.length >= 3) score += 10; // Multiple audits
  else if (recentAudits.length >= 2) score += 7;
  else if (recentAudits.length >= 1) score += 5;

  return Math.min(25, score);
}

function calculateDeploymentProvenanceScore(agent: Agent): number {
  let score = 0;

  // Deployment chain verification
  if (agent.metadata.provenance.deploymentChain) {
    const chain = agent.metadata.provenance.deploymentChain.toLowerCase();
    if (chain.includes('ethereum') || chain.includes('mainnet')) score += 10;
    else if (chain.includes('polygon') || chain.includes('arbitrum')) score += 8;
    else if (chain.includes('testnet')) score += 5;
  }

  // Verification hash
  if (agent.metadata.provenance.verificationHash && 
      agent.metadata.provenance.verificationHash.length > 20) {
    score += 8;
  }

  // Source code availability
  if (agent.metadata.provenance.sourceCode && 
      agent.metadata.provenance.sourceCode.includes('github.com')) {
    score += 7;
  }

  return Math.min(25, score);
}

function calculateSourceCodeQualityScore(agent: Agent): number {
  let score = 0;

  // Version information
  if (agent.metadata.version && agent.metadata.version.match(/^\d+\.\d+\.\d+$/)) {
    score += 5;
  }

  // Tags and categorization
  if (agent.metadata.tags && agent.metadata.tags.length >= 3) {
    score += 5;
  }

  // Description quality
  if (agent.metadata.description && agent.metadata.description.length > 50) {
    score += 5;
  }

  // Category classification
  if (agent.metadata.category && ['Trading', 'DeFi', 'Lending', 'Yield'].includes(agent.metadata.category)) {
    score += 5;
  }

  return Math.min(20, score);
}

export interface HistoricalDatum {
  performance: number;
  timestamp: Date;
}

export function calculatePerformanceScore(agent: Agent, historicalData?: HistoricalDatum[]): number {
  let score = 0;
  let maxScore = 0;

  // Historical performance consistency (40 points)
  const consistencyScore = calculatePerformanceConsistencyScore(agent, historicalData);
  score += consistencyScore * 0.40;
  maxScore += 40;

  // Risk-adjusted returns (30 points)
  const riskAdjustedScore = calculateRiskAdjustedReturnsScore(agent);
  score += riskAdjustedScore * 0.30;
  maxScore += 30;

  // Operational efficiency (30 points)
  const efficiencyScore = calculateOperationalEfficiencyScore(agent);
  score += efficiencyScore * 0.30;
  maxScore += 30;

  return Math.round((score / maxScore) * 100);
}

function calculatePerformanceConsistencyScore(agent: Agent, historicalData?: HistoricalDatum[]): number {
  if (!historicalData || historicalData.length < 3) {
    // Use agent score as fallback
    return Math.min(40, agent.score.performance);
  }

  let score = 0;

  // Calculate performance variance
  const performances = historicalData.map(d => d.performance || 0);
  const mean = performances.reduce((sum, p) => sum + p, 0) / performances.length;
  const variance = performances.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / performances.length;
  const stdDev = Math.sqrt(variance);

  // Lower variance = higher consistency
  const consistencyRatio = Math.max(0, 1 - (stdDev / mean));
  score += consistencyRatio * 25;

  // Trend analysis
  const recentPerformance = performances.slice(-3);
  const trend = recentPerformance[recentPerformance.length - 1] - recentPerformance[0];
  if (trend > 0) score += 15; // Improving trend

  return Math.min(40, score);
}

function calculateRiskAdjustedReturnsScore(agent: Agent): number {
  let score = 0;

  // Use agent's performance score as proxy for returns
  const performance = agent.score.performance;
  
  // Risk adjustment based on verification and provenance
  const riskFactor = (agent.score.verification + agent.score.provenance) / 200;
  
  // Risk-adjusted score
  score = Math.round(performance * (0.7 + (riskFactor * 0.3)));

  return Math.min(30, score);
}

function calculateOperationalEfficiencyScore(agent: Agent): number {
  let score = 0;

  // Verification coverage
  const verificationMethods = agent.metadata.verificationMethods || [];
  const activeVerifications = verificationMethods.filter(m => m.status === VerificationStatus.PASSED);
  score += (activeVerifications.length / Math.max(1, verificationMethods.length)) * 15;

  // Score stability (less variance = more efficient)
  const scoreVariance = Math.abs(agent.score.overall - agent.score.performance) + 
                        Math.abs(agent.score.overall - agent.score.provenance);
  score += Math.max(0, 15 - scoreVariance * 0.3);

  return Math.min(30, score);
}

export function calculateConfidenceScore(
  provenance: number,
  performance: number,
  perception: number,
  verification: number
): number {
  let score = 0;
  let maxScore = 0;

  // Data quality (40 points)
  const dataQualityScore = calculateDataQualityScore(provenance, performance, perception, verification);
  score += dataQualityScore * CONFIDENCE_WEIGHTS.DATA_QUALITY;
  maxScore += 40;

  // Scoring consistency (30 points)
  const consistencyScore = calculateScoringConsistencyScore(provenance, performance, perception, verification);
  score += consistencyScore * CONFIDENCE_WEIGHTS.SCORING_CONSISTENCY;
  maxScore += 30;

  // Verification coverage (20 points)
  const verificationScore = calculateVerificationCoverageScore(verification);
  score += verificationScore * CONFIDENCE_WEIGHTS.VERIFICATION_COVERAGE;
  maxScore += 20;

  // Historical stability (10 points)
  const stabilityScore = calculateHistoricalStabilityScore(provenance, performance, perception);
  score += stabilityScore * CONFIDENCE_WEIGHTS.HISTORICAL_STABILITY;
  maxScore += 10;

  return Math.round((score / maxScore) * 100);
}

function calculateDataQualityScore(
  provenance: number,
  performance: number,
  perception: number,
  verification: number
): number {
  let score = 0;

  // Score completeness (all scores present)
  if (provenance > 0 && performance > 0 && perception > 0 && verification > 0) {
    score += 20;
  } else if (provenance > 0 && performance > 0 && perception > 0) {
    score += 15;
  } else if (provenance > 0 && performance > 0) {
    score += 10;
  }

  // Score validity (within reasonable ranges)
  const scores = [provenance, performance, perception, verification];
  const validScores = scores.filter(s => s >= 0 && s <= 100);
  score += (validScores.length / scores.length) * 20;

  return Math.min(40, score);
}

function calculateScoringConsistencyScore(
  provenance: number,
  performance: number,
  perception: number,
  verification: number
): number {
  const scores = [provenance, performance, perception, verification].filter(s => s > 0);
  
  if (scores.length < 2) return 0;

  // Calculate coefficient of variation
  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / mean;

  // Lower variation = higher consistency
  const consistencyScore = Math.max(0, 30 - (coefficientOfVariation * 100));
  
  return Math.min(30, consistencyScore);
}

function calculateVerificationCoverageScore(verification: number): number {
  // Higher verification score = better coverage
  return Math.min(20, verification * 0.2);
}

function calculateHistoricalStabilityScore(
  provenance: number,
  performance: number,
  perception: number
): number {
  const scores = [provenance, performance, perception].filter(s => s > 0);
  
  if (scores.length < 2) return 0;

  // Calculate stability based on score variance
  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower standard deviation = higher stability
  const stabilityScore = Math.max(0, 10 - (stdDev * 0.5));
  
  return Math.min(10, stabilityScore);
}
