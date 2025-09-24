'use client';

import { Header } from '@/components/Header';
import RealVaultDashboard from '@/components/RealVaultDashboard';

export default function VaultPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 xl:py-12">
        <div className="mb-8 sm:mb-12 lg:mb-16 xl:mb-20">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-2 sm:mb-3 lg:mb-4 px-2 sm:px-4 leading-tight">
              Bond.Credit Vault
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-800 dark:text-slate-300 max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto px-2 sm:px-4 leading-relaxed">
              Deposit tokens and earn yield through automated DeFi strategies
            </p>
          </div>
        </div>

        <RealVaultDashboard />
      </main>
    </div>
  );
}

