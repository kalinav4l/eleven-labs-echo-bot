import { useQueries, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OptimizedUserData {
  balance: number;
  agents: any[];
  recentCalls: any[];
  statistics: {
    totalCalls: number;
    totalDuration: number;
    totalCost: number;
    successRate: number;
  };
}

export const useOptimizedUserData = () => {
  const { user } = useAuth();

  // Single optimized query that fetches all user data in one request
  return useQuery({
    queryKey: ['optimized-user-data', user?.id],
    queryFn: async (): Promise<OptimizedUserData> => {
      if (!user) throw new Error('User not authenticated');

      // Parallel requests for better performance
      const [balanceResult, agentsResult, callsResult, statsResult] = await Promise.all([
        supabase
          .from('user_balance')
          .select('balance_usd')
          .eq('user_id', user.id)
          .maybeSingle(),
        
        supabase
          .from('kalina_agents')
          .select('id, name, description, is_active, created_at, elevenlabs_agent_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        
        supabase
          .from('call_history')
          .select('id, phone_number, contact_name, call_status, call_date, duration_seconds, cost_usd, conversation_id, agent_id')
          .eq('user_id', user.id)
          .order('call_date', { ascending: false })
          .limit(20),
        
        supabase
          .from('user_statistics')
          .select('total_voice_calls, total_minutes_talked, total_spent_usd')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      // Handle errors gracefully
      if (balanceResult.error) console.warn('Balance fetch error:', balanceResult.error);
      if (agentsResult.error) console.warn('Agents fetch error:', agentsResult.error);
      if (callsResult.error) console.warn('Calls fetch error:', callsResult.error);
      if (statsResult.error) console.warn('Stats fetch error:', statsResult.error);

      const calls = callsResult.data || [];
      const successfulCalls = calls.filter(call => 
        call.call_status === 'success' || call.call_status === 'done'
      ).length;

      return {
        balance: balanceResult.data?.balance_usd || 0,
        agents: agentsResult.data || [],
        recentCalls: calls,
        statistics: {
          totalCalls: calls.length,
          totalDuration: calls.reduce((sum, call) => sum + (call.duration_seconds || 0), 0),
          totalCost: calls.reduce((sum, call) => sum + (call.cost_usd || 0), 0),
          successRate: calls.length > 0 ? Math.round((successfulCalls / calls.length) * 100) : 0
        }
      };
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });
};

export const useOptimizedAgentData = (agentId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['optimized-agent-data', user?.id, agentId],
    queryFn: async () => {
      if (!user || !agentId) return null;

      const [agentResult, callsResult] = await Promise.all([
        supabase
          .from('kalina_agents')
          .select('*')
          .eq('id', agentId)
          .eq('user_id', user.id)
          .maybeSingle(),
        
        supabase
          .from('call_history')
          .select('call_status, call_date, duration_seconds, cost_usd')
          .eq('user_id', user.id)
          .eq('agent_id', agentId)
          .order('call_date', { ascending: false })
          .limit(50)
      ]);

      return {
        agent: agentResult.data,
        calls: callsResult.data || []
      };
    },
    enabled: !!user && !!agentId,
    staleTime: 60000, // 1 minute
    retry: 1
  });
};

export const useOptimizedConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['optimized-conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, agent_name, created_at, message_count, cost_usd')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 45000, // 45 seconds
    retry: 2
  });
};