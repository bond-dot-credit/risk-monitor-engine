'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useNearWallet } from '@/hooks/useNearWallet';
import { useVaultContract } from '@/hooks/useVaultContract';
import { TokenType, VaultContractConfig } from '@/types/vault';

interface VaultDashboardProps {
  className?: string;
}

const VaultDashboard: React.FC<VaultDashboardProps> = ({ className }) => {
  const { account, isConnected, signMessage } = useNearWallet();
  const [selectedToken, setSelectedToken] = useState<TokenType>(TokenType.WNEAR);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Vault contract configuration
  const vaultConfig: VaultContractConfig = {
    contractId: 'vault-contract.testnet', // This would be your deployed contract
    networkId: 'testnet',
    ownerAccount: account?.accountId || '',
    feePercentage: 100, // 1%
  };

  const {
    config,
    state,
    isLoading,
    error: vaultError,
    events,
    deposit,
    withdraw,
    refreshData,
  } = useVaultContract(vaultConfig, account?.accountId || null);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsDepositing(true);
    setError(null);
    setTransactionResult(null);

    try {
      // For now, simulate the deposit with message signing
      const depositMessage = `Deposit ${depositAmount} ${selectedToken} to Bond.Credit Vault`;
      const signature = await signMessage(depositMessage);

      if (signature) {
        setTransactionResult({
          success: true,
          type: 'deposit',
          amount: depositAmount,
          token: selectedToken,
          signature: signature,
          timestamp: new Date().toISOString(),
        });

        // Refresh vault data
        await refreshData();
        
        // Clear form
        setDepositAmount('');
      } else {
        setError('Failed to sign deposit transaction');
      }
    } catch (err) {
      console.error('Deposit error:', err);
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid withdrawal amount');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsWithdrawing(true);
    setError(null);
    setTransactionResult(null);

    try {
      // For now, simulate the withdrawal with message signing
      const withdrawMessage = `Withdraw ${withdrawAmount} vault shares (${selectedToken}) from Bond.Credit Vault`;
      const signature = await signMessage(withdrawMessage);

      if (signature) {
        setTransactionResult({
          success: true,
          type: 'withdraw',
          amount: withdrawAmount,
          token: selectedToken,
          signature: signature,
          timestamp: new Date().toISOString(),
        });

        // Refresh vault data
        await refreshData();
        
        // Clear form
        setWithdrawAmount('');
      } else {
        setError('Failed to sign withdrawal transaction');
      }
    } catch (err) {
      console.error('Withdrawal error:', err);
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getTokenIcon = (token: TokenType) => {
    switch (token) {
      case TokenType.WNEAR: return '🌙';
      case TokenType.USDC: return '💵';
      case TokenType.USDT: return '💰';
      default: return '🪙';
    }
  };

  const getTokenColor = (token: TokenType) => {
    switch (token) {
      case TokenType.WNEAR: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case TokenType.USDC: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case TokenType.USDT: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (!isConnected) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏦 Bond.Credit Vault
            </CardTitle>
            <CardDescription>
              Deposit tokens and earn yield through automated strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-slate-800 dark:text-slate-400 mb-4">
                Please connect your NEAR wallet to access the vault
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Vault Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                🏦 Bond.Credit Vault
              </CardTitle>
              <CardDescription>
                Deposit tokens and earn yield through automated strategies
              </CardDescription>
            </div>
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? '🔄' : '🔄'} Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {state?.total_supply || '0'}
              </p>
              <p className="text-slate-800 dark:text-slate-400">Total Vault Shares</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {config?.fee_percentage ? `${config.fee_percentage / 100}%` : '1%'}
              </p>
              <p className="text-slate-800 dark:text-slate-400">Management Fee</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {config?.is_paused ? '⏸️' : '▶️'}
              </p>
              <p className="text-slate-800 dark:text-slate-400">
                {config?.is_paused ? 'Paused' : 'Active'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Reserves */}
      <Card>
        <CardHeader>
          <CardTitle>Token Reserves</CardTitle>
          <CardDescription>Current token balances in the vault</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(TokenType).map((token) => (
              <div key={token} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getTokenIcon(token)}</span>
                    <span className="font-semibold">{token}</span>
                  </div>
                  <Badge className={getTokenColor(token)}>
                    {token}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {state?.token_reserves?.[token] || '0'}
                </p>
                <p className="text-sm text-slate-800 dark:text-slate-400">
                  Available in vault
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Vault Shares */}
      {account && (
        <Card>
          <CardHeader>
            <CardTitle>Your Vault Shares</CardTitle>
            <CardDescription>
              Your current position in the vault
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(TokenType).map((token) => (
                <div key={token} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getTokenIcon(token)}</span>
                    <span className="font-semibold">{token} Shares</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {state?.user_shares?.[token] || '0'}
                  </p>
                  <p className="text-sm text-slate-800 dark:text-slate-400">
                    Your shares
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deposit Section */}
      <Card>
        <CardHeader>
          <CardTitle>Deposit Tokens</CardTitle>
          <CardDescription>
            Deposit tokens to mint vault shares and start earning yield
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-300 mb-2">
                Select Token
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(TokenType).map((token) => (
                  <button
                    key={token}
                    onClick={() => setSelectedToken(token)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedToken === token
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl">{getTokenIcon(token)}</span>
                      <span className="font-medium">{token}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-300 mb-2">
                Amount to Deposit
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  onClick={handleDeposit}
                  disabled={isDepositing || !depositAmount || parseFloat(depositAmount) <= 0}
                  className="px-6"
                >
                  {isDepositing ? '⏳' : '📥'} Deposit
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Section */}
      <Card>
        <CardHeader>
          <CardTitle>Withdraw Tokens</CardTitle>
          <CardDescription>
            Burn vault shares to withdraw your tokens plus earned yield
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-300 mb-2">
                Vault Shares to Burn
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  variant="outline"
                  className="px-6"
                >
                  {isWithdrawing ? '⏳' : '📤'} Withdraw
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Result */}
      {transactionResult && (
        <Card className={transactionResult.success ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}>
          <CardHeader>
            <CardTitle className={transactionResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
              {transactionResult.success ? '✅ Transaction Successful' : '❌ Transaction Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Type:</strong> {transactionResult.type}</p>
              <p><strong>Amount:</strong> {transactionResult.amount} {transactionResult.token}</p>
              <p><strong>Signature:</strong> {transactionResult.signature?.substring(0, 20)}...</p>
              <p><strong>Time:</strong> {new Date(transactionResult.timestamp).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200">❌ Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      {events.deposits.length > 0 || events.withdrawals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent Vault Activity</CardTitle>
            <CardDescription>Latest deposits and withdrawals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...events.deposits.slice(0, 3), ...events.withdrawals.slice(0, 3)]
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {'vault_shares_minted' in event ? '📥' : '📤'}
                      </span>
                      <div>
                        <p className="font-medium">
                          {('vault_shares_minted' in event ? 'Deposit' : 'Withdrawal')} - {event.token_type}
                        </p>
                        <p className="text-sm text-slate-800 dark:text-slate-400">
                          {event.account_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{event.amount}</p>
                      <p className="text-sm text-slate-800 dark:text-slate-400">
                        {new Date(event.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default VaultDashboard;

