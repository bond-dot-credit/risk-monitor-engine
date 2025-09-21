'use client';


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';


interface Opportunity {
  id: number;
  name: string;
  description: string;
  apy: number;
  trustScore: number;
  performance: number;
  reliability: number;
  safety: number;
  totalScore: number;
  riskLevel: string;

   contractAddress?: string;
  tokenAddress?: string;
  category?: string;
  minDeposit?: number;
  maxDeposit?: number;

  tvl?: number; 

}

interface OpportunityCardProps {
  opportunity: Opportunity;
  isConnected: boolean;

  onDeposit?: (opportunityId: number) => void;
  onAllocate?: (opportunityId: number) => void;
  onWithdraw?: (opportunityId: number) => void;
}

export function OpportunityCard({ 
  opportunity, 
  isConnected, 
  onDeposit, 
  onAllocate, 
  onWithdraw 
}: OpportunityCardProps) {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {opportunity.name}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {opportunity.description}
            </CardDescription>
          </div>
          <Badge className={`px-3 py-1 text-xs font-medium ${getRiskColor(opportunity.riskLevel)}`}>
            {opportunity.riskLevel} RISK
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {opportunity.apy.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">APY</div>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {opportunity.trustScore}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Trust Score</div>
          </div>
        </div>

        {/* Trust Score Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Performance</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{opportunity.performance}/40</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(opportunity.performance / 40) * 100}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Reliability</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{opportunity.reliability}/35</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(opportunity.reliability / 35) * 100}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Safety</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{opportunity.safety}/25</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(opportunity.safety / 25) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Contract Info */}
        {opportunity.contractAddress && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Contract Address</div>
            <div className="text-xs font-mono text-slate-900 dark:text-slate-100 break-all">
              {opportunity.contractAddress}
            </div>
          </div>
        )}

        {/* TVL and Limits */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {opportunity.tvl ? formatCurrency(opportunity.tvl) : 'N/A'}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Total Value Locked</div>
          </div>
          <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {opportunity.category || 'N/A'}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Category</div>
          </div>
        </div>

        {/* Action Buttons */}
        {isConnected ? (
          <div className="space-y-3">
            <Button 
              onClick={() => onDeposit?.(opportunity.id)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              📥 Deposit to Vault
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => onAllocate?.(opportunity.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                🔄 Allocate
              </Button>
              <Button 
                onClick={() => onWithdraw?.(opportunity.id)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
                size="sm"
              >
                📤 Withdraw
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            className="w-full bg-slate-600 hover:bg-slate-700 text-white"
            disabled
            size="sm"
          >
            🔗 Connect Wallet to Allocate
          </Button>
        )}

        {/* Deposit Limits */}
        {opportunity.minDeposit && opportunity.maxDeposit && (
          <div className="text-xs text-slate-500 dark:text-slate-500 text-center">
            Min: {opportunity.minDeposit} NEAR • Max: {opportunity.maxDeposit} NEAR
          </div>
        )}
      </CardContent>
    </Card>
  );
}
