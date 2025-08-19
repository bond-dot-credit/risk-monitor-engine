import { InMemoryStore } from './store';
import { Agent, AgentStatus, CredibilityTier } from '../types/agent';
import { ReputationEvent, ReputationEventType } from '../types/reputation';

export function ensureSeeded() {
  const store = InMemoryStore.getInstance();
  
  if (store.getAgents().length === 0) {
    // Seed with mock agents
    const mockAgents: Agent[] = [
      {
        id: '1',
        name: 'Alpha Trading Bot',
        description: 'High-frequency trading algorithm specializing in DeFi protocols',
        status: AgentStatus.ACTIVE,
        metadata: {
          version: '2.1.0',
          lastDeployment: new Date('2024-01-15'),
          uptime: 99.8,
          totalTrades: 15420,
          successRate: 94.2
        },
        provenance: {
          developer: 'DeFi Labs',
          auditStatus: 'audited',
          securityScore: 95,
          complianceScore: 88
        },
        performance: {
          totalReturn: 156.7,
          sharpeRatio: 2.1,
          maxDrawdown: -8.3,
          volatility: 12.4
        },
        perception: {
          communityRating: 4.6,
          expertRating: 4.8,
          riskTolerance: 'moderate'
        }
      },
      {
        id: '2',
        name: 'Yield Optimizer Pro',
        description: 'Automated yield farming across multiple chains',
        status: AgentStatus.ACTIVE,
        metadata: {
          version: '1.8.3',
          lastDeployment: new Date('2024-01-10'),
          uptime: 98.9,
          totalTrades: 8920,
          successRate: 97.1
        },
        provenance: {
          developer: 'YieldMax Solutions',
          auditStatus: 'audited',
          securityScore: 92,
          complianceScore: 95
        },
        performance: {
          totalReturn: 89.3,
          sharpeRatio: 1.8,
          maxDrawdown: -5.7,
          volatility: 8.9
        },
        perception: {
          communityRating: 4.4,
          expertRating: 4.6,
          riskTolerance: 'conservative'
        }
      },
      {
        id: '3',
        name: 'Arbitrage Hunter',
        description: 'Cross-exchange arbitrage detection and execution',
        status: AgentStatus.ACTIVE,
        metadata: {
          version: '3.0.1',
          lastDeployment: new Date('2024-01-20'),
          uptime: 99.5,
          totalTrades: 23450,
          successRate: 91.8
        },
        provenance: {
          developer: 'Arbitrage Inc',
          auditStatus: 'audited',
          securityScore: 89,
          complianceScore: 82
        },
        performance: {
          totalReturn: 203.4,
          sharpeRatio: 2.8,
          maxDrawdown: -12.1,
          volatility: 18.7
        },
        perception: {
          communityRating: 4.7,
          expertRating: 4.9,
          riskTolerance: 'aggressive'
        }
      }
    ];

    // Add agents to store
    mockAgents.forEach(agent => store.addAgent(agent));

    // Seed with reputation events
    const mockEvents: ReputationEvent[] = [
      {
        id: 'evt_1',
        agentId: '1',
        type: ReputationEventType.PERFORMANCE_IMPROVEMENT,
        timestamp: new Date('2024-01-25T10:30:00Z'),
        description: 'Improved trading algorithm resulted in 15% better returns',
        impact: 25,
        metadata: {
          previousValue: 141.2,
          newValue: 156.7,
          changePercentage: 15.5
        }
      },
      {
        id: 'evt_2',
        agentId: '1',
        type: ReputationEventType.CREDIT_LINE_INCREASE,
        timestamp: new Date('2024-01-24T14:15:00Z'),
        description: 'Credit line increased from $500K to $750K due to performance',
        impact: 20,
        metadata: {
          previousValue: 500000,
          newValue: 750000,
          changePercentage: 50
        }
      },
      {
        id: 'evt_3',
        agentId: '2',
        type: ReputationEventType.APR_IMPROVEMENT,
        timestamp: new Date('2024-01-23T09:45:00Z'),
        description: 'APR improved from 8.2% to 9.1% through strategy optimization',
        impact: 15,
        metadata: {
          previousValue: 8.2,
          newValue: 9.1,
          changePercentage: 11.0
        }
      },
      {
        id: 'evt_4',
        agentId: '3',
        type: ReputationEventType.LTV_OPTIMIZATION,
        timestamp: new Date('2024-01-22T16:20:00Z'),
        description: 'LTV ratio optimized from 65% to 72% while maintaining risk profile',
        impact: 18,
        metadata: {
          previousValue: 65,
          newValue: 72,
          changePercentage: 10.8
        }
      }
    ];

    // Add events to store
    mockEvents.forEach(event => store.addReputationEvent(event));
  }
}
