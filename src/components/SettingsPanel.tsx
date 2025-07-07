import React, { useState } from 'react';
import { Settings, X, Volume2, Mic, Globe, Palette, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export const SettingsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    language: 'ro',
    theme: 'system',
    volume: [80],
    micSensitivity: [70],
    notifications: true,
    autoSave: true,
    darkMode: false,
    compactMode: false,
    showCredits: true,
    highQuality: true
  });

  const togglePanel = () => setIsOpen(!isOpen);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Settings Button - Fixed bottom-left */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={togglePanel}
          size="lg"
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
        >
          <Settings className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Settings Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in">
          <div className="fixed bottom-6 left-6 w-96 max-h-[80vh] overflow-hidden animate-slide-in-right">
            <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Setări</CardTitle>
                      <p className="text-sm text-muted-foreground">Personalizează experiența ta</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePanel}
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {/* Limbă și Localizare */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-medium">Limbă și Regiune</Label>
                  </div>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ro">🇷🇴 Română</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                      <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Aspect și Temă */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-medium">Aspect</Label>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dark-mode" className="text-sm">Mod întunecat</Label>
                      <Switch
                        id="dark-mode"
                        checked={settings.darkMode}
                        onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="compact-mode" className="text-sm">Interfață compactă</Label>
                      <Switch
                        id="compact-mode"
                        checked={settings.compactMode}
                        onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Audio și Microfon */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-medium">Audio</Label>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Volum general</Label>
                        <Badge variant="secondary" className="text-xs">
                          {settings.volume[0]}%
                        </Badge>
                      </div>
                      <Slider
                        value={settings.volume}
                        onValueChange={(value) => updateSetting('volume', value)}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mic className="w-3 h-3" />
                          <Label className="text-sm">Sensibilitate microfon</Label>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {settings.micSensitivity[0]}%
                        </Badge>
                      </div>
                      <Slider
                        value={settings.micSensitivity}
                        onValueChange={(value) => updateSetting('micSensitivity', value)}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Funcționalități */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-medium">Funcționalități</Label>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications" className="text-sm">Notificări</Label>
                      <Switch
                        id="notifications"
                        checked={settings.notifications}
                        onCheckedChange={(checked) => updateSetting('notifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-save" className="text-sm">Salvare automată</Label>
                      <Switch
                        id="auto-save"
                        checked={settings.autoSave}
                        onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-credits" className="text-sm">Afișează credite</Label>
                      <Switch
                        id="show-credits"
                        checked={settings.showCredits}
                        onCheckedChange={(checked) => updateSetting('showCredits', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="high-quality" className="text-sm">Calitate înaltă</Label>
                      <Switch
                        id="high-quality"
                        checked={settings.highQuality}
                        onCheckedChange={(checked) => updateSetting('highQuality', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Securitate și Confidențialitate */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-medium">Securitate</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                      Gestionează datele personale
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                      Istoric și cache
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                      Resetează setările
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};