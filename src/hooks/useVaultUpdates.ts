import { useRealTimeData } from './useRealTimeData';
import { CreditVault } from '@/types/credit-vault';

export function useVaultUpdates(vaultId?: string) {
  const url = vaultId 
    ? `/api/enhanced-risk-monitor?action=alerts&vaultId=${vaultId}`
    : '/api/enhanced-risk-monitor?action=alerts';
    
  return useRealTimeData<CreditVault[]>(url, 3000);
}
