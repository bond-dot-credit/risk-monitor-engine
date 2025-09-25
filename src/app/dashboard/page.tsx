import React from 'react';
import { RealContractDashboard } from '@/components/dashboard/RealContractDashboard';

// Disable SSR for this page to avoid window/localStorage issues
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <RealContractDashboard />
    </div>
  );
}
