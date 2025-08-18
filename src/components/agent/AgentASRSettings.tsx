import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { AgentResponse } from '@/types/dtos';

interface AgentASRSettingsProps {
  agentData: AgentResponse;
  setAgentData: (data: AgentResponse) => void;
}

const AgentASRSettings: React.FC<AgentASRSettingsProps> = ({ agentData, setAgentData }) => {
  const asrConfig = agentData.conversation_config?.asr;

  const updateASRConfig = (field: string, value: any) => {
    setAgentData({
      ...agentData,
      conversation_config: {
        ...agentData.conversation_config,
        asr: {
          ...asrConfig,
          [field]: value
        }
      }
    });
  };

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !asrConfig?.keywords?.includes(keyword.trim())) {
      updateASRConfig('keywords', [...(asrConfig?.keywords || []), keyword.trim()]);
    }
  };

  const removeKeyword = (keyword: string) => {
    updateASRConfig('keywords', asrConfig?.keywords?.filter(k => k !== keyword) || []);
  };

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="text-foreground">Configurări ASR (Speech Recognition)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configurează setările pentru recunoașterea vocală automată.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="asr-quality">Calitatea ASR</Label>
            <Select
              value={asrConfig?.quality || 'standard'}
              onValueChange={(value) => updateASRConfig('quality', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează calitatea" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="high">Înaltă</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asr-provider">Provider ASR</Label>
            <Select
              value={asrConfig?.provider || 'elevenlabs'}
              onValueChange={(value) => updateASRConfig('provider', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează providerul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="deepgram">Deepgram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio-format">Format Audio Input</Label>
            <Select
              value={asrConfig?.user_input_audio_format || 'pcm_16000'}
              onValueChange={(value) => updateASRConfig('user_input_audio_format', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează formatul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pcm_16000">PCM 16kHz</SelectItem>
                <SelectItem value="pcm_22050">PCM 22.05kHz</SelectItem>
                <SelectItem value="pcm_44100">PCM 44.1kHz</SelectItem>
                <SelectItem value="mp3">MP3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Cuvinte Cheie pentru ASR</Label>
          <p className="text-xs text-muted-foreground">
            Adaugă cuvinte cheie care să fie recunoscute mai precis de către sistemul ASR.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {asrConfig?.keywords?.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {keyword}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeKeyword(keyword)}
                />
              </Badge>
            ))}
          </div>

          <Input
            placeholder="Adaugă cuvânt cheie și apasă Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addKeyword(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentASRSettings;