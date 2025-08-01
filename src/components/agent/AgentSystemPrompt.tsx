
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AgentResponse } from "@/types/dtos.ts";
import { useInputSanitization } from '@/hooks/useInputSanitization';

interface AgentSystemPromptProps {
  agentData: AgentResponse;
  setAgentData: React.Dispatch<React.SetStateAction<AgentResponse | null>>;
}

const AgentSystemPrompt: React.FC<AgentSystemPromptProps> = ({ agentData, setAgentData }) => {
  const { sanitizeSystemPrompt } = useInputSanitization();

  const handlePromptChange = (value: string) => {
    const sanitizedValue = sanitizeSystemPrompt(value);
    setAgentData({
      ...agentData,
      conversation_config: {
        ...agentData.conversation_config,
        agent: {
          ...agentData.conversation_config?.agent,
          prompt: {
            ...agentData.conversation_config?.agent?.prompt,
            prompt: sanitizedValue
          }
        }
      }
    });
  };

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="text-foreground">Prompt Sistem</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <Label htmlFor="system-prompt" className="text-foreground">Prompt</Label>
          <Textarea 
            id="system-prompt" 
            value={agentData.conversation_config?.agent?.prompt?.prompt || ''} 
            onChange={e => handlePromptChange(e.target.value)}
            className="glass-input min-h-[300px] w-full" 
            placeholder="Introdu prompt-ul pentru agent..." 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentSystemPrompt;
