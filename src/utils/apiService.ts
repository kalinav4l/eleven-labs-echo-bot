import { BACKEND_CONFIG, getBackendHeaders } from '@/config/backendConfig';

// Types for API requests and responses
export interface TTSConfig {
  voice_id: string;
  model_id?: string;
}

export interface AgentConfig {
  language: string;
  prompt: {
    prompt: string;
  };
}

export interface ConversationConfig {
  agent: AgentConfig;
  tts: TTSConfig;
}

export interface CreateAgentRequest {
  conversation_config: ConversationConfig;
  name: string;
}

export interface CreateAgentResponse {
  agent_id: string;
  [key: string]: unknown;
}

export interface InitiateCallRequest {
  agent_id: string;
  agent_phone_number_id: string;
  to_number: string;
}

class ElevenLabsApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_CONFIG.BASE_URL;
  }

  private getHeaders(): HeadersInit {
    return getBackendHeaders();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend API Error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async createAgent(request: CreateAgentRequest): Promise<CreateAgentResponse> {
    const response = await fetch(`${this.baseUrl}/api/eleven-labs/agent/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateAgentResponse>(response);
  }

  async initiateCall(request: InitiateCallRequest): Promise<void> {
    // This endpoint might not exist in your backend yet, but keeping the structure
    const response = await fetch(`${this.baseUrl}/api/eleven-labs/call/initiate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    await this.handleResponse<void>(response);
  }
}

export const elevenLabsApi = new ElevenLabsApiService();
