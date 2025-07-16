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
        <div className="flex max-w-7xl mx-auto">
          {/* Sidebar */}
          <div className="w-64 bg-card border-r border-border p-4">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">Apeluri</h2>
              <p className="text-sm text-muted-foreground">Gestionează apelurile automate</p>
            </div>
            
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('batch')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === 'batch' 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Phone className="w-4 h-4" />
                Apel în lot
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === 'upload' 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
              
              <button
                onClick={() => setActiveSection('history')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === 'history' 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <History className="w-4 h-4" />
                Istoric
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {activeSection === 'batch' && 'Apeluri în lot'}
                  {activeSection === 'history' && 'Istoric apeluri'}
                  {activeSection === 'contacts' && 'Contacte'}
                  {!activeSection && 'Apeluri automate'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeSection === 'batch' && 'Configurează și lansează apeluri către multiple contacte'}
                  {activeSection === 'history' && 'Vezi toate apelurile efectuate'}
                  {activeSection === 'contacts' && 'Gestionează contactele încărcate'}
                  {!activeSection && 'Alege o opțiune din meniul lateral pentru a începe'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Template CSV
                </Button>
                {activeSection && (
                  <Button variant="outline" onClick={() => setActiveSection(null)}>
                    Înapoi
                  </Button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-card rounded-xl border border-border">
              {/* Default State */}
              {!activeSection && (
                <div className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                      <Phone className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      Începe să automatizezi apelurile
                    </h3>
                    <p className="text-muted-foreground mb-8">
                      Selectează o opțiune din meniul lateral pentru a configura 
                      și lansa apeluri automate către clienții tăi.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <Button variant="outline" onClick={() => setActiveSection('batch')} className="gap-2">
                        <Phone className="w-4 h-4" />
                        Configurează apeluri
                      </Button>
                      <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                        <Upload className="w-4 h-4" />
                        Încarcă contacte
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Batch Configuration */}
              {activeSection === 'batch' && (
                <div className="flex">
                  {/* Main Content */}
                  <div className="flex-1 p-6">
                    {contacts.length === 0 ? (
                      <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Încarcă contacte pentru a începe
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Selectează un fișier CSV cu contactele tale sau înregistrează audio pentru test
                        </p>
                        <div className="flex items-center justify-center gap-4">
                          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                            <Upload className="w-4 h-4" />
                            Selectează CSV
                          </Button>
                          <span className="text-muted-foreground">sau</span>
                          <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                            <Upload className="w-4 h-4" />
                            Descarcă template
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <ContactsList 
                          contacts={contacts}
                          selectedContacts={selectedContacts}
                          onContactSelect={handleContactSelect}
                          onSelectAll={handleSelectAll}
                          isProcessingBatch={isProcessingBatch}
                        />
                        
                        <div className="pt-4 border-t border-border">
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
                                Lansează apelurile ({selectedContacts.size} contacte)
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Settings Panel */}
                  <div className="w-80 border-l border-border p-6 bg-muted/30">
                    <h3 className="font-semibold text-foreground mb-4">Configurări</h3>
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
                  </div>
                </div>
              )}

              {/* History */}
              {activeSection === 'history' && (
                <div className="p-6">
                  <CallHistoryTab callHistory={callHistory} isLoading={historyLoading} />
                </div>
              )}

              {/* Contacts */}
              {activeSection === 'contacts' && contacts.length > 0 && (
                <div className="p-6">
                  <ContactsList 
                    contacts={contacts}
                    selectedContacts={selectedContacts}
                    onContactSelect={handleContactSelect}
                    onSelectAll={handleSelectAll}
                    isProcessingBatch={isProcessingBatch}
                  />
                </div>
              )}
            </div>

            {/* Batch Status Panel */}
            {(isProcessingBatch || callStatuses.length > 0) && (
              <div className="mt-6">
                <BatchStatusPanel 
                  isProcessing={isProcessingBatch}
                  currentProgress={currentProgress}
                  totalCalls={totalCalls}
                  callStatuses={callStatuses}
                  startTime={batchStartTime}
                />
              </div>
            )}
          </div>

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