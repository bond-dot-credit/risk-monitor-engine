import React from 'react';
import { RiskMonitorDashboard } from '@/components/dashboard/RiskMonitorDashboard';
import { RealTimeAlerts } from '@/components/dashboard/RealTimeAlerts';
import { PerformanceMetrics } from '@/components/dashboard/PerformanceMetrics';
import { MarketOverview } from '@/components/dashboard/MarketOverview';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Risk Monitor Dashboard</h1>
          <p className="text-xl text-gray-600 mt-2">
            Comprehensive real-time monitoring and analytics for credit vault risk management
          </p>
        </div>

        {/* Main Dashboard */}
        <RiskMonitorDashboard />

        {/* Real-time Alerts */}
        <div className="mt-8">
          <RealTimeAlerts />
        </div>

        {/* Performance Metrics and Market Overview */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PerformanceMetrics />
          <MarketOverview />
        </div>
      </div>
    </div>
  );
}
