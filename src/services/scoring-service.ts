/**
 * Scoring Service
 * Manages trust scores and scoring calculations for opportunities
 */

export interface ScoreBreakdown {
  performance: number; // 0-40 points
  reliability: number; // 0-40 points
  safety: number; // 0-20 points
  total: number; // 0-100 points
}

export interface ScoringMetrics {
  apy: number;
  successRate: number;
  averageLatency: number;
  gasEfficiency: number;
  auditStatus: boolean;
  incidentCount: number;
  uptime: number;
  tvl: number;
  age: number; // days since launch
}

export interface OpportunityScore {
  id: number;
  name: string;
  contractAddress: string;
  currentScore: ScoreBreakdown;
  previousScore: ScoreBreakdown | null;
  metrics: ScoringMetrics;
  lastUpdated: number;
  trend: 'up' | 'down' | 'stable';
  category: 'staking' | 'lending' | 'liquidity' | 'defi';
}

export interface ScoreHistory {
  timestamp: number;
  score: ScoreBreakdown;
  metrics: ScoringMetrics;
}

export class ScoringService {
  private scores: Map<number, OpportunityScore> = new Map();
  private scoreHistory: Map<number, ScoreHistory[]> = new Map();
  private readonly STORAGE_KEY = 'bond_credit_scores';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Calculate performance score (0-40 points)
   */
  private calculatePerformanceScore(metrics: ScoringMetrics): number {
    let score = 0;

    // APY scoring (0-20 points)
    if (metrics.apy >= 20) {
      score += 20;
    } else if (metrics.apy >= 15) {
      score += 15;
    } else if (metrics.apy >= 10) {
      score += 10;
    } else if (metrics.apy >= 5) {
      score += 5;
    }

    // TVL scoring (0-10 points)
    if (metrics.tvl >= 10000000) { // 10M+
      score += 10;
    } else if (metrics.tvl >= 1000000) { // 1M+
      score += 8;
    } else if (metrics.tvl >= 100000) { // 100K+
      score += 6;
    } else if (metrics.tvl >= 10000) { // 10K+
      score += 4;
    } else if (metrics.tvl >= 1000) { // 1K+
      score += 2;
    }

    // Age scoring (0-10 points) - older is generally better
    if (metrics.age >= 365) { // 1+ years
      score += 10;
    } else if (metrics.age >= 180) { // 6+ months
      score += 8;
    } else if (metrics.age >= 90) { // 3+ months
      score += 6;
    } else if (metrics.age >= 30) { // 1+ month
      score += 4;
    } else if (metrics.age >= 7) { // 1+ week
      score += 2;
    }

    return Math.min(score, 40);
  }

  /**
   * Calculate reliability score (0-40 points)
   */
  private calculateReliabilityScore(metrics: ScoringMetrics): number {
    let score = 0;

    // Success rate scoring (0-20 points)
    if (metrics.successRate >= 99) {
      score += 20;
    } else if (metrics.successRate >= 95) {
      score += 15;
    } else if (metrics.successRate >= 90) {
      score += 10;
    } else if (metrics.successRate >= 80) {
      score += 5;
    }

    // Latency scoring (0-10 points) - lower is better
    if (metrics.averageLatency <= 1000) { // 1s or less
      score += 10;
    } else if (metrics.averageLatency <= 3000) { // 3s or less
      score += 8;
    } else if (metrics.averageLatency <= 5000) { // 5s or less
      score += 6;
    } else if (metrics.averageLatency <= 10000) { // 10s or less
      score += 4;
    } else if (metrics.averageLatency <= 30000) { // 30s or less
      score += 2;
    }

    // Uptime scoring (0-10 points)
    if (metrics.uptime >= 99.9) {
      score += 10;
    } else if (metrics.uptime >= 99) {
      score += 8;
    } else if (metrics.uptime >= 95) {
      score += 6;
    } else if (metrics.uptime >= 90) {
      score += 4;
    } else if (metrics.uptime >= 80) {
      score += 2;
    }

    return Math.min(score, 40);
  }

  /**
   * Calculate safety score (0-20 points)
   */
  private calculateSafetyScore(metrics: ScoringMetrics): number {
    let score = 0;

    // Audit status (0-10 points)
    if (metrics.auditStatus) {
      score += 10;
    }

    // Incident count (0-10 points) - fewer incidents is better
    if (metrics.incidentCount === 0) {
      score += 10;
    } else if (metrics.incidentCount === 1) {
      score += 5;
    } else if (metrics.incidentCount <= 3) {
      score += 2;
    }

    return Math.min(score, 20);
  }

  /**
   * Calculate gas efficiency bonus (0-5 points)
   */
  private calculateGasEfficiencyBonus(metrics: ScoringMetrics): number {
    // Gas efficiency bonus (0-5 points)
    if (metrics.gasEfficiency >= 90) {
      return 5;
    } else if (metrics.gasEfficiency >= 80) {
      return 3;
    } else if (metrics.gasEfficiency >= 70) {
      return 1;
    }
    return 0;
  }

  /**
   * Calculate total score for an opportunity
   */
  calculateScore(metrics: ScoringMetrics): ScoreBreakdown {
    const performance = this.calculatePerformanceScore(metrics);
    const reliability = this.calculateReliabilityScore(metrics);
    const safety = this.calculateSafetyScore(metrics);
    const gasBonus = this.calculateGasEfficiencyBonus(metrics);
    
    const total = Math.min(performance + reliability + safety + gasBonus, 100);

    return {
      performance,
      reliability,
      safety,
      total
    };
  }

  /**
   * Update opportunity score
   */
  updateOpportunityScore(
    id: number,
    name: string,
    contractAddress: string,
    metrics: ScoringMetrics,
    category: 'staking' | 'lending' | 'liquidity' | 'defi'
  ): OpportunityScore {
    const currentScore = this.calculateScore(metrics);
    const existingScore = this.scores.get(id);
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (existingScore) {
      const diff = currentScore.total - existingScore.currentScore.total;
      if (diff > 2) {
        trend = 'up';
      } else if (diff < -2) {
        trend = 'down';
      }
    }

    const opportunityScore: OpportunityScore = {
      id,
      name,
      contractAddress,
      currentScore,
      previousScore: existingScore?.currentScore || null,
      metrics,
      lastUpdated: Date.now(),
      trend,
      category
    };

    this.scores.set(id, opportunityScore);
    
    // Update history
    const history = this.scoreHistory.get(id) || [];
    history.push({
      timestamp: Date.now(),
      score: currentScore,
      metrics
    });
    
    // Keep only last 30 days of history
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.scoreHistory.set(id, history.filter(h => h.timestamp > thirtyDaysAgo));

    this.saveToStorage();
    return opportunityScore;
  }

  /**
   * Get opportunity score
   */
  getOpportunityScore(id: number): OpportunityScore | null {
    return this.scores.get(id) || null;
  }

  /**
   * Get all opportunity scores
   */
  getAllScores(): OpportunityScore[] {
    return Array.from(this.scores.values());
  }

  /**
   * Get scores by category
   */
  getScoresByCategory(category: 'staking' | 'lending' | 'liquidity' | 'defi'): OpportunityScore[] {
    return Array.from(this.scores.values()).filter(score => score.category === category);
  }

  /**
   * Get top performing opportunities
   */
  getTopOpportunities(limit: number = 10): OpportunityScore[] {
    return Array.from(this.scores.values())
      .sort((a, b) => b.currentScore.total - a.currentScore.total)
      .slice(0, limit);
  }

  /**
   * Get score history for an opportunity
   */
  getScoreHistory(id: number, days: number = 30): ScoreHistory[] {
    const history = this.scoreHistory.get(id) || [];
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    return history.filter(h => h.timestamp > cutoffTime);
  }

  /**
   * Get score statistics
   */
  getScoreStatistics(): {
    totalOpportunities: number;
    averageScore: number;
    scoreDistribution: Record<string, number>;
    categoryAverages: Record<string, number>;
    topPerformer: OpportunityScore | null;
    worstPerformer: OpportunityScore | null;
  } {
    const scores = Array.from(this.scores.values());
    
    if (scores.length === 0) {
      return {
        totalOpportunities: 0,
        averageScore: 0,
        scoreDistribution: {},
        categoryAverages: {},
        topPerformer: null,
        worstPerformer: null
      };
    }

    const totalScore = scores.reduce((sum, score) => sum + score.currentScore.total, 0);
    const averageScore = totalScore / scores.length;

    // Score distribution
    const distribution = {
      'Excellent (90-100)': 0,
      'Good (80-89)': 0,
      'Fair (70-79)': 0,
      'Poor (60-69)': 0,
      'Very Poor (0-59)': 0
    };

    scores.forEach(score => {
      if (score.currentScore.total >= 90) {
        distribution['Excellent (90-100)']++;
      } else if (score.currentScore.total >= 80) {
        distribution['Good (80-89)']++;
      } else if (score.currentScore.total >= 70) {
        distribution['Fair (70-79)']++;
      } else if (score.currentScore.total >= 60) {
        distribution['Poor (60-69)']++;
      } else {
        distribution['Very Poor (0-59)']++;
      }
    });

    // Category averages
    const categoryTotals: Record<string, { total: number; count: number }> = {};
    scores.forEach(score => {
      if (!categoryTotals[score.category]) {
        categoryTotals[score.category] = { total: 0, count: 0 };
      }
      categoryTotals[score.category].total += score.currentScore.total;
      categoryTotals[score.category].count++;
    });

    const categoryAverages: Record<string, number> = {};
    Object.entries(categoryTotals).forEach(([category, data]) => {
      categoryAverages[category] = data.total / data.count;
    });

    // Top and worst performers
    const sortedScores = scores.sort((a, b) => b.currentScore.total - a.currentScore.total);
    const topPerformer = sortedScores[0] || null;
    const worstPerformer = sortedScores[sortedScores.length - 1] || null;

    return {
      totalOpportunities: scores.length,
      averageScore: Math.round(averageScore * 10) / 10,
      scoreDistribution: distribution,
      categoryAverages,
      topPerformer,
      worstPerformer
    };
  }

  /**
   * Generate mock metrics for testing
   */
  generateMockMetrics(opportunityId: number): ScoringMetrics {
    // Generate consistent but varied metrics based on opportunity ID
    const seed = opportunityId * 12345;
    const random = (multiplier: number) => (Math.sin(seed * multiplier) + 1) / 2;

    return {
      apy: 5 + random(1) * 15, // 5-20% APY
      successRate: 80 + random(2) * 20, // 80-100% success rate
      averageLatency: 1000 + random(3) * 5000, // 1-6 seconds
      gasEfficiency: 70 + random(4) * 30, // 70-100% gas efficiency
      auditStatus: random(5) > 0.3, // 70% chance of being audited
      incidentCount: Math.floor(random(6) * 3), // 0-2 incidents
      uptime: 95 + random(7) * 5, // 95-100% uptime
      tvl: 1000 + random(8) * 1000000, // 1K-1M TVL
      age: Math.floor(random(9) * 365) // 0-365 days
    };
  }

  /**
   * Load scores from localStorage
   */
  private loadFromStorage(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          this.scores = new Map(data.scores || []);
          this.scoreHistory = new Map(data.scoreHistory || []);
        }
      }
    } catch (error) {
      console.error('Failed to load scores from storage:', error);
      this.scores = new Map();
      this.scoreHistory = new Map();
    }
  }

  /**
   * Save scores to localStorage
   */
  private saveToStorage(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = {
          scores: Array.from(this.scores.entries()),
          scoreHistory: Array.from(this.scoreHistory.entries())
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to save scores to storage:', error);
    }
  }
}

// Export singleton instance
export const scoringService = new ScoringService();
