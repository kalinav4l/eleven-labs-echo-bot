
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

export const useUserAgents = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-agents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('kalina_agents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user agents:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });
};
