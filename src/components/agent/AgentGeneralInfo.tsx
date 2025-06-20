
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy } from 'lucide-react';
import { AgentResponse } from '@/components/AgentResponse';
import { VOICES, LANGUAGES } from '@/constants/constants';
import { useClipboard } from '@/hooks/useClipboard';
import CreativitySelector from '@/components/CreativitySelector';

interface AgentGeneralInfoProps {
  agentData: AgentResponse;
  setAgentData: React.Dispatch<React.SetStateAction<AgentResponse | null>>;
}

const AgentGeneralInfo: React.FC<AgentGeneralInfoProps> = ({ agentData, setAgentData }) => {
  const { copyToClipboard } = useClipboard();

  const handleCreativityChange = (temperature: number) => {
    setAgentData({
      ...agentData,
      conversation_config: {
        ...agentData.conversation_config,
        agent: {
          ...agentData.conversation_config?.agent!,
          prompt: {
            ...agentData.conversation_config?.agent?.prompt!,
            temperature: temperature
          }
        }
      }
    });
  };

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="text-foreground">Informații Generale</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="agent-name" className="text-foreground">Numele Agentului</Label>
          <Input 
            id="agent-name" 
            value={agentData.name || ''} 
            onChange={e => setAgentData({
              ...agentData,
              name: e.target.value
            })} 
            className="glass-input" 
          />
        </div>

        <div>
          <Label className="text-foreground">Agent ID</Label>
          <div className="flex items-center gap-2">
            <Input value={agentData.agent_id || ''} readOnly className="glass-input bg-muted/50" />
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(agentData.agent_id)} className="glass-button border-border">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="voice-select" className="text-foreground">Voce</Label>
          <Select 
            value={agentData.conversation_config?.tts?.voice_id || ''} 
            onValueChange={value => setAgentData({
              ...agentData,
              conversation_config: {
                ...agentData.conversation_config,
                tts: {
                  ...agentData.conversation_config?.tts!,
                  voice_id: value
                }
              }
            })}
          >
            <SelectTrigger className="glass-input">
              <SelectValue placeholder="Selectează vocea" />
            </SelectTrigger>
            <SelectContent>
              {VOICES.map(voice => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="language-select" className="text-foreground">Limba</Label>
          <Select 
            value={agentData.conversation_config?.agent?.language || ''} 
            onValueChange={value => setAgentData({
              ...agentData,
              conversation_config: {
                ...agentData.conversation_config,
                agent: {
                  ...agentData.conversation_config?.agent!,
                  language: value
                }
              }
            })}
          >
            <SelectTrigger className="glass-input">
              <SelectValue placeholder="Selectează limba" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(language => (
                <SelectItem key={language.value} value={language.value}>
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <CreativitySelector 
            value={agentData.conversation_config?.agent?.prompt?.temperature ?? 0.5} 
            onChange={handleCreativityChange} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentGeneralInfo;
