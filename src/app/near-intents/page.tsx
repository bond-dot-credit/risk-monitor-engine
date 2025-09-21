'use client';

import React from 'react';
import NearIntentsDashboard from '@/components/NearIntentsDashboard';
import { NearBlocksViewer } from '@/components/NearBlocksViewer';
import { Header } from '@/components/Header';

export default function NearIntentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">NEAR Intents Integration</h1>
          <p className="text-slate-800 dark:text-slate-300 mt-2">
            Execute cross-chain transactions using the NEAR Intents protocol
          </p>
        </div>
        <div className="space-y-8">
          <NearIntentsDashboard />
          <NearBlocksViewer />
        </div>
      </main>
    </div>
  );
}