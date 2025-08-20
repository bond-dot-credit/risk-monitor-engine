'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent } from '@/types/agent';
import { CreditVault, VaultStatus } from '@/types/credit';
import { CreditVaultManager } from '@/components/CreditVaultManager';

export default function CreditVaultsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [vaults, setVaults] = useState<CreditVault[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success && data.data) {
        setAgents(data.data);
        if (data.data.length > 0 && !selectedAgentId) {
          setSelectedAgentId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  }, [selectedAgentId]);

  const fetchVaults = useCallback(async () => {
    try {
      const response = await fetch('/api/credit');
      const data = await response.json();
      if (data.success && data.data) {
        setVaults(data.data);
      }
    } catch (error) {
      console.error('Error fetching vaults:', error);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchAgents();
    fetchVaults();
  }, [fetchAgents, fetchVaults]);

  const handleVaultCreated = () => {
    fetchVaults();
  };

  const getStatusColor = (status: VaultStatus) => {
    switch (status) {
      case VaultStatus.ACTIVE: return 'bg-green-100 text-green-800';
      case VaultStatus.PAUSED: return 'bg-yellow-100 text-yellow-800';
      case VaultStatus.LIQUIDATING: return 'bg-red-100 text-red-800';
      case VaultStatus.CLOSED: return 'bg-gray-100 text-gray-800';
      case VaultStatus.UNDER_REVIEW: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthFactorColor = (healthFactor: number) => {
    if (healthFactor >= 1.5) return 'text-green-600';
    if (healthFactor >= 1.2) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isMounted) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Credit Vaults</h1>
          <p className="mt-2 text-gray-600">
            Dynamic LTV credit lines and collateral management for AI agents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Active Vaults</h2>
              
              {vaults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No credit vaults found. Create your first vault to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {vaults.map((vault) => (
                    <div key={vault.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Vault {vault.id.slice(-6)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Agent: {agents.find(a => a.id === vault.agentId)?.name || 'Unknown'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vault.status)}`}>
                          {vault.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500">Credit Limit</div>
                          <div className="font-medium">${vault.creditLimit.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Current LTV</div>
                          <div className="font-medium">{vault.currentLTV}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Max LTV</div>
                          <div className="font-medium">{vault.maxLTV}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Utilization</div>
                          <div className="font-medium">{vault.utilization}%</div>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Health Factor</span>
                          <span className={`font-medium ${getHealthFactorColor(vault.riskMetrics.healthFactor)}`}>
                            {vault.riskMetrics.healthFactor.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${
                              vault.riskMetrics.healthFactor >= 1.5 ? 'bg-green-500' :
                              vault.riskMetrics.healthFactor >= 1.2 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, (vault.riskMetrics.healthFactor / 2) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <CreditVaultManager agents={agents} onVaultCreated={handleVaultCreated} />
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Request Credit Line
                </button>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  Manage Collateral
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Risk Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Exposure</span>
                  <span className="font-medium">
                    ${vaults.reduce((sum, v) => sum + v.creditLimit, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Vaults</span>
                  <span className="font-medium">{vaults.filter(v => v.status === VaultStatus.ACTIVE).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Health Factor</span>
                  <span className="font-medium">
                    {(vaults.reduce((sum, v) => sum + v.riskMetrics.healthFactor, 0) / Math.max(vaults.length, 1)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
