
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const TopAgentsWidget = () => {
  const { user } = useAuth();

  const { data: topAgents = [] } = useQuery({
    queryKey: ['top-agents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('kalina_agents')
        .select('agent_id, name')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(4);

      if (error) {
        console.error('Error fetching top agents:', error);
        return [];
      }

      // Add mock performance data
      return data.map(agent => ({
        ...agent,
        performance: Math.floor(Math.random() * 40) + 60, // 60-100%
        calls: Math.floor(Math.random() * 50) + 10
      }));
    },
    enabled: !!user,
  });

  return (
    <div className="h-45 bg-white rounded-2xl border border-gray-100 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Performing Agents</h3>
        <p className="text-sm text-gray-500">This week</p>
      </div>
      
      <div className="space-y-3">
        {topAgents.map((agent, index) => (
          <div key={agent.agent_id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Avatar className="w-8 h-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`} />
              <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {agent.name}
                </p>
                <span className="text-xs text-gray-500">
                  {agent.performance}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${agent.performance}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
        
        {topAgents.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No agents found
          </div>
        )}
      </div>
    </div>
  );
};

export default TopAgentsWidget;
