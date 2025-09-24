'use client';

import { useState } from 'react';

interface UserVaultSectionProps {
  account: string;
}

export function UserVaultSection({ account }: UserVaultSectionProps) {
  const [isClaimingYield, setIsClaimingYield] = useState(false);
  
  // Mock data - will be fetched from Vault contract
  const vaultData = {
    totalDeposits: 1250.50,
    totalYield: 45.20,
    vaultShares: 1250.50,
    strategies: [
      { name: "Stake wNEAR", amount: 800.00, apy: 12.5, yield: 28.50 },
      { name: "USDC Lending", amount: 450.50, apy: 8.2, yield: 16.70 }
    ]
  };

  const handleClaimYield = async () => {
    setIsClaimingYield(true);
    try {
      // Simulate yield claim transaction
      console.log('Claiming yield for account:', account);
      
      // In a real implementation, this would call the vault contract
      // For now, we'll simulate the transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Yield claimed successfully!');
      // You could add a success notification here
    } catch (error) {
      console.error('Failed to claim yield:', error);
      // You could add an error notification here
    } finally {
      setIsClaimingYield(false);
    }
  };

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          My Vault
        </h2>
        <p className="text-lg text-slate-800 dark:text-slate-300">
          Manage your deposits and track your earnings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vault Overview */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Portfolio Overview
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                ${vaultData.totalDeposits.toLocaleString()}
              </div>
              <div className="text-sm text-slate-800 dark:text-slate-400">
                Total Deposits
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                +${vaultData.totalYield.toFixed(2)}
              </div>
              <div className="text-sm text-slate-800 dark:text-slate-400">
                Yield Earned
              </div>
            </div>
          </div>

          {/* Active Strategies */}
          <div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Active Strategies
            </h4>
            <div className="space-y-3">
              {vaultData.strategies.map((strategy, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {strategy.name}
                    </div>
                    <div className="text-sm text-slate-800 dark:text-slate-400">
                      ${strategy.amount.toLocaleString()} • {strategy.apy}% APY
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 dark:text-green-400 font-semibold">
                      +${strategy.yield.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      yield
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-center space-x-2">
              <span>💰</span>
              <span>Deposit Funds</span>
            </div>
          </button>
          
          <button className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-center space-x-2">
              <span>📤</span>
              <span>Withdraw Funds</span>
            </div>
          </button>

          <button 
            onClick={handleClaimYield}
            disabled={isClaimingYield}
            className={`w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${isClaimingYield ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🎯</span>
              <span>{isClaimingYield ? 'Claiming...' : 'Claim Yield'}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
