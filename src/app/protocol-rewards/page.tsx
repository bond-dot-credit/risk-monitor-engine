'use client';

import { ProtocolRewardsDashboard } from '@/components/ProtocolRewardsDashboard';

export default function ProtocolRewardsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">NEAR Protocol Rewards Dashboard</h1>
      <ProtocolRewardsDashboard />
    </div>
  );
}