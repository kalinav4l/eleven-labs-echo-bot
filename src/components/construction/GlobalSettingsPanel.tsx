import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Bot } from 'lucide-react';

interface GlobalSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    globalPrompt: string;
    globalVoice: string;
    company: string;
    timezone: string;
  };
  onUpdateSettings: (settings: any) => void;
}

export const GlobalSettingsPanel: React.FC<GlobalSettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="w-[600px] max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <CardTitle>Global Workflow Settings</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Configure global settings that apply to the entire workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="globalPrompt">Global System Prompt</Label>
            <Textarea
              id="globalPrompt"
              placeholder="Define the global personality and behavior for all agents..."
              value={settings.globalPrompt}
              onChange={(e) => onUpdateSettings({ ...settings, globalPrompt: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="globalVoice">Default Voice</Label>
            <Select value={settings.globalVoice} onValueChange={(value) => onUpdateSettings({ ...settings, globalVoice: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select default voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sarah">Sarah (Professional)</SelectItem>
                <SelectItem value="michael">Michael (Friendly)</SelectItem>
                <SelectItem value="emma">Emma (Energetic)</SelectItem>
                <SelectItem value="david">David (Calm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              placeholder="Your Company Name"
              value={settings.company}
              onChange={(e) => onUpdateSettings({ ...settings, company: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={settings.timezone} onValueChange={(value) => onUpdateSettings({ ...settings, timezone: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="EST">Eastern Time</SelectItem>
                <SelectItem value="PST">Pacific Time</SelectItem>
                <SelectItem value="CET">Central European Time</SelectItem>
                <SelectItem value="EET">Eastern European Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};