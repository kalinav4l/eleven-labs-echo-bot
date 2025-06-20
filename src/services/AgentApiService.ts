
import { API_CONFIG } from '@/constants/constants';
import { AgentResponse } from "@/components/AgentResponse";

export class AgentApiService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = API_CONFIG.ELEVENLABS_API_KEY;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
  }

  private getHeaders(): HeadersInit {
    return {
      'Xi-Api-Key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async getAgent(agentId: string): Promise<AgentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/convai/agents/${agentId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const agentResponse = await response.json() as AgentResponse;
      console.log('Fetched agent data:', agentResponse);
      return agentResponse;
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  }

  async updateAgent(agentId: string, updateData: any): Promise<boolean> {
    try {
      console.log('Updating agent with data:', JSON.stringify(updateData, null, 2));
      
      const response = await fetch(`${this.baseUrl}/convai/agents/${agentId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Agent update error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Agent updated successfully:', responseData);
      return true;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  }
}

export const agentApiService = new AgentApiService();
