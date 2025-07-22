
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Languages } from 'lucide-react';
import { LANGUAGE_MAP } from '@/constants/constants';
import {AgentResponse} from "@/types/dtos.ts";

interface AgentFirstMessageProps {
  agentData: AgentResponse;
  setAgentData: React.Dispatch<React.SetStateAction<AgentResponse | null>>;
  additionalLanguages: string[];
  onOpenMultilingualModal: () => void;
}

const AgentFirstMessage: React.FC<AgentFirstMessageProps> = ({ 
  agentData, 
  setAgentData, 
  additionalLanguages = [], 
  onOpenMultilingualModal 
}) => {
  const getLanguageLabel = (languageId: string) => {
    return LANGUAGE_MAP[languageId as keyof typeof LANGUAGE_MAP] || languageId;
  };

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <CardTitle className="text-foreground">Primul mesaj</CardTitle>
            <p className="text-sm text-muted-foreground">
              Primul mesaj pe care îl va spune agentul. Dacă este gol, agentul va aștepta ca utilizatorul să înceapă conversația.
            </p>
          </div>
          {additionalLanguages.length > 0 && (
            <Button 
              onClick={onOpenMultilingualModal} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 w-full lg:w-auto"
            >
              <Languages className="w-4 h-4" />
              Configurare multilingual
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="first-message" className="text-foreground">
            Mesaj
            {additionalLanguages.length > 0 && (
              <span className="text-xs text-muted-foreground ml-2 block lg:inline">
                (limba principală: {getLanguageLabel(agentData?.conversation_config?.agent?.language || 'en')})
              </span>
            )}
          </Label>
          <Textarea 
            id="first-message" 
            value={agentData.conversation_config?.agent?.first_message || ''} 
            onChange={(e) => setAgentData({
              ...agentData,
              conversation_config: {
                ...agentData.conversation_config,
                agent: {
                  ...agentData.conversation_config?.agent,
                  first_message: e.target.value
                }
              }
            })} 
            className="glass-input min-h-[120px] lg:min-h-[80px]" 
            placeholder="e.g. Hello, how can I help you today?" 
          />
          {additionalLanguages.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Pentru configurarea mesajelor în limbile adiționale, folosește butonul "Configurare multilingual".
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentFirstMessage;
