import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../app/api/credit-vaults/route';

// Mock the store
const { mockStore } = vi.hoisted(() => ({
  mockStore: {
    getAgents: vi.fn(),
    getAgent: vi.fn(),
    addAgent: vi.fn()
  }
}));

vi.mock('@/lib/store', () => ({
  store: mockStore
}));

describe('API Error Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock return values
    mockStore.getAgents.mockReturnValue([]);
    mockStore.getAgent.mockReturnValue(null);
  });

  it('should test GET route with mocked store', async () => {
    const request = new NextRequest('http://localhost:3000/api/credit-vaults');
    
    try {
      const response = await GET(request);
      console.log('GET Response status:', response.status);
      const data = await response.json();
      console.log('GET Response data:', data);
      expect(response.status).toBe(200);
    } catch (error) {
      console.error('GET API error:', error);
      throw error;
    }
  });

  it('should test POST route with mocked store returning null agent', async () => {
    // Mock agent not found
    mockStore.getAgent.mockReturnValue(null);
    
    const requestData = {
      agentId: 'agent_1',
      chainId: 1, // Ethereum
      collateralToken: 'ETH',
      collateralAmount: 10,
      collateralValueUSD: 20000
    };

    const request = new NextRequest('http://localhost:3000/api/credit-vaults', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });

    try {
      const response = await POST(request);
      console.log('POST Response status:', response.status);
      const data = await response.json();
      console.log('POST Response data:', data);
      expect(response.status).toBe(404);
    } catch (error) {
      console.error('POST API error:', error);
      throw error;
    }
  });
});
