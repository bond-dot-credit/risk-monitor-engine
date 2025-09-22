import { useState, useEffect, useCallback } from 'react';
import { contractDataService, Opportunity, GlobalStats, VaultData } from '@/services/contract-data-service';

export interface UseContractDataReturn {
  // Data
  opportunities: Opportunity[];
  globalStats: GlobalStats | null;
  vaultData: VaultData | null;
  
  // Loading states
  isLoadingOpportunities: boolean;
  isLoadingGlobalStats: boolean;
  isLoadingVaultData: boolean;
  
  // Error states
  opportunitiesError: string | null;
  globalStatsError: string | null;
  vaultDataError: string | null;
  
  // Contract health
  contractHealth: {
    registry: boolean;
    vault: boolean;
    opportunities: boolean;
  } | null;
  
  // Actions
  refreshOpportunities: () => Promise<void>;
  refreshGlobalStats: () => Promise<void>;
  refreshVaultData: (userId: string) => Promise<void>;
  checkContractHealth: () => Promise<void>;
}

export function useContractData(userId?: string): UseContractDataReturn {
  // State for opportunities
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);

  // State for global stats
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [isLoadingGlobalStats, setIsLoadingGlobalStats] = useState(false);
  const [globalStatsError, setGlobalStatsError] = useState<string | null>(null);

  // State for vault data
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [isLoadingVaultData, setIsLoadingVaultData] = useState(false);
  const [vaultDataError, setVaultDataError] = useState<string | null>(null);

  // State for contract health
  const [contractHealth, setContractHealth] = useState<{
    registry: boolean;
    vault: boolean;
    opportunities: boolean;
  } | null>(null);

  // Initialize contract service
  useEffect(() => {
    const initializeService = async () => {
      try {
        await contractDataService.initialize();
        await checkContractHealth();
      } catch (error) {
        console.error('Failed to initialize contract service:', error);
      }
    };

    initializeService();
  }, []);

  // Load opportunities
  const refreshOpportunities = useCallback(async () => {
    setIsLoadingOpportunities(true);
    setOpportunitiesError(null);
    
    try {
      const data = await contractDataService.getOpportunities(20, 0);
      setOpportunities(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load opportunities';
      setOpportunitiesError(errorMessage);
      console.error('Error loading opportunities:', error);
    } finally {
      setIsLoadingOpportunities(false);
    }
  }, []);

  // Load global stats
  const refreshGlobalStats = useCallback(async () => {
    setIsLoadingGlobalStats(true);
    setGlobalStatsError(null);
    
    try {
      const data = await contractDataService.getGlobalStats();
      setGlobalStats(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load global stats';
      setGlobalStatsError(errorMessage);
      console.error('Error loading global stats:', error);
    } finally {
      setIsLoadingGlobalStats(false);
    }
  }, []);

  // Load vault data
  const refreshVaultData = useCallback(async (userId: string) => {
    if (!userId) return;
    
    setIsLoadingVaultData(true);
    setVaultDataError(null);
    
    try {
      const data = await contractDataService.getUserVaultData(userId);
      setVaultData(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load vault data';
      setVaultDataError(errorMessage);
      console.error('Error loading vault data:', error);
    } finally {
      setIsLoadingVaultData(false);
    }
  }, []);

  // Check contract health
  const checkContractHealth = useCallback(async () => {
    try {
      const health = await contractDataService.checkContractHealth();
      setContractHealth(health);
    } catch (error) {
      console.error('Error checking contract health:', error);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    refreshOpportunities();
    refreshGlobalStats();
  }, [refreshOpportunities, refreshGlobalStats]);

  // Load vault data when userId changes
  useEffect(() => {
    if (userId) {
      refreshVaultData(userId);
    }
  }, [userId, refreshVaultData]);

  return {
    // Data
    opportunities,
    globalStats,
    vaultData,
    
    // Loading states
    isLoadingOpportunities,
    isLoadingGlobalStats,
    isLoadingVaultData,
    
    // Error states
    opportunitiesError,
    globalStatsError,
    vaultDataError,
    
    // Contract health
    contractHealth,
    
    // Actions
    refreshOpportunities,
    refreshGlobalStats,
    refreshVaultData,
    checkContractHealth,
  };
}
