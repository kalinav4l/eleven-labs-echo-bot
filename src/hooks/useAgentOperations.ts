
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

  // Note: For security, ElevenLabs API calls should be done through Supabase Edge Functions
  const deleteAgentFromElevenLabs = async ({ agentId }: DeleteAgentFromElevenLabsParams) => {
    console.warn('Direct ElevenLabs API calls should be avoided - consider using Supabase Edge Functions');
    
    // This is a placeholder - in production, use a Supabase Edge Function
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      method: 'DELETE',
      headers: {
        'Xi-Api-Key': 'PLACEHOLDER_SECURE_IN_SUPABASE_SECRETS',
      },
    });

    // If agent is not found (404), we consider it already deleted
    if (response.status === 404) {
      console.log(`Agent ${agentId} not found in ElevenLabs, considering it already deleted`);
      return { success: true, alreadyDeleted: true };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs API Error:', errorData);
      throw new Error(`Failed to delete agent from ElevenLabs: ${response.status}`);
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
      // Try to delete from ElevenLabs first, but don't fail if agent doesn't exist
      try {
        await deleteAgentFromElevenLabs({ agentId: agent.agent_id });
      } catch (error) {
        console.warn('Could not delete agent from ElevenLabs, but continuing with database deletion:', error);
        // Continue with database deletion even if ElevenLabs deletion fails
      }
      
      // Always delete from database
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
        description: "Nu s-a putut șterge agentul complet. Verifică lista pentru a vedea dacă a fost șters din baza de date.",
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
