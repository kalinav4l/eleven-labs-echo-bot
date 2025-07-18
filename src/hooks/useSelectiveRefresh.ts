
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { useCallback, useRef } from 'react';

interface ConversationUpdate {
  id: string;
  updated_at: string;
  agent_name: string;
  summary: string;
  message_count?: number;
}

export const useSelectiveRefresh = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const lastRefreshRef = useRef<string>(new Date().toISOString());

  // Get only recently updated conversations
  const { data: recentConversations, refetch } = useQuery({
    queryKey: ['recent-conversations', user?.id, lastRefreshRef.current],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('call_history')
        .select('id, updated_at, agent_id, summary, dialog_json')
        .eq('user_id', user.id)
        .gte('updated_at', lastRefreshRef.current)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      return data?.map(item => ({
        id: item.id,
        updated_at: item.updated_at,
        agent_name: item.agent_id || 'Unknown Agent',
        summary: item.summary || 'Conversație',
        message_count: item.dialog_json ? 
          JSON.parse(item.dialog_json).transcript?.length || 0 : 0
      })) || [];
    },
    enabled: !!user,
    refetchInterval: 30000, // Check for updates every 30 seconds
    staleTime: 15000 // Consider data stale after 15 seconds
  });

  const refreshConversations = useCallback(async () => {
    lastRefreshRef.current = new Date().toISOString();
    await refetch();
    
    // Invalidate the main conversations query to trigger a refresh
    queryClient.invalidateQueries({ queryKey: ['call-history', user?.id] });
    
    console.log('Selective refresh completed at:', lastRefreshRef.current);
  }, [refetch, queryClient, user?.id]);

  const markAsRefreshed = useCallback(() => {
    lastRefreshRef.current = new Date().toISOString();
  }, []);

  return {
    recentConversations: recentConversations || [],
    refreshConversations,
    markAsRefreshed,
    lastRefreshTime: lastRefreshRef.current
  };
};
