import { CreditVault, VaultRiskMetrics, LiquidationEvent, LiquidationTrigger, ChainId } from '@/types/credit-vault';
import { Agent } from '@/types/agent';
import { 
  calculateVaultRiskMetrics, 
  shouldTriggerLiquidationProtection,
  executeProtectionRules,
  recalculateVaultMetrics,
  DEFAULT_CHAIN_CONFIGS
} from './credit-vault';

export interface RiskAlert {
  id: string;
  vaultId: string;
  type: 'WARNING' | 'ALERT' | 'CRITICAL';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface MarketData {
  chainId: ChainId;
  timestamp: Date;
  volatility: number;
  gasPrice: number;
  blockNumber: number;
  priceFeeds: Record<string, number>; // token -> USD price
}

export interface RiskMonitorConfig {
  checkInterval: number; // milliseconds
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
}

export class RiskMonitor {
  private config: RiskMonitorConfig;
  private alerts: Map<string, RiskAlert> = new Map();
  private marketData: Map<ChainId, MarketData> = new Map();
  private monitoringInterval?: NodeJS.Timeout;
  private isRunning: boolean = false;

  constructor(config: RiskMonitorConfig) {
    this.config = config;
  }

  /**
   * Start the risk monitoring service
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.monitoringInterval = setInterval(() => {
      this.performRiskCheck();
    }, this.config.checkInterval);
    
    console.log('Risk monitoring service started');
  }

  /**
   * Stop the risk monitoring service
   */
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    
    console.log('Risk monitoring service stopped');
  }

  /**
   * Update market data for a specific chain
   */
  updateMarketData(chainId: ChainId, data: Partial<MarketData>): void {
    const existing = this.marketData.get(chainId);
    const updated: MarketData = {
      chainId,
      timestamp: new Date(),
      volatility: 1.0,
      gasPrice: 0,
      blockNumber: 0,
      priceFeeds: {},
      ...existing,
      ...data
    };
    
    this.marketData.set(chainId, updated);
  }

  /**
   * Get current market data for a chain
   */
  getMarketData(chainId: ChainId): MarketData | undefined {
    return this.marketData.get(chainId);
  }

  /**
   * Perform comprehensive risk check on all vaults
   */
  private async performRiskCheck(): Promise<void> {
    try {
      // This would typically fetch vaults from a database or store
      // For now, we'll simulate the process
      console.log('Performing risk check...');
      
      // In a real implementation, you would:
      // 1. Fetch all active vaults
      // 2. Get current market data
      // 3. Calculate risk metrics
      // 4. Generate alerts
      // 5. Execute protection rules
      
    } catch (error) {
      console.error('Error during risk check:', error);
    }
  }

  /**
   * Monitor a specific vault for risk
   */
  async monitorVault(
    vault: CreditVault,
    agent: Agent,
    historicalData: Array<{ timestamp: Date; ltv: number; healthFactor: number }> = []
  ): Promise<{
    riskMetrics: VaultRiskMetrics;
    alerts: RiskAlert[];
    protectionTriggered: boolean;
  }> {
    // Get current market data
    const marketData = this.marketData.get(vault.chainId);
    const volatility = marketData?.volatility || 1.0;
    
    // Recalculate vault metrics
    const updatedVault = recalculateVaultMetrics(vault, agent, volatility);
    
    // Calculate risk metrics
    const riskMetrics = calculateVaultRiskMetrics(updatedVault, agent, historicalData);
    
    // Check for alerts
    const alerts = this.generateAlerts(updatedVault, riskMetrics);
    
    // Check if liquidation protection should be triggered
    const protectionTriggered = shouldTriggerLiquidationProtection(updatedVault, agent, volatility);
    
    // Store alerts
    alerts.forEach(alert => this.alerts.set(alert.id, alert));
    
    return {
      riskMetrics,
      alerts,
      protectionTriggered
    };
  }

  /**
   * Generate risk alerts based on vault metrics
   */
  private generateAlerts(vault: CreditVault, riskMetrics: VaultRiskMetrics): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    const timestamp = new Date();
    
    // LTV-based alerts
    if (vault.ltv >= this.config.alertThresholds.ltvCritical) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        vaultId: vault.id,
        type: 'CRITICAL',
        message: `LTV ${vault.ltv.toFixed(2)}% exceeds critical threshold`,
        timestamp,
        acknowledged: false
      });
    } else if (vault.ltv >= this.config.alertThresholds.ltvAlert) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        vaultId: vault.id,
        type: 'ALERT',
        message: `LTV ${vault.ltv.toFixed(2)}% exceeds alert threshold`,
        timestamp,
        acknowledged: false
      });
    } else if (vault.ltv >= this.config.alertThresholds.ltvWarning) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        vaultId: vault.id,
        type: 'WARNING',
        message: `LTV ${vault.ltv.toFixed(2)}% approaching alert threshold`,
        timestamp,
        acknowledged: false
      });
    }
    
    // Health factor alerts
    if (vault.healthFactor <= this.config.alertThresholds.healthFactorCritical) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        vaultId: vault.id,
        type: 'CRITICAL',
        message: `Health factor ${vault.healthFactor.toFixed(2)} below critical threshold`,
        timestamp,
        acknowledged: false
      });
    } else if (vault.healthFactor <= this.config.alertThresholds.healthFactorAlert) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        vaultId: vault.id,
        type: 'ALERT',
        message: `Health factor ${vault.healthFactor.toFixed(2)} below alert threshold`,
        timestamp,
        acknowledged: false
      });
    } else if (vault.healthFactor <= this.config.alertThresholds.healthFactorWarning) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        vaultId: vault.id,
        type: 'WARNING',
        message: `Health factor ${vault.healthFactor.toFixed(2)} approaching alert threshold`,
        timestamp,
        acknowledged: false
      });
    }
    
    // Risk level alerts
    if (riskMetrics.riskLevel === 'CRITICAL') {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        vaultId: vault.id,
        type: 'CRITICAL',
        message: `Vault risk level is CRITICAL (Score: ${riskMetrics.riskScore})`,
        timestamp,
        acknowledged: false
      });
    } else if (riskMetrics.riskLevel === 'HIGH') {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        vaultId: vault.id,
        type: 'ALERT',
        message: `Vault risk level is HIGH (Score: ${riskMetrics.riskScore})`,
        timestamp,
        acknowledged: false
      });
    }
    
    return alerts;
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): RiskAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.acknowledged);
  }

  /**
   * Get alerts for a specific vault
   */
  getVaultAlerts(vaultId: string): RiskAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.vaultId === vaultId);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;
    
    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();
    
    return true;
  }

  /**
   * Get risk summary across all monitored vaults
   */
  getRiskSummary(): {
    totalVaults: number;
    criticalRisk: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    totalAlerts: number;
    unacknowledgedAlerts: number;
  } {
    const alerts = Array.from(this.alerts.values());
    const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
    
    // In a real implementation, you would aggregate this from actual vault data
    return {
      totalVaults: 0, // Would be fetched from store
      criticalRisk: 0,
      highRisk: 0,
      mediumRisk: 0,
      lowRisk: 0,
      totalAlerts: alerts.length,
      unacknowledgedAlerts: unacknowledgedAlerts.length
    };
  }

  /**
   * Simulate market volatility update
   */
  simulateMarketVolatility(chainId: ChainId, volatility: number): void {
    this.updateMarketData(chainId, { volatility });
  }

  /**
   * Simulate price feed update
   */
  simulatePriceUpdate(chainId: ChainId, token: string, price: number): void {
    const marketData = this.marketData.get(chainId);
    if (marketData) {
      this.updateMarketData(chainId, {
        priceFeeds: { ...marketData.priceFeeds, [token]: price }
      });
    }
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    isRunning: boolean;
    lastCheck: Date | null;
    config: RiskMonitorConfig;
    alertsCount: number;
  } {
    return {
      isRunning: this.isRunning,
      lastCheck: null, // Would track last check time
      config: this.config,
      alertsCount: this.alerts.size
    };
  }
}

// Default configuration
export const DEFAULT_RISK_MONITOR_CONFIG: RiskMonitorConfig = {
  checkInterval: 30000, // 30 seconds
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
    protectionCooldown: 3600 // 1 hour
  }
};

// Create default risk monitor instance
export const riskMonitor = new RiskMonitor(DEFAULT_RISK_MONITOR_CONFIG);
