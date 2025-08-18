import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, TrendingUp } from 'lucide-react';
import { AgentResponse } from '@/types/dtos';

interface AgentCallLimitsProps {
  agentData: AgentResponse;
  setAgentData: (data: AgentResponse) => void;
}

const AgentCallLimits: React.FC<AgentCallLimitsProps> = ({ agentData, setAgentData }) => {
  const callLimits = agentData.platform_settings?.call_limits;

  const updateCallLimits = (field: string, value: any) => {
    setAgentData({
      ...agentData,
      platform_settings: {
        ...agentData.platform_settings,
        call_limits: {
          ...callLimits,
          [field]: value
        }
      }
    });
  };

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Limite Apeluri
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configurează limitele pentru apelurile simultane și zilnice.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            Setează limite pentru a controla utilizarea resurselor și costurile. 
            Limitele ajută la managementul traficului și prevenirea abuzurilor.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="concurrency-limit">Limită Apeluri Simultane</Label>
            <Input
              id="concurrency-limit"
              type="number"
              value={callLimits?.agent_concurrency_limit || 10}
              onChange={(e) => updateCallLimits('agent_concurrency_limit', parseInt(e.target.value) || 10)}
              min="1"
              max="1000"
              placeholder="10"
            />
            <p className="text-xs text-muted-foreground">
              Numărul maxim de apeluri care pot fi active simultan pentru acest agent.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="daily-limit">Limită Apeluri Zilnice</Label>
            <Input
              id="daily-limit"
              type="number"
              value={callLimits?.daily_limit || 1000}
              onChange={(e) => updateCallLimits('daily_limit', parseInt(e.target.value) || 1000)}
              min="1"
              max="10000"
              placeholder="1000"
            />
            <p className="text-xs text-muted-foreground">
              Numărul maxim de apeluri care pot fi efectuate într-o zi pentru acest agent.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="bursting-enabled">Bursting Activat</Label>
              <p className="text-xs text-muted-foreground">
                Permite depășirea limitelor pe perioade scurte în cazul unui trafic intens.
              </p>
            </div>
            <Switch
              id="bursting-enabled"
              checked={callLimits?.bursting_enabled || false}
              onCheckedChange={(checked) => updateCallLimits('bursting_enabled', checked)}
            />
          </div>
        </div>

        {callLimits?.bursting_enabled && (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>Bursting activat:</strong> Agentul poate depăși temporar limitele setate 
              în cazul unui trafic neașteptat de intens. Aceasta poate rezulta în costuri suplimentare.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {callLimits?.agent_concurrency_limit || 10}
            </div>
            <div className="text-sm text-muted-foreground">Maxim Simultan</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {callLimits?.daily_limit || 1000}
            </div>
            <div className="text-sm text-muted-foreground">Maxim Zilnic</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentCallLimits;