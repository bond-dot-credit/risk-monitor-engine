import { store } from './store';
import { Agent, AgentStatus, CredibilityTier } from '../types/agent';
import { ReputationEvent, ReputationEventType } from '../types/reputation';
import { calculateAgentScore, determineCredibilityTier } from './scoring';

export function ensureSeeded() {
  if (store.getAgents().length === 0) {
    // Seed with mock agents
    const mockAgents: Agent[] = [
      {
        id: '1',
        name: 'Alpha Trading Bot',
        operator: '0x742d35Cc6640C178fFfbDD5B5e3d6480',
        metadata: {
          description: 'High-frequency trading algorithm specializing in DeFi protocols',
          category: 'Trading',
          version: '2.1.0',
          tags: ['defi', 'trading', 'arbitrage'],
          provenance: {
            sourceCode: 'https://github.com/agent-dev/trading-alpha',
            verificationHash: '0xa1b2c3d4e5f6...',
            deploymentChain: 'Ethereum',
            lastAudit: new Date('2024-01-15')
          }
        },
        score: calculateAgentScore(95, 85, 83),
        credibilityTier: CredibilityTier.PLATINUM,
        status: AgentStatus.ACTIVE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Yield Optimizer Pro',
        operator: '0x123e4567e89b12d3a456426614174000',
        metadata: {
          description: 'Automated yield farming across multiple chains',
          category: 'DeFi',
          version: '1.8.3',
          tags: ['yield', 'farming', 'optimization'],
          provenance: {
            sourceCode: 'https://github.com/yield-protocol/optimizer',
            verificationHash: '0xb2c3d4e5f6a7...',
            deploymentChain: 'Polygon',
            lastAudit: new Date('2024-01-10')
          }
        },
        score: calculateAgentScore(92, 72, 68),
        credibilityTier: CredibilityTier.GOLD,
        status: AgentStatus.ACTIVE,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Arbitrage Hunter',
        operator: '0x456789abcdef0123456789abcdef0123',
        metadata: {
          description: 'Cross-exchange arbitrage detection and execution',
          category: 'Trading',
          version: '3.0.1',
          tags: ['arbitrage', 'trading', 'cross-exchange'],
          provenance: {
            sourceCode: 'https://github.com/arbitrage-labs/hunter',
            verificationHash: '0xc3d4e5f6a7b8...',
            deploymentChain: 'Arbitrum',
            lastAudit: new Date('2024-01-20')
          }
        },
        score: calculateAgentScore(89, 78, 76),
        credibilityTier: CredibilityTier.GOLD,
        status: AgentStatus.ACTIVE,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date()
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
