import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../app/api/credit-vaults/route';

// Mock the ensureSeeded function
const { mockEnsureSeeded } = vi.hoisted(() => ({
  mockEnsureSeeded: vi.fn()
}));

// Mock the store
const { mockStore } = vi.hoisted(() => ({
  mockStore: {
    getAgents: vi.fn(),
    getAgent: vi.fn(),
    addAgent: vi.fn()
  }
}));

// Mock the seed module
vi.mock('@/lib/seed', () => ({
  ensureSeeded: mockEnsureSeeded
}));

// Mock the store module
vi.mock('@/lib/store', () => ({
  store: mockStore
}));

describe('API Mock EnsureSeeded Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock return values
    mockEnsureSeeded.mockImplementation(() => {
      // Do nothing - just don't call the real ensureSeeded
    });
    
    mockStore.getAgents.mockReturnValue([]);
    mockStore.getAgent.mockReturnValue(null);
  });

  it('should test GET route with mocked ensureSeeded', async () => {
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

  it('should test POST route with mocked ensureSeeded and null agent', async () => {
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
