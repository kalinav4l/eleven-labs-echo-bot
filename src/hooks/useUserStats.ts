
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

export const useUserStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-statistics', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Get user's personal conversation statistics
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user conversations:', error);
        // Return default values if no conversations found
        return {
          total_conversations: 0,
          total_messages: 0,
          total_voice_calls: 0,
          total_minutes_talked: 0,
          total_spent_usd: 0,
          agents_used: 0
        };
      }

      // Calculate statistics from user's conversations
      const totalConversations = conversations?.length || 0;
      const totalMessages = conversations?.reduce((sum, conv) => sum + (conv.message_count || 0), 0) || 0;
      const totalVoiceCalls = conversations?.filter(conv => conv.duration_minutes > 0).length || 0;
      const totalMinutesTalked = conversations?.reduce((sum, conv) => sum + (conv.duration_minutes || 0), 0) || 0;
      const totalSpentUsd = conversations?.reduce((sum, conv) => sum + (conv.cost_usd || 0), 0) || 0;
      const agentsUsed = new Set(conversations?.map(conv => conv.agent_id)).size || 0;

      return {
        total_conversations: totalConversations,
        total_messages: totalMessages,
        total_voice_calls: totalVoiceCalls,
        total_minutes_talked: totalMinutesTalked,
        total_spent_usd: totalSpentUsd,
        agents_used: agentsUsed
      };
    },
    enabled: !!user,
  });
};
