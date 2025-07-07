import React, { useState } from 'react';
import { Settings, X, Globe, Palette, Volume2, Shield, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const SettingsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Settings Button - Fixed in bottom-left */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full bg-black text-white shadow-lg hover:bg-gray-800 transition-all duration-200"
        size="icon"
      >
        <Settings className="h-5 w-5" />
      </Button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4 bg-white p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Language Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Language</h3>
                </div>
                <Select defaultValue="ro">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ro">Română</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Appearance Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Appearance</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dark Mode</span>
                  <Switch />
                </div>
              </div>

              {/* Audio Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Audio</h3>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Volume</span>
                  <Slider defaultValue={[50]} max={100} step={1} />
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Notifications</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Push Notifications</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Updates</span>
                  <Switch />
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Privacy</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Analytics</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Collection</span>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <Button 
                onClick={() => setIsOpen(false)}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                Save Settings
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default SettingsPanel;