import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { useEffect, useRef } from 'react';

export const useUserBalance = () => {
  const { user } = useAuth();

  const balanceQuery = useQuery({
    queryKey: ['user-balance', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_balance')
        .select('balance_usd')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching balance:', error);
        return null;
      }

      return data;
    },
    enabled: !!user,
    staleTime: 10000, // 10 seconds before considering stale
    refetchInterval: 30000, // Refetch every 30 seconds  
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Ref pentru a ține evidența canalului activ
  const channelRef = useRef<any>(null);

  // Real-time updates for user balance
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

    console.log('💰 Setting up real-time subscription for user balance');
    
    const channel = supabase
      .channel(`user-balance-realtime-${user.id}-${Date.now()}`) // Canal unic
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_balance',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('💰 Real-time update for user balance:', payload);
          balanceQuery.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'balance_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('💳 New balance transaction:', payload);
          balanceQuery.refetch();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      console.log('💰 Cleaning up balance real-time subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id]); // Removed balanceQuery dependency

  return balanceQuery;
};