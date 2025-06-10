
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
      <div className="p-6 bg-white min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Setări</h1>
          <p className="text-gray-600">Configurează preferințele tale pentru agenții AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card className="bg-white border-2 border-[#FFBB00] shadow-md">
            <CardHeader className="bg-gradient-primary">
              <CardTitle className="text-black font-bold flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Setări Generale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <label className="block text-gray-600 text-sm mb-2 font-medium">Limbă Implicită</label>
                <Select value={settings.defaultLanguage} onValueChange={(value) => setSettings({...settings, defaultLanguage: value})}>
                  <SelectTrigger className="bg-white border-2 border-[#FFBB00] text-black focus:border-[#E6A600]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-[#FFBB00]">
                    <SelectItem value="ro">Română</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2 font-medium">Voce Implicită</label>
                <Select value={settings.defaultVoice} onValueChange={(value) => setSettings({...settings, defaultVoice: value})}>
                  <SelectTrigger className="bg-white border-2 border-[#FFBB00] text-black focus:border-[#E6A600]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-[#FFBB00]">
                    <SelectItem value="aria">Aria</SelectItem>
                    <SelectItem value="sarah">Sarah</SelectItem>
                    <SelectItem value="george">George</SelectItem>
                    <SelectItem value="roger">Roger</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-black text-sm font-bold">Pornire Automată</label>
                  <p className="text-gray-600 text-xs">Pornește automat conversația când intri pe site</p>
                </div>
                <Switch 
                  checked={settings.autoStart}
                  onCheckedChange={(checked) => setSettings({...settings, autoStart: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-black text-sm font-bold">Notificări</label>
                  <p className="text-gray-600 text-xs">Primește notificări pentru mesaje noi</p>
                </div>
                <Switch 
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card className="bg-white border-2 border-[#FFBB00] shadow-md">
            <CardHeader className="bg-gradient-primary">
              <CardTitle className="text-black font-bold flex items-center">
                <Volume2 className="w-5 h-5 mr-2" />
                Setări Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <label className="block text-gray-600 text-sm mb-2 font-medium">Volum ({settings.volume}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => setSettings({...settings, volume: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #FFBB00 0%, #FFBB00 ${settings.volume}%, #E9ECEF ${settings.volume}%, #E9ECEF 100%)`
                  }}
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2 font-medium">Calitate Audio</label>
                <Select defaultValue="high">
                  <SelectTrigger className="bg-white border-2 border-[#FFBB00] text-black focus:border-[#E6A600]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-[#FFBB00]">
                    <SelectItem value="low">Scăzută (mai rapid)</SelectItem>
                    <SelectItem value="medium">Medie</SelectItem>
                    <SelectItem value="high">Înaltă (recomandat)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2 font-medium">Viteză Vorbire</label>
                <Select defaultValue="normal">
                  <SelectTrigger className="bg-white border-2 border-[#FFBB00] text-black focus:border-[#E6A600]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-[#FFBB00]">
                    <SelectItem value="slow">Încet</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="fast">Rapid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="bg-white border-2 border-[#FFBB00] shadow-md">
            <CardHeader className="bg-gradient-primary">
              <CardTitle className="text-black font-bold flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Confidențialitate & Securitate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-black text-sm font-bold">Salvează Conversațiile</label>
                  <p className="text-gray-600 text-xs">Stochează conversațiile pentru istoric</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-black text-sm font-bold">Analiză Conversații</label>
                  <p className="text-gray-600 text-xs">Permite analiza pentru îmbunătățiri</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-black text-sm font-bold">Partajare Date</label>
                  <p className="text-gray-600 text-xs">Partajează date anonime pentru cercetare</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="bg-white border-2 border-[#FFBB00] shadow-md">
            <CardHeader className="bg-gradient-primary">
              <CardTitle className="text-black font-bold flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informații Cont
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <label className="block text-gray-600 text-sm mb-2 font-medium">Email</label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-100 border-2 border-[#FFBB00] text-black"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-2 font-medium">Plan Curent</label>
                <div className="flex items-center justify-between p-3 bg-[#FFD666] rounded border border-[#FFBB00]">
                  <span className="text-black font-bold">Plan Starter</span>
                  <Button size="sm" className="bg-[#FFBB00] hover:bg-[#E6A600] text-black font-bold border border-black">
                    Upgrade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button className="bg-[#FFBB00] hover:bg-[#E6A600] text-black font-bold border-2 border-black px-8 py-2">
            Salvează Setările
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
