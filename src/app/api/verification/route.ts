import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';
import { VerificationType, VerificationStatus } from '@/types/agent';

export async function GET(request: NextRequest) {
  try {
    ensureSeeded();
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const agents = store.getAgents();
    let filteredAgents = agents;

    if (agentId) {
      filteredAgents = filteredAgents.filter(agent => agent.id === agentId);
    }

    if (type && type !== 'all') {
      filteredAgents = filteredAgents.filter(agent => 
        agent.metadata.verificationMethods.some(method => String(method.type) === type)
      );
    }

    if (status && status !== 'all') {
      filteredAgents = filteredAgents.filter(agent => 
        agent.metadata.verificationMethods.some(method => String(method.status) === status)
      );
    }

    const verificationSummary = filteredAgents.map(agent => {
      const verificationMethods = agent.metadata.verificationMethods || [];
      const passedMethods = verificationMethods.filter(m => m.status === VerificationStatus.PASSED);
      const failedMethods = verificationMethods.filter(m => m.status === VerificationStatus.FAILED);
      const pendingMethods = verificationMethods.filter(m => 
        m.status === VerificationStatus.PENDING || m.status === VerificationStatus.IN_PROGRESS
      );

      return {
        agentId: agent.id,
        agentName: agent.name,
        totalMethods: verificationMethods.length,
        passedMethods: passedMethods.length,
        failedMethods: failedMethods.length,
        pendingMethods: pendingMethods.length,
        overallScore: verificationMethods.length > 0 
          ? Math.round(passedMethods.reduce((sum, m) => sum + m.score, 0) / verificationMethods.length)
          : 0,
        lastVerified: verificationMethods.length > 0 
          ? new Date(Math.max(...verificationMethods.map(m => m.lastVerified.getTime())))
          : null,
        nextDue: verificationMethods.length > 0 
          ? new Date(Math.min(...verificationMethods.map(m => m.nextVerificationDue.getTime())))
          : null
      };
    });

    return NextResponse.json({
      success: true,
      data: verificationSummary
    });
  } catch (error) {
    console.error('Error fetching verification summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verification summary' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureSeeded();
    const body = await request.json();
    const { agentId, type, status, score, details } = body;

    if (!agentId || !type || !status) {
      return NextResponse.json(
        { success: false, error: 'agentId, type, and status are required' },
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

    const newVerificationMethod = {
      id: `verif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: type as VerificationType,
      status: status as VerificationStatus,
      score: score || 0,
      lastVerified: new Date(),
      nextVerificationDue: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months
      details: details || {}
    };

    agent.metadata.verificationMethods.push(newVerificationMethod);
    agent.updatedAt = new Date();

    // Update agent score with verification bonus
    if (status === VerificationStatus.PASSED && score > 80) {
      agent.score.verification = Math.min(100, agent.score.verification + 5);
    }

    store.addAgent(agent);

    return NextResponse.json({
      success: true,
      data: { verificationMethod: newVerificationMethod, agent }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating verification method:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create verification method' },
      { status: 500 }
    );
  }
}
