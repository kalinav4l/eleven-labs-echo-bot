
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

export interface ConversationData {
  agent_id: string;
  agent_name: string;
  phone_number?: string;
  contact_name?: string;
  summary?: string;
  duration_seconds?: number;
  cost_usd?: number;
  elevenlabs_history_id?: string;
  conversation_id?: string;
  transcript?: any[];
  status?: 'success' | 'failed' | 'busy' | 'no-answer' | 'active';
}

export const useConversationTracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const saveConversation = useMutation({
    mutationFn: async (conversationData: ConversationData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Saving conversation to Analytics Hub:', conversationData);

      // Create the call history record
      const callRecord = {
        user_id: user.id,
        phone_number: conversationData.phone_number || 'Web Chat',
        contact_name: conversationData.contact_name || conversationData.agent_name,
        call_status: conversationData.status || 'success',
        summary: conversationData.summary || 'Agent conversation',
        dialog_json: JSON.stringify({
          agent_id: conversationData.agent_id,
          agent_name: conversationData.agent_name,
          transcript: conversationData.transcript || [],
          conversation_id: conversationData.conversation_id,
          elevenlabs_history_id: conversationData.elevenlabs_history_id
        }),
        call_date: new Date().toISOString(),
        cost_usd: conversationData.cost_usd || 0,
        agent_id: conversationData.agent_id,
        language: 'ro',
        conversation_id: conversationData.conversation_id,
        elevenlabs_history_id: conversationData.elevenlabs_history_id,
        duration_seconds: conversationData.duration_seconds || 0
      };

      const { data, error } = await supabase
        .from('call_history')
        .insert([callRecord])
        .select()
        .single();

      if (error) {
        console.error('Error saving conversation:', error);
        throw error;
      }

      console.log('Conversation saved successfully:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate call history to refresh the list
      queryClient.invalidateQueries({ queryKey: ['call-history', user?.id] });
    },
  });

  const updateConversation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<ConversationData> }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('call_history')
        .update({
          summary: updates.summary,
          dialog_json: updates.transcript ? JSON.stringify(updates.transcript) : undefined,
          cost_usd: updates.cost_usd,
          duration_seconds: updates.duration_seconds,
          elevenlabs_history_id: updates.elevenlabs_history_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-history', user?.id] });
    },
  });

  return {
    saveConversation,
    updateConversation,
  };
};
