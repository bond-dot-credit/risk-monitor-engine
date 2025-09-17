import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Progress } from '@/components/ui';

interface PerformanceMetrics {
  memory: {
    used: number;
    total: number;
    limit: number;
  };
  timing: {
    navigationStart: number;
    loadEventEnd: number;
    domContentLoadedEventEnd: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
  resources: {
    total: number;
    size: number;
    time: number;
  };
}

interface PerformanceMonitorProps {
  className?: string;
  showMemory?: boolean;
  showTiming?: boolean;
  showResources?: boolean;
  updateInterval?: number;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className,
  showMemory = true,
  showTiming = true,
  showResources = true,
  updateInterval = 5000,
  onMetricsUpdate,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const getMemoryMetrics = useCallback((): PerformanceMetrics['memory'] => {
    if ('memory' in performance) {
      const memory = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }, []);

  const getTimingMetrics = useCallback((): PerformanceMetrics['timing'] => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      navigationStart: navigation?.startTime || 0,
      loadEventEnd: navigation?.loadEventEnd || 0,
      domContentLoadedEventEnd: navigation?.domContentLoadedEventEnd || 0,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
    };
  }, []);

  const getResourceMetrics = useCallback((): PerformanceMetrics['resources'] => {
    const resources = performance.getEntriesByType('resource');
    const totalSize = resources.reduce((acc, resource) => {
      if ('transferSize' in resource) {
        return acc + (resource as PerformanceResourceTiming).transferSize;
      }
      return acc;
    }, 0);

    const totalTime = resources.reduce((acc, resource) => {
      return acc + resource.duration;
    }, 0);

    return {
      total: resources.length,
      size: Math.round(totalSize / 1024), // KB
      time: Math.round(totalTime), // ms
    };
  }, []);

  const updateMetrics = useCallback(() => {
    const newMetrics: PerformanceMetrics = {
      memory: getMemoryMetrics(),
      timing: getTimingMetrics(),
      resources: getResourceMetrics(),
    };

    setMetrics(newMetrics);
    onMetricsUpdate?.(newMetrics);
  }, [getMemoryMetrics, getTimingMetrics, getResourceMetrics, onMetricsUpdate]);

  useEffect(() => {
    // Initial metrics
    updateMetrics();

    // Set up interval for updates
    const interval = setInterval(updateMetrics, updateInterval);

    return () => clearInterval(interval);
  }, [updateMetrics, updateInterval]);

  // Listen for visibility changes to pause updates when not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    setIsVisible(!document.hidden);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (!metrics) {
    return null;
  }

  const memoryUsagePercent = (metrics.memory.used / metrics.memory.limit) * 100;
  const loadTime = metrics.timing.loadEventEnd - metrics.timing.navigationStart;
  const domReadyTime = metrics.timing.domContentLoadedEventEnd - metrics.timing.navigationStart;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Performance Monitor</span>
          <button
            onClick={() => updateMetrics()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh metrics"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Memory Usage */}
        {showMemory && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Memory Usage</span>
              <span className="text-sm text-muted-foreground">
                {metrics.memory.used}MB / {metrics.memory.limit}MB
              </span>
            </div>
            <Progress
              value={memoryUsagePercent}
              variant={memoryUsagePercent > 80 ? 'danger' : memoryUsagePercent > 60 ? 'warning' : 'success'}
              showLabel={false}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Used: {metrics.memory.used}MB</span>
              <span>Total: {metrics.memory.total}MB</span>
              <span>Limit: {metrics.memory.limit}MB</span>
            </div>
          </div>
        )}

        {/* Page Load Timing */}
        {showTiming && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Page Load Timing</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Load Time:</span>
                <span className="font-mono">{loadTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DOM Ready:</span>
                <span className="font-mono">{domReadyTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">First Paint:</span>
                <span className="font-mono">{metrics.timing.firstPaint}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">First Contentful Paint:</span>
                <span className="font-mono">{metrics.timing.firstContentfulPaint}ms</span>
              </div>
            </div>
          </div>
        )}

        {/* Resource Loading */}
        {showResources && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Resource Loading</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Resources:</span>
                <span className="font-mono">{metrics.resources.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Size:</span>
                <span className="font-mono">{metrics.resources.size}KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Load Time:</span>
                <span className="font-mono">{metrics.resources.time}ms</span>
              </div>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {isVisible ? 'Active' : 'Paused'}
          </span>
          <span className="text-xs text-muted-foreground">
            Updates every {updateInterval / 1000}s
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
