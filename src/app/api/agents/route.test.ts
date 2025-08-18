// Mock next/server so importing the route module doesn't require Next.js runtime
jest.mock('next/server', () => {
  class NextRequest {
    url: string;
    body: any;
    constructor(input: any) {
      this.url = typeof input === 'string' ? input : input?.url;
      this.body = input?.body;
    }
    async json() {
      if (this.body) {
        try { return JSON.parse(this.body); } catch { return this.body; }
      }
      return {};
    }
  }

  const NextResponse = {
    json: (payload: any, opts?: any) => {
      return {
        status: opts?.status || 200,
        json: async () => payload
      } as any;
    }
  };

  return { NextRequest, NextResponse };
});

let route: any;

beforeAll(async () => {
  // import after mocking
  route = await import('./route');
});

describe('agents API route', () => {
  test('GET returns all agents without filters', async () => {
  const req = { url: 'http://localhost/api/agents' } as any;
  const res = await route.GET(req);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.total).toBeGreaterThanOrEqual(1);
  });

  test('GET applies category filter', async () => {
  const req = { url: 'http://localhost/api/agents?category=Trading' } as any;
  const res = await route.GET(req);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.every((a: any) => a.metadata.category === 'Trading')).toBe(true);
  });

  test('POST returns 400 for missing fields', async () => {
  const bodyObj = { name: 'x' };
  const req = { url: 'http://localhost/api/agents', method: 'POST', json: async () => bodyObj } as any;
  const res = await route.POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  test('POST creates an agent with valid payload', async () => {
    const payload = {
      name: 'New Agent',
      operator: '0xabc',
      metadata: { description: '', category: 'test', version: '1', tags: [], provenance: { sourceCode: '', verificationHash: '', deploymentChain: '' } },
      scores: { provenance: 80, performance: 80, perception: 80 }
    };
  const req = { url: 'http://localhost/api/agents', method: 'POST', json: async () => payload } as any;
  const res = await route.POST(req);
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('id');
    expect(json.data.credibilityTier).toBeDefined();
  });
});
