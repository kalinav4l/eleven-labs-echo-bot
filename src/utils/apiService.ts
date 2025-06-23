import { API_CONFIG } from '../constants/constants';

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
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = API_CONFIG.ELEVENLABS_API_KEY;
    this.baseUrl = API_CONFIG.ELEVENLABS_BASE_URL;
  }

  private getHeaders(): HeadersInit {
    return {
      'Xi-Api-Key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async createAgent(request: CreateAgentRequest): Promise<CreateAgentResponse> {
    const response = await fetch(`${this.baseUrl}/convai/agents/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateAgentResponse>(response);
  }

  async initiateCall(request: InitiateCallRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/convai/sip-trunk/outbound-call`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    await this.handleResponse<void>(response);
  }
}

export const elevenLabsApi = new ElevenLabsApiService();

