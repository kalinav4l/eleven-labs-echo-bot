import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentResponse } from '@/types/dtos';

interface AgentWidgetSettingsProps {
  agentData: AgentResponse;
  setAgentData: (data: AgentResponse) => void;
}

const AgentWidgetSettings: React.FC<AgentWidgetSettingsProps> = ({ agentData, setAgentData }) => {
  const widgetSettings = agentData.platform_settings?.widget;

  const updateWidgetSettings = (field: string, value: any) => {
    setAgentData({
      ...agentData,
      platform_settings: {
        ...agentData.platform_settings,
        widget: {
          ...widgetSettings,
          [field]: value
        }
      }
    });
  };

  const updateTextContents = (field: string, value: any) => {
    updateWidgetSettings('text_contents', {
      ...widgetSettings?.text_contents,
      [field]: value
    });
  };

  const updateStyles = (field: string, value: any) => {
    updateWidgetSettings('styles', {
      ...widgetSettings?.styles,
      [field]: value
    });
  };

  const updateAvatar = (field: string, value: any) => {
    updateWidgetSettings('avatar', {
      ...widgetSettings?.avatar,
      [field]: value
    });
  };

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="text-foreground">Configurări Widget</CardTitle>
        <p className="text-sm text-muted-foreground">
          Personalizează aspectul și comportamentul widget-ului web.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance">Aspect</TabsTrigger>
            <TabsTrigger value="behavior">Comportament</TabsTrigger>
            <TabsTrigger value="text">Texte</TabsTrigger>
            <TabsTrigger value="styles">Stiluri</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Varianta Widget</Label>
                <Select
                  value={widgetSettings?.variant || 'embedded'}
                  onValueChange={(value) => updateWidgetSettings('variant', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="embedded">Încorporat</SelectItem>
                    <SelectItem value="popup">Popup</SelectItem>
                    <SelectItem value="fullscreen">Ecran Complet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Poziție</Label>
                <Select
                  value={widgetSettings?.placement || 'bottom-right'}
                  onValueChange={(value) => updateWidgetSettings('placement', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Jos Dreapta</SelectItem>
                    <SelectItem value="bottom-left">Jos Stânga</SelectItem>
                    <SelectItem value="top-right">Sus Dreapta</SelectItem>
                    <SelectItem value="top-left">Sus Stânga</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tip Avatar</Label>
                <Select
                  value={widgetSettings?.avatar?.type || 'icon'}
                  onValueChange={(value) => updateAvatar('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="icon">Iconiță</SelectItem>
                    <SelectItem value="image">Imagine</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mod Feedback</Label>
                <Select
                  value={widgetSettings?.feedback_mode || 'stars'}
                  onValueChange={(value) => updateWidgetSettings('feedback_mode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stars">Stele</SelectItem>
                    <SelectItem value="thumbs">Thumbs Up/Down</SelectItem>
                    <SelectItem value="none">Dezactivat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Culoare Fundal</Label>
                <Input
                  type="color"
                  value={widgetSettings?.bg_color || '#ffffff'}
                  onChange={(e) => updateWidgetSettings('bg_color', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Culoare Text</Label>
                <Input
                  type="color"
                  value={widgetSettings?.text_color || '#000000'}
                  onChange={(e) => updateWidgetSettings('text_color', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Culoare Buton</Label>
                <Input
                  type="color"
                  value={widgetSettings?.btn_color || '#007bff'}
                  onChange={(e) => updateWidgetSettings('btn_color', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Expandabil</Label>
                  <p className="text-xs text-muted-foreground">Widget poate fi expandat/contractat</p>
                </div>
                <Switch
                  checked={widgetSettings?.expandable === 'true'}
                  onCheckedChange={(checked) => updateWidgetSettings('expandable', checked ? 'true' : 'false')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Selector Limba</Label>
                  <p className="text-xs text-muted-foreground">Afișează selectorul de limbă</p>
                </div>
                <Switch
                  checked={widgetSettings?.language_selector || false}
                  onCheckedChange={(checked) => updateWidgetSettings('language_selector', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Suport Doar Text</Label>
                  <p className="text-xs text-muted-foreground">Permite conversații text-only</p>
                </div>
                <Switch
                  checked={widgetSettings?.supports_text_only || false}
                  onCheckedChange={(checked) => updateWidgetSettings('supports_text_only', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Microfon Muting</Label>
                  <p className="text-xs text-muted-foreground">Permite mutarea microfonului</p>
                </div>
                <Switch
                  checked={widgetSettings?.mic_muting_enabled || false}
                  onCheckedChange={(checked) => updateWidgetSettings('mic_muting_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Transcript Activat</Label>
                  <p className="text-xs text-muted-foreground">Afișează transcriptul conversației</p>
                </div>
                <Switch
                  checked={widgetSettings?.transcript_enabled || false}
                  onCheckedChange={(checked) => updateWidgetSettings('transcript_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Input Text Activat</Label>
                  <p className="text-xs text-muted-foreground">Permite introducerea de text</p>
                </div>
                <Switch
                  checked={widgetSettings?.text_input_enabled || false}
                  onCheckedChange={(checked) => updateWidgetSettings('text_input_enabled', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Text Acțiune</Label>
                <Input
                  value={widgetSettings?.action_text || ''}
                  onChange={(e) => updateWidgetSettings('action_text', e.target.value)}
                  placeholder="Vorbește cu agentul"
                />
              </div>

              <div className="space-y-2">
                <Label>Text Start Apel</Label>
                <Input
                  value={widgetSettings?.start_call_text || ''}
                  onChange={(e) => updateWidgetSettings('start_call_text', e.target.value)}
                  placeholder="Începe apelul"
                />
              </div>

              <div className="space-y-2">
                <Label>Text Sfârșit Apel</Label>
                <Input
                  value={widgetSettings?.end_call_text || ''}
                  onChange={(e) => updateWidgetSettings('end_call_text', e.target.value)}
                  placeholder="Termină apelul"
                />
              </div>

              <div className="space-y-2">
                <Label>Text Expandare</Label>
                <Input
                  value={widgetSettings?.expand_text || ''}
                  onChange={(e) => updateWidgetSettings('expand_text', e.target.value)}
                  placeholder="Expandează"
                />
              </div>

              <div className="space-y-2">
                <Label>Text Ascultare</Label>
                <Input
                  value={widgetSettings?.listening_text || ''}
                  onChange={(e) => updateWidgetSettings('listening_text', e.target.value)}
                  placeholder="Te ascult..."
                />
              </div>

              <div className="space-y-2">
                <Label>Text Vorbire</Label>
                <Input
                  value={widgetSettings?.speaking_text || ''}
                  onChange={(e) => updateWidgetSettings('speaking_text', e.target.value)}
                  placeholder="Vorbesc..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Termeni și Condiții</Label>
              <Textarea
                value={widgetSettings?.terms_text || ''}
                onChange={(e) => updateWidgetSettings('terms_text', e.target.value)}
                placeholder="Textul termenilor și condițiilor..."
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="styles" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Raza Border</Label>
                <Input
                  type="number"
                  value={widgetSettings?.border_radius || 8}
                  onChange={(e) => updateWidgetSettings('border_radius', parseInt(e.target.value))}
                  min="0"
                  max="50"
                />
              </div>

              <div className="space-y-2">
                <Label>Raza Buton</Label>
                <Input
                  type="number"
                  value={widgetSettings?.btn_radius || 6}
                  onChange={(e) => updateWidgetSettings('btn_radius', parseInt(e.target.value))}
                  min="0"
                  max="50"
                />
              </div>

              <div className="space-y-2">
                <Label>Culoare Border</Label>
                <Input
                  type="color"
                  value={widgetSettings?.border_color || '#e0e0e0'}
                  onChange={(e) => updateWidgetSettings('border_color', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Culoare Focus</Label>
                <Input
                  type="color"
                  value={widgetSettings?.focus_color || '#007bff'}
                  onChange={(e) => updateWidgetSettings('focus_color', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AgentWidgetSettings;