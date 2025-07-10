
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AgentIdInputProps {
  agentId: string;
  setAgentId: (id: string) => void;
}

export const AgentIdInput: React.FC<AgentIdInputProps> = ({ agentId, setAgentId }) => {
  return (
    <div className="mb-6">
      <Label htmlFor="agent-id" className="text-gray-900 font-medium">
        Agent ID ElevenLabs *
      </Label>
      <Input
        id="agent-id"
        value={agentId}
        onChange={(e) => setAgentId(e.target.value)}
        placeholder="agent_xxxxxxxxx"
        className="bg-white border-gray-300 text-gray-900 font-mono mt-1"
      />
      <p className="text-xs text-gray-500 mt-1">
        ID-ul agentului vostru din ElevenLabs care va efectua apelurile
      </p>
    </div>
  );
};
