
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { ElevenLabsController } from '../controllers/ElevenLabsController';
import { AgentCreateRequest, TtsCreate } from '../types/dtos';
import { API_CONFIG, MESSAGES } from '../constants/constants';
import { useClipboard } from './useClipboard.ts';

interface CreateAgentParams {
  agentName: string;
  agentLanguage: string;
  selectedVoice: string;
  websiteUrl: string;
  prompt: string;
}

interface UseAgentCreationProps {
  websiteUrl: string;
  additionalPrompt: string;
  agentName: string;
  agentLanguage: string;
  selectedVoice: string;
  generatePrompt: (params: { websiteUrl: string; additionalPrompt: string }) => Promise<string | null>;
}

export const useAgentCreation = ({
                                   websiteUrl,
                                   additionalPrompt,
                                   agentName,
                                   agentLanguage,
                                   selectedVoice,
                                   generatePrompt,
                                 }: UseAgentCreationProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [createdAgentId, setCreatedAgentId] = useState('');
  const { user } = useAuth();
  const { copyToClipboard } = useClipboard();

  const createAgent = useCallback(async ({
                                           agentName,
                                           agentLanguage,
                                           selectedVoice,
                                           websiteUrl,
                                           prompt,
                                         }: CreateAgentParams): Promise<string | null> => {
    if (!agentName.trim()) {
      toast({
        title: "Eroare",
        description: MESSAGES.ERRORS.MISSING_AGENT_NAME,
        variant: "destructive",
      });
      return null;
    }

    setIsCreating(true);
    setCreatedAgentId('');

    try {
      // Prepare TTS configuration based on language
      const ttsConfig: TtsCreate = {
        voice_id: selectedVoice,
        model_id: API_CONFIG.DEFAULT_MODEL_ID,
      };

      // Prepare request body
      const requestBody: AgentCreateRequest = {
        conversation_config: {
          agent: {
            language: agentLanguage,
            prompt: {
              prompt,
            },
          },
          tts: ttsConfig,
        },
        name: agentName,
      };

      const agentData = await ElevenLabsController.createAgent(requestBody);
      console.log('Agent created:', agentData);

      // Save to Supabase with the correct ElevenLabs agent ID
      if (user) {
        const { error: supabaseError } = await supabase
            .from('kalina_agents')
            .insert({
              agent_id: agentData.agent_id, // Use the actual ElevenLabs agent ID
              elevenlabs_agent_id: agentData.agent_id,
              name: agentName,
              description: `Agent consultant generat automat pentru ${websiteUrl}`,
              system_prompt: prompt,
              voice_id: selectedVoice,
              user_id: user.id,
              provider: 'elevenlabs',
              is_active: true,
            });

        if (supabaseError) {
          console.error('Error saving to Supabase:', supabaseError);
          toast({
            title: "Avertisment",
            description: "Agentul a fost creat în ElevenLabs dar nu a putut fi salvat în baza de date.",
            variant: "destructive",
          });
        }
      }

      setCreatedAgentId(agentData.agent_id);

      toast({
        title: "Succes!",
        description: `Agentul "${agentName}" ${MESSAGES.SUCCESS.AGENT_CREATED}`,
      });

      // Copy agent ID to clipboard without showing success message
      await copyToClipboard(agentData.agent_id, false);

      return agentData.agent_id;
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Eroare",
        description: MESSAGES.ERRORS.AGENT_CREATION_FAILED,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [user, copyToClipboard]);

  // Handler for creating agent - moved into the hook
  const handleCreateAgent = useCallback(async () => {
    const prompt = await generatePrompt({ websiteUrl, additionalPrompt });

    if (!prompt) {
      console.log("Prompt generation failed, stopping agent creation.");
      return;
    }

    console.log("Creating agent with Name:", agentName);
    console.log("Creating agent with Prompt:", prompt);

    await createAgent({
      agentName,
      agentLanguage,
      selectedVoice,
      websiteUrl,
      prompt,
    });
  }, [
    generatePrompt,
    createAgent,
    websiteUrl,
    additionalPrompt,
    agentName,
    agentLanguage,
    selectedVoice,
  ]);

  // Handler for copying agent ID - moved into the hook
  const handleCopyAgentId = useCallback(async () => {
    await copyToClipboard(createdAgentId);
  }, [copyToClipboard, createdAgentId]);

  return {
    createAgent,
    isCreating,
    createdAgentId,
    setCreatedAgentId,
    handleCreateAgent,
    handleCopyAgentId,
  };
};
