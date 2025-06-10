
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
          <h1 className="text-3xl font-bold text-white mb-2">Setări</h1>
          <p className="text-gray-400">Configurează preferințele tale pentru agenții AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Setări Generale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Limbă Implicită</label>
                <Select value={settings.defaultLanguage} onValueChange={(value) => setSettings({...settings, defaultLanguage: value})}>
                  <SelectTrigger className="bg-black border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ro">Română</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Voce Implicită</label>
                <Select value={settings.defaultVoice} onValueChange={(value) => setSettings({...settings, defaultVoice: value})}>
                  <SelectTrigger className="bg-black border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aria">Aria</SelectItem>
                    <SelectItem value="sarah">Sarah</SelectItem>
                    <SelectItem value="george">George</SelectItem>
                    <SelectItem value="roger">Roger</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white text-sm font-medium">Pornire Automată</label>
                  <p className="text-gray-400 text-xs">Pornește automat conversația când intri pe site</p>
                </div>
                <Switch 
                  checked={settings.autoStart}
                  onCheckedChange={(checked) => setSettings({...settings, autoStart: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white text-sm font-medium">Notificări</label>
                  <p className="text-gray-400 text-xs">Primește notificări pentru mesaje noi</p>
                </div>
                <Switch 
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Volume2 className="w-5 h-5 mr-2" />
                Setări Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Volum ({settings.volume}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => setSettings({...settings, volume: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Calitate Audio</label>
                <Select defaultValue="high">
                  <SelectTrigger className="bg-black border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Scăzută (mai rapid)</SelectItem>
                    <SelectItem value="medium">Medie</SelectItem>
                    <SelectItem value="high">Înaltă (recomandat)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Viteză Vorbire</label>
                <Select defaultValue="normal">
                  <SelectTrigger className="bg-black border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Încet</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="fast">Rapid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Confidențialitate & Securitate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white text-sm font-medium">Salvează Conversațiile</label>
                  <p className="text-gray-400 text-xs">Stochează conversațiile pentru istoric</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white text-sm font-medium">Analiză Conversații</label>
                  <p className="text-gray-400 text-xs">Permite analiza pentru îmbunătățiri</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white text-sm font-medium">Partajare Date</label>
                  <p className="text-gray-400 text-xs">Partajează date anonime pentru cercetare</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informații Cont
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-black border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Plan Curent</label>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <span className="text-white">Plan Starter</span>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Upgrade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Salvează Setările
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
