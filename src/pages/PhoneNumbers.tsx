import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, Phone, Plus, Settings, Globe, Lock } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface SIPTrunkData {
  // Basic info
  label: string;
  phone_number: string;
  
  // Outbound Configuration
  outbound_address: string;
  outbound_transport: string;
  outbound_username: string;
  outbound_password: string;
  outbound_media_encryption: string;
  outbound_headers: string;
  
  // Inbound Configuration
  inbound_allowed_addresses: string;
  inbound_username: string;
  inbound_password: string;
  inbound_media_encryption: string;
  inbound_allowed_numbers: string;
}

const countryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+373', country: 'MD', flag: '🇲🇩' },
  { code: '+40', country: 'RO', flag: '🇷🇴' },
];

export default function PhoneNumbers() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SIPTrunkData>({
    label: '',
    phone_number: '',
    
    // Outbound Configuration
    outbound_address: '',
    outbound_transport: 'tcp',
    outbound_username: '',
    outbound_password: '',
    outbound_media_encryption: 'allowed',
    outbound_headers: '',
    
    // Inbound Configuration  
    inbound_allowed_addresses: '',
    inbound_username: '',
    inbound_password: '',
    inbound_media_encryption: 'allowed',
    inbound_allowed_numbers: ''
  });

  const handleInputChange = (field: keyof SIPTrunkData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.label || !formData.phone_number) {
      toast({
        title: "Eroare",
        description: "Label și numărul de telefon sunt obligatorii",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Parse headers from string to object
      let headersObj = {};
      if (formData.outbound_headers.trim()) {
        try {
          headersObj = JSON.parse(formData.outbound_headers);
        } catch {
          // If not valid JSON, treat as key:value pairs separated by newlines
          const headerLines = formData.outbound_headers.split('\n');
          headerLines.forEach(line => {
            const [key, value] = line.split(':').map(s => s.trim());
            if (key && value) {
              headersObj[key] = value;
            }
          });
        }
      }

      const sipData = {
        phone_number: formData.phone_number,
        label: formData.label,
        provider: "sip_trunk",
        outbound_trunk_config: {
          address: formData.outbound_address,
          transport: formData.outbound_transport,
          credentials: {
            username: formData.outbound_username,
            password: formData.outbound_password
          },
          media_encryption: formData.outbound_media_encryption,
          headers: headersObj
        },
        inbound_trunk_config: {
          allowed_addresses: formData.inbound_allowed_addresses ? formData.inbound_allowed_addresses.split(',').map(s => s.trim()) : [],
          credentials: {
            username: formData.inbound_username,
            password: formData.inbound_password
          },
          media_encryption: formData.inbound_media_encryption,
          allowed_numbers: formData.inbound_allowed_numbers ? formData.inbound_allowed_numbers.split(',').map(s => s.trim()) : []
        }
      };

      const response = await fetch('https://api.elevenlabs.io/v1/convai/phone-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': 'sk_6443a64ab5f84bfe0c72941fd2d4f188317cdab4715a3925'
        },
        body: JSON.stringify(sipData)
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Succes!",
          description: "SIP Trunk a fost configurat cu succes",
        });
        
        // Reset form
        setFormData({
          label: '',
          phone_number: '',
          
          // Outbound Configuration
          outbound_address: '',
          outbound_transport: 'tcp',
          outbound_username: '',
          outbound_password: '',
          outbound_media_encryption: 'allowed',
          outbound_headers: '',
          
          // Inbound Configuration  
          inbound_allowed_addresses: '',
          inbound_username: '',
          inbound_password: '',
          inbound_media_encryption: 'allowed',
          inbound_allowed_numbers: ''
        });
      } else {
        throw new Error(result.message || 'A apărut o eroare');
      }
    } catch (error) {
      console.error('Error configuring SIP trunk:', error);
      toast({
        title: "Eroare",
        description: error instanceof Error ? error.message : "A apărut o eroare la configurarea SIP trunk-ului",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Import SIP Trunk</h1>
          </div>
          <p className="text-muted-foreground">
            Configurează un nou SIP trunk pentru agentul conversațional
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Configurare SIP Trunk
            </CardTitle>
            <CardDescription>
              Completează toate informațiile pentru a conecta un SIP trunk la sistemul conversațional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="label">Label *</Label>
                  <Input
                    id="label"
                    placeholder="Easy to identify name of the phone number"
                    value={formData.label}
                    onChange={(e) => handleInputChange('label', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone number *</Label>
                  <Input
                    id="phone_number"
                    placeholder="+37378123378"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code (e.g. +37378123378)
                  </p>
                </div>
              </div>

              <Separator />

              {/* Outbound Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Outbound Configuration</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Configure where ElevenLabs should send calls for your phone number
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="outbound_address">Address</Label>
                    <Input
                      id="outbound_address"
                      placeholder="example.com or 192.168.1.1"
                      value={formData.outbound_address}
                      onChange={(e) => handleInputChange('outbound_address', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Hostname or IP where calls will be forwarded
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="outbound_transport">Transport</Label>
                      <Select value={formData.outbound_transport} onValueChange={(value) => handleInputChange('outbound_transport', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tcp">TCP</SelectItem>
                          <SelectItem value="udp">UDP</SelectItem>
                          <SelectItem value="tls">TLS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outbound_media_encryption">Media Encryption</Label>
                      <Select value={formData.outbound_media_encryption} onValueChange={(value) => handleInputChange('outbound_media_encryption', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="allowed">Allowed</SelectItem>
                          <SelectItem value="required">Required</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="outbound_username">Username (Optional)</Label>
                      <Input
                        id="outbound_username"
                        placeholder="SIP username"
                        value={formData.outbound_username}
                        onChange={(e) => handleInputChange('outbound_username', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outbound_password">Password (Optional)</Label>
                      <Input
                        id="outbound_password"
                        type="password"
                        placeholder="SIP password"
                        value={formData.outbound_password}
                        onChange={(e) => handleInputChange('outbound_password', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outbound_headers">Custom Headers (Optional)</Label>
                    <Textarea
                      id="outbound_headers"
                      placeholder='{"X-Custom-Header": "value", "X-Another": "value2"} or key:value per line'
                      value={formData.outbound_headers}
                      onChange={(e) => handleInputChange('outbound_headers', e.target.value)}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      JSON object or key:value pairs (one per line)
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Inbound Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Inbound Configuration</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Configure security and access control for incoming calls
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inbound_allowed_addresses">Allowed Addresses (Optional)</Label>
                    <Input
                      id="inbound_allowed_addresses"
                      placeholder="192.168.1.1, example.com (comma separated)"
                      value={formData.inbound_allowed_addresses}
                      onChange={(e) => handleInputChange('inbound_allowed_addresses', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      IP addresses or hostnames allowed to send calls (leave empty to allow all)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inbound_allowed_numbers">Allowed Numbers (Optional)</Label>
                    <Input
                      id="inbound_allowed_numbers"
                      placeholder="+37378123378, +40721234567 (comma separated)"
                      value={formData.inbound_allowed_numbers}
                      onChange={(e) => handleInputChange('inbound_allowed_numbers', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Phone numbers allowed to call this number (leave empty to allow all)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inbound_username">Username (Optional)</Label>
                      <Input
                        id="inbound_username"
                        placeholder="SIP username"
                        value={formData.inbound_username}
                        onChange={(e) => handleInputChange('inbound_username', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inbound_password">Password (Optional)</Label>
                      <Input
                        id="inbound_password"
                        type="password"
                        placeholder="SIP password"
                        value={formData.inbound_password}
                        onChange={(e) => handleInputChange('inbound_password', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inbound_media_encryption">Media Encryption</Label>
                    <Select value={formData.inbound_media_encryption} onValueChange={(value) => handleInputChange('inbound_media_encryption', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="allowed">Allowed</SelectItem>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button type="submit" disabled={isLoading} className="min-w-[140px]">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Import
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold mb-3 text-blue-900">SIP Trunk Configuration Guide:</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• <strong>Phone Number:</strong> Include full international format (+37378123378)</li>
            <li>• <strong>Outbound:</strong> Configure where ElevenLabs forwards calls from your number</li>
            <li>• <strong>Inbound:</strong> Set security rules for who can call your number</li>
            <li>• <strong>Authentication:</strong> Optional SIP credentials for secure connections</li>
            <li>• <strong>Headers:</strong> Custom SIP headers for advanced routing and identification</li>
            <li>• <strong>Provider:</strong> Uses "sip_trunk" for direct SIP connections</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}