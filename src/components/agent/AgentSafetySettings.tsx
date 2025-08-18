import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { AgentResponse } from '@/types/dtos';

interface AgentSafetySettingsProps {
  agentData: AgentResponse;
  setAgentData: (data: AgentResponse) => void;
}

const AgentSafetySettings: React.FC<AgentSafetySettingsProps> = ({ agentData, setAgentData }) => {
  const safetySettings = agentData.platform_settings?.safety;

  const updateSafetySettings = (field: string, value: any) => {
    setAgentData({
      ...agentData,
      platform_settings: {
        ...agentData.platform_settings,
        safety: {
          ...safetySettings,
          [field]: value
        }
      }
    });
  };

  const isAnyBlocked = safetySettings?.is_blocked_ivc || safetySettings?.is_blocked_non_ivc;

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Setări Siguranță
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configurează filtrele de siguranță și moderarea conținutului.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            Aceste setări ajută la protejarea împotriva conținutului neadecvat și abuzurilor. 
            Recomandăm păstrarea filtrelor activate pentru o experiență sigură.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="blocked-ivc">Blocat pentru IVC</Label>
              <p className="text-xs text-muted-foreground">
                Blochează agentul pentru apelurile Interactive Voice Calls (IVC).
              </p>
            </div>
            <Switch
              id="blocked-ivc"
              checked={safetySettings?.is_blocked_ivc || false}
              onCheckedChange={(checked) => updateSafetySettings('is_blocked_ivc', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="blocked-non-ivc">Blocat pentru Non-IVC</Label>
              <p className="text-xs text-muted-foreground">
                Blochează agentul pentru alte tipuri de interacțiuni (text, API, etc.).
              </p>
            </div>
            <Switch
              id="blocked-non-ivc"
              checked={safetySettings?.is_blocked_non_ivc || false}
              onCheckedChange={(checked) => updateSafetySettings('is_blocked_non_ivc', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ignore-safety">Ignoră Evaluarea Siguranței</Label>
              <p className="text-xs text-muted-foreground">
                Dezactivează sistemul automat de evaluare a siguranței conținutului.
              </p>
            </div>
            <Switch
              id="ignore-safety"
              checked={safetySettings?.ignore_safety_evaluation || false}
              onCheckedChange={(checked) => updateSafetySettings('ignore_safety_evaluation', checked)}
            />
          </div>
        </div>

        {isAnyBlocked && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenție:</strong> Agentul este blocat pentru unele tipuri de interacțiuni. 
              Aceasta va limita funcționalitatea și disponibilitatea agentului.
            </AlertDescription>
          </Alert>
        )}

        {safetySettings?.ignore_safety_evaluation && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenție:</strong> Evaluarea automată a siguranței este dezactivată. 
              Aceasta poate permite conținut neadecvat să treacă prin filtru.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-center p-4 bg-muted/20 rounded-lg">
          <div className="text-center">
            <div className={`text-2xl font-bold ${isAnyBlocked ? 'text-destructive' : 'text-green-500'}`}>
              {isAnyBlocked ? 'RESTRICȚIONAT' : 'ACTIV'}
            </div>
            <div className="text-sm text-muted-foreground">
              Status Siguranță Agent
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentSafetySettings;