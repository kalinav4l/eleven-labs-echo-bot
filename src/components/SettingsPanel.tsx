import React, { useState } from 'react';
import { Settings, User, Volume2, Palette, Shield, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const SettingsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    language: 'ro',
    theme: 'light',
    volume: [70],
    notifications: true,
    autoSave: true,
    highContrast: false
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Floating Settings Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Settings Panel */}
      {isOpen && (
        <div className="fixed bottom-20 left-6 z-50 animate-fade-in">
          <Card className="w-80 p-6 bg-card border-border shadow-xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Setări</h3>
              </div>

              {/* Language Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Limbă</Label>
                </div>
                <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ro">Română</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Theme Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Temă</Label>
                </div>
                <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Luminos</SelectItem>
                    <SelectItem value="dark">Întunecat</SelectItem>
                    <SelectItem value="auto">Automat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Volume Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Volum</Label>
                </div>
                <Slider
                  value={settings.volume}
                  onValueChange={(value) => updateSetting('volume', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {settings.volume[0]}%
                </div>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Preferințe</Label>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="text-sm">Notificări</Label>
                  <Switch
                    id="notifications"
                    checked={settings.notifications}
                    onCheckedChange={(checked) => updateSetting('notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="autoSave" className="text-sm">Salvare automată</Label>
                  <Switch
                    id="autoSave"
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="highContrast" className="text-sm">Contrast ridicat</Label>
                  <Switch
                    id="highContrast"
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                  />
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Securitate</Label>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Șterge cache-ul
                </Button>
              </div>

              {/* Close Button */}
              <div className="pt-2 border-t border-border">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  Închide
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default SettingsPanel;