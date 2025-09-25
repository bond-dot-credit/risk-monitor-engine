/**
 * Global Statistics Service
 * Manages and aggregates global platform statistics
 */

export interface GlobalStats {
  // Core Metrics
  totalValueLocked: number;
  totalUsers: number;
  activeVaults: number;
  totalTransactions: number;
  
  // Financial Metrics
  totalVolume: number;
  averageApy: number;
  totalYieldGenerated: number;
  dailyVolume: number;
  
  // Performance Metrics
  averageScore: number;
  topPerformingOpportunity: string;
  successRate: number;
  averageGasUsed: number;
  
  // Growth Metrics
  weeklyGrowth: number;
  monthlyGrowth: number;
  newUsersToday: number;
  newVaultsToday: number;
  
  // Risk Metrics
  highRiskOpportunities: number;
  mediumRiskOpportunities: number;
  lowRiskOpportunities: number;
  totalIncidents: number;
  
  // Network Metrics
  averageBlockTime: number;
  networkCongestion: number;
  gasPrice: number;
  activeValidators: number;
}

export interface StatsHistory {
  timestamp: number;
  stats: Partial<GlobalStats>;
}

export interface CategoryStats {
  category: string;
  tvl: number;
  users: number;
  opportunities: number;
  averageApy: number;
  averageScore: number;
}

export class GlobalStatsService {
  private stats: GlobalStats | null = null;
  private statsHistory: StatsHistory[] = [];
  private categoryStats: CategoryStats[] = [];
  private readonly STORAGE_KEY = 'bond_credit_global_stats';
  private readonly HISTORY_KEY = 'bond_credit_stats_history';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Update global statistics
   */
  updateStats(newStats: Partial<GlobalStats>): void {
    const currentStats = this.stats || this.getDefaultStats();
    
    this.stats = {
      ...currentStats,
      ...newStats,
      timestamp: Date.now()
    } as GlobalStats & { timestamp: number };

    // Add to history
    this.statsHistory.unshift({
      timestamp: Date.now(),
      stats: newStats
    });

    // Keep only last 30 days of history
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.statsHistory = this.statsHistory.filter(h => h.timestamp > thirtyDaysAgo);

    this.saveToStorage();
  }

  /**
   * Get current global statistics
   */
  getStats(): GlobalStats | null {
    return this.stats;
  }

  /**
   * Get statistics history
   */
  getStatsHistory(days: number = 30): StatsHistory[] {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    return this.statsHistory.filter(h => h.timestamp > cutoffTime);
  }

  /**
   * Get category statistics
   */
  getCategoryStats(): CategoryStats[] {
    return this.categoryStats;
  }

  /**
   * Update category statistics
   */
  updateCategoryStats(categories: CategoryStats[]): void {
    this.categoryStats = categories;
    this.saveToStorage();
  }

  /**
   * Calculate growth metrics
   */
  calculateGrowthMetrics(): { weekly: number; monthly: number } {
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

    const weeklyStats = this.statsHistory.find(h => h.timestamp <= oneWeekAgo);
    const monthlyStats = this.statsHistory.find(h => h.timestamp <= oneMonthAgo);

    let weeklyGrowth = 0;
    let monthlyGrowth = 0;

    if (weeklyStats && this.stats) {
      const oldTvl = weeklyStats.stats.totalValueLocked || 0;
      const newTvl = this.stats.totalValueLocked;
      weeklyGrowth = oldTvl > 0 ? ((newTvl - oldTvl) / oldTvl) * 100 : 0;
    }

    if (monthlyStats && this.stats) {
      const oldTvl = monthlyStats.stats.totalValueLocked || 0;
      const newTvl = this.stats.totalValueLocked;
      monthlyGrowth = oldTvl > 0 ? ((newTvl - oldTvl) / oldTvl) * 100 : 0;
    }

    return { weekly: weeklyGrowth, monthly: monthlyGrowth };
  }

  /**
   * Get risk distribution
   */
  getRiskDistribution(): { high: number; medium: number; low: number } {
    if (!this.stats) return { high: 0, medium: 0, low: 0 };

    return {
      high: this.stats.highRiskOpportunities,
      medium: this.stats.mediumRiskOpportunities,
      low: this.stats.lowRiskOpportunities
    };
  }

  /**
   * Get performance insights
   */
  getPerformanceInsights(): {
    topCategory: string;
    fastestGrowing: string;
    mostStable: string;
    riskLevel: 'low' | 'medium' | 'high';
  } {
    if (!this.categoryStats.length) {
      return {
        topCategory: 'N/A',
        fastestGrowing: 'N/A',
        mostStable: 'N/A',
        riskLevel: 'medium'
      };
    }

    // Find top category by TVL
    const topCategory = this.categoryStats.reduce((prev, current) => 
      prev.tvl > current.tvl ? prev : current
    ).category;

    // Find fastest growing (highest APY)
    const fastestGrowing = this.categoryStats.reduce((prev, current) => 
      prev.averageApy > current.averageApy ? prev : current
    ).category;

    // Find most stable (highest score)
    const mostStable = this.categoryStats.reduce((prev, current) => 
      prev.averageScore > current.averageScore ? prev : current
    ).category;

    // Determine overall risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (this.stats) {
      const totalRisk = this.stats.highRiskOpportunities + this.stats.mediumRiskOpportunities + this.stats.lowRiskOpportunities;
      const highRiskPercentage = (this.stats.highRiskOpportunities / totalRisk) * 100;
      
      if (highRiskPercentage > 30) {
        riskLevel = 'high';
      } else if (highRiskPercentage < 10) {
        riskLevel = 'low';
      }
    }

    return {
      topCategory,
      fastestGrowing,
      mostStable,
      riskLevel
    };
  }

  /**
   * Generate mock data for testing
   */
  generateMockStats(): GlobalStats {
    const baseTvl = 5000000 + Math.random() * 10000000; // 5M-15M
    const baseUsers = 1000 + Math.random() * 5000; // 1K-6K users
    
    return {
      // Core Metrics
      totalValueLocked: baseTvl,
      totalUsers: Math.floor(baseUsers),
      activeVaults: 50 + Math.floor(Math.random() * 100),
      totalTransactions: 10000 + Math.floor(Math.random() * 50000),
      
      // Financial Metrics
      totalVolume: baseTvl * (2 + Math.random() * 3),
      averageApy: 8 + Math.random() * 12,
      totalYieldGenerated: baseTvl * 0.1,
      dailyVolume: baseTvl * 0.05,
      
      // Performance Metrics
      averageScore: 75 + Math.random() * 20,
      topPerformingOpportunity: 'NEAR Staking Pool',
      successRate: 95 + Math.random() * 5,
      averageGasUsed: 100000000000000 + Math.random() * 200000000000000,
      
      // Growth Metrics
      weeklyGrowth: -5 + Math.random() * 15,
      monthlyGrowth: -10 + Math.random() * 30,
      newUsersToday: Math.floor(Math.random() * 50),
      newVaultsToday: Math.floor(Math.random() * 10),
      
      // Risk Metrics
      highRiskOpportunities: Math.floor(Math.random() * 10),
      mediumRiskOpportunities: 20 + Math.floor(Math.random() * 30),
      lowRiskOpportunities: 30 + Math.floor(Math.random() * 40),
      totalIncidents: Math.floor(Math.random() * 5),
      
      // Network Metrics
      averageBlockTime: 1.2 + Math.random() * 0.6,
      networkCongestion: Math.random() * 100,
      gasPrice: 1000000000000000000 + Math.random() * 5000000000000000000,
      activeValidators: 100 + Math.floor(Math.random() * 50)
    };
  }

  /**
   * Generate mock category statistics
   */
  generateMockCategoryStats(): CategoryStats[] {
    const categories = ['staking', 'lending', 'liquidity', 'defi'];
    
    return categories.map(category => {
      const baseTvl = 500000 + Math.random() * 2000000;
      const baseUsers = 100 + Math.random() * 1000;
      
      return {
        category,
        tvl: baseTvl,
        users: Math.floor(baseUsers),
        opportunities: 5 + Math.floor(Math.random() * 20),
        averageApy: 5 + Math.random() * 15,
        averageScore: 70 + Math.random() * 25
      };
    });
  }

  /**
   * Initialize with mock data
   */
  initializeWithMockData(): void {
    const mockStats = this.generateMockStats();
    const mockCategoryStats = this.generateMockCategoryStats();
    
    this.updateStats(mockStats);
    this.updateCategoryStats(mockCategoryStats);
  }

  /**
   * Get default statistics
   */
  private getDefaultStats(): GlobalStats {
    return {
      totalValueLocked: 0,
      totalUsers: 0,
      activeVaults: 0,
      totalTransactions: 0,
      totalVolume: 0,
      averageApy: 0,
      totalYieldGenerated: 0,
      dailyVolume: 0,
      averageScore: 0,
      topPerformingOpportunity: '',
      successRate: 0,
      averageGasUsed: 0,
      weeklyGrowth: 0,
      monthlyGrowth: 0,
      newUsersToday: 0,
      newVaultsToday: 0,
      highRiskOpportunities: 0,
      mediumRiskOpportunities: 0,
      lowRiskOpportunities: 0,
      totalIncidents: 0,
      averageBlockTime: 0,
      networkCongestion: 0,
      gasPrice: 0,
      activeValidators: 0
    };
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedStats = localStorage.getItem(this.STORAGE_KEY);
        if (storedStats) {
          this.stats = JSON.parse(storedStats);
        }

        const storedHistory = localStorage.getItem(this.HISTORY_KEY);
        if (storedHistory) {
          this.statsHistory = JSON.parse(storedHistory);
        }
      }
    } catch (error) {
      console.error('Failed to load global stats from storage:', error);
      this.stats = null;
      this.statsHistory = [];
    }
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        if (this.stats) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats));
        }
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.statsHistory));
      }
    } catch (error) {
      console.error('Failed to save global stats to storage:', error);
    }
  }
}

// Export singleton instance
export const globalStatsService = new GlobalStatsService();
