import { Agent } from '@/types/agent';
import { ReputationEvent } from '@/types/reputation';

class InMemoryStore {
  private agents: Map<string, Agent> = new Map();
  private reputationEvents: Map<string, ReputationEvent> = new Map();

  // Agent methods
  addAgent(agent: Agent) {
    this.agents.set(agent.id, agent);
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  // Reputation event methods
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

  // Singleton pattern
  private static instance: InMemoryStore;

  static getInstance(): InMemoryStore {
    if (!InMemoryStore.instance) {
      InMemoryStore.instance = new InMemoryStore();
    }
    return InMemoryStore.instance;
  }
}

// For backward compatibility
export const store = InMemoryStore.getInstance();


