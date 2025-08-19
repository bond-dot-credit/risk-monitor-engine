import { NextRequest } from 'next/server';
import { store } from '@/lib/store';
import { calculateRiskMetrics } from '@/lib/scoring';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
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

      function send(data: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      // initial snapshot
      send({ type: 'snapshot', risk: calculateRiskMetrics(agent) });

      // periodic updates (mock)
      const interval = setInterval(() => {
        const currentAgent = store.getAgent(agentId);
        if (!currentAgent) return;
        const risk = calculateRiskMetrics(currentAgent);
        send({ type: 'update', risk, at: new Date().toISOString() });
      }, 3000);

      const close = () => {
        clearInterval(interval);
        controller.close();
      };

      // Close on client disconnect (standard Request has an AbortSignal in Edge/Node runtimes)
      const req = request as Request & { signal?: AbortSignal };
      if (req?.signal?.addEventListener) {
        req.signal.addEventListener('abort', close);
      }
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


