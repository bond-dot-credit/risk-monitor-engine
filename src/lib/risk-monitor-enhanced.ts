import { CreditVault, VaultRiskMetrics, ChainId } from '@/types/credit-vault';
import { Agent } from '@/types/agent';
import { 
  calculateVaultRiskMetrics, 
  shouldTriggerLiquidationProtection,
  recalculateVaultMetrics
} from './credit-vault';

export interface EnhancedRiskAlert {
  id: string;
  vaultId: string;
  type: 'WARNING' | 'ALERT' | 'CRITICAL';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'LTV' | 'HEALTH_FACTOR' | 'MARKET_RISK' | 'LIQUIDATION' | 'PERFORMANCE' | 'SYSTEM';
  metadata: Record<string, unknown>;
  escalationLevel: number;
  autoEscalation: boolean;
  relatedAlerts: string[];
}

export interface EnhancedMarketData {
  chainId: ChainId;
  timestamp: Date;
  volatility: number;
  gasPrice: number;
  blockNumber: number;
  priceFeeds: Record<string, number>;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  volatilityIndex: number;
  marketSentiment: 'BEARISH' | 'NEUTRAL' | 'BULLISH';
}

export interface RiskMonitorConfig {
  checkInterval: number;
  alertThresholds: {
    ltvWarning: number;
    ltvAlert: number;
    ltvCritical: number;
    healthFactorWarning: number;
    healthFactorAlert: number;
    healthFactorCritical: number;
  };
  autoProtection: {
    enabled: boolean;
    maxProtectionTriggers: number;
    protectionCooldown: number;
  };
  performance: {
    maxConcurrentVaults: number;
    batchSize: number;
    timeoutMs: number;
    retryAttempts: number;
  };
  analytics: {
    enableRealTimeMetrics: boolean;
    enablePredictiveAnalysis: boolean;
    enableCorrelationAnalysis: boolean;
    dataRetentionDays: number;
  };
}

export interface PredictiveRiskMetrics {
  predictedLTV: number;
  predictedHealthFactor: number;
  riskProbability: number;
  timeHorizon: number;
  confidence: number;
  factors: string[];
}

export class EnhancedRiskMonitor {
  private config: RiskMonitorConfig;
  private alerts: Map<string, EnhancedRiskAlert> = new Map();
  private marketData: Map<ChainId, EnhancedMarketData> = new Map();
  private monitoringInterval?: NodeJS.Timeout;
  private isRunning: boolean = false;
  private performanceMetrics = {
    totalChecks: 0,
    averageResponseTime: 0,
    lastCheckTime: null as Date | null,
    errorCount: 0,
    successRate: 100
  };

  constructor(config: RiskMonitorConfig) {
    this.config = config;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.monitoringInterval = setInterval(() => {
      this.performEnhancedRiskCheck();
    }, this.config.checkInterval);
    console.log('Enhanced risk monitoring service started');
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    console.log('Enhanced risk monitoring service stopped');
  }

  updateMarketData(chainId: ChainId, data: Partial<EnhancedMarketData>): void {
    const existing = this.marketData.get(chainId);
    const updated: EnhancedMarketData = {
      chainId,
      timestamp: new Date(),
      volatility: 1.0,
      gasPrice: 0,
      blockNumber: 0,
      priceFeeds: {},
      marketCap: 0,
      volume24h: 0,
      priceChange24h: 0,
      volatilityIndex: 1.0,
      marketSentiment: 'NEUTRAL',
      ...existing,
      ...data
    };
    this.marketData.set(chainId, updated);
  }

  getMarketData(chainId: ChainId): EnhancedMarketData | undefined {
    return this.marketData.get(chainId);
  }

  private async performEnhancedRiskCheck(): Promise<void> {
    const startTime = Date.now();
    try {
      this.performanceMetrics.totalChecks++;
      console.log('Performing enhanced risk check...');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      this.performanceMetrics.averageResponseTime = 
        (this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalChecks - 1) + responseTime) / this.performanceMetrics.totalChecks;
      this.performanceMetrics.lastCheckTime = new Date();
      this.performanceMetrics.successRate = 
        ((this.performanceMetrics.totalChecks - this.performanceMetrics.errorCount) / this.performanceMetrics.totalChecks) * 100;
      
    } catch (error) {
      this.performanceMetrics.errorCount++;
      console.error('Error during enhanced risk check:', error);
    }
  }

  async monitorVault(
    vault: CreditVault,
    agent: Agent,
    historicalData: Array<{ timestamp: Date; ltv: number; healthFactor: number }> = []
  ): Promise<{
    riskMetrics: VaultRiskMetrics;
    alerts: EnhancedRiskAlert[];
    protectionTriggered: boolean;
    predictiveMetrics: PredictiveRiskMetrics;
    performanceMetrics: {
      responseTime: number;
      dataPoints: number;
      accuracy: number;
    };
  }> {
    const startTime = Date.now();
    
    try {
      const marketData = this.marketData.get(vault.chainId);
      const volatility = marketData?.volatility || 1.0;
      
      const updatedVault = recalculateVaultMetrics(vault, agent, volatility);
      const riskMetrics = calculateVaultRiskMetrics(updatedVault, agent, historicalData);
      const alerts = this.generateEnhancedAlerts(updatedVault, riskMetrics, marketData);
      const protectionTriggered = shouldTriggerLiquidationProtection(updatedVault, agent, volatility);
      const predictiveMetrics = this.calculatePredictiveRiskMetrics(updatedVault, historicalData, marketData);
      
      alerts.forEach(alert => this.alerts.set(alert.id, alert));
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      return {
        riskMetrics,
        alerts,
        protectionTriggered,
        predictiveMetrics,
        performanceMetrics: {
          responseTime,
          dataPoints: historicalData.length,
          accuracy: Math.max(0.1, Math.min(1, predictiveMetrics.confidence))
        }
      };
      
    } catch (error) {
      console.error('Error monitoring vault:', error);
      throw error;
    }
  }

  private generateEnhancedAlerts(
    vault: CreditVault, 
    riskMetrics: VaultRiskMetrics, 
    marketData?: EnhancedMarketData
  ): EnhancedRiskAlert[] {
    const alerts: EnhancedRiskAlert[] = [];
    const timestamp = new Date();
    
    if (vault.ltv >= this.config.alertThresholds.ltvCritical) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        vaultId: vault.id,
        type: 'CRITICAL',
        message: `LTV ${vault.ltv.toFixed(2)}% exceeds critical threshold`,
        timestamp,
        acknowledged: false,
        severity: 'CRITICAL',
        category: 'LTV',
        metadata: { currentLTV: vault.ltv, threshold: this.config.alertThresholds.ltvCritical },
        escalationLevel: 3,
        autoEscalation: true,
        relatedAlerts: []
      });
    }
    
    if (vault.healthFactor <= this.config.alertThresholds.healthFactorCritical) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        vaultId: vault.id,
        type: 'CRITICAL',
        message: `Health factor ${vault.healthFactor.toFixed(2)} below critical threshold`,
        timestamp,
        acknowledged: false,
        severity: 'CRITICAL',
        category: 'HEALTH_FACTOR',
        metadata: { currentHealthFactor: vault.healthFactor, threshold: this.config.alertThresholds.healthFactorCritical },
        escalationLevel: 3,
        autoEscalation: true,
        relatedAlerts: []
      });
    }
    
    return alerts;
  }

  private calculatePredictiveRiskMetrics(
    vault: CreditVault,
    historicalData: Array<{ timestamp: Date; ltv: number; healthFactor: number }>,
    marketData?: EnhancedMarketData
  ): PredictiveRiskMetrics {
    if (historicalData.length < 3) {
      return {
        predictedLTV: vault.ltv,
        predictedHealthFactor: vault.healthFactor,
        riskProbability: 0.5,
        timeHorizon: 24,
        confidence: 0.1,
        factors: ['Insufficient historical data']
      };
    }

    const volatilityImpact = marketData?.volatilityIndex || 1.0;
    const volatilityMultiplier = Math.max(0.5, Math.min(2.0, volatilityImpact));
    
    const predictedLTV = Math.max(0, Math.min(100, vault.ltv * volatilityMultiplier));
    const predictedHealthFactor = Math.max(0.1, vault.healthFactor / volatilityMultiplier);
    
    const riskProbability = Math.min(1, (predictedLTV - vault.maxLTV) / (100 - vault.maxLTV));
    const confidence = Math.min(1, historicalData.length / 10);
    
    return {
      predictedLTV,
      predictedHealthFactor,
      riskProbability,
      timeHorizon: 24,
      confidence,
      factors: [`Market volatility: ${volatilityImpact.toFixed(2)}`]
    };
  }

  getActiveAlerts(): EnhancedRiskAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.acknowledged);
  }

  getVaultAlerts(vaultId: string): EnhancedRiskAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.vaultId === vaultId);
  }

  getAlertsByCategory(category: string): EnhancedRiskAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.category === category);
  }

  getAlertsBySeverity(severity: string): EnhancedRiskAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.severity === severity);
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;
    
    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();
    
    return true;
  }

  getEnhancedRiskSummary() {
    const alerts = Array.from(this.alerts.values());
    const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
    
    const alertsByCategory: Record<string, number> = {};
    const alertsBySeverity: Record<string, number> = {};
    
    alerts.forEach(alert => {
      alertsByCategory[alert.category] = (alertsByCategory[alert.category] || 0) + 1;
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
    });
    
    const chains = Array.from(this.marketData.keys());
    const averageVolatility = chains.length > 0 
      ? chains.reduce((sum, chainId) => {
          const data = this.marketData.get(chainId);
          return sum + (data?.volatilityIndex || 1.0);
        }, 0) / chains.length
      : 1.0;
    
    return {
      totalVaults: 0,
      criticalRisk: 0,
      highRisk: 0,
      mediumRisk: 0,
      lowRisk: 0,
      totalAlerts: alerts.length,
      unacknowledgedAlerts: unacknowledgedAlerts.length,
      alertsByCategory,
      alertsBySeverity,
      performanceMetrics: { ...this.performanceMetrics },
      marketOverview: {
        totalChains: chains.length,
        averageVolatility,
        marketSentiment: 'NEUTRAL'
      }
    };
  }

  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  simulateMarketVolatility(chainId: ChainId, volatility: number): void {
    this.updateMarketData(chainId, { volatility, volatilityIndex: volatility });
  }

  simulatePriceUpdate(chainId: ChainId, token: string, price: number): void {
    const marketData = this.marketData.get(chainId);
    if (marketData) {
      this.updateMarketData(chainId, {
        priceFeeds: { ...marketData.priceFeeds, [token]: price }
      });
    }
  }

  getEnhancedStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: this.performanceMetrics.lastCheckTime,
      config: this.config,
      alertsCount: this.alerts.size,
      performanceMetrics: { ...this.performanceMetrics },
      marketDataCount: this.marketData.size,
      vaultMetricsHistoryCount: 0
    };
  }
}

export const ENHANCED_RISK_MONITOR_CONFIG: RiskMonitorConfig = {
  checkInterval: 30000,
  alertThresholds: {
    ltvWarning: 70,
    ltvAlert: 80,
    ltvCritical: 90,
    healthFactorWarning: 1.5,
    healthFactorAlert: 1.3,
    healthFactorCritical: 1.1
  },
  autoProtection: {
    enabled: true,
    maxProtectionTriggers: 3,
    protectionCooldown: 3600
  },
  performance: {
    maxConcurrentVaults: 100,
    batchSize: 10,
    timeoutMs: 5000,
    retryAttempts: 3
  },
  analytics: {
    enableRealTimeMetrics: true,
    enablePredictiveAnalysis: true,
    enableCorrelationAnalysis: true,
    dataRetentionDays: 30
  }
};

export const enhancedRiskMonitor = new EnhancedRiskMonitor(ENHANCED_RISK_MONITOR_CONFIG);
