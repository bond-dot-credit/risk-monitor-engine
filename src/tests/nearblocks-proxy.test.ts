import { describe, it, expect } from 'vitest';
import { GET, POST } from '../app/api/nearblocks-proxy/route';

describe('NearBlocks Proxy API', () => {
  it('should return error when accountId is missing in GET request', async () => {
    const request = new Request('http://localhost:3000/api/nearblocks-proxy', {
      method: 'GET',
    });
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Missing accountId parameter');
  });

  it('should return mock transaction data when accountId is provided in GET request', async () => {
    const request = new Request('http://localhost:3000/api/nearblocks-proxy?accountId=test.near', {
      method: 'GET',
    });
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('txns');
    expect(Array.isArray(data.data.txns)).toBe(true);
    expect(data.data.txns.length).toBeGreaterThan(0);
  });

  it('should return error when accountId is missing in POST request', async () => {
    const request = new Request('http://localhost:3000/api/nearblocks-proxy', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Missing accountId in request body');
  });

  it('should return mock account data when accountId is provided in POST request', async () => {
    const request = new Request('http://localhost:3000/api/nearblocks-proxy', {
      method: 'POST',
      body: JSON.stringify({ accountId: 'test.near' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('account_id');
    expect(data.data.account_id).toBe('test.near');
  });
});