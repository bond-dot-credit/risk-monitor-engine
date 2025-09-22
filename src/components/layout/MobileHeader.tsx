import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface MobileHeaderProps {
  accountId?: string;
  isConnected: boolean;
  contractHealth?: {
    registry: boolean;
    vault: boolean;
    opportunities: boolean;
  } | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  accountId,
  isConnected,
  contractHealth,
  onConnect,
  onDisconnect,
  onRefresh,
  isRefreshing
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getContractHealthStatus = () => {
    if (!contractHealth) return null;
    
    const totalChecks = Object.values(contractHealth).length;
    const passedChecks = Object.values(contractHealth).filter(Boolean).length;
    
    if (passedChecks === totalChecks) {
      return <StatusBadge status="success" text="Online" />;
    } else if (passedChecks > 0) {
      return <StatusBadge status="warning" text="Partial" />;
    } else {
      return <StatusBadge status="error" text="Offline" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
      <div className="px-4 py-3">
        {/* Main Header Row */}
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BC</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Bond.Credit
              </h1>
              {contractHealth && (
                <div className="text-xs">
                  {getContractHealthStatus()}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Refresh Button */}
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <span className="text-sm">
                {isRefreshing ? '⟳' : '↻'}
              </span>
            </Button>

            {/* Menu Button */}
            <Button
              onClick={() => setShowMenu(!showMenu)}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <span className="text-sm">☰</span>
            </Button>
          </div>
        </div>

        {/* Account Status (when connected) */}
        {isConnected && accountId && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✅ Connected
                </Badge>
                <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                  {accountId}
                </span>
              </div>
              <Button
                onClick={onDisconnect}
                variant="outline"
                size="sm"
                className="text-xs h-6 px-2"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {showMenu && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="space-y-2">
              {!isConnected ? (
                <Button
                  onClick={onConnect}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  🔗 Connect Wallet
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                  <Button
                    onClick={onDisconnect}
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Disconnect Wallet
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
