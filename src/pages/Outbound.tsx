import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Phone, Activity, TrendingUp, FileText, Settings, Play, Pause, BarChart3, Plus, Eye, Edit, Trash2, Upload, History, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserAgents } from '@/hooks/useUserAgents';
import { CSVUploadSection } from '@/components/outbound/CSVUploadSection';
import { CallHistoryTab } from '@/components/outbound/CallHistoryTab';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { LiveCampaignCard } from '@/components/outbound/LiveCampaignCard';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  agent_id: string | null;
  sms_enabled: boolean | null;
  sms_message: string | null;
  status: string | null;
  total_contacts: number | null;
  called_contacts: number | null;
  successful_calls: number | null;
  failed_calls: number | null;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  country: string;
  location: string;
}

const Outbound = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    agent_id: '',
    sms_enabled: false,
    sms_message: ''
  });
  
  const { callHistory, isLoading } = useCallHistory();
  const { data: agents = [] } = useUserAgents();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Load campaigns
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCampaigns((data || []) as Campaign[]);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu s-au putut încărca campaniile"
      });
    }
  };

  const createCampaign = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          ...campaignForm,
          user_id: user.id,
          total_contacts: contacts.length
        }])
        .select()
        .single();

      if (error) throw error;

      // If we have contacts, insert them into campaign_contacts
      if (contacts.length > 0) {
        const { error: contactsError } = await supabase
          .from('campaign_contacts')
          .insert(
            contacts.map(contact => ({
              campaign_id: data.id,
              phone_number: contact.phone,
              contact_name: contact.name
            }))
          );

        if (contactsError) {
          console.error('Error inserting contacts:', contactsError);
          // Continue even if contacts insertion fails
        }
      }

      setCampaigns([data as Campaign, ...campaigns]);
      setIsCreateCampaignOpen(false);
      setContacts([]);
      setCampaignForm({
        name: '',
        description: '',
        agent_id: '',
        sms_enabled: false,
        sms_message: ''
      });
      
      toast({
        title: "Succes",
        description: `Campania a fost creată cu succes${contacts.length > 0 ? ` cu ${contacts.length} contacte` : ''}`
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu s-a putut crea campania"
      });
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      setCampaigns(campaigns.filter(c => c.id !== campaignId));
      toast({
        title: "Succes",
        description: "Campania a fost ștearsă"
      });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu s-a putut șterge campania"
      });
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: Campaign['status']) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status })
        .eq('id', campaignId);

      if (error) throw error;

      setCampaigns(campaigns.map(c => 
        c.id === campaignId ? { ...c, status } : c
      ));
      
      toast({
        title: "Succes",
        description: `Campania a fost ${status === 'active' ? 'pornită' : 'oprită'}`
      });
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu s-a putut actualiza statusul campaniei"
      });
    }
  };

  const stats = [
    { label: 'Total Campanii', value: campaigns.length.toString(), icon: FileText, change: '+12%', trend: 'up' as const },
    { label: 'Apeluri Realizate', value: campaigns.reduce((sum, c) => sum + (c.called_contacts || 0), 0).toString(), icon: Phone, change: '+5%', trend: 'up' as const },
    { label: 'Rata Succes', value: '68%', icon: Activity, change: '+3%', trend: 'up' as const },
    { label: 'Campanii Active', value: campaigns.filter(c => c.status === 'active').length.toString(), icon: TrendingUp, change: '+8%', trend: 'up' as const },
  ];

  const renderCampaignsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Campaniile Tale</h3>
        <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Campanie Nouă
            </Button>
          </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Creează Campanie Nouă</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <Label htmlFor="name">Nume Campanie</Label>
                  <Input
                    id="name"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                    placeholder="Ex: Campania Q1 2025"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descriere</Label>
                  <Textarea
                    id="description"
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                    placeholder="Descrierea campaniei..."
                  />
                </div>
                <div>
                  <Label htmlFor="agent">Agent</Label>
                  <Select
                    value={campaignForm.agent_id}
                    onValueChange={(value) => setCampaignForm({...campaignForm, agent_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează agentul" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.elevenlabs_agent_id || agent.agent_id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* CSV Upload Section */}
                <div className="space-y-3 border rounded-lg p-4 bg-muted/10">
                  <Label>Baza de Date Contacte</Label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <input
                         type="file"
                         ref={fileInputRef}
                         onChange={handleNewCampaignFileSelect}
                         accept=".csv"
                         className="hidden"
                       />
                       <Button
                         type="button"
                         variant="outline"
                         onClick={() => fileInputRef.current?.click()}
                         className="gap-2"
                       >
                         <Upload className="w-4 h-4" />
                         {contacts.length > 0 ? 'Schimbă CSV' : 'Selectează CSV'}
                       </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={downloadTemplate}
                        className="gap-2 text-blue-600"
                      >
                        <Download className="w-4 h-4" />
                        Template
                      </Button>
                    </div>
                    {contacts.length > 0 && (
                      <span className="text-sm text-green-600 font-medium">
                        {contacts.length} contacte încărcate
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    CSV-ul trebuie să conțină coloanele: nume, telefon, tara, locatie
                  </p>
                  
                  {/* Preview contacts */}
                  {contacts.length > 0 && (
                    <div className="mt-3">
                      <Label className="text-sm">Preview Contacte:</Label>
                      <div className="max-h-32 overflow-y-auto border rounded mt-1 p-2 bg-background">
                        {contacts.slice(0, 5).map((contact, index) => (
                          <div key={index} className="text-sm py-1 border-b last:border-b-0">
                            <span className="font-medium">{contact.name}</span> - {contact.phone} ({contact.country})
                          </div>
                        ))}
                        {contacts.length > 5 && (
                          <div className="text-sm text-muted-foreground mt-1">
                            ...și încă {contacts.length - 5} contacte
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sms"
                    checked={campaignForm.sms_enabled}
                    onCheckedChange={(checked) => setCampaignForm({...campaignForm, sms_enabled: checked})}
                  />
                  <Label htmlFor="sms">Activează SMS</Label>
                </div>
                {campaignForm.sms_enabled && (
                  <div>
                    <Label htmlFor="sms_message">Mesaj SMS</Label>
                    <Textarea
                      id="sms_message"
                      value={campaignForm.sms_message}
                      onChange={(e) => setCampaignForm({...campaignForm, sms_message: e.target.value})}
                      placeholder="Mesajul SMS care va fi trimis..."
                    />
                  </div>
                )}
                <Button 
                  onClick={createCampaign} 
                  className="w-full"
                  disabled={!campaignForm.name || !campaignForm.agent_id}
                >
                  {contacts.length > 0 
                    ? `Creează Campania cu ${contacts.length} contacte` 
                    : 'Creează Campania'
                  }
                </Button>
              </div>
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold">{campaign.name}</h4>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status === 'active' ? 'Activă' : campaign.status === 'paused' ? 'Pauzată' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{campaign.description}</p>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Contacte:</span>
                      <div className="font-medium">{campaign.total_contacts || 0}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Apelate:</span>
                      <div className="font-medium">{campaign.called_contacts || 0}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reușite:</span>
                      <div className="font-medium">{campaign.successful_calls || 0}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">SMS:</span>
                      <div className="font-medium">{campaign.sms_enabled ? 'Da' : 'Nu'}</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {campaign.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCampaignStatus(campaign.id, 'active')}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setActiveTab('import');
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteCampaign(campaign.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {campaigns.length === 0 && (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nicio campanie încă</h3>
              <p className="text-muted-foreground mb-4">Creează prima ta campanie pentru a începe</p>
              <Button onClick={() => setIsCreateCampaignOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Creează Prima Campanie
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const downloadTemplate = () => {
    const csvContent = "nume,telefon,tara,locatie\nJohn Doe,+40712345678,Romania,Bucuresti\nJane Smith,+40798765432,Romania,Cluj";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_contacte.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNewCampaignFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('nume'));
      const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('telefon'));
      const countryIndex = headers.findIndex(h => h.includes('country') || h.includes('tara'));
      const locationIndex = headers.findIndex(h => h.includes('location') || h.includes('locatie'));

      if (phoneIndex === -1) {
        toast({
          variant: "destructive",
          title: "Eroare",
          description: "CSV-ul trebuie să conțină o coloană pentru telefon"
        });
        return;
      }

      const parsedContacts = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        return {
          id: `temp-${index}`,
          name: nameIndex >= 0 ? values[nameIndex] || 'Contact' : 'Contact',
          phone: values[phoneIndex] || '',
          country: countryIndex >= 0 ? values[countryIndex] || 'Romania' : 'Romania',
          location: locationIndex >= 0 ? values[locationIndex] || 'Necunoscut' : 'Necunoscut'
        };
      }).filter(contact => contact.phone);

      setContacts(parsedContacts);
      toast({
        title: "Succes",
        description: `S-au încărcat ${parsedContacts.length} contacte`
      });
    };
    reader.readAsText(file);
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      if (!selectedCampaign) {
        toast({
          variant: "destructive",
          title: "Eroare",
          description: "Selectează o campanie mai întâi"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('nume'));
        const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('telefon'));

        if (phoneIndex === -1) {
          toast({
            variant: "destructive",
            title: "Eroare",
            description: "CSV-ul trebuie să conțină o coloană pentru telefon"
          });
          return;
        }

        const contacts = lines.slice(1).map((line) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          return {
            phone_number: values[phoneIndex] || '',
            contact_name: nameIndex >= 0 ? values[nameIndex] || 'Contact' : 'Contact'
          };
        }).filter(contact => contact.phone_number);

        try {
          const { data: insertedContacts, error } = await supabase
            .from('campaign_contacts')
            .insert(
              contacts.map(contact => ({
                campaign_id: selectedCampaign.id,
                phone_number: contact.phone_number,
                contact_name: contact.contact_name
              }))
            );

          if (error) throw error;

          // Update campaign total_contacts
          await supabase
            .from('campaigns')
            .update({ total_contacts: contacts.length })
            .eq('id', selectedCampaign.id);

          toast({
            title: "Succes",
            description: `S-au adăugat ${contacts.length} contacte în campanie`
          });

          loadCampaigns();
        } catch (error) {
          console.error('Error importing contacts:', error);
          toast({
            variant: "destructive",
            title: "Eroare",
            description: "Nu s-au putut importa contactele"
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'campaigns':
        return renderCampaignsTab();
      case 'import':
        return (
          <div className="space-y-6">
            {selectedCampaign ? (
              <div className="mb-4 p-4 bg-primary/10 rounded-lg">
                <h4 className="font-medium">Campania selectată: {selectedCampaign.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedCampaign.description}</p>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">Selectează o campanie din tab-ul "Campanii" pentru a importa contacte.</p>
              </div>
            )}
            <CSVUploadSection onFileSelect={handleFileSelect} onDownloadTemplate={downloadTemplate} />
          </div>
        );
      case 'live':
        return renderLiveCallsTab();
      case 'history':
        return <CallHistoryTab callHistory={callHistory} isLoading={isLoading} />;
      default:
        return renderCampaignsTab();
    }
  };

  const renderLiveCallsTab = () => {
    const activeCampaigns = campaigns.filter(c => c.status === 'active');

    if (activeCampaigns.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Phone className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nicio Campanie Activă</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Nu există campanii active în acest moment. Mergi la tab-ul "Campanii" pentru a activa o campanie.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Apeluri Live</h3>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {activeCampaigns.length} campanii active
          </Badge>
        </div>

        {activeCampaigns.map((campaign) => (
          <LiveCampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Campanii Outbound
            </h1>
            <p className="text-muted-foreground text-lg">
              Creează și gestionează campaniile tale de apeluri automate
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Stats */}
            <div className="col-span-3 space-y-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/90 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                            {stat.change}
                          </p>
                        </div>
                        <div className="p-3 rounded-full bg-primary/10">
                          <stat.icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Main Content */}
            <div className="col-span-9">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/95 min-h-[600px]">
                <CardHeader>
                  <div className="flex space-x-2 border-b border-border/50 pb-4">
                    {[
                      { id: 'campaigns', label: 'Campanii', icon: FileText },
                      { id: 'live', label: 'Apeluri Live', icon: Phone },
                      { id: 'import', label: 'Import CSV', icon: Upload },
                      { id: 'history', label: 'Istoric Apeluri', icon: History },
                    ].map((tab) => (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? 'default' : 'ghost'}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderMainContent()}
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Outbound;