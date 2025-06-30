
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { elevenLabsApi, CreateAgentRequest, ConversationConfig } from '../utils/apiService';
import { API_CONFIG, MESSAGES } from '../constants/constants';

interface UseAgentCreationProps {
  websiteUrl: string;
  additionalPrompt: string;
  agentName: string;
  agentLanguage: string;
  selectedVoice: string;
  generatePrompt: () => Promise<string>;
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

  // Handler for copying agent ID to clipboard
  const handleCopyAgentId = useCallback(async () => {
    if (!createdAgentId) return;

    try {
      await navigator.clipboard.writeText(createdAgentId);
      toast({
        title: "Copiat!",
        description: MESSAGES.SUCCESS.CLIPBOARD_COPIED,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Eroare",
        description: MESSAGES.ERRORS.CLIPBOARD_COPY_FAILED,
        variant: "destructive",
      });
    }
  }, [createdAgentId]);

  // Handler for creating agent
  const handleCreateAgent = useCallback(async () => {
    if (!agentName.trim()) {
      toast({
        title: "Eroare",
        description: MESSAGES.ERRORS.MISSING_AGENT_NAME,
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Eroare",
        description: "Trebuie să fii autentificat pentru a crea un agent",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const promptText = await generatePrompt();
      if (!promptText) {
        throw new Error(MESSAGES.ERRORS.PROMPT_GENERATION_FAILED);
      }

      const conversationConfig: ConversationConfig = {
        agent: {
          language: agentLanguage,
          prompt: {
            prompt: promptText,
          },
        },
        tts: {
          voice_id: selectedVoice,
          model_id: API_CONFIG.DEFAULT_MODEL_ID,
        },
      };

      const createAgentRequest: CreateAgentRequest = {
        conversation_config: conversationConfig,
        name: agentName,
      };

      console.log('Creating agent with request:', createAgentRequest);
      const response = await elevenLabsApi.createAgent(createAgentRequest);
      
      // Salvez agentul în baza de date
      const { error: dbError } = await supabase
        .from('kalina_agents')
        .insert({
          agent_id: response.agent_id,
          user_id: user.id,
          name: agentName,
          description: `Agent consultant generat automat pentru ${websiteUrl}`,
          system_prompt: promptText,
          voice_id: selectedVoice,
          provider: 'elevenlabs',
          elevenlabs_agent_id: response.agent_id,
          is_active: true
        });

      if (dbError) {
        console.error('Error saving agent to database:', dbError);
        // Nu blochează procesul, dar loghez eroarea
      }

      setCreatedAgentId(response.agent_id);

      // Copy to clipboard automatically
      await navigator.clipboard.writeText(response.agent_id);

      toast({
        title: "Succes!",
        description: `${agentName} ${MESSAGES.SUCCESS.AGENT_CREATED}`,
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Eroare",
        description: MESSAGES.ERRORS.AGENT_CREATION_FAILED,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  }, [agentName, agentLanguage, selectedVoice, generatePrompt, user, websiteUrl]);

  return {
    isCreating,
    createdAgentId,
    handleCreateAgent,
    handleCopyAgentId,
  };
};
