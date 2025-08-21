import { useRealTimeData } from './useRealTimeData';

interface MarketData {
  ethereum: { volatility: number; sentiment: string; priceChange: number };
  arbitrum: { volatility: number; sentiment: string; priceChange: number };
  polygon: { volatility: number; sentiment: string; priceChange: number };
}

export function useMarketData() {
  return useRealTimeData<MarketData>('/api/enhanced-risk-monitor?action=market-data', 5000);
}
