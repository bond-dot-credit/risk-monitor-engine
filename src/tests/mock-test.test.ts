import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store } from '@/lib/store';

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

describe('Mock Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should mock store.getAgent correctly', () => {
    // Set up mock return value
    mockStore.getAgent.mockReturnValue(null);
    
    // Test that the mock is working
    const result = store.getAgent('agent_1');
    expect(result).toBe(null);
    expect(mockStore.getAgent).toHaveBeenCalledWith('agent_1');
  });

  it('should mock store.getAgents correctly', () => {
    const mockAgents = [
      { id: 'agent_1', name: 'Test Agent' }
    ];
    
    mockStore.getAgents.mockReturnValue(mockAgents);
    
    const result = store.getAgents();
    expect(result).toEqual(mockAgents);
    expect(mockStore.getAgents).toHaveBeenCalled();
  });
});
