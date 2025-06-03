
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { Coins } from 'lucide-react';

const CreditsDisplay = () => {
  const { user } = useAuth();

  const { data: credits, isLoading } = useQuery({
    queryKey: ['user-credits', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_credits')
        .select('remaining_credits, total_credits')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching credits:', error);
        return null;
      }

      return data;
    },
    enabled: !!user,
  });

  if (!user || isLoading) {
    return null;
  }

  const remainingCredits = credits?.remaining_credits ?? 0;

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
      <Coins className="w-4 h-4 text-gray-600" />
      <span className="text-sm text-gray-700 font-medium">
        {remainingCredits.toLocaleString()} credite
      </span>
    </div>
  );
};

export default CreditsDisplay;
