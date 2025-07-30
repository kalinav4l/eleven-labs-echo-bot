
import {
    AgentCreateRequest,
    AgentCreateResponse,
    AgentUpdateRequest,
    AgentResponse,
    ConversationConfigUpdate,
    LanguagePresetUpdate
} from '../types/dtos';
import { supabase } from '@/integrations/supabase/client';

export class VoiceController {
  // All ElevenLabs API calls now go through Supabase Edge Functions
  // to use the API key stored securely in Supabase Secrets
  
  static async createAgent(request: AgentCreateRequest): Promise<AgentCreateResponse> {
    console.log('Creating agent via Supabase Edge Function:', request);
    
    const { data, error } = await supabase.functions.invoke('create-elevenlabs-agent', {
      body: request
    });

    if (error) {
      console.error('Create agent error:', error);
      throw new Error(`Create agent failed: ${error.message}`);
    }

    console.log('Agent created successfully:', data);
    return data;
  }

  static async getAgent(agentId: string): Promise<AgentResponse> {
    console.log('Getting agent via Supabase Edge Function:', agentId);
    
    const { data, error } = await supabase.functions.invoke('get-elevenlabs-agent', {
      body: { agentId }
    });

    if (error) {
      console.error('Get agent error:', error);
      throw new Error(`Get agent failed: ${error.message}`);
    }

    console.log('Agent retrieved successfully');
    return data;
  }

  static async updateAgent(agentId: string, request: AgentUpdateRequest): Promise<AgentResponse> {
    console.log('Updating agent via Supabase Edge Function:', agentId, request);
    
    const { data, error } = await supabase.functions.invoke('update-elevenlabs-agent', {
      body: { agentId, ...request }
    });

    if (error) {
      console.error('Update agent error:', error);
      throw new Error(`Update agent failed: ${error.message}`);
    }

    console.log('Agent updated successfully');
    return data;
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
