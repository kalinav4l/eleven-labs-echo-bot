import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { useEffect } from 'react';

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

  // Real-time updates for user balance
  useEffect(() => {
    if (!user?.id) return;

    console.log('💰 Setting up real-time subscription for user balance');
    
    const channel = supabase
      .channel('user-balance-realtime')
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

    return () => {
      console.log('💰 Cleaning up balance real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, balanceQuery]);

  return balanceQuery;
};