import { useRealTimeData } from './useRealTimeData';
import { EnhancedRiskAlert } from '@/lib/risk-monitor-enhanced';

export function useRiskAlerts() {
  return useRealTimeData<EnhancedRiskAlert[]>('/api/enhanced-risk-monitor?action=alerts', 2000);
}
