import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, Phone, Plus, Settings, Globe, Lock, Trash2, Edit3, PhoneCall, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { PhoneTestCallModal } from '@/components/outbound/PhoneTestCallModal';
import DashboardLayout from '@/components/DashboardLayout';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
const countryCodes = [{
  code: '+1',
  country: 'US',
  flag: '🇺🇸'
}, {
  code: '+44',
  country: 'UK',
  flag: '🇬🇧'
}, {
  code: '+373',
  country: 'MD',
}, {
  code: '+40',
  country: 'RO',
  flag: '🇷🇴'
}];
type PhoneNumber = Tables<'phone_numbers'>;
export default function PhoneNumbers() {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedPhone, setExpandedPhone] = useState<string | null>(null);
  const [testCallModal, setTestCallModal] = useState<{isOpen: boolean, phone?: PhoneNumber}>({isOpen: false});
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

  // Load phone numbers on component mount
  useEffect(() => {
    loadPhoneNumbers();
  }, []);
  const loadPhoneNumbers = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('phone_numbers').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setPhoneNumbers(data || []);
    } catch (error) {
      console.error('Error loading phone numbers:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca numerele de telefon",
        variant: "destructive"
      });
    }
  };
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
          'xi-api-key': 'ELEVENLABS_API_KEY'
        },
        body: JSON.stringify(sipData)
      });
      const result = await response.json();
      if (response.ok) {
        // Get current user
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Nu sunteți autentificat');
        }

        // Save to database
        const {
          error: dbError
        } = await supabase.from('phone_numbers').insert({
          user_id: user.id,
          label: formData.label,
          phone_number: formData.phone_number,
          elevenlabs_phone_id: result.phone_number_id,
          outbound_address: formData.outbound_address,
          outbound_transport: formData.outbound_transport,
          outbound_username: formData.outbound_username,
          outbound_password: formData.outbound_password,
          outbound_media_encryption: formData.outbound_media_encryption,
          outbound_headers: headersObj,
          inbound_allowed_addresses: formData.inbound_allowed_addresses ? formData.inbound_allowed_addresses.split(',').map(s => s.trim()) : [],
          inbound_username: formData.inbound_username,
          inbound_password: formData.inbound_password,
          inbound_media_encryption: formData.inbound_media_encryption,
          inbound_allowed_numbers: formData.inbound_allowed_numbers ? formData.inbound_allowed_numbers.split(',').map(s => s.trim()) : []
        });
        if (dbError) {
          console.error('Database error:', dbError);
          toast({
            title: "Eroare",
            description: "Numărul a fost adăugat în ElevenLabs dar nu s-a putut salva local",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Succes!",
            description: "SIP Trunk a fost configurat cu succes"
          });

          // Reset form and reload numbers
          setFormData({
            label: '',
            phone_number: '',
            outbound_address: '',
            outbound_transport: 'tcp',
            outbound_username: '',
            outbound_password: '',
            outbound_media_encryption: 'allowed',
            outbound_headers: '',
            inbound_allowed_addresses: '',
            inbound_username: '',
            inbound_password: '',
            inbound_media_encryption: 'allowed',
            inbound_allowed_numbers: ''
          });
          setShowAddForm(false);
          loadPhoneNumbers();
        }
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
  const deletePhoneNumber = async (id: string) => {
    try {
      const {
        error
      } = await supabase.from('phone_numbers').delete().eq('id', id);
      if (error) throw error;
      toast({
        title: "Succes!",
        description: "Numărul de telefon a fost șters"
      });
      loadPhoneNumbers();
    } catch (error) {
      console.error('Error deleting phone number:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge numărul de telefon",
        variant: "destructive"
      });
    }
  };
  const connectAgent = async (phoneId: string, agentId: string) => {
    try {
      const {
        error
      } = await supabase.from('phone_numbers').update({
        connected_agent_id: agentId
      }).eq('id', phoneId);
      if (error) throw error;
      toast({
        title: "Succes!",
        description: "Agentul a fost conectat la numărul de telefon"
      });
      loadPhoneNumbers();
    } catch (error) {
      console.error('Error connecting agent:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut conecta agentul",
        variant: "destructive"
      });
    }
  };
  return <DashboardLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-6 w-6" />
                <h1 className="text-3xl font-bold">Phone Numbers</h1>
              </div>
              <p className="text-muted-foreground">
                Gestiona numerele de telefon SIP pentru agenții conversationali
              </p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="mr-2 h-4 w-4" />
              {showAddForm ? 'Anulează' : 'Adaugă număr'}
            </Button>
          </div>
        </div>

        {/* Lista numerelor existente */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Numerele tale</CardTitle>
            <CardDescription>
              {phoneNumbers.length} {phoneNumbers.length === 1 ? 'număr configurat' : 'numere configurate'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {phoneNumbers.length === 0 ? <div className="text-center py-8">
                <Phone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nu ai încă numere de telefon configurate.</p>
                <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adaugă primul număr
                </Button>
              </div> : <div className="space-y-4">
                {phoneNumbers.map(phone => <div key={phone.id} className="border rounded-2xl overflow-hidden">
                    {/* Collapsed View */}
                    <div className="p-6 cursor-pointer hover:bg-muted/50 flex items-center justify-between" onClick={() => setExpandedPhone(expandedPhone === phone.id ? null : phone.id)}>
                      <div className="flex items-center gap-4">
                        {expandedPhone === phone.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-xl">{phone.phone_number}</h3>
                            <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(phone.phone_number);
                                    toast({
                                      title: "Copiat!",
                                      description: "Numărul de telefon a fost copiat în clipboard"
                                    });
                                  }} />
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{phone.label}</p>
                          <div className="text-sm text-muted-foreground font-mono">
                            {phone.elevenlabs_phone_id || 'Nu este sincronizat cu ElevenLabs'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={e => {
                          e.stopPropagation();
                          setTestCallModal({isOpen: true, phone});
                        }}>
                          <PhoneCall className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={e => e.stopPropagation()}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={e => {
                    e.stopPropagation();
                    deletePhoneNumber(phone.id);
                  }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded View */}
                    {expandedPhone === phone.id && <div className="border-t bg-muted/20 p-6 space-y-8">
                        
                        {/* Agent Assignment */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Agent</h4>
                          <p className="text-sm text-muted-foreground">Assign an agent to handle calls to this phone number.</p>
                          <div className="flex items-center gap-2">
                            <Select value={phone.connected_agent_id || "no-agent"} onValueChange={(value) => {
                              if (value !== "no-agent") {
                                connectAgent(phone.id, value);
                              }
                            }}>
                              <SelectTrigger className="w-[280px] rounded-xl">
                                <SelectValue placeholder="No agent" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="no-agent">No agent</SelectItem>
                                {/* Add your agents here */}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* SIP Configuration */}
                        <div className="space-y-6">
                          {/* Inbound Configuration */}
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-muted rounded-xl p-3">
                                <Globe className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium mb-2">Inbound SIP Trunk Configuration</h4>
                                <p className="text-sm text-muted-foreground mb-6">You can use any of the following SIP servers to receive calls.</p>
                                
                                <div className="bg-background rounded-xl border p-6 space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <h5 className="text-sm font-medium">SIP Server TCP</h5>
                                        <div className="bg-muted rounded-lg p-1">
                                          <Globe className="h-3 w-3" />
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground font-mono">sip:sip.rtc.elevenlabs.io:5060;transport=tcp</p>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <h5 className="text-sm font-medium">SIP Server TLS</h5>
                                        <div className="bg-muted rounded-lg p-1">
                                          <Lock className="h-3 w-3" />
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground font-mono">sip:sip.rtc.elevenlabs.io:5061;transport=tls</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <h5 className="text-sm font-medium">Media Encryption</h5>
                                        <div className="bg-muted rounded-lg p-1">
                                          <Lock className="h-3 w-3" />
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{phone.inbound_media_encryption || 'Allowed (Default)'}</p>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <h5 className="text-sm font-medium">Allowed Addresses</h5>
                                        <div className="bg-muted rounded-lg p-1">
                                          <Globe className="h-3 w-3" />
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground">All addresses</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Outbound Configuration */}
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-muted rounded-xl p-3">
                                <Settings className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium mb-2">Outbound SIP Trunk Configuration</h4>
                                <p className="text-sm text-muted-foreground mb-6">Configuration details for this SIP Trunk phone number.</p>
                                
                                <div className="bg-background rounded-xl border p-6 space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <h5 className="text-sm font-medium">Address</h5>
                                        <div className="bg-muted rounded-lg p-1">
                                          <Globe className="h-3 w-3" />
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground font-mono">{phone.outbound_address || '193.53.40.79:5060'}</p>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <h5 className="text-sm font-medium">Transport Protocol</h5>
                                        <div className="bg-muted rounded-lg p-1">
                                          <Settings className="h-3 w-3" />
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground uppercase">{phone.outbound_transport || 'TCP'}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <h5 className="text-sm font-medium">Media Encryption</h5>
                                        <div className="bg-muted rounded-lg p-1">
                                          <Lock className="h-3 w-3" />
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{phone.outbound_media_encryption || 'Allowed (Default)'}</p>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <h5 className="text-sm font-medium">Authentication</h5>
                                        <div className="bg-muted rounded-lg p-1">
                                          <Lock className="h-3 w-3" />
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground">Username and password configured</p>
                                    </div>
                                  </div>
                                  
                                  {phone.outbound_username && (
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <h5 className="text-sm font-medium">Username</h5>
                                        <div className="bg-muted rounded-lg p-1">
                                          <Settings className="h-3 w-3" />
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground font-mono">{phone.outbound_username}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Adăugat la: {new Date(phone.created_at).toLocaleString('ro-RO')} | 
                          Ultima modificare: {new Date(phone.updated_at).toLocaleString('ro-RO')}
                        </div>
                      </div>}
                  </div>)}
              </div>}
          </CardContent>
        </Card>

        {/* Formularul de adăugare */}
        {showAddForm && <Card>
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
                    <Input id="label" placeholder="Easy to identify name of the phone number" value={formData.label} onChange={e => handleInputChange('label', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone number *</Label>
                    <Input id="phone_number" placeholder="+37378123378" value={formData.phone_number} onChange={e => handleInputChange('phone_number', e.target.value)} className="font-mono" />
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
                      <Input id="outbound_address" placeholder="example.com or 192.168.1.1" value={formData.outbound_address} onChange={e => handleInputChange('outbound_address', e.target.value)} />
                      <p className="text-xs text-muted-foreground">
                        Hostname or IP where calls will be forwarded
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="outbound_transport">Transport</Label>
                        <Select value={formData.outbound_transport} onValueChange={value => handleInputChange('outbound_transport', value)}>
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
                        <Select value={formData.outbound_media_encryption} onValueChange={value => handleInputChange('outbound_media_encryption', value)}>
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
                        <Input id="outbound_username" placeholder="SIP username" value={formData.outbound_username} onChange={e => handleInputChange('outbound_username', e.target.value)} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="outbound_password">Password (Optional)</Label>
                        <Input id="outbound_password" type="password" placeholder="SIP password" value={formData.outbound_password} onChange={e => handleInputChange('outbound_password', e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outbound_headers">Custom Headers (Optional)</Label>
                      <Textarea id="outbound_headers" placeholder='{"X-Custom-Header": "value", "X-Another": "value2"} or key:value per line' value={formData.outbound_headers} onChange={e => handleInputChange('outbound_headers', e.target.value)} rows={3} />
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
                      <Input id="inbound_allowed_addresses" placeholder="192.168.1.1, example.com (comma separated)" value={formData.inbound_allowed_addresses} onChange={e => handleInputChange('inbound_allowed_addresses', e.target.value)} />
                      <p className="text-xs text-muted-foreground">
                        IP addresses or hostnames allowed to send calls (leave empty to allow all)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inbound_allowed_numbers">Allowed Numbers (Optional)</Label>
                      <Input id="inbound_allowed_numbers" placeholder="+37378123378, +40721234567 (comma separated)" value={formData.inbound_allowed_numbers} onChange={e => handleInputChange('inbound_allowed_numbers', e.target.value)} />
                      <p className="text-xs text-muted-foreground">
                        Phone numbers allowed to call this number (leave empty to allow all)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="inbound_username">Username (Optional)</Label>
                        <Input id="inbound_username" placeholder="SIP username" value={formData.inbound_username} onChange={e => handleInputChange('inbound_username', e.target.value)} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inbound_password">Password (Optional)</Label>
                        <Input id="inbound_password" type="password" placeholder="SIP password" value={formData.inbound_password} onChange={e => handleInputChange('inbound_password', e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inbound_media_encryption">Media Encryption</Label>
                      <Select value={formData.inbound_media_encryption} onValueChange={value => handleInputChange('inbound_media_encryption', value)}>
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

                <div className="flex justify-end gap-2 pt-6">
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Anulează
                  </Button>
                  <Button type="submit" disabled={isLoading} className="min-w-[140px]">
                    {isLoading ? <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </> : <>
                        <Plus className="mr-2 h-4 w-4" />
                        Import
                      </>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>}

        {/* Test Call Modal */}
        <PhoneTestCallModal 
          isOpen={testCallModal.isOpen}
          onClose={() => setTestCallModal({isOpen: false})}
          phoneNumber={testCallModal.phone?.phone_number || ''}
          phoneLabel={testCallModal.phone?.label || ''}
        />
      </div>
    </DashboardLayout>;
}