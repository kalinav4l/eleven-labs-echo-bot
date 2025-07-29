
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

export const useUserStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-statistics', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user statistics:', error);
        // Return default values if no statistics found
        return {
          total_conversations: 0,
          total_messages: 0,
          total_voice_calls: 0,
          total_minutes_talked: 0,
          total_spent_usd: 0,
          current_spent_usd: 0,
          agents_used: 0
        };
      }

      // Return data or default values if no record exists
      return data || {
        total_conversations: 0,
        total_messages: 0,
        total_voice_calls: 0,
        total_minutes_talked: 0,
        total_spent_usd: 0,
        current_spent_usd: 0,
        agents_used: 0
      };
    },
    enabled: !!user,
  });
};
