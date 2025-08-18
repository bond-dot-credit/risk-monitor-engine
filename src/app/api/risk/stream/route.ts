import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';
import { calculateRiskMetrics } from '@/lib/scoring';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  ensureSeeded();
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  if (!agentId) {
    return new Response('agentId is required', { status: 400 });
  }
  const agent = store.getAgent(agentId);
  if (!agent) {
    return new Response('Agent not found', { status: 404 });
  }

  const readable = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      send({ type: 'snapshot', risk: calculateRiskMetrics(agent) });

      const interval = setInterval(() => {
        const currentAgent = store.getAgent(agentId);
        if (!currentAgent) return;
        send({ type: 'update', risk: calculateRiskMetrics(currentAgent), at: new Date().toISOString() });
      }, 3000);

      const close = () => {
        clearInterval(interval);
        controller.close();
      };

      const anyReq: any = request as any;
      if (anyReq?.signal?.addEventListener) anyReq.signal.addEventListener('abort', close);
    }
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}


