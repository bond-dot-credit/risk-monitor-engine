'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSystemStatus } from '@/hooks/useSystemStatus';

export const PerformanceMetrics: React.FC = () => {
  const { data: systemStatus, loading, error } = useSystemStatus();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Loading system metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Fetching performance data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !systemStatus) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Error Loading Metrics</CardTitle>
          <CardDescription className="text-red-600">
            {error?.message || 'Failed to load system metrics'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { performanceMetrics, isRunning, alertsCount } = systemStatus;
  const successRate = performanceMetrics?.successRate || 100;
  const totalChecks = performanceMetrics?.totalChecks || 0;
  const errorCount = performanceMetrics?.errorCount || 0;
  const averageResponseTime = performanceMetrics?.averageResponseTime || 0;
  const lastCheckTime = performanceMetrics?.lastCheckTime;

  // Calculate health score based on various metrics
  const calculateHealthScore = () => {
    let score = 100;
    
    // Deduct points for errors
    if (errorCount > 0) {
      score -= Math.min(30, errorCount * 5);
    }
    
    // Deduct points for low success rate
    if (successRate < 100) {
      score -= (100 - successRate) * 0.5;
    }
    
    // Deduct points for high response time
    if (averageResponseTime > 1000) {
      score -= Math.min(20, (averageResponseTime - 1000) / 100);
    }
    
    return Math.max(0, Math.round(score));
  };

  const healthScore = calculateHealthScore();
  const healthStatus = healthScore >= 80 ? 'HEALTHY' : healthScore >= 60 ? 'WARNING' : 'CRITICAL';
  const healthColor = healthScore >= 80 ? 'bg-green-500' : healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>System Health</span>
            <Badge className={healthColor}>
              {healthStatus}
            </Badge>
          </CardTitle>
          <CardDescription>Overall system performance and health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Health Score</span>
                <span className="text-2xl font-bold">{healthScore}%</span>
              </div>
              <Progress value={healthScore} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalChecks}</div>
                <div className="text-sm text-gray-600">Total Checks</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Detailed system performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm text-gray-600">{averageResponseTime.toFixed(2)}ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      averageResponseTime < 100 ? 'bg-green-500' :
                      averageResponseTime < 500 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (averageResponseTime / 1000) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {averageResponseTime < 100 ? 'Excellent' : 
                   averageResponseTime < 500 ? 'Good' : 'Needs attention'}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Error Rate</span>
                  <span className="text-sm text-gray-600">
                    {totalChecks > 0 ? ((errorCount / totalChecks) * 100).toFixed(2) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      errorCount === 0 ? 'bg-green-500' :
                      errorCount < 5 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (errorCount / Math.max(1, totalChecks)) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {errorCount === 0 ? 'No errors' : 
                   errorCount < 5 ? 'Low error rate' : 'High error rate'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-700">{totalChecks}</div>
                <div className="text-sm text-blue-600">Total Operations</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-700">{totalChecks - errorCount}</div>
                <div className="text-sm text-green-600">Successful</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-semibold text-red-700">{errorCount}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system operational status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">Monitoring Service</span>
              </div>
              <Badge variant={isRunning ? 'default' : 'secondary'}>
                {isRunning ? 'RUNNING' : 'STOPPED'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="font-medium">Active Alerts</span>
              </div>
              <Badge variant="outline">{alertsCount}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="font-medium">Last Check</span>
              </div>
              <span className="text-sm text-gray-600">
                {lastCheckTime ? new Date(lastCheckTime).toLocaleString() : 'Never'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
