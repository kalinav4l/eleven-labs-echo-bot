
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { useEffect, useRef } from 'react';

export const useUserStats = () => {
  const { user } = useAuth();

  const statsQuery = useQuery({
    queryKey: ['user-statistics', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user statistics:', error);
        // Return default values if no statistics found
        return {
          total_conversations: 0,
          total_messages: 0,
          total_voice_calls: 0,
          total_minutes_talked: 0,
          agents_used: 0,
          total_spent_usd: 0,
          current_spent_usd: 0
        };
      }

      return data;
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds before considering stale
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Ref pentru a ține evidența canalului activ
  const channelRef = useRef<any>(null);

  // Real-time updates for user statistics
  useEffect(() => {
    // Cleanup existent dacă nu avem user
    if (!user?.id) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Previne multiple subscriptions
    if (channelRef.current) return;

    console.log('📊 Setting up real-time subscription for user statistics');
    
    const channel = supabase
      .channel(`user-statistics-realtime-${user.id}-${Date.now()}`) // Canal unic
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_statistics',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📊 Real-time update for user statistics:', payload);
          statsQuery.refetch();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      console.log('📊 Cleaning up user statistics real-time subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id]); // Removed statsQuery dependency

  return statsQuery;
};
