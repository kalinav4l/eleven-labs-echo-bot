
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { API_CONFIG } from '@/constants/constants';
import { toast } from '@/components/ui/use-toast';

interface DeleteAgentFromElevenLabsParams {
  agentId: string;
}

interface UpdateAgentStatusParams {
  id: string;
  isActive: boolean;
}

export const useAgentOperations = () => {
  const queryClient = useQueryClient();

  const deleteAgentFromElevenLabs = async ({ agentId }: DeleteAgentFromElevenLabsParams) => {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'DELETE',
      headers: {
        'Xi-Api-Key': API_CONFIG.ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete agent from ElevenLabs');
    }

    return response.json();
  };

  const updateAgentStatus = async ({ id, isActive }: UpdateAgentStatusParams) => {
    const { data, error } = await supabase
      .from('kalina_agents')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  };

  const deleteAgentFromDatabase = async (id: string) => {
    const { error } = await supabase
      .from('kalina_agents')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  };

  const deactivateAgentMutation = useMutation({
    mutationFn: updateAgentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-agents'] });
      toast({
        title: "Agent dezactivat",
        description: "Agentul a fost dezactivat cu succes",
      });
    },
    onError: (error) => {
      console.error('Error deactivating agent:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut dezactiva agentul",
        variant: "destructive",
      });
    },
  });

  const activateAgentMutation = useMutation({
    mutationFn: updateAgentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-agents'] });
      toast({
        title: "Agent activat",
        description: "Agentul a fost activat cu succes",
      });
    },
    onError: (error) => {
      console.error('Error activating agent:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut activa agentul",
        variant: "destructive",
      });
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (agent: { id: string; agent_id: string }) => {
      // First delete from ElevenLabs
      await deleteAgentFromElevenLabs({ agentId: agent.agent_id });
      // Then delete from database
      await deleteAgentFromDatabase(agent.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-agents'] });
      toast({
        title: "Agent șters",
        description: "Agentul a fost șters cu succes",
      });
    },
    onError: (error) => {
      console.error('Error deleting agent:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge agentul",
        variant: "destructive",
      });
    },
  });

  return {
    deactivateAgent: deactivateAgentMutation.mutate,
    activateAgent: activateAgentMutation.mutate,
    deleteAgent: deleteAgentMutation.mutate,
    isDeactivating: deactivateAgentMutation.isPending,
    isActivating: activateAgentMutation.isPending,
    isDeleting: deleteAgentMutation.isPending,
  };
};
