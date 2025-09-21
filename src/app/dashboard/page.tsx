import React from 'react';
import { IntentBasedDashboard } from '@/components/dashboard/IntentBasedDashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <IntentBasedDashboard />
    </div>
  );
}
