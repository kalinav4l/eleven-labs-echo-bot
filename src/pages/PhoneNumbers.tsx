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
  country_code: string;
  
  // Inbound Configuration
  origination_uri: string;
  inbound_media_encryption: string;
  
  // Outbound Configuration
  outbound_address: string;
  transport_type: string;
  outbound_media_encryption: string;
  custom_headers: string;
  
  // Authentication (Optional)
  sip_username: string;
  sip_password: string;
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
    country_code: '+373',
    origination_uri: 'sip:sip.rtc.elevenlabs.io:5060;transport=tcp',
    inbound_media_encryption: 'allowed',
    outbound_address: '',
    transport_type: 'TLS',
    outbound_media_encryption: 'allowed',
    custom_headers: '',
    sip_username: '',
    sip_password: ''
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
      const sipData = {
        phone_number: `${formData.country_code}${formData.phone_number}`,
        label: formData.label,
        sip_config: {
          inbound: {
            origination_uri: formData.origination_uri,
            media_encryption: formData.inbound_media_encryption
          },
          outbound: {
            address: formData.outbound_address,
            transport_type: formData.transport_type,
            media_encryption: formData.outbound_media_encryption,
            custom_headers: formData.custom_headers
          },
          authentication: {
            username: formData.sip_username,
            password: formData.sip_password
          }
        }
      };

      const response = await fetch('https://api.elevenlabs.io/v1/convai/phone-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': 'conv_01jzssz233fw29c0rb1zcfmja7'
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
          country_code: '+373',
          origination_uri: 'sip:sip.rtc.elevenlabs.io:5060;transport=tcp',
          inbound_media_encryption: 'allowed',
          outbound_address: '',
          transport_type: 'TLS',
          outbound_media_encryption: 'allowed',
          custom_headers: '',
          sip_username: '',
          sip_password: ''
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
                  <div className="flex gap-2">
                    <Select value={formData.country_code} onValueChange={(value) => handleInputChange('country_code', value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <div className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone_number"
                      placeholder="794 16 481"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      className="flex-1"
                    />
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
                  Forward calls to the ElevenLabs SIP server
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origination_uri">Origination URI</Label>
                    <Select value={formData.origination_uri} onValueChange={(value) => handleInputChange('origination_uri', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sip:sip.rtc.elevenlabs.io:5060;transport=tcp">
                          sip:sip.rtc.elevenlabs.io:5060;transport=tcp
                        </SelectItem>
                        <SelectItem value="sip:sip.rtc.elevenlabs.io:5060;transport=udp">
                          sip:sip.rtc.elevenlabs.io:5060;transport=udp
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                      placeholder="w"
                      value={formData.outbound_address}
                      onChange={(e) => handleInputChange('outbound_address', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Hostname or IP the SIP INVITE is sent to. This is not a SIP URI and shouldn't contain the sip: protocol.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transport_type">Transport Type</Label>
                      <Select value={formData.transport_type} onValueChange={(value) => handleInputChange('transport_type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TLS">TLS</SelectItem>
                          <SelectItem value="TCP">TCP</SelectItem>
                          <SelectItem value="UDP">UDP</SelectItem>
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

                  <div className="space-y-2">
                    <Label htmlFor="custom_headers">Custom Headers (Optional)</Label>
                    <Textarea
                      id="custom_headers"
                      placeholder="Add custom SIP headers to be included with outbound calls."
                      value={formData.custom_headers}
                      onChange={(e) => handleInputChange('custom_headers', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Authentication */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Authentication (Optional)</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Provide digest authentication credentials if required by your SIP trunk provider. If left empty, ACL authentication will be used (you'll need to allowlist ElevenLabs IPs).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sip_username">SIP Trunk Username</Label>
                    <Input
                      id="sip_username"
                      placeholder="Username for SIP digest authentication"
                      value={formData.sip_username}
                      onChange={(e) => handleInputChange('sip_username', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sip_password">SIP Trunk Password</Label>
                    <Input
                      id="sip_password"
                      type="password"
                      placeholder="Password for SIP digest authentication"
                      value={formData.sip_password}
                      onChange={(e) => handleInputChange('sip_password', e.target.value)}
                    />
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
          <h3 className="font-semibold mb-3 text-blue-900">Important Notes:</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• <strong>Inbound:</strong> Configure your provider to forward calls to ElevenLabs SIP server</li>
            <li>• <strong>Outbound:</strong> ElevenLabs will send calls to your specified address</li>
            <li>• <strong>Authentication:</strong> Use digest auth credentials or configure IP allowlisting</li>
            <li>• <strong>Encryption:</strong> TLS transport provides secure call handling</li>
            <li>• <strong>Headers:</strong> Add custom SIP headers for advanced routing</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}