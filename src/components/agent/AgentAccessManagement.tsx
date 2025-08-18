import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Key, Copy, Plus, X } from 'lucide-react';
import { AgentResponse } from '@/types/dtos';
import { toast } from '@/components/ui/use-toast';

interface AgentAccessManagementProps {
  agentData: AgentResponse;
  setAgentData: (data: AgentResponse) => void;
}

const AgentAccessManagement: React.FC<AgentAccessManagementProps> = ({ agentData, setAgentData }) => {
  const authSettings = agentData.platform_settings?.auth;
  const accessInfo = agentData.access_info;

  const updateAuthSettings = (field: string, value: any) => {
    setAgentData({
      ...agentData,
      platform_settings: {
        ...agentData.platform_settings,
        auth: {
          ...authSettings,
          [field]: value
        }
      }
    });
  };

  const updateAccessInfo = (field: string, value: any) => {
    setAgentData({
      ...agentData,
      access_info: {
        ...accessInfo,
        [field]: value
      }
    });
  };

  const generateShareableToken = () => {
    const token = 'token_' + Math.random().toString(36).substr(2, 16);
    updateAuthSettings('shareable_token', token);
    toast({
      title: "Token generat",
      description: "Un nou token de partajare a fost generat."
    });
  };

  const copyToken = () => {
    if (authSettings?.shareable_token) {
      navigator.clipboard.writeText(authSettings.shareable_token);
      toast({
        title: "Token copiat",
        description: "Token-ul a fost copiat în clipboard."
      });
    }
  };

  const addAllowedUser = (email: string) => {
    if (email.trim() && !authSettings?.allowlist?.some((item: any) => item.email === email.trim())) {
      const newUser = { email: email.trim(), role: 'user' };
      updateAuthSettings('allowlist', [...(authSettings?.allowlist || []), newUser]);
    }
  };

  const removeAllowedUser = (email: string) => {
    updateAuthSettings('allowlist', 
      authSettings?.allowlist?.filter((item: any) => item.email !== email) || []
    );
  };

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Users className="w-5 h-5" />
          Managementul Accesului
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configurează cine poate accesa și utiliza agentul.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-auth">Activează Autentificarea</Label>
              <p className="text-xs text-muted-foreground">
                Necesită autentificare pentru accesarea agentului.
              </p>
            </div>
            <Switch
              id="enable-auth"
              checked={authSettings?.enable_auth || false}
              onCheckedChange={(checked) => updateAuthSettings('enable_auth', checked)}
            />
          </div>

          {authSettings?.enable_auth && (
            <>
              <div className="space-y-2">
                <Label>Token Partajabil</Label>
                <div className="flex gap-2">
                  <Input
                    value={authSettings?.shareable_token || ''}
                    readOnly
                    placeholder="Nu este generat încă"
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToken}
                    disabled={!authSettings?.shareable_token}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateShareableToken}
                  >
                    <Key className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Token-ul poate fi folosit pentru accesul direct la agent fără autentificare suplimentară.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Utilizatori Autorizați</Label>
                <p className="text-xs text-muted-foreground">
                  Lista utilizatorilor care au acces la acest agent.
                </p>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {authSettings?.allowlist?.map((user: any, index: number) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {user.email}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removeAllowedUser(user.email)}
                      />
                    </Badge>
                  ))}
                </div>

                <Input
                  placeholder="Adaugă email utilizator și apasă Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAllowedUser(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-foreground mb-3">Informații Creator</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creator-name">Nume Creator</Label>
              <Input
                id="creator-name"
                value={accessInfo?.creator_name || ''}
                onChange={(e) => updateAccessInfo('creator_name', e.target.value)}
                placeholder="Numele creatorului"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creator-email">Email Creator</Label>
              <Input
                id="creator-email"
                type="email"
                value={accessInfo?.creator_email || ''}
                onChange={(e) => updateAccessInfo('creator_email', e.target.value)}
                placeholder="email@exemplu.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={accessInfo?.role || 'owner'}
                onValueChange={(value) => updateAccessInfo('role', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Proprietar</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Vizualizator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-creator"
                  checked={accessInfo?.is_creator || false}
                  onCheckedChange={(checked) => updateAccessInfo('is_creator', checked)}
                />
                <Label htmlFor="is-creator">Este Creator</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Marchează dacă această persoană este creatorul original al agentului.
              </p>
            </div>
          </div>
        </div>

        {!authSettings?.enable_auth && (
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              Agentul este public și poate fi accesat de oricine fără autentificare. 
              Activează autentificarea pentru a controla accesul.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentAccessManagement;