'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMarketData } from '@/hooks/useMarketData';

export const MarketOverview: React.FC = () => {
  const { data: marketData, loading, error } = useMarketData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
          <CardDescription>Loading market data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Fetching market data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !marketData) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Error Loading Market Data</CardTitle>
          <CardDescription className="text-red-600">
            {error?.message || 'Failed to load market data'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish': return 'bg-green-500 text-white';
      case 'bearish': return 'bg-red-500 text-white';
      case 'neutral': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish': return '📈';
      case 'bearish': return '📉';
      case 'neutral': return '➡️';
      default: return '➡️';
    }
  };

  const getVolatilityColor = (volatility: number) => {
    if (volatility < 0.5) return 'text-green-600';
    if (volatility < 1.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVolatilityLabel = (volatility: number) => {
    if (volatility < 0.5) return 'Low';
    if (volatility < 1.5) return 'Medium';
    return 'High';
  };

  return (
    <div className="space-y-6">
      {/* Market Overview Header */}
      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
          <CardDescription>Real-time market conditions across all chains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(marketData).map(([chain, data]) => (
              <div key={chain} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize text-lg">{chain}</h3>
                  <Badge className={getSentimentColor(data.sentiment)}>
                    {getSentimentIcon(data.sentiment)} {data.sentiment}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Volatility</span>
                    <div className="text-right">
                      <div className={`font-semibold ${getVolatilityColor(data.volatility)}`}>
                        {data.volatility.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getVolatilityLabel(data.volatility)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">24h Change</span>
                    <div className="text-right">
                      <div className={`font-semibold ${data.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.priceChange >= 0 ? '+' : ''}{data.priceChange.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {data.priceChange >= 0 ? 'Gain' : 'Loss'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Volatility Indicator */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        data.volatility < 0.5 ? 'bg-green-500' :
                        data.volatility < 1.5 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, (data.volatility / 3) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Market Summary</CardTitle>
          <CardDescription>Aggregated market insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Sentiment Distribution</h4>
              <div className="space-y-3">
                {Object.entries(marketData).map(([chain, data]) => (
                  <div key={chain} className="flex items-center justify-between">
                    <span className="capitalize">{chain}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{data.sentiment}</span>
                      <span className="text-lg">{getSentimentIcon(data.sentiment)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Volatility Analysis</h4>
              <div className="space-y-3">
                {Object.entries(marketData).map(([chain, data]) => (
                  <div key={chain} className="flex items-center justify-between">
                    <span className="capitalize">{chain}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getVolatilityColor(data.volatility)}`}>
                        {data.volatility.toFixed(2)}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          data.volatility < 0.5 ? 'border-green-300 text-green-700' :
                          data.volatility < 1.5 ? 'border-yellow-300 text-yellow-700' : 'border-red-300 text-red-700'
                        }`}
                      >
                        {getVolatilityLabel(data.volatility)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Health Indicator */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📊</div>
              <div>
                <h4 className="font-semibold text-blue-900">Market Health</h4>
                <p className="text-sm text-blue-700">
                  {Object.values(marketData).every(data => data.volatility < 2.0) 
                    ? 'All markets showing stable conditions' 
                    : 'Some markets experiencing increased volatility'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
