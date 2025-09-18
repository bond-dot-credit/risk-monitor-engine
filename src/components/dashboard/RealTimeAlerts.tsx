'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRiskAlerts } from '@/hooks/useRiskAlerts';
import { EnhancedRiskAlert } from '@/lib/risk-monitor-enhanced';

export const RealTimeAlerts: React.FC = () => {
  const { data: alerts, loading, error, refetch } = useRiskAlerts();
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const handleAcknowledge = async (alertId: string) => {
    setAcknowledging(alertId);
    try {
      const response = await fetch('/api/enhanced-risk-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'acknowledge-alert',
          alertId,
          acknowledgedBy: 'dashboard-user'
        })
      });

      if (response.ok) {
        // Refetch alerts to get updated list
        await refetch();
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    } finally {
      setAcknowledging(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ltv': return '💰';
      case 'health_factor': return '❤️';
      case 'market_risk': return '📊';
      case 'liquidation': return '⚠️';
      case 'performance': return '⚡';
      case 'system': return '🔧';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-time Alerts</CardTitle>
          <CardDescription>Loading alerts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Fetching latest alerts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Error Loading Alerts</CardTitle>
          <CardDescription className="text-red-600">
            {error.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refetch} variant="outline" size="sm">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activeAlerts = alerts?.filter(alert => !alert.acknowledged) || [];
  const acknowledgedAlerts = alerts?.filter(alert => alert.acknowledged) || [];

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Active Alerts</span>
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {activeAlerts.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Unacknowledged risk alerts requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          {activeAlerts.length > 0 ? (
            <div className="space-y-4">
              {activeAlerts.map((alert: EnhancedRiskAlert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.severity === 'CRITICAL' ? 'border-red-200 bg-red-50' :
                    alert.severity === 'HIGH' ? 'border-orange-200 bg-orange-50' :
                    alert.severity === 'MEDIUM' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(alert.category)}</span>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">{alert.category}</Badge>
                        {alert.autoEscalation && (
                          <Badge variant="secondary">Auto-Escalate</Badge>
                        )}
                        {alert.escalationLevel > 1 && (
                          <Badge variant="destructive">Level {alert.escalationLevel}</Badge>
                        )}
                      </div>
                      
                      <p className="font-medium text-gray-900 mb-2">{alert.message}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Vault:</span> {alert.vaultId}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {new Date(alert.timestamp).toLocaleString()}
                        </div>
                        {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                          <div className="col-span-2">
                            <span className="font-medium">Details:</span>
                            <div className="mt-1 text-xs bg-white/50 p-2 rounded">
                              {Object.entries(alert.metadata).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col space-y-2">
                      <Button
                        onClick={() => handleAcknowledge(alert.id)}
                        disabled={acknowledging === alert.id}
                        size="sm"
                        variant="outline"
                      >
                        {acknowledging === alert.id ? 'Acknowledging...' : 'Acknowledge'}
                      </Button>
                      
                      {alert.relatedAlerts && alert.relatedAlerts.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {alert.relatedAlerts.length} related alerts
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-medium">No active alerts</p>
              <p className="text-sm">All systems are operating normally</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Acknowledged Alerts</span>
              <Badge variant="outline" className="ml-2">
                {acknowledgedAlerts.length}
              </Badge>
            </CardTitle>
            <CardDescription>Recently acknowledged alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {acknowledgedAlerts.slice(0, 5).map((alert: EnhancedRiskAlert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getCategoryIcon(alert.category)}</span>
                    <div>
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs text-gray-500">
                        Acknowledged by {alert.acknowledgedBy} at {alert.acknowledgedAt ? new Date(alert.acknowledgedAt).toLocaleString() : 'Unknown time'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
