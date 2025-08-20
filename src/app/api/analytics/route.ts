import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';

export async function GET(request: NextRequest) {
  try {
    ensureSeeded();
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    const category = searchParams.get('category');
    const tier = searchParams.get('tier');

    const agents = store.getAgents();
    let filteredAgents = agents;

    if (category && category !== 'all') {
      filteredAgents = filteredAgents.filter(agent => 
        agent.metadata.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (tier && tier !== 'all') {
      filteredAgents = filteredAgents.filter(agent => agent.credibilityTier === tier);
    }

    const totalAgents = filteredAgents.length;
    const averageScore = totalAgents > 0 
      ? Math.round(filteredAgents.reduce((sum, agent) => sum + agent.score.overall, 0) / totalAgents)
      : 0;

    const tierDistribution = filteredAgents.reduce((acc, agent) => {
      const tier = agent.credibilityTier;
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const topPerformers = [...filteredAgents]
      .sort((a, b) => b.score.overall - a.score.overall)
      .slice(0, 10)
      .map(agent => ({
        id: agent.id,
        name: agent.name,
        category: agent.metadata.category,
        score: agent.score.overall,
        tier: agent.credibilityTier,
        status: agent.status
      }));

    const riskMetrics = {
      highRisk: filteredAgents.filter(a => a.score.overall < 60).length,
      mediumRisk: filteredAgents.filter(a => a.score.overall >= 60 && a.score.overall < 80).length,
      lowRisk: filteredAgents.filter(a => a.score.overall >= 80).length
    };

    const categoryBreakdown = filteredAgents.reduce((acc, agent) => {
      const category = agent.metadata.category;
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalScore: 0,
          averageScore: 0,
          tiers: {}
        };
      }
      acc[category].count++;
      acc[category].totalScore += agent.score.overall;
      
      const tier = agent.credibilityTier;
      acc[category].tiers[tier] = (acc[category].tiers[tier] || 0) + 1;
      
      return acc;
    }, {} as { [key: string]: any });

    // Calculate average scores for each category
    Object.keys(categoryBreakdown).forEach(category => {
      const data = categoryBreakdown[category];
      data.averageScore = Math.round(data.totalScore / data.count);
    });

    // Mock performance trends based on timeframe
    const generateTrendData = (days: number) => {
      const data = [];
      let baseValue = 80;
      for (let i = 0; i < days; i++) {
        baseValue += Math.random() * 4 - 2; // Random variation
        data.push(Math.max(0, Math.min(100, Math.round(baseValue)));
      }
      return data;
    };

    const performanceTrends = {
      '7d': generateTrendData(7),
      '30d': generateTrendData(30),
      '90d': generateTrendData(90)
    };

    const analyticsData = {
      totalAgents,
      averageScore,
      tierDistribution,
      performanceTrends,
      topPerformers,
      riskMetrics,
      categoryBreakdown,
      timeframe,
      lastUpdated: new Date()
    };

    return NextResponse.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
