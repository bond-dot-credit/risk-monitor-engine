import { Agent } from '@/types/agent';

class InMemoryStore {
  private agents: Map<string, Agent> = new Map();

  upsertAgent(agent: Agent) {
    this.agents.set(agent.id, agent);
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  listAgents(): Agent[] {
    return Array.from(this.agents.values());
  }
}

declare global {
  var __riskMonitorStore: InMemoryStore | undefined;
}

export const store: InMemoryStore = globalThis.__riskMonitorStore ?? new InMemoryStore();
if (!globalThis.__riskMonitorStore) {
  globalThis.__riskMonitorStore = store;
}


