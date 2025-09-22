import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TrustScoreDisplay } from '@/components/TrustScoreDisplay';
import { scoringService, OpportunityScore } from '@/services/scoring-service';

interface Opportunity {
  id: number;
  name: string;
  description: string;
  apy: number;
  trustScore: number;
  contractAddress?: string;
  category?: string;
  tvl?: number;
  maxDeposit?: number;
  minDeposit?: number;
  status?: 'active' | 'inactive' | 'paused';
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  isConnected: boolean;
  onDeposit?: (opportunityId: number) => void;
  onAllocate?: (opportunityId: number) => void;
  onWithdraw?: (opportunityId: number) => void;
}

export function OpportunityCard({ opportunity, isConnected, onDeposit, onAllocate, onWithdraw }: OpportunityCardProps) {
  const [opportunityScore, setOpportunityScore] = useState<OpportunityScore | null>(null);
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  // Initialize or update opportunity score
  useEffect(() => {
    const mockMetrics = scoringService.generateMockMetrics(opportunity.id);
    const score = scoringService.updateOpportunityScore(
      opportunity.id,
      opportunity.name,
      opportunity.contractAddress || '',
      mockMetrics,
      (opportunity.category as any) || 'defi'
    );
    setOpportunityScore(score);
  }, [opportunity]);
  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge variant="default" className="bg-green-500 text-white">⭐ Preferred ({score})</Badge>;
    if (score >= 50) return <Badge variant="default" className="bg-yellow-500 text-white">✅ Moderate ({score})</Badge>;
    return <Badge variant="destructive">🚨 Caution ({score})</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'staking': return '🔒';
      case 'lending': return '💰';
      case 'liquidity': return '💧';
      case 'defi': return '🏛️';
      default: return '📊';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <StatusBadge status="success" text="Active" />;
      case 'paused': return <StatusBadge status="warning" text="Paused" />;
      case 'inactive': return <StatusBadge status="error" text="Inactive" />;
      default: return <StatusBadge status="info" text="Unknown" />;
    }
  };

  return (
    <Card className="w-full max-w-sm bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryIcon(opportunity.category || '')}</span>
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {opportunity.name}
            </CardTitle>
          </div>
          {opportunity.status && getStatusBadge(opportunity.status)}
        </div>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          {opportunity.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">APY:</span>
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            {opportunity.apy.toFixed(1)}%
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Trust Score:</span>
          <div className="flex items-center gap-2">
            {opportunityScore && (
              <Badge 
                variant="outline" 
                className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  opportunityScore.currentScore.total >= 80 ? 'border-green-500 text-green-600' :
                  opportunityScore.currentScore.total >= 60 ? 'border-yellow-500 text-yellow-600' :
                  'border-red-500 text-red-600'
                }`}
                onClick={() => setShowScoreDetails(!showScoreDetails)}
              >
                {opportunityScore.currentScore.total}/100
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScoreDetails(!showScoreDetails)}
              className="h-6 px-2 text-xs"
            >
              {showScoreDetails ? 'Hide' : 'Details'}
            </Button>
          </div>
        </div>
        
        {opportunity.tvl && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">TVL:</span>
            <span className="text-md font-semibold text-slate-800 dark:text-slate-200">
              ${opportunity.tvl.toLocaleString()}
            </span>
          </div>
        )}
        
        {opportunity.minDeposit && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Min Deposit:</span>
            <span className="text-md font-semibold text-slate-800 dark:text-slate-200">
              {opportunity.minDeposit} NEAR
            </span>
          </div>
        )}
        
        {opportunity.maxDeposit && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Deposit:</span>
            <span className="text-md font-semibold text-slate-800 dark:text-slate-200">
              {opportunity.maxDeposit} NEAR
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Category:</span>
          <Badge variant="secondary">{opportunity.category}</Badge>
        </div>

        {/* Trust Score Details */}
        {showScoreDetails && opportunityScore && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <TrustScoreDisplay
              score={opportunityScore}
              showBreakdown={true}
              showMetrics={true}
              size="sm"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4">
        {isConnected ? (
          <div className="space-y-2 w-full">
            <Button 
              onClick={() => onDeposit?.(opportunity.id)} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={opportunity.status !== 'active'}
            >
              📥 Deposit
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => onAllocate?.(opportunity.id)} 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={opportunity.status !== 'active'}
              >
                🔄 Allocate
              </Button>
              <Button 
                onClick={() => onWithdraw?.(opportunity.id)} 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={opportunity.status !== 'active'}
              >
                📤 Withdraw
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            className="w-full bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed" 
            disabled
          >
            Connect Wallet to Interact
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
