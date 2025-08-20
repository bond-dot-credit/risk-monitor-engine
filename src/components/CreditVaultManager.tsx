'use client';

import { useState } from 'react';
import { Agent } from '@/types/agent';
import { Collateral, CreditLineRequest, VaultStatus } from '@/types/credit';

interface CreditVaultManagerProps {
  agents: Agent[];
  onVaultCreated: () => void;
}

export function CreditVaultManager({ agents, onVaultCreated }: CreditVaultManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [collateral, setCollateral] = useState<Collateral[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addCollateral = () => {
    const newCollateral: Collateral = {
      id: `coll_${Date.now()}`,
      assetType: 'ETH',
      amount: 0,
      value: 0,
      ltvRatio: 70,
      liquidationThreshold: 80,
      lastUpdated: new Date()
    };
    setCollateral([...collateral, newCollateral]);
  };

  const updateCollateral = (index: number, field: keyof Collateral, value: any) => {
    const updated = [...collateral];
    updated[index] = { ...updated[index], [field]: value };
    setCollateral(updated);
  };

  const removeCollateral = (index: number) => {
    setCollateral(collateral.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId || !creditLimit || collateral.length === 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          balance: parseFloat(creditLimit),
          creditLimit: parseFloat(creditLimit),
          collateral: collateral
        })
      });

      if (response.ok) {
        setIsOpen(false);
        setSelectedAgentId('');
        setCreditLimit('');
        setCollateral([]);
        onVaultCreated();
      }
    } catch (error) {
      console.error('Error creating vault:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create New Vault
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Create Credit Vault</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Agent
              </label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Choose an agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.credibilityTier})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Limit (USD)
              </label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="1000000"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Collateral
                </label>
                <button
                  type="button"
                  onClick={addCollateral}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + Add Collateral
                </button>
              </div>
              
              {collateral.map((col, index) => (
                <div key={col.id} className="border rounded-lg p-4 mb-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Asset Type</label>
                      <input
                        type="text"
                        value={col.assetType}
                        onChange={(e) => updateCollateral(index, 'assetType', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="ETH"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Amount</label>
                      <input
                        type="number"
                        value={col.amount}
                        onChange={(e) => updateCollateral(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="25"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Value (USD)</label>
                      <input
                        type="number"
                        value={col.value}
                        onChange={(e) => updateCollateral(index, 'value', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="750000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">LTV Ratio (%)</label>
                      <input
                        type="number"
                        value={col.ltvRatio}
                        onChange={(e) => updateCollateral(index, 'ltvRatio', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="70"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCollateral(index)}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedAgentId || !creditLimit || collateral.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Vault'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
