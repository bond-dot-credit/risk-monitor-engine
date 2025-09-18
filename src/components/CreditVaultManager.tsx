'use client';

import { useState } from 'react';
import { Agent } from '@/types/agent';
import { Collateral } from '@/types/credit';

interface CreditVaultManagerProps {
  agents: Agent[];
  onVaultCreated: () => void;
  onClose?: () => void;
}

export function CreditVaultManager({ agents, onVaultCreated, onClose }: CreditVaultManagerProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [collateral, setCollateral] = useState<Collateral[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const updateCollateral = (index: number, field: keyof Collateral, value: string | number) => {
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
        setCurrentStep(1);
        setErrors({});
        onVaultCreated();
        onClose?.();
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Failed to create vault' });
      }
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-700">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Credit Vault</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Set up a new credit line for an AI agent</p>
            </div>
          </div>
          
          {/* Step Indicator */}
          <div className="hidden sm:flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
            }`}>
              1
            </div>
            <div className={`w-6 h-0.5 ${
              currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
            }`}>
              2
            </div>
            <div className={`w-6 h-0.5 ${
              currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
            }`}>
              3
            </div>
          </div>
          
          <button
            onClick={() => onClose?.()}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-slate-600/50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Agent & Credit Limit */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Agent Selection & Credit Limit</h3>
                  <p className="text-gray-600 dark:text-gray-400">Choose the agent and set the credit parameters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Agent *
                  </label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.agent ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Choose an agent</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({agent.credibilityTier}) - Score: {agent.score.overall}
                      </option>
                    ))}
                  </select>
                  {errors.agent && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.agent}</p>}
                  
                  {selectedAgentId && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      {(() => {
                        const agent = agents.find(a => a.id === selectedAgentId);
                        return agent ? (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-blue-600 dark:text-blue-400 font-medium">Tier:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{agent.credibilityTier}</span>
                            </div>
                            <div>
                              <span className="text-blue-600 dark:text-blue-400 font-medium">Overall Score:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{agent.score.overall}</span>
                            </div>
                            <div>
                              <span className="text-blue-600 dark:text-blue-400 font-medium">Performance:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{agent.score.performance}</span>
                            </div>
                            <div>
                              <span className="text-blue-600 dark:text-blue-400 font-medium">Provenance:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{agent.score.provenance}</span>
                            </div>
                          </div>
                        ) : null;
                      })()} 
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Credit Limit (USD) *
                  </label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.creditLimit ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="1,000,000"
                  />
                  {errors.creditLimit && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.creditLimit}</p>}
                  
                  {creditLimit && parseFloat(creditLimit) > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between mb-2">
                          <span>Credit Limit:</span>
                          <span className="font-medium">${parseFloat(creditLimit).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Max LTV:</span>
                          <span className="font-medium">70%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Collateral */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Collateral Configuration</h3>
                  <p className="text-gray-600 dark:text-gray-400">Add collateral assets to secure the credit line</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Collateral Assets
                    </label>
                    <button
                      type="button"
                      onClick={addCollateral}
                      className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add Collateral</span>
                    </button>
                  </div>
                  
                  {errors.collateral && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{errors.collateral}</p>}
                  
                  {collateral.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">No collateral added yet</p>
                      <button
                        type="button"
                        onClick={addCollateral}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add First Collateral
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {collateral.map((col, index) => (
                        <div key={col.id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-6 bg-gray-50 dark:bg-slate-700">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-white">Collateral Asset #{index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeCollateral(index)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Asset Type</label>
                              <input
                                type="text"
                                value={col.assetType}
                                onChange={(e) => updateCollateral(index, 'assetType', e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-600 text-gray-900 dark:text-white ${
                                  errors[`collateral_${index}_asset`] ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-500'
                                }`}
                                placeholder="ETH, BTC, MATIC..."
                              />
                              {errors[`collateral_${index}_asset`] && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[`collateral_${index}_asset`]}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Amount</label>
                              <input
                                type="number"
                                value={col.amount}
                                onChange={(e) => updateCollateral(index, 'amount', parseFloat(e.target.value) || 0)}
                                className={`w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-600 text-gray-900 dark:text-white ${
                                  errors[`collateral_${index}_amount`] ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-500'
                                }`}
                                placeholder="25"
                              />
                              {errors[`collateral_${index}_amount`] && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[`collateral_${index}_amount`]}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Value (USD)</label>
                              <input
                                type="number"
                                value={col.value}
                                onChange={(e) => updateCollateral(index, 'value', parseFloat(e.target.value) || 0)}
                                className={`w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-600 text-gray-900 dark:text-white ${
                                  errors[`collateral_${index}_value`] ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-500'
                                }`}
                                placeholder="750,000"
                              />
                              {errors[`collateral_${index}_value`] && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[`collateral_${index}_value`]}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">LTV Ratio (%)</label>
                              <input
                                type="number"
                                value={col.ltvRatio}
                                onChange={(e) => updateCollateral(index, 'ltvRatio', parseFloat(e.target.value) || 0)}
                                className="w-full border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-600 text-gray-900 dark:text-white"
                                placeholder="70"
                                min="1"
                                max="95"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

        {/* Enhanced Footer with Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-6 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentStep} of 3
            </span>
            <div className="flex space-x-1">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full ${
                    step === currentStep ? 'bg-blue-600' :
                    step < currentStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
            )}
            
            <button
              type="button"
              onClick={() => onClose?.()}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-200"
            >
              Cancel
            </button>
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Next</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:hover:scale-100 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Create Vault</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
            {/* Step 3: Review & Confirm */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Review & Confirm</h3>
                  <p className="text-gray-600 dark:text-gray-400">Review all details before creating the vault</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-700 rounded-xl p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Vault Summary</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Agent Information</h5>
                      {(() => {
                        const agent = agents.find(a => a.id === selectedAgentId);
                        return agent ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Name:</span>
                              <span className="font-medium">{agent.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tier:</span>
                              <span className="font-medium">{agent.credibilityTier}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Score:</span>
                              <span className="font-medium">{agent.score.overall}</span>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Credit Details</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Credit Limit:</span>
                          <span className="font-medium">${parseFloat(creditLimit || '0').toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Collateral Items:</span>
                          <span className="font-medium">{collateral.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Collateral Value:</span>
                          <span className="font-medium">${collateral.reduce((sum, c) => sum + c.value, 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Collateral Breakdown</h5>
                    <div className="space-y-3">
                      {collateral.map((col, index) => (
                        <div key={col.id} className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-600/50 rounded-lg">
                          <div>
                            <span className="font-medium">{col.assetType}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">({col.amount} units)</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${col.value.toLocaleString()}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">LTV: {col.ltvRatio}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {errors.submit && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
