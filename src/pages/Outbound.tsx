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
    isPaused,
    isStopped,
    currentProgress,
    totalCalls,
    callStatuses,
    currentCallStatus,
    pauseBatch,
    resumeBatch,
    stopBatch
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Apeluri Automate</h1>
            <p className="text-muted-foreground">Automatizează conversațiile cu clienții tăi</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadTemplate}>
              <Upload className="w-4 h-4 mr-2" />
              Template
            </Button>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Începe
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border p-6">
              {!activeSection && (
                <div className="text-center py-12">
                  <Phone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Automatizează apelurile</h3>
                  <p className="text-muted-foreground mb-6">
                    Automatizează conversațiile cu multiple contacte simultan
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button onClick={() => setActiveSection('batch')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Configurează
                    </Button>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Încarcă CSV
                    </Button>
                  </div>
                </div>
              )}

              {activeSection === 'batch' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Configurare Apeluri</h3>
                  {contacts.length === 0 ? (
                    <CSVUploadSection 
                      onFileSelect={() => fileInputRef.current?.click()} 
                      onDownloadTemplate={downloadTemplate}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Contacte ({contacts.length})</h4>
                        <Button variant="outline" size="sm" onClick={handleSelectAll}>
                          {selectedContacts.size === contacts.length ? 'Deselectează tot' : 'Selectează tot'}
                        </Button>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {contacts.map((contact) => (
                          <div
                            key={contact.id}
                            className={`p-3 rounded-lg border transition-colors ${
                              selectedContacts.has(contact.id) ? 'border-primary bg-primary/5' : 'border-border'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedContacts.has(contact.id)}
                                onChange={(e) => handleContactSelect(contact.id, e.target.checked)}
                                className="w-4 h-4"
                              />
                              <div>
                                <div className="font-medium text-sm">{contact.name}</div>
                                <div className="text-xs text-muted-foreground">{contact.phone}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {selectedContacts.size > 0 && (
                        <Button onClick={handleBatchProcess} className="w-full">
                          Începe apelurile ({selectedContacts.size} contacte)
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'history' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Istoric Apeluri</h3>
                  <CallHistoryTab callHistory={callHistory} isLoading={historyLoading} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-medium mb-3">Acțiuni Rapide</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSection('batch')}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    activeSection === 'batch' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">Apeluri în Lot</span>
                  </div>
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3 rounded-lg text-left hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Import CSV</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveSection('history')}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    activeSection === 'history' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    <span className="text-sm">Istoric</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Configuration Panel */}
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

            {/* Statistics */}
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-medium mb-3">Statistici</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contacte încărcate</span>
                  <span>{contacts.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contacte selectate</span>
                  <span>{selectedContacts.size}</span>
                </div>
              </div>
            </div>

            {/* Batch Status */}
            {(isProcessingBatch || currentProgress > 0) && (
              <BatchStatusPanel 
                isProcessing={isProcessingBatch}
                isPaused={isPaused}
                isStopped={isStopped}
                currentProgress={currentProgress}
                totalCalls={totalCalls}
                callStatuses={callStatuses}
                currentCallStatus={currentCallStatus}
                startTime={batchStartTime}
                onPause={pauseBatch}
                onResume={resumeBatch}
                onStop={stopBatch}
              />
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          className="hidden"
        />
      </div>
    </DashboardLayout>
  );
};

export default Outbound;