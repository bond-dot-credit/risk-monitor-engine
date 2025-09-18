'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface OnChainMetrics {
  transactionVolume: number;
  smartContractCalls: number;
  uniqueWallets: number;
}

interface RewardData {
  metrics: OnChainMetrics;
  rewardTier: string;
  monetaryReward: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export function ProtocolRewardsDashboard() {
  const [rewardData, setRewardData] = useState<RewardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
    endDate: new Date()
  });

  // Load reward data when component mounts
  useEffect(() => {
    loadRewardData();
  }, []);

  const loadRewardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/near-protocol-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'collectMetrics',
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setRewardData(result.data);
      } else {
        setError(result.error || 'Failed to load reward data');
      }
    } catch (err) {
      setError('Failed to fetch reward data');
      console.error('Error fetching reward data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Diamond': return 'bg-blue-500';
      case 'Gold': return 'bg-yellow-500';
      case 'Silver': return 'bg-gray-300';
      case 'Bronze': return 'bg-amber-700';
      case 'Contributor': return 'bg-green-500';
      case 'Explorer': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getMetricScore = (metrics: OnChainMetrics) => {
    let score = 0;
    
    // Transaction Volume (8 points)
    if (metrics.transactionVolume >= 10000) {
      score += 8;
    } else if (metrics.transactionVolume >= 5000) {
      score += 6;
    } else if (metrics.transactionVolume >= 1000) {
      score += 4;
    } else if (metrics.transactionVolume >= 100) {
      score += 2;
    }
    
    // Smart Contract Calls (8 points)
    if (metrics.smartContractCalls >= 500) {
      score += 8;
    } else if (metrics.smartContractCalls >= 250) {
      score += 6;
    } else if (metrics.smartContractCalls >= 100) {
      score += 4;
    } else if (metrics.smartContractCalls >= 50) {
      score += 2;
    }
    
    // Unique Wallets (4 points)
    if (metrics.uniqueWallets >= 100) {
      score += 4;
    } else if (metrics.uniqueWallets >= 50) {
      score += 3;
    } else if (metrics.uniqueWallets >= 25) {
      score += 2;
    } else if (metrics.uniqueWallets >= 10) {
      score += 1;
    }
    
    return score;
  };

  const exportData = () => {
    if (!rewardData) return;
    
    const dataStr = JSON.stringify(rewardData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `protocol-rewards-${format(dateRange.startDate, 'yyyy-MM-dd')}-to-${format(dateRange.endDate, 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>NEAR Protocol Rewards</CardTitle>
            <CardDescription>
              Track your on-chain activity and potential rewards
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadRewardData} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button onClick={exportData} variant="outline" disabled={!rewardData}>
              Export Data
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <div className="relative">
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange.startDate && "text-muted-foreground"
                )}
                onClick={() => {/* Handle date picker */}}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.startDate ? format(dateRange.startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <div className="relative">
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange.endDate && "text-muted-foreground"
                )}
                onClick={() => {/* Handle date picker */}}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.endDate ? format(dateRange.endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </div>
          </div>
        </div>

        {rewardData && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-2xl font-bold">Current Reward Tier</h3>
              <Badge className={`mt-2 text-lg px-4 py-2 ${getTierColor(rewardData.rewardTier)}`}>
                {rewardData.rewardTier}
              </Badge>
              <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                ${rewardData.monetaryReward.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Potential reward for period: {format(new Date(rewardData.period.startDate), 'MMM d, yyyy')} - {format(new Date(rewardData.period.endDate), 'MMM d, yyyy')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${rewardData.metrics.transactionVolume.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    Target: $10,000+ ({rewardData.metrics.transactionVolume >= 10000 ? '✓' : '✗'})
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Smart Contract Calls</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{rewardData.metrics.smartContractCalls}</p>
                  <p className="text-sm text-gray-500">
                    Target: 500+ ({rewardData.metrics.smartContractCalls >= 500 ? '✓' : '✗'})
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Unique Wallets</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{rewardData.metrics.uniqueWallets}</p>
                  <p className="text-sm text-gray-500">
                    Target: 100+ ({rewardData.metrics.uniqueWallets >= 100 ? '✓' : '✗'})
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">Scoring Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Transaction Volume:</span>
                  <span>
                    {rewardData.metrics.transactionVolume >= 10000 ? '8' : 
                     rewardData.metrics.transactionVolume >= 5000 ? '6' : 
                     rewardData.metrics.transactionVolume >= 1000 ? '4' : 
                     rewardData.metrics.transactionVolume >= 100 ? '2' : '0'} / 8 points
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Smart Contract Calls:</span>
                  <span>
                    {rewardData.metrics.smartContractCalls >= 500 ? '8' : 
                     rewardData.metrics.smartContractCalls >= 250 ? '6' : 
                     rewardData.metrics.smartContractCalls >= 100 ? '4' : 
                     rewardData.metrics.smartContractCalls >= 50 ? '2' : '0'} / 8 points
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Unique Wallets:</span>
                  <span>
                    {rewardData.metrics.uniqueWallets >= 100 ? '4' : 
                     rewardData.metrics.uniqueWallets >= 50 ? '3' : 
                     rewardData.metrics.uniqueWallets >= 25 ? '2' : 
                     rewardData.metrics.uniqueWallets >= 10 ? '1' : '0'} / 4 points
                  </span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Score:</span>
                  <span>{getMetricScore(rewardData.metrics)} / 20 points</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!rewardData && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No reward data available. Click refresh to load data.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}