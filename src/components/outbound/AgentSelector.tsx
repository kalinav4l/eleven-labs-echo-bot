import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserAgents } from '@/hooks/useUserAgents';
import { Bot, Loader2 } from 'lucide-react';

interface AgentSelectorProps {
  selectedAgentId: string;
  onAgentSelect: (agentId: string) => void;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  selectedAgentId,
  onAgentSelect,
}) => {
  const { data: agents, isLoading } = useUserAgents();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Se încarcă agenții...</span>
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        Nu aveți agenți creați încă. Mergeți la{' '}
        <a href="/account/kalina-agents" className="text-primary hover:underline">
          Agenții Kalina
        </a>{' '}
        pentru a crea primul agent.
      </div>
    );
  }

  return (
    <Select value={selectedAgentId} onValueChange={onAgentSelect}>
      <SelectTrigger className="w-full">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-gray-500" />
          <SelectValue placeholder="Selectează un agent..." />
        </div>
      </SelectTrigger>
      <SelectContent>
        {agents.map((agent) => (
          <SelectItem key={agent.id} value={agent.agent_id}>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <span className="font-medium">{agent.name}</span>
                <span className="text-xs text-gray-500">{agent.agent_id}</span>
              </div>
              <div className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                agent.is_active 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {agent.is_active ? 'Activ' : 'Inactiv'}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};