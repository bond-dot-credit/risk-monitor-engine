import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { VerificationStatus } from '@/types/agent';
import { ensureSeeded } from '@/lib/seed';

export async function GET(request: NextRequest) {
  try {
    ensureSeeded();
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const agents = store.getAgents();
    let filteredAgents = agents;

    if (agentId) {
      filteredAgents = filteredAgents.filter(agent => agent.id === agentId);
    }

    if (category && category !== 'all') {
      filteredAgents = filteredAgents.filter(agent => 
        agent.metadata.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (status && status !== 'all') {
      // status comes as string; compare to enum name
      filteredAgents = filteredAgents.filter(agent => String(agent.verification) === status);
    }

    // Mock compliance data
    const complianceData = filteredAgents.map(agent => {
      const complianceScore = Math.round(
        (agent.score.provenance * 0.4) + 
        (agent.score.performance * 0.3) + 
        (agent.score.verification * 0.3)
      );

      const complianceStatus = complianceScore >= 80 ? 'compliant' : 
                             complianceScore >= 60 ? 'under-review' : 'non-compliant';

      const lastAudit = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const nextAudit = new Date(lastAudit.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

      return {
        agentId: agent.id,
        agentName: agent.name,
        category: agent.metadata.category,
        complianceScore,
        complianceStatus,
        lastAudit,
        nextAudit,
        riskLevel: complianceScore < 60 ? 'high' : complianceScore < 80 ? 'medium' : 'low',
        verificationMethods: agent.metadata.verificationMethods?.length || 0,
  passedVerifications: agent.metadata.verificationMethods?.filter(m => m.status === VerificationStatus.PASSED).length || 0
      };
    });

    return NextResponse.json({
      success: true,
      data: complianceData
    });
  } catch (error) {
    console.error('Error fetching compliance data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch compliance data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureSeeded();
    const body = await request.json();
    const { agentId, complianceType, status, notes, auditor } = body;

    if (!agentId || !complianceType || !status) {
      return NextResponse.json(
        { success: false, error: 'agentId, complianceType, and status are required' },
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

    // Create compliance record
    const complianceRecord = {
      id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      agentId,
      complianceType,
      status,
      notes: notes || '',
      auditor: auditor || 'System',
      timestamp: new Date(),
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    };

    // Update agent verification status if compliance check fails
    if (status === 'FAILED' && agent.verification === VerificationStatus.PASSED) {
      agent.verification = VerificationStatus.UNDER_REVIEW;
      agent.updatedAt = new Date();
      store.addAgent(agent);
    }

    return NextResponse.json({
      success: true,
      data: { complianceRecord, agent }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating compliance record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create compliance record' },
      { status: 500 }
    );
  }
}
