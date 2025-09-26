'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with ssr: false for client-side only rendering
const RealContractDashboard = dynamic<{}>(
  () => import('@/components/dashboard/RealContractDashboard').then(mod => mod.RealContractDashboard),
  { 
    ssr: false, 
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Dashboard...</h1>
        </div>
      </div>
    ) 
  }
);

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Dashboard...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <RealContractDashboard />
    </div>
  );
}
