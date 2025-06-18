import { API_CONFIG } from '@/constants/constants';
import { AgentResponse, LanguagePreset } from "@/components/AgentResponse.ts";

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

  prepareUpdatePayload(
    agentData: AgentResponse,
    multilingualMessages: Record<string, string>
  ): UpdateAgentRequest {
    const defaultLanguage = agentData.conversation_config?.agent?.language || 'en';
    
    // Prepare language presets for additional languages
    const languagePresets: Record<string, LanguagePreset> = {};
    
    // Add existing language presets first
    if (agentData.conversation_config?.language_presets) {
      Object.entries(agentData.conversation_config.language_presets).forEach(([language, preset]) => {
        languagePresets[language] = { ...preset };
      });
    }
    
    // Update or add multilingual messages
    Object.entries(multilingualMessages).forEach(([language, message]) => {
      if (language !== defaultLanguage && message.trim()) {
        // Create proper source hash with the correct format
        const sourceHash = JSON.stringify({
          firstMessage: multilingualMessages[defaultLanguage] || '',
          language: defaultLanguage
        });
        
        // Check if this language already exists in language_presets
        const languageAlreadyExists = languagePresets[language] !== undefined;
        
        if (languageAlreadyExists) {
          // Update existing preset - keep existing agent values if they exist
          languagePresets[language] = {
            ...languagePresets[language],
            overrides: {
              ...languagePresets[language].overrides,
              agent: {
                ...languagePresets[language].overrides.agent,
                first_message: message,
                // Keep existing language and prompt values if language already exists
                language: languagePresets[language].overrides.agent.language,
                prompt: languagePresets[language].overrides.agent.prompt
              }
            },
            first_message_translation: {
              source_hash: sourceHash,
              text: message
            }
          };
        } else {
          // Create new preset - set agent.language and agent.prompt to null for new languages
          languagePresets[language] = {
            overrides: {
              tts: null,
              conversation: null,
              agent: {
                first_message: message,
                language: null, // Set to null for new languages
                prompt: null    // Set to null for new languages
              }
            },
            first_message_translation: {
              source_hash: sourceHash,
              text: message
            }
          };
        }
      }
    });

    // Remove language presets for languages that no longer have messages
    Object.keys(languagePresets).forEach(language => {
      if (language !== defaultLanguage && !multilingualMessages[language]?.trim()) {
        delete languagePresets[language];
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
          temperature: agentData.conversation_config?.agent?.prompt?.temperature ?? 0.5
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

    const updatePayload = {
      name: agentData.name,
      conversation_config: conversationConfig
    };

    console.log('Prepared update payload:', JSON.stringify(updatePayload, null, 2));
    return updatePayload;
  }
}

export const agentService = new AgentService();
