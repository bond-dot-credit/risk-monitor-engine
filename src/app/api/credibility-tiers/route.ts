import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';
import { 
  CREDIBILITY_TIERS, 
  calculateCredibilityTier, 
  calculateMaxLTV, 
  checkTierUpgradeEligibility,
  compareAgentTiers
} from '@/lib/credibility-tiers';
import { CredibilityTier } from '@/types/agent';

export async function GET(request: NextRequest) {
  try {
    ensureSeeded();
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const tier = searchParams.get('tier');
    const includeComparison = searchParams.get('includeComparison') === 'true';

    const agents = store.getAgents();
    let filteredAgents = agents;

    // Filter by specific agent
    if (agentId) {
      filteredAgents = filteredAgents.filter(agent => agent.id === agentId);
    }

    // Filter by specific tier
    if (tier && tier !== 'all') {
      filteredAgents = filteredAgents.filter(agent => agent.credibilityTier === tier);
    }

    // Get tier information
    const tierInfo = Object.entries(CREDIBILITY_TIERS).map(([tierKey, info]) => ({
      tier: tierKey,
      ...info
    }));

    // Get tier distribution and comparison data
    let tierComparison = null;
    if (includeComparison && agents.length > 0) {
      tierComparison = compareAgentTiers(agents);
    }

    // Get agent tier details
    const agentTierDetails = filteredAgents.map(agent => {
      const currentTier = agent.credibilityTier;
      const tierData = CREDIBILITY_TIERS[currentTier];
      const maxLTV = calculateMaxLTV(agent);
      
      // Calculate upgrade eligibility (mock data for now)
      const daysActive = Math.floor((Date.now() - agent.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const successfulTransactions = Math.floor(Math.random() * 50) + 5; // Mock data
      const upgradeEligibility = checkTierUpgradeEligibility(agent, daysActive, successfulTransactions);

      return {
        agentId: agent.id,
        agentName: agent.name,
        currentTier: currentTier,
        tierInfo: tierData,
        maxLTV,
        score: agent.score.overall,
        daysActive,
        successfulTransactions,
        upgradeEligibility,
        lastUpdated: agent.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        tierInfo,
        agentTierDetails,
        tierComparison,
        totalAgents: agents.length,
        filteredCount: filteredAgents.length
      }
    });
  } catch (error) {
    console.error('Error fetching credibility tiers data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch credibility tiers data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureSeeded();
    const body = await request.json();
    const { agentId, action, tier, collateral, marketConditions } = body;

    if (!agentId || !action) {
      return NextResponse.json(
        { success: false, error: 'agentId and action are required' },
        { status: 400 }
      );
    }

    const agent = store.getAgent(agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    let result: Record<string, unknown> = {};

    switch (action) {
      case 'calculate_ltv':
        if (collateral === undefined || marketConditions === undefined) {
          return NextResponse.json(
            { success: false, error: 'collateral and marketConditions are required for LTV calculation' },
            { status: 400 }
          );
        }
        
        const maxLTV = calculateMaxLTV(agent, collateral, marketConditions);
        result = {
          agentId,
          currentTier: agent.credibilityTier,
          baseLTV: CREDIBILITY_TIERS[agent.credibilityTier].maxLTV,
          maxLTV,
          collateral,
          marketConditions,
          calculation: {
            scoreBonus: Math.min(5, Math.floor(agent.score.overall / 20)),
            verificationBonus: Math.min(3, Math.floor(agent.score.verification / 33)),
            performanceBonus: Math.min(2, Math.floor(agent.score.performance / 50)),
            collateralBonus: collateral > 1000000 ? 3 : collateral > 500000 ? 2 : collateral > 100000 ? 1 : 0,
            marketAdjustment: marketConditions === 'bull' ? 2 : marketConditions === 'bear' ? -3 : marketConditions === 'volatile' ? -2 : 0
          }
        };
        break;

      case 'check_upgrade_eligibility':
        const daysActive = Math.floor((Date.now() - agent.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const successfulTransactions = Math.floor(Math.random() * 50) + 5; // Mock data
        const upgradeEligibility = checkTierUpgradeEligibility(agent, daysActive, successfulTransactions);
        
        result = {
          agentId,
          currentTier: agent.credibilityTier,
          upgradeEligibility,
          metrics: {
            daysActive,
            successfulTransactions,
            score: agent.score.overall,
            verification: agent.score.verification,
            performance: agent.score.performance
          }
        };
        break;

      case 'simulate_tier_change':
        if (!tier) {
          return NextResponse.json(
            { success: false, error: 'tier is required for tier change simulation' },
            { status: 400 }
          );
        }

        if (!Object.values(CredibilityTier).includes(tier as CredibilityTier)) {
          return NextResponse.json(
            { success: false, error: 'Invalid tier specified' },
            { status: 400 }
          );
        }

        const simulatedAgent = { ...agent, credibilityTier: tier as CredibilityTier };
        const simulatedLTV = calculateMaxLTV(simulatedAgent, collateral || 0, marketConditions || 'normal');
        
        result = {
          agentId,
          originalTier: agent.credibilityTier,
          simulatedTier: tier,
          originalLTV: calculateMaxLTV(agent, collateral || 0, marketConditions || 'normal'),
          simulatedLTV,
          ltvChange: simulatedLTV - calculateMaxLTV(agent, collateral || 0, marketConditions || 'normal'),
          tierInfo: CREDIBILITY_TIERS[tier as CredibilityTier]
        };
        break;

      case 'get_tier_recommendations':
        const currentScore = agent.score.overall;
        const recommendations = Object.entries(CREDIBILITY_TIERS)
          .filter(([tierKey, tierData]) => {
            const tierEnum = tierKey as CredibilityTier;
            return tierEnum !== agent.credibilityTier && currentScore >= tierData.minScore;
          })
          .map(([tierKey, tierData]) => {
            const tierEnum = tierKey as CredibilityTier;
            const scoreGap = tierData.minScore - currentScore;
            const estimatedTime = scoreGap <= 0 ? 'Immediate' :
                                scoreGap <= 5 ? '1-2 weeks' :
                                scoreGap <= 10 ? '2-4 weeks' :
                                scoreGap <= 15 ? '1-2 months' : '3+ months';
            
            return {
              tier: tierEnum,
              tierInfo: tierData,
              scoreGap,
              estimatedTime,
              requirements: tierData.requirements,
              benefits: tierData.benefits
            };
          })
          .sort((a, b) => a.scoreGap - b.scoreGap);

        result = {
          agentId,
          currentTier: agent.credibilityTier,
          currentScore,
          recommendations
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action specified' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 });

  } catch (error) {
    console.error('Error processing credibility tiers request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    ensureSeeded();
    const body = await request.json();
    const { agentId, newTier, reason } = body;

    if (!agentId || !newTier) {
      return NextResponse.json(
        { success: false, error: 'agentId and newTier are required' },
        { status: 400 }
      );
    }

    if (!Object.values(CredibilityTier).includes(newTier as CredibilityTier)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tier specified' },
        { status: 400 }
      );
    }

    const agent = store.getAgent(agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    const oldTier = agent.credibilityTier;
    agent.credibilityTier = newTier as CredibilityTier;
    agent.updatedAt = new Date();

    // Update the agent in the store
    store.addAgent(agent);

    // Log the tier change
    const tierChangeLog = {
      id: `tier_change_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      agentId,
      oldTier,
      newTier,
      reason: reason || 'Manual tier update',
      timestamp: new Date(),
      updatedBy: 'system'
    };

    return NextResponse.json({
      success: true,
      data: {
        agentId,
        oldTier,
        newTier,
        tierChangeLog,
        message: `Agent ${agent.name} tier updated from ${oldTier} to ${newTier}`
      }
    });

  } catch (error) {
    console.error('Error updating agent tier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update agent tier' },
      { status: 500 }
    );
  }
}
