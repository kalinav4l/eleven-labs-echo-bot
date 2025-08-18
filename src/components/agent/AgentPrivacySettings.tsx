import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { AgentResponse } from '@/types/dtos';

interface AgentPrivacySettingsProps {
  agentData: AgentResponse;
  setAgentData: (data: AgentResponse) => void;
}

const AgentPrivacySettings: React.FC<AgentPrivacySettingsProps> = ({ agentData, setAgentData }) => {
  const privacySettings = agentData.platform_settings?.privacy;

  const updatePrivacySettings = (field: string, value: any) => {
    setAgentData({
      ...agentData,
      platform_settings: {
        ...agentData.platform_settings,
        privacy: {
          ...privacySettings,
          [field]: value
        }
      }
    });
  };

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Setări Confidențialitate
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configurează politicile de păstrare și protecție a datelor utilizatorilor.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Aceste setări afectează modul în care datele utilizatorilor sunt stocate și procesate. 
            Asigură-te că respecti legislația locală privind protecția datelor.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="record-voice">Înregistrare Voce</Label>
              <p className="text-xs text-muted-foreground">
                Permite înregistrarea și stocarea conversațiilor vocale.
              </p>
            </div>
            <Switch
              id="record-voice"
              checked={privacySettings?.record_voice || false}
              onCheckedChange={(checked) => updatePrivacySettings('record_voice', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retention-days">Perioada de Păstrare (zile)</Label>
            <Input
              id="retention-days"
              type="number"
              value={privacySettings?.retention_days || 30}
              onChange={(e) => updatePrivacySettings('retention_days', parseInt(e.target.value) || 30)}
              min="1"
              max="365"
              placeholder="30"
            />
            <p className="text-xs text-muted-foreground">
              Numărul de zile pentru care datele vor fi păstrate înainte de a fi șterse automat.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="delete-transcript">Șterge Transcript și PII</Label>
              <p className="text-xs text-muted-foreground">
                Șterge automat transcripturile și informațiile personale după perioada de păstrare.
              </p>
            </div>
            <Switch
              id="delete-transcript"
              checked={privacySettings?.delete_transcript_and_pii || false}
              onCheckedChange={(checked) => updatePrivacySettings('delete_transcript_and_pii', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="delete-audio">Șterge Audio</Label>
              <p className="text-xs text-muted-foreground">
                Șterge automat fișierele audio după perioada de păstrare.
              </p>
            </div>
            <Switch
              id="delete-audio"
              checked={privacySettings?.delete_audio || false}
              onCheckedChange={(checked) => updatePrivacySettings('delete_audio', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="apply-existing">Aplică la Conversațiile Existente</Label>
              <p className="text-xs text-muted-foreground">
                Aplică noile setări de confidențialitate și la conversațiile existente.
              </p>
            </div>
            <Switch
              id="apply-existing"
              checked={privacySettings?.apply_to_existing_conversations || false}
              onCheckedChange={(checked) => updatePrivacySettings('apply_to_existing_conversations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="zero-retention">Mod Zero Retention</Label>
              <p className="text-xs text-muted-foreground">
                Nu stoca niciun fel de date. Toate datele sunt șterse imediat după conversație.
              </p>
            </div>
            <Switch
              id="zero-retention"
              checked={privacySettings?.zero_retention_mode || false}
              onCheckedChange={(checked) => updatePrivacySettings('zero_retention_mode', checked)}
            />
          </div>
        </div>

        {privacySettings?.zero_retention_mode && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenție:</strong> Modul Zero Retention este activat. Toate datele vor fi șterse 
              imediat după terminarea conversației. Aceasta va dezactiva anumite funcții de analiză și raportare.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentPrivacySettings;