
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AgentResponse } from "@/types/dtos.ts";
import { useInputSanitization } from '@/hooks/useInputSanitization';
import { useAuth } from '@/components/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AgentSystemPromptProps {
  agentData: AgentResponse;
  setAgentData: React.Dispatch<React.SetStateAction<AgentResponse | null>>;
}

const AgentSystemPrompt: React.FC<AgentSystemPromptProps> = ({ agentData, setAgentData }) => {
  const { sanitizeSystemPrompt } = useInputSanitization();
  const { user } = useAuth();

  // Check if user is banned/restricted
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const isRestricted = userProfile?.account_type === 'banned';

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
            placeholder={isRestricted ? "Contul tău este restricționat. Contactează suportul pentru a edita prompt-urile." : "Introdu prompt-ul pentru agent..."}
            disabled={isRestricted}
            readOnly={isRestricted}
          />
          {isRestricted && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ Editarea prompt-urilor este restricționată pentru contul tău. Contactează suportul pentru mai multe informații.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentSystemPrompt;
