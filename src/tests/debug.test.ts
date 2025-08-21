import { describe, it, expect } from 'vitest';
import { store } from '@/lib/store';
import { ensureSeeded } from '@/lib/seed';
import { calculateDynamicLTV, createCreditVault } from '@/lib/credit-vault';
import { ChainId } from '@/types/credit-vault';
import { GET, POST } from '@/app/api/credit-vaults/route';
import { NextRequest } from 'next/server';

describe('Debug Test', () => {
  it('should seed the store', () => {
    ensureSeeded();
    const agents = store.getAgents();
    console.log('Agents:', agents.map(a => ({ id: a.id, name: a.name })));
    expect(agents.length).toBeGreaterThan(0);
  });

  it('should get agent by id', () => {
    ensureSeeded();
    const agent = store.getAgent('agent_1');
    console.log('Agent 1:', agent);
    expect(agent).toBeDefined();
    expect(agent?.id).toBe('agent_1');
  });

  it('should calculate dynamic LTV', () => {
    ensureSeeded();
    const agent = store.getAgent('agent_1');
    expect(agent).toBeDefined();
    
    const ltv = calculateDynamicLTV(agent!, ChainId.ETHEREUM, 20000);
    console.log('Dynamic LTV:', ltv);
    expect(ltv).toBeGreaterThan(0);
  });

  it('should create credit vault', () => {
    ensureSeeded();
    const agent = store.getAgent('agent_1');
    expect(agent).toBeDefined();
    
    const vault = createCreditVault(
      'agent_1',
      ChainId.ETHEREUM,
      'ETH',
      10,
      20000,
      70
    );
    console.log('Created vault:', vault);
    expect(vault).toBeDefined();
    expect(vault.agentId).toBe('agent_1');
  });

  it('should test GET API route directly', async () => {
    ensureSeeded();
    
    // Create a mock request
    const request = new NextRequest('http://localhost:3000/api/credit-vaults');
    
    try {
      const response = await GET(request);
      console.log('GET Response status:', response.status);
      console.log('GET Response body:', await response.json());
      expect(response.status).toBe(200);
    } catch (error) {
      console.error('GET API error:', error);
      throw error;
    }
  });
});
