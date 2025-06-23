
import { BACKEND_CONFIG, getBackendHeaders } from '@/config/backendConfig';
import { AgentResponse } from "@/components/AgentResponse";

export class AgentApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_CONFIG.BASE_URL;
  }

  private getHeaders(): HeadersInit {
    return getBackendHeaders();
  }

  async getAgent(agentId: string): Promise<AgentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/eleven-labs/agent/${agentId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const agentResponse = await response.json() as AgentResponse;
      console.log('Fetched agent data from backend:', agentResponse);
      return agentResponse;
    } catch (error) {
      console.error('Error fetching agent from backend:', error);
      throw error;
    }
  }

  async updateAgent(agentId: string, updateData: any): Promise<boolean> {
    try {
      console.log('Updating agent via backend with data:', JSON.stringify(updateData, null, 2));
      
      const response = await fetch(`${this.baseUrl}/api/eleven-labs/agent/${agentId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Agent update error via backend:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Agent updated successfully via backend:', responseData);
      return true;
    } catch (error) {
      console.error('Error updating agent via backend:', error);
      throw error;
    }
  }

  async createAgent(agentData: any): Promise<{ agent_id: string }> {
    try {
      console.log('Creating agent via backend with data:', JSON.stringify(agentData, null, 2));
      
      const response = await fetch(`${this.baseUrl}/api/eleven-labs/agent/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Agent creation error via backend:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Agent created successfully via backend:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error creating agent via backend:', error);
      throw error;
    }
  }
}

export const agentApiService = new AgentApiService();
