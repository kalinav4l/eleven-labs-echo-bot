
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

export const useConversationById = (conversationId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversation', conversationId, user?.id],
    queryFn: async () => {
      if (!user || !conversationId) return null;
      
      console.log('Fetching conversation by ID:', conversationId);
      
      // Fetch conversation details
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (convError) {
        console.error('Error fetching conversation:', convError);
        throw convError;
      }

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Fetch related call history
      const { data: callHistory, error: callError } = await supabase
        .from('call_history')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .order('call_date', { ascending: false });

      if (callError) {
        console.error('Error fetching call history:', callError);
        // Don't throw error for call history as it might not exist
      }

      console.log('Fetched conversation:', conversation);
      console.log('Fetched call history:', callHistory);

      return {
        conversation,
        callHistory: callHistory || []
      };
    },
    enabled: !!user && !!conversationId,
  });
};
