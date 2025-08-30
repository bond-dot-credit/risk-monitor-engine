'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const RiskMonitorDashboard: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);

  const toggleMonitoring = useCallback(async () => {
    try {
      const action = isMonitoring ? 'stop' : 'start';
      const response = await fetch('/api/enhanced-risk-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        setIsMonitoring(!isMonitoring);
      }
    } catch (error) {
      console.error('Failed to toggle monitoring:', error);
    }
  }, [isMonitoring]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Monitor Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time risk monitoring and analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
            </span>
          </div>
          <Button
            onClick={toggleMonitoring}
            variant={isMonitoring ? 'destructive' : 'default'}
            size="sm"
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Vaults</CardTitle>
            <CardDescription>Active vaults in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">0 active vaults</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Overall system performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>Unacknowledged alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">0 total alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Level</CardTitle>
            <CardDescription>Current risk assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-500">LOW</Badge>
            <p className="text-xs text-muted-foreground mt-2">No critical issues</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
          <CardDescription>Real-time market conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="font-semibold">Ethereum</h3>
              <Badge className="bg-gray-500">NEUTRAL</Badge>
              <p className="text-sm text-gray-600 mt-2">Volatility: 1.0</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Arbitrum</h3>
              <Badge className="bg-gray-500">NEUTRAL</Badge>
              <p className="text-sm text-gray-600 mt-2">Volatility: 1.0</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Polygon</h3>
              <Badge className="bg-gray-500">NEUTRAL</Badge>
              <p className="text-sm text-gray-600 mt-2">Volatility: 1.0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
