
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { agentService } from '../services/AgentService';

interface CreateAgentParams {
  name: string;
  prompt: string;
  language: string;
  voiceId: string;
  temperature: number;
}

export const useAgentCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [createdAgentId, setCreatedAgentId] = useState('');

  const createAgent = useCallback(async ({
    name,
    prompt,
    language,
    voiceId,
    temperature
  }: CreateAgentParams): Promise<string> => {
    if (!name.trim() || !prompt.trim() || !voiceId.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog completează toate câmpurile obligatorii.",
        variant: "destructive",
      });
      return '';
    }

    setIsCreating(true);

    try {
      const agentData = {
        name: name.trim(),
        conversation_config: {
          agent: {
            language: language,
            prompt: {
              prompt: prompt.trim(),
              temperature: temperature
            }
          },
          tts: {
            voice_id: voiceId,
            model_id: "eleven_turbo_v2_5"
          }
        }
      };

      console.log('Creating agent with data:', agentData);
      
      const response = await agentService.createAgent(agentData);
      
      setCreatedAgentId(response.agent_id);
      
      toast({
        title: "Succes!",
        description: `Agentul "${name}" a fost creat cu ID-ul: ${response.agent_id}`,
      });

      return response.agent_id;
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut crea agentul. Te rog verifică setările și încearcă din nou.",
        variant: "destructive",
      });
      return '';
    } finally {
      setIsCreating(false);
    }
  }, []);

  const resetCreatedAgentId = useCallback(() => {
    setCreatedAgentId('');
  }, []);

  return {
    createAgent,
    isCreating,
    createdAgentId,
    resetCreatedAgentId
  };
};
