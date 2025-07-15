import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Settings, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SMSConfig {
  enabled: boolean;
  apiToken: string;
  senderId: string;
  message: string;
  delay: number; // delay in minutes after call ends
}

interface SMSConfigSectionProps {
  config: SMSConfig;
  onConfigChange: (config: SMSConfig) => void;
}

export const SMSConfigSection: React.FC<SMSConfigSectionProps> = ({
  config,
  onConfigChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editConfig, setEditConfig] = useState<SMSConfig>(config);
  const { toast } = useToast();

  const handleSave = () => {
    if (editConfig.enabled && (!editConfig.apiToken || !editConfig.message)) {
      toast({
        title: "Eroare",
        description: "Token API și mesajul sunt obligatorii pentru SMS",
        variant: "destructive"
      });
      return;
    }

    onConfigChange(editConfig);
    setIsEditing(false);
    
    toast({
      title: "Salvat",
      description: "Configurația SMS a fost salvată cu succes",
    });
  };

  const handleCancel = () => {
    setEditConfig(config);
    setIsEditing(false);
  };

  const defaultMessage = `Mulțumim pentru timpul acordat! Conversația de astăzi va fi procesată și veți primi un răspuns în cel mai scurt timp posibil. 

Pentru întrebări suplimentare, nu ezitați să ne contactați.

Cu respect,
Echipa ${editConfig.senderId || 'AiChat'}`;

  return (
    <Card className="border-2 border-gray-100">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>SMS După Apel</span>
            <Badge variant={config.enabled ? "default" : "secondary"} className="text-xs">
              {config.enabled ? "Activat" : "Dezactivat"}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="h-8 w-8 p-0"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            {/* SMS Enable/Disable */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Activează SMS-uri automate
              </label>
              <Switch
                checked={editConfig.enabled}
                onCheckedChange={(checked) => 
                  setEditConfig({ ...editConfig, enabled: checked })
                }
              />
            </div>

            {editConfig.enabled && (
              <>
                {/* API Token */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    SMS.to API Token
                  </label>
                  <Input
                    type="password"
                    placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
                    value={editConfig.apiToken}
                    onChange={(e) => 
                      setEditConfig({ ...editConfig, apiToken: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Token-ul API pentru serviciul SMS.to
                  </p>
                </div>

                {/* Sender ID */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Sender ID
                  </label>
                  <Input
                    placeholder="aichat"
                    value={editConfig.senderId}
                    onChange={(e) => 
                      setEditConfig({ ...editConfig, senderId: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500">
                    ID-ul expeditorului (max 11 caractere)
                  </p>
                </div>

                {/* Delay */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Întârzierea (minute)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    value={editConfig.delay}
                    onChange={(e) => 
                      setEditConfig({ ...editConfig, delay: parseInt(e.target.value) || 0 })
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Câte minute să aștepte după sfârșitul apelului
                  </p>
                </div>

                {/* Message Template */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Mesaj Template
                  </label>
                  <Textarea
                    placeholder={defaultMessage}
                    value={editConfig.message}
                    onChange={(e) => 
                      setEditConfig({ ...editConfig, message: e.target.value })
                    }
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    Mesajul care va fi trimis clienților după apel
                  </p>
                </div>

                {/* Use Default Message Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => 
                    setEditConfig({ ...editConfig, message: defaultMessage })
                  }
                >
                  Folosește mesajul implicit
                </Button>
              </>
            )}

            {/* Save/Cancel Buttons */}
            <div className="flex space-x-2 pt-4 border-t">
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Salvează
              </Button>
              <Button variant="outline" onClick={handleCancel} size="sm">
                Anulează
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Display Current Config */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant={config.enabled ? "default" : "secondary"}>
                  {config.enabled ? "Activat" : "Dezactivat"}
                </Badge>
              </div>
              
              {config.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sender ID:</span>
                    <span className="text-sm font-medium">{config.senderId || 'aichat'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Întârziere:</span>
                    <span className="text-sm font-medium">{config.delay} minute</span>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm text-gray-600">Mesaj:</span>
                    <div className="text-xs bg-gray-50 p-2 rounded border max-h-20 overflow-y-auto">
                      {config.message || defaultMessage}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};