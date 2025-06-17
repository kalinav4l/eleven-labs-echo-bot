
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
import { useLanguage } from '@/contexts/LanguageContext';

const AccountSettings = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
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
      <div className="p-6 my-[60px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('settings.title')}</h1>
          <p className="text-muted-foreground">{t('settings.description')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                {t('settings.general')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-muted-foreground text-sm mb-2">{t('settings.defaultLanguage')}</label>
                <Select
                  value={settings.defaultLanguage}
                  onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}
                >
                  <SelectTrigger className="liquid-glass border-gray-200/50 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="liquid-glass border-gray-200/50">
                    <SelectItem value="ro">{t('language.ro')}</SelectItem>
                    <SelectItem value="en">{t('language.en')}</SelectItem>
                    <SelectItem value="ru">{t('language.ru')}</SelectItem>
                    <SelectItem value="es">{t('language.es')}</SelectItem>
                    <SelectItem value="fr">{t('language.fr')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-muted-foreground text-sm mb-2">{t('settings.defaultVoice')}</label>
                <Select
                  value={settings.defaultVoice}
                  onValueChange={(value) => setSettings({ ...settings, defaultVoice: value })}
                >
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
                  <label className="text-foreground text-sm font-medium">{t('settings.autoStart')}</label>
                  <p className="text-muted-foreground text-xs">{t('settings.autoStartDesc')}</p>
                </div>
                <Switch
                  checked={settings.autoStart}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoStart: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-foreground text-sm font-medium">{t('settings.notifications')}</label>
                  <p className="text-muted-foreground text-xs">{t('settings.notificationsDesc')}</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Volume2 className="w-5 h-5 mr-2" />
                {t('settings.audio')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-muted-foreground text-sm mb-2">
                  {t('settings.volume')} ({settings.volume}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => setSettings({ ...settings, volume: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200/50 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>

              <div>
                <label className="block text-muted-foreground text-sm mb-2">{t('settings.audioQuality')}</label>
                <Select defaultValue="high">
                  <SelectTrigger className="liquid-glass border-gray-200/50 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="liquid-glass border-gray-200/50">
                    <SelectItem value="low">{t('audio.low')}</SelectItem>
                    <SelectItem value="medium">{t('audio.medium')}</SelectItem>
                    <SelectItem value="high">{t('audio.high')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-muted-foreground text-sm mb-2">{t('settings.speechSpeed')}</label>
                <Select defaultValue="normal">
                  <SelectTrigger className="liquid-glass border-gray-200/50 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="liquid-glass border-gray-200/50">
                    <SelectItem value="slow">{t('speech.slow')}</SelectItem>
                    <SelectItem value="normal">{t('speech.normal')}</SelectItem>
                    <SelectItem value="fast">{t('speech.fast')}</SelectItem>
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
                {t('settings.privacy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-foreground text-sm font-medium">{t('settings.saveConversations')}</label>
                  <p className="text-muted-foreground text-xs">{t('settings.saveConversationsDesc')}</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-foreground text-sm font-medium">{t('settings.analyzeConversations')}</label>
                  <p className="text-muted-foreground text-xs">{t('settings.analyzeConversationsDesc')}</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-foreground text-sm font-medium">{t('settings.shareData')}</label>
                  <p className="text-muted-foreground text-xs">{t('settings.shareDataDesc')}</p>
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
                {t('settings.accountInfo')}
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
                <label className="block text-muted-foreground text-sm mb-2">{t('settings.currentPlan')}</label>
                <div className="flex items-center justify-between p-3 liquid-glass rounded border border-gray-200/50">
                  <span className="text-foreground">Plan Starter</span>
                  <Button size="sm" className="glass-button bg-accent/90 hover:bg-accent text-white">
                    {t('settings.upgrade')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button className="glass-button bg-accent/90 hover:bg-accent text-white">
            {t('settings.saveSettings')}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
