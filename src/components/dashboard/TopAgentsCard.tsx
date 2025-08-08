import React from 'react';
import { Bot, TrendingUp, Phone, Clock } from 'lucide-react';
import { useUserAgents } from '@/hooks/useUserAgents';

interface TopAgentsCardProps {
  callHistory?: any[];
}

const TopAgentsCard = ({ callHistory = [] }: TopAgentsCardProps) => {
  const { data: agents = [] } = useUserAgents();

  // Calculate agent statistics from call history
  const agentStats = React.useMemo(() => {
    const stats = new Map();
    
    callHistory.forEach(call => {
      if (call.agent_id) {
        const current = stats.get(call.agent_id) || {
          agent_id: call.agent_id,
          agent_name: call.agent_name || 'Agent Necunoscut',
          total_calls: 0,
          total_duration: 0,
          successful_calls: 0
        };
        
        current.total_calls += 1;
        current.total_duration += call.duration_seconds || 0;
        if (call.status === 'completed' || call.status === 'successful') {
          current.successful_calls += 1;
        }
        
        stats.set(call.agent_id, current);
      }
    });
    
    // Convert to array and sort by total calls
    return Array.from(stats.values())
      .sort((a, b) => b.total_calls - a.total_calls)
      .slice(0, 5); // Top 5 agents
  }, [callHistory]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  return (
    <div className="relative group animate-fade-in">
      {/* Glass background */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-sm" />
      
      {/* Content */}
      <div className="relative p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-xl shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Cei mai activi agenți</h3>
        </div>
        
        <div className="space-y-3">
          {agentStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Încă nu există apeluri</p>
            </div>
          ) : (
            agentStats.map((agent, index) => {
              const successRate = agent.total_calls > 0 
                ? Math.round((agent.successful_calls / agent.total_calls) * 100) 
                : 0;
              
              return (
                <div key={agent.agent_id} className="flex items-center gap-4 p-3 bg-white/50 rounded-xl border border-gray-100">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {agent.agent_name}
                      </h4>
                      <span className="text-xs text-green-600 font-medium">
                        {successRate}% succes
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{agent.total_calls} apeluri</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(agent.total_duration)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {agentStats.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-xs text-gray-500">
                Total: {agents.length} agenți înregistrați
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopAgentsCard;