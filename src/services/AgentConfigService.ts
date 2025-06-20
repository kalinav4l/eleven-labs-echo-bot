
import { AgentResponse, LanguagePreset, KnowledgeBaseDocument } from "@/components/AgentResponse";

export interface AgentPrompt {
  prompt: string;
  knowledge_base: KnowledgeBaseDocument[];
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

export interface ConversationConfig {
  agent: AgentConfig;
  tts: TTSConfig;
  language_presets?: Record<string, LanguagePreset>;
}

export interface UpdateAgentRequest {
  name?: string;
  conversation_config: ConversationConfig;
}

export class AgentConfigService {
  prepareUpdatePayload(
    agentData: AgentResponse,
    multilingualMessages: Record<string, string>
  ): UpdateAgentRequest {
    const defaultLanguage = agentData.conversation_config?.agent?.language || 'en';
    
    const languagePresets: Record<string, LanguagePreset> = {};
    
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
      if (language !== defaultLanguage && !multilingualMessages.hasOwnProperty(language)) {
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

export const agentConfigService = new AgentConfigService();
