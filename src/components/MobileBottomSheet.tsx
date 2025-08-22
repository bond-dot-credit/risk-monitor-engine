import React, { useEffect } from 'react';
import { useResponsive } from '@/hooks/useResponsive';

interface Agent {
  id: string;
  name: string;
  metadata: {
    category: string;
    description: string;
    version: string;
    tags: string[];
  };
  score: {
    overall: number;
    provenance: number;
    performance: number;
    perception: number;
  };
  credibilityTier: string;
  status: string;
}

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  selectedAgentId: string;
  onAgentSelect: (agentId: string) => void;
  loading?: boolean;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  agents,
  selectedAgentId,
  onAgentSelect,
  loading = false
}: MobileBottomSheetProps) {
  const { isMobile } = useResponsive();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const getPerformanceStatus = (score: number) => {
    if (score >= 95) return { label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    if (score >= 85) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    if (score >= 70) return { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
    return { label: 'Poor', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
  };

  const handleAgentSelect = (agentId: string) => {
    onAgentSelect(agentId);
    onClose();
  };

  if (!isMobile) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-700 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Select Agent
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Choose an agent to monitor performance metrics
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Loading agents...</p>
              </div>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Agents Available</h3>
              <p className="text-slate-500 dark:text-slate-400">Connect agents to start monitoring</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent) => {
                const status = getPerformanceStatus(agent.score.performance);
                const isSelected = selectedAgentId === agent.id;
                
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 touch-manipulation ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[0.98]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98]'
                    }`}
                    style={{ minHeight: '80px' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1 truncate">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {agent.metadata.description}
                        </p>
                      </div>
                      <div className={`px-3 py-1 text-sm font-bold rounded-full ml-3 flex-shrink-0 ${status.bg} ${status.color}`}>
                        {agent.score.performance}%
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {agent.credibilityTier}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        agent.status === 'ACTIVE' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {agent.status}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="mt-3 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Currently Selected</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}