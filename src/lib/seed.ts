import { Agent, AgentStatus, CredibilityTier } from '@/types/agent';
import { store } from './store';

let seeded = false;

export function ensureSeeded() {
  if (seeded) return;

  const agents: Agent[] = [
    {
      id: '1',
      name: 'TradingBot Alpha',
      operator: '0x742d35Cc6640C178fFfbDD5B5e3d6480',
      metadata: {
        description: 'High-frequency trading agent for DeFi protocols',
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
      score: {
        overall: 87,
        provenance: 92,
        performance: 85,
        perception: 83,
        confidence: 89,
        lastUpdated: new Date()
      },
      credibilityTier: CredibilityTier.PLATINUM,
      status: AgentStatus.ACTIVE,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Oracle Sentinel',
      operator: '0x123e4567e89b12d3a456426614174000',
      metadata: {
        description: 'Real-time price oracle with ML predictions',
        category: 'Oracle',
        version: '1.8.2',
        tags: ['oracle', 'price-feed', 'ml'],
        provenance: {
          sourceCode: 'https://github.com/oracle-labs/sentinel',
          verificationHash: '0xb2c3d4e5f6a7...',
          deploymentChain: 'Arbitrum',
          lastAudit: new Date('2024-02-01')
        }
      },
      score: {
        overall: 76,
        provenance: 88,
        performance: 72,
        perception: 68,
        confidence: 78,
        lastUpdated: new Date()
      },
      credibilityTier: CredibilityTier.GOLD,
      status: AgentStatus.ACTIVE,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    }
  ];

  for (const a of agents) store.upsertAgent(a);
  seeded = true;
}


