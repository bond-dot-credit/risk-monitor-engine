import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/scoring.log' })
  ]
});

/**
 * v0 Scoring System - Simple 3-metric trust scoring
 */
export class ScoringSystem {
  constructor() {
    this.performanceWeight = 40;  // 0-40 pts
    this.reliabilityWeight = 40;  // 0-40 pts  
    this.safetyWeight = 20;       // 0-20 pts
  }

  /**
   * Calculate total trust score for an opportunity
   */
  calculateScore(opportunityData) {
    const { performance, reliability, safety } = opportunityData;
    
    const performanceScore = this.calculatePerformanceScore(performance);
    const reliabilityScore = this.calculateReliabilityScore(reliability);
    const safetyScore = this.calculateSafetyScore(safety);
    
    const totalScore = performanceScore + reliabilityScore + safetyScore;
    const riskLevel = this.getRiskLevel(totalScore);
    
    logger.info('Score calculated', {
      opportunityId: opportunityData.id,
      performanceScore,
      reliabilityScore, 
      safetyScore,
      totalScore,
      riskLevel
    });

    return {
      totalScore,
      performanceScore,
      reliabilityScore,
      safetyScore,
      riskLevel,
      breakdown: {
        performance: { score: performanceScore, max: this.performanceWeight },
        reliability: { score: reliabilityScore, max: this.reliabilityWeight },
        safety: { score: safetyScore, max: this.safetyWeight }
      }
    };
  }

  /**
   * Performance Score (0-40 pts)
   * Based on last 7d/30d APY
   */
  calculatePerformanceScore(performance) {
    const { apy7d, apy30d, targetApy } = performance;
    
    // Use 30d APY if available, otherwise 7d, otherwise target
    const actualApy = apy30d || apy7d || targetApy;
    
    if (!actualApy || actualApy <= 0) return 0;
    
    // Score based on APY performance
    // 0-5%: 0-10 pts, 5-10%: 10-20 pts, 10-15%: 20-30 pts, 15%+: 30-40 pts
    if (actualApy < 5) {
      return Math.floor((actualApy / 5) * 10);
    } else if (actualApy < 10) {
      return 10 + Math.floor(((actualApy - 5) / 5) * 10);
    } else if (actualApy < 15) {
      return 20 + Math.floor(((actualApy - 10) / 5) * 10);
    } else {
      return 30 + Math.min(10, Math.floor((actualApy - 15) / 5) * 10);
    }
  }

  /**
   * Reliability Score (0-40 pts)
   * Based on successful intents, gas usage, latency
   */
  calculateReliabilityScore(reliability) {
    const { successRate, avgGasUsed, avgLatency, totalIntents } = reliability;
    
    if (!totalIntents || totalIntents < 10) {
      // Not enough data - give base score
      return 15;
    }
    
    // Base score from success rate (0-25 pts)
    const successScore = Math.floor((successRate / 100) * 25);
    
    // Gas efficiency bonus (0-10 pts)
    const gasScore = this.calculateGasScore(avgGasUsed);
    
    // Latency bonus (0-5 pts)  
    const latencyScore = this.calculateLatencyScore(avgLatency);
    
    return Math.min(40, successScore + gasScore + latencyScore);
  }

  /**
   * Calculate gas efficiency score
   */
  calculateGasScore(avgGasUsed) {
    // Lower gas = higher score
    // 0-10 pts based on gas efficiency
    if (avgGasUsed < 20000000000000) return 10; // < 20 TGas
    if (avgGasUsed < 40000000000000) return 8;  // < 40 TGas  
    if (avgGasUsed < 60000000000000) return 6;  // < 60 TGas
    if (avgGasUsed < 80000000000000) return 4;  // < 80 TGas
    if (avgGasUsed < 100000000000000) return 2; // < 100 TGas
    return 0; // > 100 TGas
  }

  /**
   * Calculate latency efficiency score
   */
  calculateLatencyScore(avgLatency) {
    // Lower latency = higher score
    // 0-5 pts based on latency
    if (avgLatency < 1000) return 5;    // < 1s
    if (avgLatency < 2000) return 4;    // < 2s
    if (avgLatency < 3000) return 3;    // < 3s
    if (avgLatency < 5000) return 2;    // < 5s
    if (avgLatency < 10000) return 1;   // < 10s
    return 0; // > 10s
  }

  /**
   * Safety Score (0-20 pts)
   * Based on audit status and incident history
   */
  calculateSafetyScore(safety) {
    const { isAudited, hasIncidents, auditDate, lastIncident } = safety;
    
    let score = 0;
    
    // Audit status (0-15 pts)
    if (isAudited) {
      score += 15;
      
      // Recent audit bonus (0-3 pts)
      if (auditDate) {
        const auditAge = Date.now() - new Date(auditDate).getTime();
        const monthsOld = auditAge / (1000 * 60 * 60 * 24 * 30);
        
        if (monthsOld < 6) score += 3;
        else if (monthsOld < 12) score += 2;
        else if (monthsOld < 24) score += 1;
      }
    }
    
    // Incident penalty (0-5 pts penalty)
    if (hasIncidents) {
      score -= 5;
      
      // Recent incident additional penalty
      if (lastIncident) {
        const incidentAge = Date.now() - new Date(lastIncident).getTime();
        const monthsOld = incidentAge / (1000 * 60 * 60 * 24 * 30);
        
        if (monthsOld < 6) score -= 3;
        else if (monthsOld < 12) score -= 2;
        else if (monthsOld < 24) score -= 1;
      }
    }
    
    return Math.max(0, Math.min(20, score));
  }

  /**
   * Get risk level based on total score
   */
  getRiskLevel(totalScore) {
    if (totalScore < 50) {
      return {
        level: 'Caution',
        emoji: '🚨',
        color: 'red',
        description: 'High risk - proceed with caution'
      };
    } else if (totalScore < 80) {
      return {
        level: 'Moderate', 
        emoji: '✅',
        color: 'yellow',
        description: 'Medium risk - acceptable for most users'
      };
    } else {
      return {
        level: 'Preferred',
        emoji: '⭐', 
        color: 'green',
        description: 'Low risk - recommended opportunity'
      };
    }
  }

  /**
   * Batch calculate scores for multiple opportunities
   */
  calculateBatchScores(opportunitiesData) {
    return opportunitiesData.map(data => ({
      ...data,
      score: this.calculateScore(data)
    }));
  }

  /**
   * Get scoring explanation for transparency
   */
  getScoringExplanation() {
    return {
      totalMaxScore: 100,
      breakdown: {
        performance: {
          maxScore: 40,
          description: 'Based on actual APY performance (7d/30d)',
          calculation: 'Higher APY = higher score, up to 40 points'
        },
        reliability: {
          maxScore: 40,
          description: 'Based on intent success rate, gas efficiency, latency',
          calculation: 'Success rate (25pts) + gas efficiency (10pts) + latency (5pts)'
        },
        safety: {
          maxScore: 20,
          description: 'Based on audit status and incident history',
          calculation: 'Audit status (15pts) + recent audit bonus (3pts) - incident penalties'
        }
      },
      riskLevels: {
        caution: { min: 0, max: 49, emoji: '🚨', description: 'High risk' },
        moderate: { min: 50, max: 79, emoji: '✅', description: 'Medium risk' },
        preferred: { min: 80, max: 100, emoji: '⭐', description: 'Low risk' }
      }
    };
  }
}
