import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

export const useUserPhoneNumbers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-phone-numbers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user phone numbers:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });
};