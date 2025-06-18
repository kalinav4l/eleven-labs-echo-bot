
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Key, AlertTriangle, CheckCircle, Globe, Clock, FileText } from 'lucide-react';

interface SecurityCenterProps {
  onChanges?: (hasChanges: boolean) => void;
}

const SecurityCenter = ({ onChanges }: SecurityCenterProps) => {
  const [securityScore] = useState(85);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [dataRetention, setDataRetention] = useState('12');
  const [whitelistIPs, setWhitelistIPs] = useState(['192.168.1.0/24', '10.0.0.0/8']);
  const [newIP, setNewIP] = useState('');

  const [auditLogs] = useState([
    {
      id: 1,
      action: 'Login successful',
      user: 'ion.popescu@company.com',
      ip: '192.168.1.100',
      timestamp: '2024-01-15 14:30:25',
      status: 'success'
    },
    {
      id: 2,
      action: 'Settings modified',
      user: 'maria.ionescu@company.com',
      ip: '10.0.1.50',
      timestamp: '2024-01-15 13:45:12',
      status: 'info'
    },
    {
      id: 3,
      action: 'Failed login attempt',
      user: 'unknown@malicious.com',
      ip: '203.45.67.89',
      timestamp: '2024-01-15 12:15:33',
      status: 'warning'
    }
  ]);

  const getSecurityLevel = (score: number) => {
    if (score >= 90) return { level: 'Excelent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 75) return { level: 'Bun', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 60) return { level: 'Mediu', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Slab', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const securityLevel = getSecurityLevel(securityScore);

  const addWhitelistIP = () => {
    if (newIP && !whitelistIPs.includes(newIP)) {
      setWhitelistIPs([...whitelistIPs, newIP]);
      setNewIP('');
      onChanges?.(true);
    }
  };

  const removeWhitelistIP = (ip: string) => {
    setWhitelistIPs(whitelistIPs.filter(item => item !== ip));
    onChanges?.(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Centru de securitate</h2>
        <p className="text-gray-600">Monitorizează și configurează setările de securitate</p>
      </div>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Scor de securitate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{securityScore}/100</span>
                <Badge className={`${securityLevel.color} ${securityLevel.bg}`}>
                  {securityLevel.level}
                </Badge>
              </div>
              <Progress value={securityScore} className="mb-2" />
              <p className="text-sm text-gray-600">
                Securitatea ta este la nivel {securityLevel.level.toLowerCase()}. 
                Urmează recomandările pentru a îmbunătăți scorul.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Listă de verificare securitate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium">Autentificare cu doi factori</h4>
                  <p className="text-sm text-gray-600">Activată pentru toate conturile admin</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Complet</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <h4 className="font-medium">Politici de parolă puternică</h4>
                  <p className="text-sm text-gray-600">Configurează cerințe minime pentru parole</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Configurează</Button>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <h4 className="font-medium">Lista albă IP</h4>
                  <p className="text-sm text-gray-600">Restricționează accesul la IP-uri de încredere</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Activează</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Setări autentificare
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Autentificare cu doi factori</h4>
              <p className="text-sm text-gray-600">Activează 2FA pentru securitate suplimentară</p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={(checked) => {
                setTwoFactorEnabled(checked);
                onChanges?.(true);
              }}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Timeout sesiune (minute)</Label>
            <Select value={sessionTimeout} onValueChange={(value) => {
              setSessionTimeout(value);
              onChanges?.(true);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minute</SelectItem>
                <SelectItem value="30">30 minute</SelectItem>
                <SelectItem value="60">1 oră</SelectItem>
                <SelectItem value="120">2 ore</SelectItem>
                <SelectItem value="480">8 ore</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* IP Whitelist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Lista albă IP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Restricționare accesul după IP</h4>
              <p className="text-sm text-gray-600">Permite accesul doar din IP-uri de încredere</p>
            </div>
            <Switch
              checked={ipWhitelistEnabled}
              onCheckedChange={(checked) => {
                setIpWhitelistEnabled(checked);
                onChanges?.(true);
              }}
            />
          </div>

          {ipWhitelistEnabled && (
            <>
              <Separator />
              
              <div className="space-y-2">
                <Label>Adaugă IP sau rețea</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="192.168.1.0/24"
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                  />
                  <Button onClick={addWhitelistIP}>Adaugă</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>IP-uri permise</Label>
                <div className="space-y-2">
                  {whitelistIPs.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-mono text-sm">{ip}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWhitelistIP(ip)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Elimină
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Politici de retenție date
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Păstrează datele pentru (luni)</Label>
            <Select value={dataRetention} onValueChange={(value) => {
              setDataRetention(value);
              onChanges?.(true);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 luni</SelectItem>
                <SelectItem value="6">6 luni</SelectItem>
                <SelectItem value="12">12 luni</SelectItem>
                <SelectItem value="24">24 luni</SelectItem>
                <SelectItem value="36">36 luni</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Notă:</strong> Datele vor fi șterse automat după perioada specificată pentru a respecta reglementările GDPR.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Jurnal de audit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    log.status === 'success' ? 'bg-green-500' :
                    log.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{log.action}</p>
                    <p className="text-xs text-gray-600">{log.user} • {log.ip}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Vezi toate log-urile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityCenter;
