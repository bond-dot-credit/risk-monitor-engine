'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent } from '@/types/agent';

interface PerformanceMonitorProps {
  agents: Agent[];
}

interface PerformanceMetric {
  agentId: string;
  timestamp: Date;
  apr: number;
  ltv: number;
  aum: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  healthFactor: number;
  utilization: number;
}

interface PerformanceAlert {
  id: string;
  agentId: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export function PerformanceMonitor({ agents }: PerformanceMonitorProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
    // we intentionally only want to run this when `agents` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents]);

  useEffect(() => {
    if (selectedAgent) {
      generatePerformanceMetrics();
      generateAlerts();
    }
    // generatePerformanceMetrics and generateAlerts are stable helpers here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgent]);

  useEffect(() => {
    if (isMonitoring && selectedAgent) {
      const interval = setInterval(() => {
        updatePerformanceMetrics();
        checkForAlerts();
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
    // updatePerformanceMetrics and checkForAlerts are stable helpers; we control re-run via isMonitoring/refreshInterval
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMonitoring, selectedAgent, refreshInterval]);

  const generatePerformanceMetrics = () => {
    if (!selectedAgent) return;

    const metrics: PerformanceMetric[] = [];
    const baseMetrics = {
      apr: 8 + (selectedAgent.score.performance / 100) * 12,
      ltv: 50 + (selectedAgent.score.overall / 100) * 30,
      aum: 100000 + (selectedAgent.score.performance / 100) * 900000,
      volatility: 20 - (selectedAgent.score.overall / 100) * 15,
      sharpeRatio: (selectedAgent.score.performance / 100) * 2 + 0.5,
      maxDrawdown: 30 - (selectedAgent.score.overall / 100) * 20,
      healthFactor: 1.5 + (selectedAgent.score.overall / 100) * 0.5,
      utilization: 40 + (selectedAgent.score.overall / 100) * 40
    };

    // Generate 24 hours of hourly data
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - i);
      
      // Add realistic variation
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      
      metrics.push({
        agentId: selectedAgent.id,
        timestamp,
        apr: Math.round((baseMetrics.apr * (1 + variation)) * 100) / 100,
        ltv: Math.round((baseMetrics.ltv * (1 + variation)) * 100) / 100,
        aum: Math.round(baseMetrics.aum * (1 + variation)),
        volatility: Math.round((baseMetrics.volatility * (1 + variation)) * 100) / 100,
        sharpeRatio: Math.round((baseMetrics.sharpeRatio * (1 + variation)) * 100) / 100,
        maxDrawdown: Math.round((baseMetrics.maxDrawdown * (1 + variation)) * 100) / 100,
        healthFactor: Math.round((baseMetrics.healthFactor * (1 + variation)) * 100) / 100,
        utilization: Math.round((baseMetrics.utilization * (1 + variation)) * 100) / 100
      });
    }

    setPerformanceMetrics(metrics);
  };

  const updatePerformanceMetrics = () => {
    if (!selectedAgent) return;

    const newMetric: PerformanceMetric = {
      agentId: selectedAgent.id,
      timestamp: new Date(),
      apr: Math.round((8 + (Math.random() * 12)) * 100) / 100,
      ltv: Math.round((50 + (Math.random() * 30)) * 100) / 100,
      aum: Math.round(100000 + (Math.random() * 900000)),
      volatility: Math.round((5 + (Math.random() * 15)) * 100) / 100,
      sharpeRatio: Math.round((0.5 + (Math.random() * 2)) * 100) / 100,
      maxDrawdown: Math.round((10 + (Math.random() * 20)) * 100) / 100,
      healthFactor: Math.round((1.0 + (Math.random() * 1)) * 100) / 100,
      utilization: Math.round((40 + (Math.random() * 40)) * 100) / 100
    };

    setPerformanceMetrics(prev => [newMetric, ...prev.slice(0, 23)]);
  };

  const generateAlerts = () => {
    if (!selectedAgent) return;

    const newAlerts: PerformanceAlert[] = [];
    
    // Check for performance issues
    if (selectedAgent.score.performance < 70) {
      newAlerts.push({
        id: `alert_${Date.now()}_1`,
        agentId: selectedAgent.id,
        type: 'warning',
        message: `Performance score below threshold: ${selectedAgent.score.performance}`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Check for verification issues
    if (selectedAgent.score.verification < 60) {
      newAlerts.push({
        id: `alert_${Date.now()}_2`,
        agentId: selectedAgent.id,
        type: 'critical',
        message: `Verification score critically low: ${selectedAgent.score.verification}`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Check for health factor issues
    const currentHealthFactor = performanceMetrics[0]?.healthFactor || 1.5;
    if (currentHealthFactor < 1.2) {
      newAlerts.push({
        id: `alert_${Date.now()}_3`,
        agentId: selectedAgent.id,
        type: 'critical',
        message: `Health factor below safe threshold: ${currentHealthFactor}`,
        timestamp: new Date(),
        resolved: false
      });
    }

    setAlerts(prev => [...newAlerts, ...prev]);
  };

  const checkForAlerts = () => {
    if (!selectedAgent || performanceMetrics.length === 0) return;

    const currentMetric = performanceMetrics[0];
    
    // Check for sudden changes
    if (performanceMetrics.length >= 2) {
      const previousMetric = performanceMetrics[1];
      const aprChange = Math.abs(currentMetric.apr - previousMetric.apr);
      const ltvChange = Math.abs(currentMetric.ltv - previousMetric.ltv);
      
      if (aprChange > 2) {
        const newAlert: PerformanceAlert = {
          id: `alert_${Date.now()}_4`,
          agentId: selectedAgent.id,
          type: 'warning',
          message: `Significant APR change detected: ${aprChange.toFixed(2)}%`,
          timestamp: new Date(),
          resolved: false
        };
        setAlerts(prev => [newAlert, ...prev]);
      }
      
      if (ltvChange > 5) {
        const newAlert: PerformanceAlert = {
          id: `alert_${Date.now()}_5`,
          agentId: selectedAgent.id,
          type: 'warning',
          message: `Significant LTV change detected: ${ltvChange.toFixed(2)}%`,
          timestamp: new Date(),
          resolved: false
        };
        setAlerts(prev => [newAlert, ...prev]);
      }
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMetricColor = (value: number, threshold: number, isHigherBetter: boolean = true) => {
    if (isHigherBetter) {
      return value >= threshold ? 'text-green-600' : 'text-red-600';
    } else {
      return value <= threshold ? 'text-green-600' : 'text-red-600';
    }
  };

  if (!selectedAgent) {
    return <div className="p-6 text-center text-gray-500">Select an agent to monitor performance</div>;
  }

  const currentMetrics = performanceMetrics[0];
  const recentMetrics = performanceMetrics.slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Monitoring Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Performance Monitoring</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Refresh:</span>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            </div>
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isMonitoring
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {isMonitoring ? (
            <span className="flex items-center text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Live monitoring active - Refreshing every {refreshInterval} seconds
            </span>
          ) : (
            <span className="text-gray-500">Monitoring paused</span>
          )}
        </div>
      </div>

      {/* Current Metrics */}
      {currentMetrics && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Current Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className={`text-2xl font-bold ${getMetricColor(currentMetrics.apr, 10)}`}>
                {currentMetrics.apr}%
              </div>
              <div className="text-sm text-blue-600">APR</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className={`text-2xl font-bold ${getMetricColor(currentMetrics.ltv, 70)}`}>
                {currentMetrics.ltv}%
              </div>
              <div className="text-sm text-green-600">LTV</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                ${currentMetrics.aum.toLocaleString()}
              </div>
              <div className="text-sm text-purple-600">AUM</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className={`text-2xl font-bold ${getMetricColor(currentMetrics.healthFactor, 1.2)}`}>
                {currentMetrics.healthFactor}
              </div>
              <div className="text-sm text-orange-600">Health Factor</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-lg font-bold ${getMetricColor(currentMetrics.volatility, 15, false)}`}>
                {currentMetrics.volatility}%
              </div>
              <div className="text-xs text-gray-600">Volatility</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-lg font-bold ${getMetricColor(currentMetrics.sharpeRatio, 1.0)}`}>
                {currentMetrics.sharpeRatio}
              </div>
              <div className="text-xs text-gray-600">Sharpe Ratio</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-lg font-bold ${getMetricColor(currentMetrics.maxDrawdown, 20, false)}`}>
                {currentMetrics.maxDrawdown}%
              </div>
              <div className="text-xs text-gray-600">Max Drawdown</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-lg font-bold ${getMetricColor(currentMetrics.utilization, 80)}`}>
                {currentMetrics.utilization}%
              </div>
              <div className="text-xs text-gray-600">Utilization</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Trend (Last 7 Hours)</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-lg font-medium">Performance Chart</div>
            <div className="text-sm">Showing hourly metrics</div>
            <div className="text-xs mt-2">
              {recentMetrics.length} data points available
            </div>
          </div>
        </div>
      </div>

      {/* Performance Alerts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Alerts</h3>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-sm">No active alerts</div>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.filter(alert => !alert.resolved).map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{alert.message}</div>
                    <div className="text-xs opacity-75">
                      {alert.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Data Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Historical Performance Data</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">APR</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">LTV</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">AUM</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Health</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceMetrics.slice(0, 10).map((metric, index) => (
                <tr key={index} className={index === 0 ? 'bg-blue-50' : ''}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {metric.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{metric.apr}%</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{metric.ltv}%</td>
                  <td className="px-4 py-2 text-sm text-gray-900">${metric.aum.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{metric.healthFactor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
