
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

const ActiveCallsWidget = () => {
  const { user } = useAuth();

  const { data: activeCalls = 0 } = useQuery({
    queryKey: ['active-calls', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { data, error } = await supabase
        .from('call_history')
        .select('id')
        .eq('user_id', user.id)
        .eq('call_status', 'active');

      if (error) {
        console.error('Error fetching active calls:', error);
        return 0;
      }

      return data?.length || 0;
    },
    enabled: !!user,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  return (
    <div className="h-45 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <div className="text-5xl font-bold mb-2 animate-pulse">
            {activeCalls}
          </div>
          <div className="text-blue-100 text-sm font-medium">
            Active Calls
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 border-2 border-white rounded-full"></div>
      </div>
    </div>
  );
};

export default ActiveCallsWidget;
