import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { AgentResponse } from '@/types/dtos';

interface AgentTTSAdvancedProps {
  agentData: AgentResponse;
  setAgentData: (data: AgentResponse) => void;
}

const AgentTTSAdvanced: React.FC<AgentTTSAdvancedProps> = ({ agentData, setAgentData }) => {
  const ttsConfig = agentData.conversation_config?.tts;

  const updateTTSConfig = (field: string, value: any) => {
    setAgentData({
      ...agentData,
      conversation_config: {
        ...agentData.conversation_config,
        tts: {
          ...ttsConfig,
          [field]: value
        }
      }
    });
  };

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="text-foreground">Configurări TTS Avansate</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configurări detaliate pentru text-to-speech și calitatea vocii.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tts-model">Model TTS</Label>
            <Select
              value={ttsConfig?.model_id || 'eleven_turbo_v2_5'}
              onValueChange={(value) => updateTTSConfig('model_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează modelul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eleven_turbo_v2_5">Eleven Turbo v2.5</SelectItem>
                <SelectItem value="eleven_turbo_v2">Eleven Turbo v2</SelectItem>
                <SelectItem value="eleven_multilingual_v2">Eleven Multilingual v2</SelectItem>
                <SelectItem value="eleven_multilingual_v1">Eleven Multilingual v1</SelectItem>
                <SelectItem value="eleven_monolingual_v1">Eleven English v1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio-format">Format Audio Output</Label>
            <Select
              value={ttsConfig?.agent_output_audio_format || 'pcm_16000'}
              onValueChange={(value) => updateTTSConfig('agent_output_audio_format', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează formatul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pcm_16000">PCM 16kHz</SelectItem>
                <SelectItem value="pcm_22050">PCM 22.05kHz</SelectItem>
                <SelectItem value="pcm_44100">PCM 44.1kHz</SelectItem>
                <SelectItem value="mp3_22050_32">MP3 22.05kHz</SelectItem>
                <SelectItem value="mp3_44100_32">MP3 44.1kHz</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Optimizare Latență Streaming: {ttsConfig?.optimize_streaming_latency || 0}</Label>
            <Slider
              value={[ttsConfig?.optimize_streaming_latency || 0]}
              onValueChange={([value]) => updateTTSConfig('optimize_streaming_latency', value)}
              max={4}
              min={0}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Nivel mai mare = latență mai mică, dar calitate redusă.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Stabilitate: {((ttsConfig?.stability || 0.5) * 100).toFixed(0)}%</Label>
            <Slider
              value={[ttsConfig?.stability || 0.5]}
              onValueChange={([value]) => updateTTSConfig('stability', value)}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Controlează consistența vocii. Valori mai mari = mai puțină variație.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Viteză: {((ttsConfig?.speed || 1) * 100).toFixed(0)}%</Label>
            <Slider
              value={[ttsConfig?.speed || 1]}
              onValueChange={([value]) => updateTTSConfig('speed', value)}
              max={2}
              min={0.5}
              step={0.01}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Controlează viteza de vorbire. 100% = viteză normală.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Similarity Boost: {((ttsConfig?.similarity_boost || 0.5) * 100).toFixed(0)}%</Label>
            <Slider
              value={[ttsConfig?.similarity_boost || 0.5]}
              onValueChange={([value]) => updateTTSConfig('similarity_boost', value)}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Îmbunătățește similaritatea cu vocea originală.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentTTSAdvanced;