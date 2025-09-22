import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useRealTimeData } from '@/hooks/useRealTimeData';

interface PriceData {
  token: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  timestamp: number;
}

export const RealTimePriceTicker: React.FC = () => {
  const { data, isConnected } = useRealTimeData();
  const [prices, setPrices] = useState<PriceData[]>([]);

  // Mock price data for demonstration (in real app, this would come from WebSocket)
  useEffect(() => {
    const mockPrices: PriceData[] = [
      {
        token: 'NEAR',
        price: 3.45,
        change24h: 0.12,
        changePercent24h: 3.6,
        volume24h: 125000000,
        timestamp: Date.now()
      },
      {
        token: 'USDC',
        price: 1.00,
        change24h: 0.001,
        changePercent24h: 0.1,
        volume24h: 890000000,
        timestamp: Date.now()
      },
      {
        token: 'USDT',
        price: 0.999,
        change24h: -0.001,
        changePercent24h: -0.1,
        volume24h: 750000000,
        timestamp: Date.now()
      }
    ];

    setPrices(mockPrices);

    // Simulate real-time price updates
    const interval = setInterval(() => {
      setPrices(prevPrices => 
        prevPrices.map(price => ({
          ...price,
          price: price.price + (Math.random() - 0.5) * 0.01,
          changePercent24h: price.changePercent24h + (Math.random() - 0.5) * 0.2,
          timestamp: Date.now()
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return price.toFixed(price >= 1 ? 2 : 4);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(1)}B`;
    } else if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '↗️';
    if (change < 0) return '↘️';
    return '→';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📈 Real-Time Prices
          {isConnected ? (
            <StatusBadge status="success" text="Live" />
          ) : (
            <StatusBadge status="error" text="Offline" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prices.map((price, index) => (
            <div
              key={price.token}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {price.token.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {price.token}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Vol: ${formatVolume(price.volume24h)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  ${formatPrice(price.price)}
                </div>
                <div className={`text-sm flex items-center gap-1 ${getChangeColor(price.changePercent24h)}`}>
                  <span>{getChangeIcon(price.changePercent24h)}</span>
                  <span>{price.changePercent24h > 0 ? '+' : ''}{price.changePercent24h.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <span>Updates every 5s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
