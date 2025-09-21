'use client';

import { Header } from "@/components/Header";
import { NearLoginButton } from "@/components/NearLoginButton";
import { useNearWallet } from "@/hooks/useNearWallet";
import { OpportunityCard } from "@/components/OpportunityCard";
import { GlobalStats } from "@/components/GlobalStats";
import { UserVaultSection } from "@/components/UserVaultSection";
import { TransactionHistory } from "@/components/TransactionHistory";

export default function Home() {
  const { account, isConnected, disconnect } = useNearWallet();

  const handleLoginSuccess = (accountId: string) => {
    console.log('Login successful for account:', accountId);
  };

  const handleLogout = async () => {
    await disconnect();
  };

  // Mock data for opportunities (will be fetched from Registry contract)
  const opportunities = [
    {
      id: 1,
      name: "Stake wNEAR",
      description: "Stake wrapped NEAR tokens to earn staking rewards",
      apy: 12.5,
      trustScore: 85,
      performance: 35,
      reliability: 38,
      safety: 12,
      totalScore: 85,
      riskLevel: "Preferred ⭐"
    },
    {
      id: 2,
      name: "USDC Lending",
      description: "Lend USDC to earn interest through DeFi protocols",
      apy: 8.2,
      trustScore: 72,
      performance: 28,
      reliability: 32,
      safety: 12,
      totalScore: 72,
      riskLevel: "Moderate ✅"
    },
    {
      id: 3,
      name: "NEAR Liquid Staking",
      description: "Liquid staking derivative for NEAR tokens",
      apy: 15.8,
      trustScore: 45,
      performance: 25,
      reliability: 15,
      safety: 5,
      totalScore: 45,
      riskLevel: "Caution 🚨"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              bond.credit
            </h1>
          </div>
          <p className="text-xl text-slate-700 dark:text-slate-200 mb-2 font-medium">
            Credit layer for the agentic economy
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Discover high-yield opportunities with our v0 scoring system. Earn rewards through trusted protocols.
          </p>

          {/* CTA Button */}
          <div className="mb-12">
            {!isConnected ? (
              <NearLoginButton 
                onLoginSuccess={handleLoginSuccess}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    Connected: {account}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Stats */}
        <GlobalStats />

        {/* Opportunities Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Investment Opportunities
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Browse available opportunities with our v0 scoring system based on Performance, Reliability, and Safety
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <OpportunityCard 
                key={opportunity.id} 
                opportunity={opportunity} 
                isConnected={isConnected}
              />
            ))}
          </div>
        </div>

        {/* User-specific sections when logged in */}
        {isConnected && account && (
          <>
            <UserVaultSection account={account} />
            <TransactionHistory account={account} />
          </>
        )}

        {/* Call to Action for non-logged users */}
        {!isConnected && (
          <div className="text-center py-12 bg-white/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Ready to Start Earning?
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
              Connect your NEAR wallet to deposit funds, allocate to strategies, and start earning yield on your assets.
            </p>
            <NearLoginButton 
              onLoginSuccess={handleLoginSuccess}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            />
          </div>
        )}
      </main>
    </div>
  );
}