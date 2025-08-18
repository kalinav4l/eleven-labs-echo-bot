import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AgentResponse } from '@/types/dtos';

interface AgentTurnManagementProps {
  agentData: AgentResponse;
  setAgentData: (data: AgentResponse) => void;
}

const AgentTurnManagement: React.FC<AgentTurnManagementProps> = ({ agentData, setAgentData }) => {
  const turnConfig = agentData.conversation_config?.turn;

  const updateTurnConfig = (field: string, value: any) => {
    setAgentData({
      ...agentData,
      conversation_config: {
        ...agentData.conversation_config,
        turn: {
          ...turnConfig,
          [field]: value
        }
      }
    });
  };

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="text-foreground">Managementul Rândurilor</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configurează modul în care agentul gestionează rândurile în conversație.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="turn-timeout">Timeout Rând (secunde)</Label>
            <Input
              id="turn-timeout"
              type="number"
              value={turnConfig?.turn_timeout || 10}
              onChange={(e) => updateTurnConfig('turn_timeout', parseInt(e.target.value) || 10)}
              min="1"
              max="60"
              placeholder="10"
            />
            <p className="text-xs text-muted-foreground">
              Timpul de așteptare până când agentul preia din nou controlul conversației.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="silence-timeout">Timeout Tăcere (secunde)</Label>
            <Input
              id="silence-timeout"
              type="number"
              value={turnConfig?.silence_end_call_timeout || 30}
              onChange={(e) => updateTurnConfig('silence_end_call_timeout', parseInt(e.target.value) || 30)}
              min="5"
              max="300"
              placeholder="30"
            />
            <p className="text-xs text-muted-foreground">
              Timpul de tăcere după care apelul se încheie automat.
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="turn-mode">Modul de Rând</Label>
            <Select
              value={turnConfig?.mode || 'auto'}
              onValueChange={(value) => updateTurnConfig('mode', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează modul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automat</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="push_to_talk">Push-to-Talk</SelectItem>
                <SelectItem value="voice_activity">Detectare Activitate Vocală</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Determină cum se alternează rândurile între utilizator și agent.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentTurnManagement;