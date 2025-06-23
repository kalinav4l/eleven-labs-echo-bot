import {
  AgentCreateRequest,
  AgentCreateResponse,
  AgentUpdateRequest,
  AgentResponse
} from '../types/dtos';
import { API_CONFIG } from '../constants/constants';

export class ElevenLabsController {
  static async createAgent(request: AgentCreateRequest): Promise<AgentCreateResponse> {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/eleven-labs/agent/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Create agent failed');
    }
    return response.json();
  }

  static async getAgent(agentId: string): Promise<AgentResponse> {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/eleven-labs/agent/${encodeURIComponent(agentId)}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Get agent failed');
    }
    return response.json();
  }

  static async updateAgent(agentId: string, request: AgentUpdateRequest): Promise<AgentResponse> {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/eleven-labs/agent/${encodeURIComponent(agentId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Update agent failed');
    }
    return response.json();
  }
}
