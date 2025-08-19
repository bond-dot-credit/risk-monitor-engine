import { Agent } from '@/types/agent';
import { ReputationEvent } from '@/types/reputation';

class InMemoryStore {
  private agents = new Map<string, Agent>();
  private reputationEvents = new Map<string, ReputationEvent>();

  addAgent(agent: Agent) {
    this.agents.set(agent.id, agent);
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  addReputationEvent(event: ReputationEvent) {
    this.reputationEvents.set(event.id, event);
  }

  getReputationEvents(agentId: string): ReputationEvent[] {
    return Array.from(this.reputationEvents.values())
      .filter(event => event.agentId === agentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getAllReputationEvents(): ReputationEvent[] {
    return Array.from(this.reputationEvents.values());
  }

  private static instance: InMemoryStore;

  static getInstance(): InMemoryStore {
    if (!InMemoryStore.instance) {
      InMemoryStore.instance = new InMemoryStore();
    }
    return InMemoryStore.instance;
  }
}

export const store = InMemoryStore.getInstance();


