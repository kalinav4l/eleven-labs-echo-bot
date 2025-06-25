import {
    AgentCreateRequest,
    AgentCreateResponse,
    AgentUpdateRequest,
    AgentResponse,
    ConversationConfigUpdate,
    LanguagePresetUpdate
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

    static prepareUpdatePayload(
        agentData: AgentResponse,
        multilingualMessages: Record<string, string>
    ): AgentUpdateRequest {
        const defaultLanguage = agentData.conversation_config?.agent?.language || 'en';

        const languagePresets: Record<string, LanguagePresetUpdate> = {};

        if (agentData.conversation_config?.language_presets) {
            Object.entries(agentData.conversation_config.language_presets).forEach(([language, preset]) => {
                languagePresets[language] = { ...preset };
            });
        }

        const sourceHash = JSON.stringify({
            firstMessage: multilingualMessages[defaultLanguage] || '',
            language: defaultLanguage
        });

        Object.entries(multilingualMessages).forEach(([language, message]) => {
            if (language !== defaultLanguage) {
                const languageAlreadyExists = languagePresets[language] !== undefined;

                if (languageAlreadyExists) {
                    languagePresets[language] = {
                        ...languagePresets[language],
                        overrides: {
                            ...languagePresets[language].overrides,
                            agent: {
                                ...languagePresets[language].overrides.agent,
                                first_message: message || '',
                                language: languagePresets[language].overrides.agent.language,
                                prompt: languagePresets[language].overrides.agent.prompt
                            }
                        },
                        first_message_translation: {
                            source_hash: sourceHash,
                            text: message || ''
                        }
                    };
                } else {
                    languagePresets[language] = {
                        overrides: {
                            tts: null,
                            conversation: null,
                            agent: {
                                first_message: message || '',
                                language: null,
                                prompt: null
                            }
                        },
                        first_message_translation: {
                            source_hash: sourceHash,
                            text: message || ''
                        }
                    };
                }
            }
        });

        Object.keys(languagePresets).forEach(language => {
            if (language !== defaultLanguage && !Object.prototype.hasOwnProperty.call(multilingualMessages, language)) {
                delete languagePresets[language];
            }
        });

        const conversationConfig: ConversationConfigUpdate = {
            agent: {
                first_message: multilingualMessages[defaultLanguage] || '',
                language: defaultLanguage,
                prompt: {
                    prompt: agentData.conversation_config?.agent?.prompt?.prompt || '',
                    knowledge_base: agentData.conversation_config?.agent?.prompt?.knowledge_base || [],
                    rag: agentData.conversation_config?.agent?.prompt?.rag || null,
                    temperature: agentData.conversation_config?.agent?.prompt?.temperature ?? 0.5
                },
            },
            language_presets: languagePresets,
            tts: {
                voice_id: agentData.conversation_config?.tts?.voice_id || ''
            }
        };

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
