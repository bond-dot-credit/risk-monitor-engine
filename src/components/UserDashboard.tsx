'use client';

import { NearAccount } from '@/hooks/useNearWallet';
import { useState } from 'react';

interface UserDashboardProps {
  account: NearAccount;
  onLogout: () => void;
}

interface YieldOpportunity {
  id: string;
  name: string;
  description: string;
  apy: number;
  trustScore: number;
  minDeposit: string;
  token: string;
  risk: 'Low' | 'Medium' | 'High';
}

const mockYieldOpportunities: YieldOpportunity[] = [
  {
    id: '1',
    name: 'NEAR Staking',
    description: 'Stake NEAR tokens to secure the network and earn rewards',
    apy: 8.5,
    trustScore: 95,
    minDeposit: '1',
    token: 'NEAR',
    risk: 'Low'
  },
  {
    id: '2',
    name: 'USDC Lending Pool',
    description: 'Lend USDC to earn interest from borrowers',
    apy: 12.3,
    trustScore: 88,
    minDeposit: '100',
    token: 'USDC',
    risk: 'Medium'
  },
  {
    id: '3',
    name: 'Liquidity Provider',
    description: 'Provide liquidity to NEAR/USDC pool on Ref Finance',
    apy: 15.7,
    trustScore: 82,
    minDeposit: '50',
    token: 'LP',
    risk: 'Medium'
  },
  {
    id: '4',
    name: 'DeFi Yield Farming',
    description: 'Advanced yield farming strategies across multiple protocols',
    apy: 22.1,
    trustScore: 75,
    minDeposit: '200',
    token: 'MULTI',
    risk: 'High'
  }
];

export function UserDashboard({ account, onLogout }: UserDashboardProps) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<YieldOpportunity | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  const handleDeposit = async () => {
    if (!selectedOpportunity || !depositAmount) return;
    
    setIsDepositing(true);
    
    try {
      // Simulate deposit process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Successfully deposited ${depositAmount} ${selectedOpportunity.token} to ${selectedOpportunity.name}!`);
      
      // Reset form
      setDepositAmount('');
      setSelectedOpportunity(null);
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Deposit failed. Please try again.');
    } finally {
      setIsDepositing(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 70) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Welcome back, {account.accountId}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your yield opportunities and track your earnings
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                account.accountId.includes('.testnet') || account.accountId.includes('testnet')
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {account.accountId.includes('.testnet') || account.accountId.includes('testnet') ? '🧪 TESTNET' : '🌐 MAINNET'}
              </span>
            </p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Account Balance */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Real Blockchain Balance</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            🔄 Refresh Data
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{account.balance}</p>
            <p className="text-slate-600 dark:text-slate-400">NEAR</p>
          </div>
          
          {/* Show real token balances */}
          {account.tokens && account.tokens.length > 0 ? (
            account.tokens.map((token, index) => {
              // Format token balance with standard crypto notation
              const formatTokenBalance = (balance: string, tokenName: string) => {
                const balanceStr = balance.toString();
                let decimals = 24; // Default for wNEAR
                
                if (tokenName === 'wNEAR') {
                  decimals = 24;
                } else if (tokenName === 'USDC' || tokenName === 'USDT') {
                  decimals = 6;
                } else if (tokenName === 'DAI') {
                  decimals = 18;
                }
                
                try {
                  const bigIntBalance = BigInt(balanceStr);
                  const divisor = BigInt(10 ** decimals);
                  const quotient = bigIntBalance / divisor;
                  const remainder = bigIntBalance % divisor;
                  
                  const decimalPart = remainder.toString().padStart(decimals, '0');
                  const trimmedDecimal = decimalPart.replace(/0+$/, '');
                  
                  let result;
                  if (trimmedDecimal === '') {
                    result = quotient.toString();
                  } else {
                    result = `${quotient}.${trimmedDecimal}`;
                  }
                  
                  const num = parseFloat(result);
                  
                  if (num >= 1e15) {
                    return `${num.toExponential(2)}`;
                  } else if (num >= 1e12) {
                    return `${(num / 1e12).toFixed(2)}T`;
                  } else if (num >= 1e9) {
                    return `${(num / 1e9).toFixed(2)}B`;
                  } else if (num >= 1e6) {
                    return `${(num / 1e6).toFixed(2)}M`;
                  } else if (num >= 1e3) {
                    return `${(num / 1e3).toFixed(2)}K`;
                  } else if (num >= 1) {
                    return num.toFixed(2);
                  } else if (num >= 0.01) {
                    return num.toFixed(4);
                  } else {
                    return num.toFixed(6);
                  }
                } catch (error) {
                  const num = Number(balanceStr);
                  if (num > Number.MAX_SAFE_INTEGER) {
                    return (num / (10 ** decimals)).toExponential(2);
                  }
                  return (num / (10 ** decimals)).toFixed(6);
                }
              };

              const formattedBalance = formatTokenBalance(token.balance, token.token);
              
              return (
                <div key={index} className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formattedBalance}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">{token.token}</p>
                </div>
              );
            })
          ) : (
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0.00</p>
              <p className="text-slate-600 dark:text-slate-400">Tokens</p>
            </div>
          )}
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {account.tokens && account.tokens.length > 0 ? 'Active' : 'No Tokens'}
            </p>
            <p className="text-slate-600 dark:text-slate-400">Status</p>
          </div>
        </div>
        
        {/* Token Details */}
        {account.tokens && account.tokens.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Token Details</h3>
            <div className="space-y-2">
              {account.tokens.map((token, index) => {
                // Format token balance with standard crypto notation
                const formatTokenBalance = (balance: string, tokenName: string) => {
                  const balanceStr = balance.toString();
                  let decimals = 24; // Default for wNEAR
                  
                  if (tokenName === 'wNEAR') {
                    decimals = 24;
                  } else if (tokenName === 'USDC' || tokenName === 'USDT') {
                    decimals = 6;
                  } else if (tokenName === 'DAI') {
                    decimals = 18;
                  }
                  
                  try {
                    const bigIntBalance = BigInt(balanceStr);
                    const divisor = BigInt(10 ** decimals);
                    const quotient = bigIntBalance / divisor;
                    const remainder = bigIntBalance % divisor;
                    
                    const decimalPart = remainder.toString().padStart(decimals, '0');
                    const trimmedDecimal = decimalPart.replace(/0+$/, '');
                    
                    let result;
                    if (trimmedDecimal === '') {
                      result = quotient.toString();
                    } else {
                      result = `${quotient}.${trimmedDecimal}`;
                    }
                    
                    const num = parseFloat(result);
                    
                  if (num >= 1e15) {
                    return `${num.toExponential(2)}`;
                  } else if (num >= 1e12) {
                    return `${(num / 1e12).toFixed(2)}T`;
                  } else if (num >= 1e9) {
                    return `${(num / 1e9).toFixed(2)}B`;
                  } else if (num >= 1e6) {
                    return `${(num / 1e6).toFixed(2)}M`;
                  } else if (num >= 1e3) {
                    return `${(num / 1e3).toFixed(2)}K`;
                  } else if (num >= 1) {
                    return num.toFixed(2);
                  } else if (num >= 0.01) {
                    return num.toFixed(4);
                  } else {
                    return num.toFixed(6);
                  }
                  } catch (error) {
                    const num = Number(balanceStr);
                    if (num > Number.MAX_SAFE_INTEGER) {
                      return (num / (10 ** decimals)).toExponential(2);
                    }
                    return (num / (10 ** decimals)).toFixed(6);
                  }
                };

                const formattedBalance = formatTokenBalance(token.balance, token.token);
                
                return (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{token.token}</span>
                    <span className="font-mono">{formattedBalance}</span>
                    <span className="text-slate-500 dark:text-slate-400">{token.contract}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Yield Opportunities */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Available Yield Opportunities</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockYieldOpportunities.map((opportunity) => (
            <div
              key={opportunity.id}
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                selectedOpportunity?.id === opportunity.id 
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400' 
                  : ''
              }`}
              onClick={() => setSelectedOpportunity(opportunity)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {opportunity.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(opportunity.risk)}`}>
                  {opportunity.risk}
                </span>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                {opportunity.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">APY</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {opportunity.apy}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Trust Score</span>
                  <span className={`text-sm font-medium ${getTrustScoreColor(opportunity.trustScore)}`}>
                    {opportunity.trustScore}/100
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Min Deposit</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {opportunity.minDeposit} {opportunity.token}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit Section */}
      {selectedOpportunity && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Deposit to {selectedOpportunity.name}
          </h3>
          
          <div className="max-w-md">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Amount ({selectedOpportunity.token})
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder={`Minimum: ${selectedOpportunity.minDeposit} ${selectedOpportunity.token}`}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                min={selectedOpportunity.minDeposit}
                step="0.01"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDeposit}
                disabled={!depositAmount || parseFloat(depositAmount) < parseFloat(selectedOpportunity.minDeposit) || isDepositing}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDepositing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Depositing...</span>
                  </div>
                ) : (
                  'Deposit'
                )}
              </button>
              
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Positions (placeholder) */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Active Positions</h2>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <p className="text-slate-600 dark:text-slate-400 text-center py-8">
            No active positions yet. Deposit to a yield opportunity to get started!
          </p>
        </div>
      </div>
    </div>
  );
}
