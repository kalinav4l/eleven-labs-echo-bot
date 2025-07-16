import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import { useCallInitiation } from '@/hooks/useCallInitiation';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useUserPhoneNumbers } from '@/hooks/useUserPhoneNumbers';
import { toast } from '@/hooks/use-toast';
import { Phone, Upload, History, Settings, Play } from 'lucide-react';

// Import refactored components
import { OutboundHeader } from '@/components/outbound/OutboundHeader';
import { CallHistoryTab } from '@/components/outbound/CallHistoryTab';
import { BatchConfigPanel } from '@/components/outbound/BatchConfigPanel';
import { BatchStatusPanel } from '@/components/outbound/BatchStatusPanel';
import { ContactsList } from '@/components/outbound/ContactsList';
import { CSVUploadSection } from '@/components/outbound/CSVUploadSection';

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
const Outbound = () => {
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

  return (
    <DashboardLayout>
      <div className="h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Apeluri în Lot
          </h1>
          <p className="text-muted-foreground text-sm">
            Configurează și lansează apeluri automate către mai multe contacte
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Actions & Config */}
          <div className="w-80 border-r bg-card/50 flex flex-col">
            {/* Quick Actions */}
            <div className="p-4 border-b">
              <h3 className="font-semibold text-foreground mb-3 text-sm">Acțiuni</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  size="sm"
                  className="w-full justify-start"
                >
                  Template CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveSection('history')}
                  size="sm"
                  className="w-full justify-start"
                >
                  <History className="w-4 h-4 mr-2" />
                  Istoric Apeluri
                </Button>
              </div>
            </div>

            {/* Configuration */}
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold text-foreground mb-3 text-sm">Configurații</h3>
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

            {/* Process Button */}
            <div className="p-4 border-t">
              <div className="space-y-3">
                {/* Statistics */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="font-medium">{contacts.length}</div>
                    <div className="text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center p-2 bg-primary/10 rounded">
                    <div className="font-medium text-primary">{selectedContacts.size}</div>
                    <div className="text-muted-foreground">Selectate</div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleBatchProcess}
                  disabled={!selectedAgentId || !selectedPhoneId || selectedContacts.size === 0 || isProcessingBatch}
                  className="w-full"
                  size="sm"
                >
                  {isProcessingBatch ? (
                    <>
                      <Phone className="w-4 h-4 mr-2 animate-pulse" />
                      Procesează... ({currentProgress}/{totalCalls})
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Lansează Apeluri ({selectedContacts.size})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Contact List */}
          <div className="flex-1 flex flex-col">
            {activeSection === 'history' ? (
              <div className="p-6 overflow-y-auto">
                <CallHistoryTab callHistory={callHistory} isLoading={historyLoading} />
              </div>
            ) : (
              <>
                {/* Contact List Header */}
                <div className="p-4 border-b bg-card/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">
                      Lista Contacte ({contacts.length})
                    </h3>
                    {contacts.length > 0 && (
                      <Button
                        variant="ghost"
                        onClick={handleSelectAll}
                        size="sm"
                        className="text-xs"
                      >
                        {selectedContacts.size === contacts.length ? 'Deselectează Tot' : 'Selectează Tot'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Contact List Content */}
                <div className="flex-1 overflow-y-auto">
                  {contacts.length === 0 ? (
                    <div className="h-full flex items-center justify-center p-8">
                      <div className="text-center max-w-sm">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">
                          Încarcă contactele
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Selectează un fișier CSV cu contactele pentru a începe
                        </p>
                        <Button 
                          onClick={() => fileInputRef.current?.click()} 
                          size="sm"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Selectează CSV
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 space-y-2">
                      {contacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`p-3 rounded-lg border transition-all cursor-pointer ${
                            selectedContacts.has(contact.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-muted-foreground'
                          }`}
                          onClick={() => handleContactSelect(contact.id, !selectedContacts.has(contact.id))}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedContacts.has(contact.id)}
                              onChange={() => {}}
                              className="w-4 h-4 rounded border-border pointer-events-none"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground text-sm truncate">{contact.name}</div>
                              <div className="text-sm text-muted-foreground">{contact.phone}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {contact.country}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status Panel - Bottom */}
        {(isProcessingBatch || callStatuses.length > 0) && (
          <div className="border-t bg-card/50">
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
    </DashboardLayout>
  );
};

export default Outbound;