import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { AgentResponse } from '@/types/dtos';

interface AgentConversationSettingsProps {
  agentData: AgentResponse;
  setAgentData: (data: AgentResponse) => void;
}

const AgentConversationSettings: React.FC<AgentConversationSettingsProps> = ({ 
  agentData, 
  setAgentData 
}) => {
  const conversationConfig = agentData.conversation_config?.conversation;

  const updateConversationConfig = (field: string, value: any) => {
    setAgentData({
      ...agentData,
      conversation_config: {
        ...agentData.conversation_config,
        conversation: {
          ...conversationConfig,
          [field]: value
        }
      }
    });
  };

  const addClientEvent = (event: string) => {
    if (event.trim() && !conversationConfig?.client_events?.includes(event.trim())) {
      updateConversationConfig('client_events', [
        ...(conversationConfig?.client_events || []), 
        event.trim()
      ]);
    }
  };

  const removeClientEvent = (event: string) => {
    updateConversationConfig('client_events', 
      conversationConfig?.client_events?.filter(e => e !== event) || []
    );
  };

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="text-foreground">Setări Conversație</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configurează comportamentul general al conversației.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="text-only">Doar Text</Label>
            <p className="text-xs text-muted-foreground">
              Dezactivează funcționalitatea audio și folosește doar text.
            </p>
          </div>
          <Switch
            id="text-only"
            checked={conversationConfig?.text_only || false}
            onCheckedChange={(checked) => updateConversationConfig('text_only', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-duration">Durata Maximă (secunde)</Label>
          <Input
            id="max-duration"
            type="number"
            value={conversationConfig?.max_duration_seconds || 300}
            onChange={(e) => updateConversationConfig('max_duration_seconds', 
              parseInt(e.target.value) || 300
            )}
            min="30"
            max="3600"
            placeholder="300"
          />
          <p className="text-xs text-muted-foreground">
            Durata maximă a unei conversații în secunde.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Evenimente Client</Label>
          <p className="text-xs text-muted-foreground">
            Evenimente care pot fi trimise către aplicația client.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {conversationConfig?.client_events?.map((event, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {event}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeClientEvent(event)}
                />
              </Badge>
            ))}
          </div>

          <Input
            placeholder="Adaugă eveniment client și apasă Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addClientEvent(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentConversationSettings;