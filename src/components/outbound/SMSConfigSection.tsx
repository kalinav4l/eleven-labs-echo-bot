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
  onConfigChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editConfig, setEditConfig] = useState<SMSConfig>(config);
  const {
    toast
  } = useToast();
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
      description: "Configurația SMS a fost salvată cu succes"
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
  return <Card className="border-2 border-gray-100 mx-0 my-[18px] py-[30px] px-[11px]">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>SMS </span>
            <Badge variant={config.enabled ? "default" : "secondary"} className="text-xs">
              {config.enabled ? "Activat" : "Dezactivat"}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="h-8 w-8 p-0">
            {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      
    </Card>;
};