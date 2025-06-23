
import { agentApiService } from './AgentApiService';
import { agentConfigService } from './AgentConfigService';
import { AgentResponse } from "@/components/AgentResponse";

export class AgentService {
  async updateAgent(agentId: string, updateData: any): Promise<boolean> {
    return agentApiService.updateAgent(agentId, updateData);
  }

  async getAgent(agentId: string): Promise<AgentResponse> {
    return agentApiService.getAgent(agentId);
  }

  async createAgent(agentData: any): Promise<{ agent_id: string }> {
    return agentApiService.createAgent(agentData);
  }

  prepareUpdatePayload(
    agentData: AgentResponse,
    multilingualMessages: Record<string, string>
  ) {
    return agentConfigService.prepareUpdatePayload(agentData, multilingualMessages);
  }
}

export const agentService = new AgentService();

// Re-export types for backward compatibility
export type {
  AgentPrompt,
  AgentConfig,
  TTSConfig,
  ConversationConfig,
  UpdateAgentRequest
} from './AgentConfigService';
