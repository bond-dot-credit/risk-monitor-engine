import { useRealTimeData } from './useRealTimeData';

interface SystemStatus {
  isRunning: boolean;
  lastCheck: Date | null;
  config: Record<string, unknown>;
  alertsCount: number;
  performanceMetrics: {
    totalChecks: number;
    averageResponseTime: number;
    lastCheckTime: Date | null;
    errorCount: number;
    successRate: number;
  };
  marketDataCount: number;
  vaultMetricsHistoryCount: number;
}

export function useSystemStatus() {
  return useRealTimeData<SystemStatus>('/api/enhanced-risk-monitor?action=status', 10000);
}
