import { NextRequest, NextResponse } from 'next/server';
import { CreditVault, VaultStatus } from '@/types/credit';
import { Agent, CredibilityTier, AgentStatus } from '@/types/agent';
import { calculateLTV } from '@/lib/scoring';

// Mock credit vaults data
const mockVaults: CreditVault[] = [
  {
    id: 'vault_1',
    agentId: '1',
    balance: 15000,
    creditLimit: 25000,
    currentLTV: 75,
    maxLTV: 80,
    utilization: 60,
    status: VaultStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'vault_2',
    agentId: '2',
    balance: 8500,
    creditLimit: 15000,
    currentLTV: 65,
    maxLTV: 70,
    utilization: 57,
    status: VaultStatus.ACTIVE,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  }
];

// Mock agent data for calculations
const mockAgent: Agent = {
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
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');

    let filteredVaults = [...mockVaults];

    // Apply filters
    if (agentId) {
      filteredVaults = filteredVaults.filter(vault => vault.agentId === agentId);
    }

    if (status && status !== 'all') {
      filteredVaults = filteredVaults.filter(vault => vault.status === status);
    }

    // Calculate additional metrics for each vault
    const vaultsWithMetrics = filteredVaults.map(vault => {
      const healthFactor = calculateHealthFactor(vault);
      const liquidationPrice = calculateLiquidationPrice(vault);
      
      return {
        ...vault,
        healthFactor,
        liquidationPrice,
        riskLevel: getRiskLevel(healthFactor)
      };
    });

    return NextResponse.json({
      success: true,
      data: vaultsWithMetrics,
      total: vaultsWithMetrics.length
    });
  } catch (error) {
    console.error('Error fetching credit vaults:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch credit vaults' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, requestedLimit } = body;

    if (!agentId || !requestedLimit) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate LTV for the agent
    const ltvCalculation = calculateLTV(mockAgent);
    const maxCreditLimit = (requestedLimit * ltvCalculation.finalLTV) / 100;

    // Create new credit vault
    const newVault: CreditVault = {
      id: `vault_${Date.now()}`,
      agentId,
      balance: 0,
      creditLimit: maxCreditLimit,
      currentLTV: 0,
      maxLTV: ltvCalculation.finalLTV,
      utilization: 0,
      status: VaultStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // In production, save to database
    mockVaults.push(newVault);

    return NextResponse.json({
      success: true,
      data: {
        vault: newVault,
        ltvCalculation
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating credit vault:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create credit vault' },
      { status: 500 }
    );
  }
}

// Calculate health factor for a vault
function calculateHealthFactor(vault: CreditVault): number {
  if (vault.balance === 0) return Infinity;
  
  const collateralValue = vault.balance * (vault.maxLTV / 100);
  const healthFactor = collateralValue / vault.balance;
  
  return Math.round(healthFactor * 100) / 100;
}

// Calculate liquidation price
function calculateLiquidationPrice(vault: CreditVault): number {
  if (vault.balance === 0) return 0;
  
  const liquidationThreshold = vault.maxLTV * 0.85; // 85% of max LTV
  return vault.balance * (liquidationThreshold / 100);
}

// Determine risk level based on health factor
function getRiskLevel(healthFactor: number): string {
  if (healthFactor === Infinity) return 'none';
  if (healthFactor > 2) return 'low';
  if (healthFactor > 1.5) return 'medium';
  if (healthFactor > 1.2) return 'high';
  return 'critical';
}
