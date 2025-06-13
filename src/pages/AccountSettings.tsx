
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings, User, Volume2, Globe, Shield } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const AccountSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    defaultLanguage: 'ro',
    defaultVoice: 'aria',
    autoStart: true,
    notifications: true,
    darkMode: true,
    volume: 80
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Setări</h1>
          <p className="text-muted-foreground">Configurează preferințele tale pentru agenții AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Setări Generale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-muted-foreground text-sm mb-2">Limbă Implicită</label>
                <Select value={settings.defaultLanguage} onValueChange={(value) => setSettings({...settings, defaultLanguage: value})}>
                  <SelectTrigger className="liquid-glass border-gray-200/50 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="liquid-glass border-gray-200/50">
                    <SelectItem value="ro">Română</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-muted-foreground text-sm mb-2">Voce Implicită</label>
                <Select value={settings.defaultVoice} onValueChange={(value) => setSettings({...settings, defaultVoice: value})}>
                  <SelectTrigger className="liquid-glass border-gray-200/50 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="liquid-glass border-gray-200/50">
                    <SelectItem value="aria">Aria</SelectItem>
                    <SelectItem value="sarah">Sarah</SelectItem>
                    <SelectItem value="george">George</SelectItem>
                    <SelectItem value="roger">Roger</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-foreground text-sm font-medium">Pornire Automată</label>
                  <p className="text-muted-foreground text-xs">Pornește automat conversația când intri pe site</p>
                </div>
                <Switch 
                  checked={settings.autoStart}
                  onCheckedChange={(checked) => setSettings({...settings, autoStart: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-foreground text-sm font-medium">Notificări</label>
                  <p className="text-muted-foreground text-xs">Primește notificări pentru mesaje noi</p>
                </div>
                <Switch 
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Volume2 className="w-5 h-5 mr-2" />
                Setări Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-muted-foreground text-sm mb-2">Volum ({settings.volume}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => setSettings({...settings, volume: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200/50 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>

              <div>
                <label className="block text-muted-foreground text-sm mb-2">Calitate Audio</label>
                <Select defaultValue="high">
                  <SelectTrigger className="liquid-glass border-gray-200/50 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="liquid-glass border-gray-200/50">
                    <SelectItem value="low">Scăzută (mai rapid)</SelectItem>
                    <SelectItem value="medium">Medie</SelectItem>
                    <SelectItem value="high">Înaltă (recomandat)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-muted-foreground text-sm mb-2">Viteză Vorbire</label>
                <Select defaultValue="normal">
                  <SelectTrigger className="liquid-glass border-gray-200/50 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="liquid-glass border-gray-200/50">
                    <SelectItem value="slow">Încet</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="fast">Rapid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Confidențialitate & Securitate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-foreground text-sm font-medium">Salvează Conversațiile</label>
                  <p className="text-muted-foreground text-xs">Stochează conversațiile pentru istoric</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-foreground text-sm font-medium">Analiză Conversații</label>
                  <p className="text-muted-foreground text-xs">Permite analiza pentru îmbunătățiri</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-foreground text-sm font-medium">Partajare Date</label>
                  <p className="text-muted-foreground text-xs">Partajează date anonime pentru cercetare</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informații Cont
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-muted-foreground text-sm mb-2">Email</label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="liquid-glass border-gray-200/50 text-foreground bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-muted-foreground text-sm mb-2">Plan Curent</label>
                <div className="flex items-center justify-between p-3 liquid-glass rounded border border-gray-200/50">
                  <span className="text-foreground">Plan Starter</span>
                  <Button size="sm" className="glass-button bg-accent/90 hover:bg-accent text-white">
                    Upgrade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button className="glass-button bg-accent/90 hover:bg-accent text-white">
            Salvează Setările
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
