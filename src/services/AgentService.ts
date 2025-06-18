
import { API_CONFIG } from '@/constants/constants';
import {AgentResponse} from "@/components/AgentResponse.ts";

export interface AgentPrompt {
  prompt: string;
  knowledge_base: Array<{ name: string; content: string }>;
  rag?: Record<string, any>;
  temperature?: number;
}

export interface AgentConfig {
  first_message: string;
  language: string;
  prompt: AgentPrompt;
  multilingual_first_messages?: Record<string, string>;
}

export interface TTSConfig {
  voice_id: string;
}

export interface LanguageOverrides {
  agent?: Partial<AgentConfig>;
  tts?: Partial<TTSConfig>;
}

export interface LanguagePreset {
  overrides: LanguageOverrides;
  first_message_translation?: {
    source_hash: string;
    text: string;
  };
}

export interface ConversationConfig {
  agent: AgentConfig;
  tts: TTSConfig;
  language_presets?: Record<string, LanguagePreset>;
}

export interface UpdateAgentRequest {
  name?: string;
  conversation_config: ConversationConfig;
}

export class AgentService {
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

  async updateAgent(agentId: string, updateData: UpdateAgentRequest): Promise<boolean> {
    try {
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

      return true;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
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
      console.log(agentResponse);
      return agentResponse;
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  }

  prepareUpdatePayload(
    agentData: any,
    multilingualMessages: Record<string, string>
  ): UpdateAgentRequest {
    const defaultLanguage = agentData.conversation_config?.agent?.language || 'en';
    
    // Prepare language presets for additional languages
    const languagePresets: Record<string, LanguagePreset> = {};
    
    Object.entries(multilingualMessages).forEach(([language, message]) => {
      if (language !== defaultLanguage && message.trim()) {
        languagePresets[language] = {
          overrides: {
            agent: {
              first_message: message
            },
            tts: {}
          },
          first_message_translation: {
            source_hash: `"first_message": "${multilingualMessages[defaultLanguage]}","language":"${defaultLanguage}"}`,
            text: message
          }
        };
      }
    });

    const conversationConfig: ConversationConfig = {
      agent: {
        first_message: multilingualMessages[defaultLanguage] || '',
        language: defaultLanguage,
        prompt: {
          prompt: agentData.conversation_config?.agent?.prompt?.prompt || '',
          knowledge_base: agentData.conversation_config?.agent?.prompt?.knowledge_base || [],
          rag: agentData.conversation_config?.agent?.prompt?.rag || {},
          temperature: agentData.conversation_config?.agent?.temperature ?? 0.0
        },
        multilingual_first_messages: multilingualMessages,
      },
      tts: {
        voice_id: agentData.conversation_config?.tts?.voice_id || ''
      }
    };

    // Add language presets if there are any
    if (Object.keys(languagePresets).length > 0) {
      conversationConfig.language_presets = languagePresets;
    }

    return {
      name: agentData.name,
      conversation_config: conversationConfig
    };
  }
}

export const agentService = new AgentService();
