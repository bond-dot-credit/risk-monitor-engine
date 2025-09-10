import React from 'react';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveHeaderProps {
  title?: string;
  onMenuClick?: () => void;
  onAgentSelectorClick?: () => void;
  showAgentSelector?: boolean;
  selectedAgentName?: string;
}

export function ResponsiveHeader({
  title = "Performance Analytics",
  onMenuClick,
  onAgentSelectorClick,
  showAgentSelector = false,
  selectedAgentName
}: ResponsiveHeaderProps) {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) {
    return (
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left section */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
              aria-label="Open main menu"
            >
              <svg className="w-6 h-6 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Performance
              </h1>
              {selectedAgentName && (
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-none">
                  {selectedAgentName}
                </span>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            {showAgentSelector && (
              <button
                onClick={onAgentSelectorClick}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors touch-manipulation"
                aria-label="Select agent"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>Agent</span>
              </button>
            )}
            
            {/* Live indicator */}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Live</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (isTablet) {
    return (
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between px-6 h-20">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h1>
              {selectedAgentName && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Monitoring: {selectedAgentName}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {showAgentSelector && (
              <button
                onClick={onAgentSelectorClick}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                <span>Select Agent</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Live</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Desktop header - can fall back to the original Header component
  return null;
}