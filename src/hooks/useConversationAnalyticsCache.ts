import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

interface CachedConversation {
  id: string;
  conversation_id: string;
  user_id: string;
  agent_id?: string;
  agent_name?: string;
  phone_number?: string;
  contact_name?: string;
  call_status?: string;
  call_date?: string;
  duration_seconds?: number;
  cost_credits?: number;
  transcript?: any;
  analysis?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const useConversationAnalyticsCache = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch cached conversations
  const cachedConversationsQuery = useQuery({
    queryKey: ['conversation-analytics-cache', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching cached conversation analytics for user:', user.id);
      
      const { data, error } = await supabase
        .from('conversation_analytics_cache')
        .select('*')
        .eq('user_id', user.id)
        .order('call_date', { ascending: false });

      if (error) {
        console.error('Error fetching cached conversations:', error);
        throw error;
      }

      console.log('Cached conversations data:', data);
      return data as CachedConversation[];
    },
    enabled: !!user,
  });

  // Save or update conversation in cache
  const saveToCache = useMutation({
    mutationFn: async (conversationData: {
      conversation_id: string;
      agent_id?: string;
      agent_name?: string;
      phone_number?: string;
      contact_name?: string;
      call_status?: string;
      call_date?: string;
      duration_seconds?: number;
      cost_credits?: number;
      transcript?: any;
      analysis?: any;
      metadata?: any;
    }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Saving conversation to cache:', conversationData);

      const { data, error } = await supabase
        .from('conversation_analytics_cache')
        .upsert({
          conversation_id: conversationData.conversation_id,
          user_id: user.id,
          agent_id: conversationData.agent_id,
          agent_name: conversationData.agent_name,
          phone_number: conversationData.phone_number,
          contact_name: conversationData.contact_name,
          call_status: conversationData.call_status,
          call_date: conversationData.call_date,
          duration_seconds: conversationData.duration_seconds,
          cost_credits: conversationData.cost_credits,
          transcript: conversationData.transcript,
          analysis: conversationData.analysis,
          metadata: conversationData.metadata,
          updated_at: new Date().toISOString()
        }, { onConflict: 'conversation_id,user_id' })
        .select();

      if (error) {
        console.error('Error saving to cache:', error);
        throw error;
      }

      console.log('Successfully saved to cache:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-analytics-cache', user?.id] });
    },
  });

  // Refresh conversation data from ElevenLabs and update cache
  const refreshConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Refreshing conversation from ElevenLabs:', conversationId);

      try {
        const { data: elevenLabsData, error } = await supabase.functions.invoke('get-elevenlabs-conversation', {
          body: { conversationId }
        });

        if (error) {
          console.error('Error fetching from ElevenLabs:', error);
          throw error;
        }

        if (!elevenLabsData) {
          console.warn('No data returned from ElevenLabs for conversation:', conversationId);
          return null;
        }

        // Extract data from ElevenLabs response
        const metadata = elevenLabsData.metadata || {};
        const duration = Math.round(metadata.call_duration_secs || 0);
        const cost = metadata.cost || 0;

        // Get call history info if available
        const { data: callHistoryData } = await supabase
          .from('call_history')
          .select('*')
          .eq('conversation_id', conversationId)
          .eq('user_id', user.id)
          .single();

        // Get agent name from kalina_agents table
        let agentName = 'Unknown Agent';
        if (callHistoryData?.agent_id) {
          const { data: agentData } = await supabase
            .from('kalina_agents')
            .select('name')
            .eq('agent_id', callHistoryData.agent_id)
            .single();
          agentName = agentData?.name || 'Unknown Agent';
        }

        const conversationData = {
          conversation_id: conversationId,
          agent_id: callHistoryData?.agent_id,
          agent_name: agentName,
          phone_number: callHistoryData?.phone_number || metadata.phone_number,
          contact_name: callHistoryData?.contact_name || 'Unknown Contact',
          call_status: callHistoryData?.call_status || 'completed',
          call_date: callHistoryData?.call_date || new Date().toISOString(),
          duration_seconds: duration,
          cost_credits: cost,
          transcript: elevenLabsData.transcript,
          analysis: {
            sentiment_data: elevenLabsData.sentiment_data,
            emotions: elevenLabsData.emotions,
            keywords: elevenLabsData.keywords,
            topics: elevenLabsData.topics,
            metrics: elevenLabsData.metrics
          },
          metadata: metadata
        };

        // Save to cache
        await saveToCache.mutateAsync(conversationData);

        return conversationData;
      } catch (error) {
        console.error('Error refreshing conversation:', error);
        throw error;
      }
    },
  });

  // Auto-refresh logic for recent conversations
  const autoRefreshRecentConversations = async (callHistory: any[]) => {
    if (!user || !callHistory.length) return;

    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // Find the most recent conversation
    const recentConversation = callHistory
      .filter(call => call.conversation_id && call.call_date)
      .sort((a, b) => new Date(b.call_date).getTime() - new Date(a.call_date).getTime())[0];

    if (!recentConversation) return;

    const conversationDate = new Date(recentConversation.call_date);
    
    // Check if conversation is recent (within last 10 minutes)
    if (conversationDate > tenMinutesAgo) {
      console.log('Auto-refreshing recent conversation:', recentConversation.conversation_id);
      
      // Check if it's already in cache and recent
      const cached = cachedConversationsQuery.data?.find(
        c => c.conversation_id === recentConversation.conversation_id
      );

      if (!cached || new Date(cached.updated_at) < conversationDate) {
        try {
          await refreshConversation.mutateAsync(recentConversation.conversation_id);
        } catch (error) {
          console.error('Auto-refresh failed:', error);
        }
      }
    }
  };

  // Get conversation data (from cache or fresh)
  const getConversationData = (conversationId: string) => {
    const cached = cachedConversationsQuery.data?.find(
      c => c.conversation_id === conversationId
    );

    if (cached) {
      return {
        duration: cached.duration_seconds || 0,
        cost: cached.cost_credits || 0,
        isCached: true,
        lastUpdated: cached.updated_at
      };
    }

    return {
      duration: 0,
      cost: 0,
      isCached: false,
      lastUpdated: null
    };
  };

  // Manual refresh all conversations
  const refreshAllConversations = useMutation({
    mutationFn: async (callHistory: any[]) => {
      if (!user) throw new Error('User not authenticated');

      const conversationsToRefresh = callHistory.filter(call => call.conversation_id);
      console.log('Refreshing all conversations:', conversationsToRefresh.length);

      const refreshPromises = conversationsToRefresh.map(async (call) => {
        try {
          return await refreshConversation.mutateAsync(call.conversation_id);
        } catch (error) {
          console.error(`Failed to refresh conversation ${call.conversation_id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(refreshPromises);
      const successCount = results.filter(r => r !== null).length;
      
      console.log(`Successfully refreshed ${successCount}/${conversationsToRefresh.length} conversations`);
      return { successCount, totalCount: conversationsToRefresh.length };
    },
  });

  return {
    cachedConversations: cachedConversationsQuery.data || [],
    isLoading: cachedConversationsQuery.isLoading,
    error: cachedConversationsQuery.error,
    saveToCache,
    refreshConversation,
    refreshAllConversations,
    autoRefreshRecentConversations,
    getConversationData,
    refetch: cachedConversationsQuery.refetch,
  };
};