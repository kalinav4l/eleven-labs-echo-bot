
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bot, Volume2, Globe, Clock, Shield } from 'lucide-react';

interface VoiceAgentDefaultsProps {
  onChanges?: (hasChanges: boolean) => void;
}

const VoiceAgentDefaults = ({ onChanges }: VoiceAgentDefaultsProps) => {
  const [settings, setSettings] = useState({
    defaultVoice: 'maria',
    defaultLanguage: 'ro-RO',
    responseSpeed: 'normal',
    complianceMode: true,
    recordCalls: true,
    fallbackBehavior: 'transfer',
  });

  const [businessHours, setBusinessHours] = useState({
    enabled: true,
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'Europe/Bucharest',
  });

  const [scripts, setScripts] = useState({
    greeting: 'Bună ziua! Sunt asistentul virtual Kalina. Cu ce vă pot ajuta astăzi?',
    fallback: 'Îmi pare rău, nu am înțeles. Vă rog să repetați sau să mă contactați pe alt canal.',
    closing: 'Vă mulțumesc pentru apel. O zi bună!',
  });

  const handleSettingChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    onChanges?.(true);
  };

  const handleScriptChange = (field: string, value: string) => {
    setScripts(prev => ({ ...prev, [field]: value }));
    onChanges?.(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Setări implicite agenți vocali</h2>
        <p className="text-gray-600">Configurează comportamentul implicit pentru toți agenții vocali</p>
      </div>

      {/* Voice & Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Voce și limbă
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Voce implicită</Label>
              <Select value={settings.defaultVoice} onValueChange={(value) => handleSettingChange('defaultVoice', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maria">Maria (Feminină, Română)</SelectItem>
                  <SelectItem value="andrei">Andrei (Masculină, Română)</SelectItem>
                  <SelectItem value="sarah">Sarah (Feminină, Engleză)</SelectItem>
                  <SelectItem value="john">John (Masculină, Engleză)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Limbă implicită</Label>
              <Select value={settings.defaultLanguage} onValueChange={(value) => handleSettingChange('defaultLanguage', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ro-RO">Română</SelectItem>
                  <SelectItem value="en-US">Engleză (US)</SelectItem>
                  <SelectItem value="en-GB">Engleză (UK)</SelectItem>
                  <SelectItem value="fr-FR">Franceză</SelectItem>
                  <SelectItem value="de-DE">Germană</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Viteza de răspuns</Label>
            <Select value={settings.responseSpeed} onValueChange={(value) => handleSettingChange('responseSpeed', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Lentă</SelectItem>
                <SelectItem value="normal">Normală</SelectItem>
                <SelectItem value="fast">Rapidă</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Program de lucru
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Activează programul de lucru</h4>
              <p className="text-sm text-gray-600">Agenții vor fi activi doar în intervalul specificat</p>
            </div>
            <Switch
              checked={businessHours.enabled}
              onCheckedChange={(checked) => setBusinessHours(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {businessHours.enabled && (
            <>
              <Separator />
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Ora de început</Label>
                  <Select value={businessHours.startTime} onValueChange={(value) => setBusinessHours(prev => ({ ...prev, startTime: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {`${i.toString().padStart(2, '0')}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ora de sfârșit</Label>
                  <Select value={businessHours.endTime} onValueChange={(value) => setBusinessHours(prev => ({ ...prev, endTime: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {`${i.toString().padStart(2, '0')}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fus orar</Label>
                  <Select value={businessHours.timezone} onValueChange={(value) => setBusinessHours(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Bucharest">Europa/București</SelectItem>
                      <SelectItem value="Europe/London">Europa/Londra</SelectItem>
                      <SelectItem value="America/New_York">America/New York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Compliance & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Conformitate și securitate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Mod conformitate GDPR</h4>
              <p className="text-sm text-gray-600">Respectă regulamentele de protecție a datelor</p>
            </div>
            <Switch
              checked={settings.complianceMode}
              onCheckedChange={(checked) => handleSettingChange('complianceMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Înregistrează apelurile</h4>
              <p className="text-sm text-gray-600">Salvează conversațiile pentru analiză</p>
            </div>
            <Switch
              checked={settings.recordCalls}
              onCheckedChange={(checked) => handleSettingChange('recordCalls', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Comportament de rezervă</Label>
            <Select value={settings.fallbackBehavior} onValueChange={(value) => handleSettingChange('fallbackBehavior', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Transfer la operator</SelectItem>
                <SelectItem value="voicemail">Mesaj vocal</SelectItem>
                <SelectItem value="callback">Programează apel de întoarcere</SelectItem>
                <SelectItem value="email">Trimite email</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Default Scripts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Scripturi implicite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="greeting">Mesaj de salut</Label>
            <Textarea
              id="greeting"
              value={scripts.greeting}
              onChange={(e) => handleScriptChange('greeting', e.target.value)}
              placeholder="Mesajul de salut pentru începutul conversației"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fallback">Mesaj de rezervă</Label>
            <Textarea
              id="fallback"
              value={scripts.fallback}
              onChange={(e) => handleScriptChange('fallback', e.target.value)}
              placeholder="Mesajul când agentul nu înțelege"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="closing">Mesaj de închidere</Label>
            <Textarea
              id="closing"
              value={scripts.closing}
              onChange={(e) => handleScriptChange('closing', e.target.value)}
              placeholder="Mesajul de închidere a conversației"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAgentDefaults;
