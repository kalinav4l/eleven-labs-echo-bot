import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { useCallInitiation } from '@/hooks/useCallInitiation';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useUserPhoneNumbers } from '@/hooks/useUserPhoneNumbers';
import { toast } from '@/hooks/use-toast';
import { Phone, Upload, History, Play, Settings } from 'lucide-react';

// Import existing components
import { BatchConfigPanel } from '@/components/outbound/BatchConfigPanel';
import { ContactsList } from '@/components/outbound/ContactsList';
import { CallHistoryTab } from '@/components/outbound/CallHistoryTab';
import { BatchStatusPanel } from '@/components/outbound/BatchStatusPanel';

interface Contact {
  id: string;
  name: string;
  phone: string;
  country: string;
  location: string;
}

interface SMSConfig {
  enabled: boolean;
  apiToken: string;
  senderId: string;
  message: string;
  delay: number;
}

const Calls = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // State for configuration
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedPhoneId, setSelectedPhoneId] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [batchStartTime, setBatchStartTime] = useState<Date | undefined>();
  const [smsConfig, setSmsConfig] = useState<SMSConfig>({
    enabled: false,
    apiToken: '',
    senderId: 'aichat',
    message: '',
    delay: 2
  });

  // Get user's phone numbers
  const { data: phoneNumbers } = useUserPhoneNumbers();
  const {
    processBatchCalls,
    isProcessingBatch,
    currentProgress,
    totalCalls,
    callStatuses
  } = useCallInitiation({
    agentId: selectedAgentId,
    phoneNumber: '',
    smsConfig: smsConfig
  });
  const {
    callHistory,
    isLoading: historyLoading,
    refetch: refetchHistory
  } = useCallHistory();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Eroare",
        description: "Vă rugăm să selectați un fișier CSV.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('nume'));
      const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('telefon'));
      const countryIndex = headers.findIndex(h => h.includes('country') || h.includes('tara'));
      const locationIndex = headers.findIndex(h => h.includes('location') || h.includes('locatie'));

      if (phoneIndex === -1) {
        toast({
          title: "Eroare",
          description: "CSV-ul trebuie să conțină o coloană pentru telefon (phone/telefon).",
          variant: "destructive"
        });
        return;
      }

      const parsedContacts: Contact[] = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        return {
          id: `contact-${index}`,
          name: nameIndex >= 0 ? values[nameIndex] || `Contact ${index + 1}` : `Contact ${index + 1}`,
          phone: values[phoneIndex] || '',
          country: countryIndex >= 0 ? values[countryIndex] || 'Necunoscut' : 'Necunoscut',
          location: locationIndex >= 0 ? values[locationIndex] || 'Necunoscut' : 'Necunoscut'
        };
      }).filter(contact => contact.phone);

      setContacts(parsedContacts);
      setActiveSection('contacts');
      toast({
        title: "Succes",
        description: `S-au încărcat ${parsedContacts.length} contacte din CSV.`
      });
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContactSelect = (contactId: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) {
      newSelected.add(contactId);
    } else {
      newSelected.delete(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map(c => c.id)));
    }
  };

  const handleBatchProcess = async () => {
    if (!selectedAgentId || selectedContacts.size === 0) {
      toast({
        title: "Eroare",
        description: "Trebuie să selectați un agent și cel puțin un contact",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedPhoneId) {
      toast({
        title: "Eroare",
        description: "Trebuie să selectați un număr de telefon pentru apeluri",
        variant: "destructive"
      });
      return;
    }

    setBatchStartTime(new Date());
    const contactsToProcess = contacts.filter(c => selectedContacts.has(c.id));
    await processBatchCalls(contactsToProcess, selectedAgentId);
    
    setTimeout(() => {
      refetchHistory();
    }, 2000);
  };

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

  const serviceCards = [
    {
      icon: Phone,
      title: 'Apeluri Batch',
      description: 'Automatizează apelurile către multiple contacte',
      price: 'De la $0.02/min',
      badge: null,
      onClick: () => setActiveSection('batch')
    },
    {
      icon: Upload,
      title: 'Import CSV',
      description: 'Încarcă contacte în format CSV',
      price: 'Gratuit',
      badge: null,
      onClick: () => fileInputRef.current?.click()
    },
    {
      icon: History,
      title: 'Istoric Apeluri',
      description: 'Vezi istoricul apelurilor efectuate',
      price: 'Inclus',
      badge: null,
      onClick: () => setActiveSection('history')
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Apeluri Outbound</h1>
              <p className="text-muted-foreground">
                Gestionați apelurile automate cu monitorizare în timp real prin ElevenLabs API
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Cum funcționează
              </Button>
              <Button className="gap-2" onClick={() => setActiveSection('batch')}>
                <Play className="w-4 h-4" />
                Începe Apelul
              </Button>
            </div>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {serviceCards.map((service, index) => (
              <Card 
                key={index} 
                className="relative cursor-pointer hover:shadow-lg transition-all duration-200 border border-border"
                onClick={service.onClick}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    {service.badge && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                        {service.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                  <p className="text-sm font-medium text-foreground">{service.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Area */}
          {!activeSection && (
            <Card className="p-8 text-center bg-muted/30">
              <div className="max-w-md mx-auto">
                <div className="p-4 rounded-full bg-primary/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Automatizați apelurile către clienții dumneavoastră
                </h3>
                <p className="text-muted-foreground mb-6">
                  Echipa noastră de experți în AI vă va livra apeluri automate de calitate, 
                  gata să fie distribuite către audiența dumneavoastră.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                    <Upload className="w-4 h-4" />
                    Descarcă Template
                  </Button>
                  <Button onClick={() => setActiveSection('batch')} className="gap-2">
                    <Play className="w-4 h-4" />
                    Începe Apelurile
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Dynamic Content Based on Active Section */}
          {activeSection === 'batch' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Configurație Batch</h3>
                <BatchConfigPanel 
                  selectedAgentId={selectedAgentId}
                  onAgentSelect={setSelectedAgentId}
                  selectedPhoneId={selectedPhoneId}
                  onPhoneSelect={setSelectedPhoneId}
                  totalRecipients={contacts.length}
                  selectedRecipients={selectedContacts.size}
                  smsConfig={smsConfig}
                  onSMSConfigChange={setSmsConfig}
                />
              </Card>

              {contacts.length > 0 && (
                <Card className="p-6">
                  <ContactsList 
                    contacts={contacts}
                    selectedContacts={selectedContacts}
                    onContactSelect={handleContactSelect}
                    onSelectAll={handleSelectAll}
                    isProcessingBatch={isProcessingBatch}
                  />
                  
                  <div className="mt-6">
                    <Button 
                      onClick={handleBatchProcess}
                      disabled={!selectedAgentId || !selectedPhoneId || selectedContacts.size === 0 || isProcessingBatch}
                      className="w-full py-3"
                      size="lg"
                    >
                      {isProcessingBatch ? (
                        <>
                          <Phone className="w-4 h-4 mr-2 animate-pulse" />
                          Se procesează... ({currentProgress}/{totalCalls})
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4 mr-2" />
                          Începe Apelurile Batch ({selectedContacts.size} contacte)
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              )}

              {(isProcessingBatch || callStatuses.length > 0) && (
                <BatchStatusPanel 
                  isProcessing={isProcessingBatch}
                  currentProgress={currentProgress}
                  totalCalls={totalCalls}
                  callStatuses={callStatuses}
                  startTime={batchStartTime}
                />
              )}
            </div>
          )}

          {activeSection === 'history' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Istoric Apeluri</h3>
                <Button variant="outline" onClick={() => setActiveSection(null)}>
                  Înapoi
                </Button>
              </div>
              <CallHistoryTab callHistory={callHistory} isLoading={historyLoading} />
            </Card>
          )}

          {activeSection === 'contacts' && contacts.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Contacte Încărcate</h3>
                <Button variant="outline" onClick={() => setActiveSection(null)}>
                  Înapoi
                </Button>
              </div>
              <ContactsList 
                contacts={contacts}
                selectedContacts={selectedContacts}
                onContactSelect={handleContactSelect}
                onSelectAll={handleSelectAll}
                isProcessingBatch={isProcessingBatch}
              />
            </Card>
          )}

          <input 
            ref={fileInputRef} 
            type="file" 
            accept=".csv" 
            onChange={handleCSVUpload} 
            className="hidden" 
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calls;