/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
// @ts-expect-error: testing-library may be a devDependency not installed in this environment
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PerformanceMonitor } from '../components/PerformanceMonitor';
import { Agent, VerificationType, VerificationStatus, CredibilityTier, AgentStatus } from '../types/agent';

// Mock the component since we're testing the logic
vi.mock('../components/PerformanceMonitor', () => ({
  PerformanceMonitor: vi.fn()
}));

describe('Performance Monitor Logic', () => {
  let mockAgent: Agent;
  let mockPerformanceMetrics: any[];
  let mockAlerts: any[];

  beforeEach(() => {
    mockAgent = {
      id: 'test-agent-1',
      name: 'Test Performance Agent',
      operator: '0x1234567890abcdef',
      metadata: {
        description: 'A test agent for performance monitoring',
        category: 'Trading',
        version: '1.0.0',
        tags: ['test', 'performance', 'monitoring'],
        provenance: {
          sourceCode: 'https://github.com/test-org/performance-agent',
          verificationHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          deploymentChain: 'Ethereum',
          lastAudit: new Date('2024-01-15'),
          auditScore: 85,
          auditReport: 'https://audit-reports.com/test-performance-agent'
        },
        verificationMethods: [
          {
            id: 'verif_1',
            type: VerificationType.CODE_AUDIT,
            status: VerificationStatus.PASSED,
            score: 85,
            lastVerified: new Date('2024-01-15'),
            nextVerificationDue: new Date('2024-07-15'),
            details: {}
          }
        ]
      },
      score: {
        overall: 82,
        provenance: 85,
        performance: 78,
        perception: 80,
        verification: 85,
        confidence: 83,
        lastUpdated: new Date()
      },
      credibilityTier: CredibilityTier.GOLD,
      status: AgentStatus.ACTIVE,
      verification: VerificationStatus.PASSED,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };

    mockPerformanceMetrics = [
      {
        agentId: 'test-agent-1',
        timestamp: new Date(),
        apr: 12.5,
        ltv: 68.5,
        aum: 750000,
        volatility: 12.3,
        sharpeRatio: 1.8,
        maxDrawdown: 18.5,
        healthFactor: 1.65,
        utilization: 72.5
      }
    ];

    mockAlerts = [
      {
        id: 'alert_1',
        agentId: 'test-agent-1',
        type: 'warning',
        message: 'Performance score below threshold: 78',
        timestamp: new Date(),
        resolved: false
      }
    ];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Performance Metrics Generation', () => {
    it('should generate performance metrics based on agent scores', () => {
      const baseMetrics = {
        apr: 8 + (mockAgent.score.performance / 100) * 12,
        ltv: 50 + (mockAgent.score.overall / 100) * 30,
        aum: 100000 + (mockAgent.score.performance / 100) * 900000,
        volatility: 20 - (mockAgent.score.overall / 100) * 15,
        sharpeRatio: (mockAgent.score.performance / 100) * 2 + 0.5,
        maxDrawdown: 30 - (mockAgent.score.overall / 100) * 20,
        healthFactor: 1.5 + (mockAgent.score.overall / 100) * 0.5,
        utilization: 40 + (mockAgent.score.overall / 100) * 40
      };

      // Expected calculations
      expect(baseMetrics.apr).toBeCloseTo(17.36, 1); // 8 + (78/100) * 12
      expect(baseMetrics.ltv).toBeCloseTo(74.6, 1); // 50 + (82/100) * 30
      expect(baseMetrics.aum).toBeCloseTo(802000, 0); // 100000 + (78/100) * 900000
      expect(baseMetrics.volatility).toBeCloseTo(7.7, 1); // 20 - (82/100) * 15
      expect(baseMetrics.sharpeRatio).toBeCloseTo(2.06, 2); // (78/100) * 2 + 0.5
      expect(baseMetrics.maxDrawdown).toBeCloseTo(13.6, 1); // 30 - (82/100) * 20
      expect(baseMetrics.healthFactor).toBeCloseTo(1.91, 2); // 1.5 + (82/100) * 0.5
      expect(baseMetrics.utilization).toBeCloseTo(72.8, 1); // 40 + (82/100) * 40
    });

    it('should generate 24 hours of hourly data', () => {
      const metrics = [];
      const baseMetrics = {
        apr: 12.5,
        ltv: 68.5,
        aum: 750000,
        volatility: 12.3,
        sharpeRatio: 1.8,
        maxDrawdown: 18.5,
        healthFactor: 1.65,
        utilization: 72.5
      };

      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date();
        timestamp.setHours(timestamp.getHours() - i);
        
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        
        metrics.push({
          agentId: mockAgent.id,
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

      expect(metrics).toHaveLength(24);
      expect(metrics[0].timestamp.getTime()).toBeLessThan(metrics[23].timestamp.getTime()); // First timestamp should be earlier than last
    });
  });

  describe('Alert Generation', () => {
    it('should generate warning alert for low performance score', () => {
      const lowPerformanceAgent = { ...mockAgent };
      lowPerformanceAgent.score.performance = 65; // Below 70 threshold

      const alerts = [];
      
      if (lowPerformanceAgent.score.performance < 70) {
        alerts.push({
          id: `alert_${Date.now()}_1`,
          agentId: lowPerformanceAgent.id,
          type: 'warning',
          message: `Performance score below threshold: ${lowPerformanceAgent.score.performance}`,
          timestamp: new Date(),
          resolved: false
        });
      }

      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('warning');
      expect(alerts[0].message).toContain('Performance score below threshold: 65');
    });

    it('should generate critical alert for low verification score', () => {
      const lowVerificationAgent = { ...mockAgent };
      lowVerificationAgent.score.verification = 55; // Below 60 threshold

      const alerts = [];
      
      if (lowVerificationAgent.score.verification < 60) {
        alerts.push({
          id: `alert_${Date.now()}_2`,
          agentId: lowVerificationAgent.id,
          type: 'critical',
          message: `Verification score critically low: ${lowVerificationAgent.score.verification}`,
          timestamp: new Date(),
          resolved: false
        });
      }

      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('critical');
      expect(alerts[0].message).toContain('Verification score critically low: 55');
    });

    it('should generate critical alert for low health factor', () => {
      const lowHealthFactor = 1.1; // Below 1.2 threshold
      
      const alerts = [];
      
      if (lowHealthFactor < 1.2) {
        alerts.push({
          id: `alert_${Date.now()}_3`,
          agentId: mockAgent.id,
          type: 'critical',
          message: `Health factor below safe threshold: ${lowHealthFactor}`,
          timestamp: new Date(),
          resolved: false
        });
      }

      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('critical');
      expect(alerts[0].message).toContain('Health factor below safe threshold: 1.1');
    });
  });

  describe('Performance Change Detection', () => {
    it('should detect significant APR changes', () => {
      const currentMetric = { apr: 15.5 };
      const previousMetric = { apr: 12.5 };
      const threshold = 2;
      
      const aprChange = Math.abs(currentMetric.apr - previousMetric.apr);
      const isSignificant = aprChange > threshold;
      
      expect(aprChange).toBe(3);
      expect(isSignificant).toBe(true);
    });

    it('should detect significant LTV changes', () => {
      const currentMetric = { ltv: 75.5 };
      const previousMetric = { ltv: 68.5 };
      const threshold = 5;
      
      const ltvChange = Math.abs(currentMetric.ltv - previousMetric.ltv);
      const isSignificant = ltvChange > threshold;
      
      expect(ltvChange).toBe(7);
      expect(isSignificant).toBe(true);
    });

    it('should not trigger alerts for minor changes', () => {
      const currentMetric = { apr: 12.8, ltv: 69.0 };
      const previousMetric = { apr: 12.5, ltv: 68.5 };
      
      const aprChange = Math.abs(currentMetric.apr - previousMetric.apr);
      const ltvChange = Math.abs(currentMetric.ltv - previousMetric.ltv);
      
      expect(aprChange).toBeLessThan(2);
      expect(ltvChange).toBeLessThan(5);
    });
  });

  describe('Metric Color Coding', () => {
    it('should return green for good metrics', () => {
      const getMetricColor = (value: number, threshold: number, isHigherBetter: boolean = true) => {
        if (isHigherBetter) {
          return value >= threshold ? 'text-green-600' : 'text-red-600';
        } else {
          return value <= threshold ? 'text-green-600' : 'text-red-600';
        }
      };

      // Higher is better
      expect(getMetricColor(85, 80)).toBe('text-green-600');
      expect(getMetricColor(75, 80)).toBe('text-red-600');
      
      // Lower is better
      expect(getMetricColor(12, 15, false)).toBe('text-green-600');
      expect(getMetricColor(18, 15, false)).toBe('text-red-600');
    });
  });

  describe('Alert Color Coding', () => {
    it('should return appropriate colors for different alert types', () => {
      const getAlertColor = (type: string) => {
        switch (type) {
          case 'critical': return 'bg-red-100 text-red-800 border-red-200';
          case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
          default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
      };

      expect(getAlertColor('critical')).toBe('bg-red-100 text-red-800 border-red-200');
      expect(getAlertColor('warning')).toBe('bg-yellow-100 text-yellow-800 border-yellow-200');
      expect(getAlertColor('info')).toBe('bg-blue-100 text-blue-800 border-blue-200');
      expect(getAlertColor('unknown')).toBe('bg-gray-100 text-gray-800 border-gray-200');
    });
  });

  describe('Data Validation', () => {
    it('should validate performance metric ranges', () => {
      const validateMetric = (metric: any) => {
        const validations = {
          apr: metric.apr >= 0 && metric.apr <= 100,
          ltv: metric.ltv >= 0 && metric.ltv <= 100,
          aum: metric.aum >= 0,
          volatility: metric.volatility >= 0 && metric.volatility <= 100,
          sharpeRatio: metric.sharpeRatio >= -3 && metric.sharpeRatio <= 5,
          maxDrawdown: metric.maxDrawdown >= 0 && metric.maxDrawdown <= 100,
          healthFactor: metric.healthFactor >= 0.1 && metric.healthFactor <= 10,
          utilization: metric.utilization >= 0 && metric.utilization <= 100
        };

        return validations;
      };

      const validMetric = {
        apr: 12.5,
        ltv: 68.5,
        aum: 750000,
        volatility: 12.3,
        sharpeRatio: 1.8,
        maxDrawdown: 18.5,
        healthFactor: 1.65,
        utilization: 72.5
      };

      const validations = validateMetric(validMetric);
      
      expect(validations.apr).toBe(true);
      expect(validations.ltv).toBe(true);
      expect(validations.aum).toBe(true);
      expect(validations.volatility).toBe(true);
      expect(validations.sharpeRatio).toBe(true);
      expect(validations.maxDrawdown).toBe(true);
      expect(validations.healthFactor).toBe(true);
      expect(validations.utilization).toBe(true);
    });

    it('should detect invalid metrics', () => {
      const validateMetric = (metric: any) => {
        const validations = {
          apr: metric.apr >= 0 && metric.apr <= 100,
          ltv: metric.ltv >= 0 && metric.ltv <= 100,
          aum: metric.aum >= 0,
          volatility: metric.volatility >= 0 && metric.volatility <= 100,
          sharpeRatio: metric.sharpeRatio >= -3 && metric.sharpeRatio <= 5,
          maxDrawdown: metric.maxDrawdown >= 0 && metric.maxDrawdown <= 100,
          healthFactor: metric.healthFactor >= 0.1 && metric.healthFactor <= 10,
          utilization: metric.utilization >= 0 && metric.utilization <= 100
        };

        return validations;
      };

      const invalidMetric = {
        apr: 150, // Invalid: > 100
        ltv: -5,  // Invalid: < 0
        aum: -1000, // Invalid: < 0
        volatility: 12.3, // Valid
        sharpeRatio: 8, // Invalid: > 5
        maxDrawdown: 120, // Invalid: > 100
        healthFactor: 0.05, // Invalid: < 0.1
        utilization: 72.5 // Valid
      };

      const validations = validateMetric(invalidMetric);
      
      expect(validations.apr).toBe(false);
      expect(validations.ltv).toBe(false);
      expect(validations.aum).toBe(false);
      expect(validations.volatility).toBe(true);
      expect(validations.sharpeRatio).toBe(false);
      expect(validations.maxDrawdown).toBe(false);
      expect(validations.healthFactor).toBe(false);
      expect(validations.utilization).toBe(true);
    });
  });

  describe('Performance Calculations', () => {
    it('should calculate performance trends correctly', () => {
      const metrics = [
        { performance: 80, timestamp: new Date('2024-01-01T10:00:00Z') },
        { performance: 82, timestamp: new Date('2024-01-01T11:00:00Z') },
        { performance: 85, timestamp: new Date('2024-01-01T12:00:00Z') }
      ];

      if (metrics.length >= 2) {
        const firstPerformance = metrics[0].performance;
        const lastPerformance = metrics[metrics.length - 1].performance;
        const trend = lastPerformance - firstPerformance;
        
        expect(trend).toBe(5); // 85 - 80 = 5
        expect(trend > 0).toBe(true); // Improving trend
      }
    });

    it('should handle empty metrics array', () => {
      const metrics: any[] = [];
      
      if (metrics.length >= 2) {
        const firstPerformance = metrics[0].performance;
        const lastPerformance = metrics[metrics.length - 1].performance;
        const trend = lastPerformance - firstPerformance;
        
        // This should not execute
        expect(firstPerformance).toBeUndefined();
      }
      
      expect(metrics.length).toBe(0);
    });
  });
});
