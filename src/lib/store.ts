import { Agent } from '@/types/agent';
import { ReputationEvent } from '@/types/reputation';

/**
 * Simple in-memory store for MVP. In production, replace with a database.
 */
class InMemoryStore {
  private agents: Map<string, Agent> = new Map();
  private reputationEvents: Map<string, ReputationEvent[]> = new Map();

  upsertAgent(agent: Agent) {
    this.agents.set(agent.id, agent);
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  listAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  addReputationEvent(event: ReputationEvent) {
    const list = this.reputationEvents.get(event.agentId) ?? [];
    list.push(event);
    this.reputationEvents.set(event.agentId, list);
  }

  getReputationEvents(agentId: string): ReputationEvent[] {
    return this.reputationEvents.get(agentId) ?? [];
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __riskMonitorStore: InMemoryStore | undefined;
}

export const store: InMemoryStore = globalThis.__riskMonitorStore ?? new InMemoryStore();
if (!globalThis.__riskMonitorStore) {
  globalThis.__riskMonitorStore = store;
}


