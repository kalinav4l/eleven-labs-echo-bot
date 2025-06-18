
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from 'lucide-react';

interface TopAgentsWidgetProps {
  data: any;
  onRefresh: () => void;
}

const TopAgentsWidget = ({ data }: TopAgentsWidgetProps) => {
  const agents = data?.activeAgents?.slice(0, 4) || [];

  return (
    <div className="h-full bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow col-span-2">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Agents</h3>
      
      <div className="space-y-4">
        {agents.map((agent: any, index: number) => (
          <div key={agent.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <Avatar className="w-10 h-10">
              <AvatarImage src={`/api/placeholder/40/40?text=${agent.name.charAt(0)}`} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {agent.name}
              </div>
              <div className="text-xs text-gray-500">
                {agent.description || 'Voice Agent'}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.random() * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {Math.floor(Math.random() * 100)}%
              </span>
            </div>
          </div>
        ))}
        
        {agents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No agents found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopAgentsWidget;
