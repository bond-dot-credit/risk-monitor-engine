import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TransactionForm } from '@/components/TransactionForm';

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


  onDeposit?: (opportunityId: number, amount: string, tokenType: string) => Promise<void>;
  onAllocate?: (opportunityId: number, amount: string, tokenType: string) => Promise<void>;
  onWithdraw?: (opportunityId: number, amount: string, tokenType: string) => Promise<void>;
}

export function OpportunityCard({ opportunity, isConnected, onDeposit, onAllocate, onWithdraw }: OpportunityCardProps) {
  const [showForm, setShowForm] = useState<'deposit' | 'allocate' | 'withdraw' | null>(null);
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
          {getScoreBadge(opportunity.trustScore)}
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
      </CardContent>
      
      <CardFooter className="pt-4">
        {isConnected ? (
          <div className="space-y-2 w-full">
            {showForm ? (
              <div className="space-y-3">
                <TransactionForm
                  type={showForm}
                  onSubmit={async (data) => {
                    if (showForm === 'deposit' && onDeposit) {
                      await onDeposit(opportunity.id, data.amount, data.tokenType);
                    } else if (showForm === 'allocate' && onAllocate) {
                      await onAllocate(opportunity.id, data.amount, data.tokenType);
                    } else if (showForm === 'withdraw' && onWithdraw) {
                      await onWithdraw(opportunity.id, data.amount, data.tokenType);
                    }
                    setShowForm(null);
                  }}
                />
                <Button
                  onClick={() => setShowForm(null)}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button 
                  onClick={() => setShowForm('deposit')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={opportunity.status !== 'active'}
                >
                  📥 Deposit
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => setShowForm('allocate')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={opportunity.status !== 'active'}
                  >
                    🔄 Allocate
                  </Button>
                  <Button 
                    onClick={() => setShowForm('withdraw')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={opportunity.status !== 'active'}
                  >
                    📤 Withdraw
                  </Button>
                </div>
              </div>
            )}
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
