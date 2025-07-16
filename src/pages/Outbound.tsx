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
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-7xl mx-auto p-6">
          {/* Modern Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Apeluri Automate
                </h1>
                <p className="text-muted-foreground text-lg">
                  Gestionează și lansează apeluri în lot către clienții tăi
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Template
                </Button>
                <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80">
                  <Play className="w-4 h-4" />
                  Începe
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Actions */}
            <div className="col-span-3 space-y-4">
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4">Acțiuni Rapide</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveSection('batch')}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                      activeSection === 'batch'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted/50 hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activeSection === 'batch' ? 'bg-white/20' : 'bg-primary/10'
                      }`}>
                        <Phone className={`w-5 h-5 ${activeSection === 'batch' ? 'text-white' : 'text-primary'}`} />
                      </div>
                      <div>
                        <div className="font-medium">Apeluri în Lot</div>
                        <div className={`text-sm ${activeSection === 'batch' ? 'text-white/80' : 'text-muted-foreground'}`}>
                          Configurează și lansează
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-4 rounded-xl text-left transition-all duration-200 bg-muted/50 hover:bg-muted text-foreground"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <div className="font-medium">Import CSV</div>
                        <div className="text-sm text-muted-foreground">Încarcă contacte</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveSection('history')}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                      activeSection === 'history'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted/50 hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activeSection === 'history' ? 'bg-white/20' : 'bg-blue-500/10'
                      }`}>
                        <History className={`w-5 h-5 ${activeSection === 'history' ? 'text-white' : 'text-blue-500'}`} />
                      </div>
                      <div>
                        <div className="font-medium">Istoric</div>
                        <div className={`text-sm ${activeSection === 'history' ? 'text-white/80' : 'text-muted-foreground'}`}>
                          Vezi apelurile
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4">Statistici</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Contacte încărcate</span>
                    <span className="font-medium text-foreground">{contacts.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Contacte selectate</span>
                    <span className="font-medium text-primary">{selectedContacts.size}</span>
                  </div>
                  {isProcessingBatch && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Progres</span>
                      <span className="font-medium text-emerald-500">{currentProgress}/{totalCalls}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center Column - Main Content */}
            <div className="col-span-6">
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {!activeSection && (
                  <div className="p-12 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Phone className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      Automatizează apelurile
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Lansează apeluri automate către multiple contacte simultan cu AI-ul nostru avansat
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveSection('batch')} 
                        className="gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Configurează
                      </Button>
                      <Button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="gap-2 bg-gradient-to-r from-primary to-primary/80"
                      >
                        <Upload className="w-4 h-4" />
                        Începe cu CSV
                      </Button>
                    </div>
                  </div>
                )}

                {activeSection === 'batch' && (
                  <div className="p-6">
                    {contacts.length === 0 ? (
                      <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Încarcă contactele tale
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Selectează un fișier CSV cu contactele pentru a începe procesul de apeluri automate
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          <Button 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()} 
                            className="gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Selectează CSV
                          </Button>
                          <Button 
                            variant="ghost" 
                            onClick={downloadTemplate} 
                            className="gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Template
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-foreground">
                            Contacte Încărcate ({contacts.length})
                          </h3>
                          <Button
                            variant="outline"
                            onClick={handleSelectAll}
                            size="sm"
                            className="gap-2"
                          >
                            {selectedContacts.size === contacts.length ? 'Deselectează Tot' : 'Selectează Tot'}
                          </Button>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {contacts.map((contact) => (
                            <div
                              key={contact.id}
                              className={`p-4 rounded-xl border transition-all duration-200 ${
                                selectedContacts.has(contact.id)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-muted-foreground'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedContacts.has(contact.id)}
                                  onChange={(e) => handleContactSelect(contact.id, e.target.checked)}
                                  className="w-4 h-4 rounded border-border"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-foreground">{contact.name}</div>
                                  <div className="text-sm text-muted-foreground">{contact.phone}</div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {contact.country}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-border">
                          <Button 
                            onClick={handleBatchProcess}
                            disabled={!selectedAgentId || !selectedPhoneId || selectedContacts.size === 0 || isProcessingBatch}
                            className="w-full py-3 bg-gradient-to-r from-primary to-primary/80"
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
                                Lansează Apelurile ({selectedContacts.size})
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === 'history' && (
                  <div className="p-6">
                    <CallHistoryTab callHistory={callHistory} isLoading={historyLoading} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Configuration */}
            <div className="col-span-3">
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-6">Configurații</h3>
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
          </div>

          {/* Status Panel - Full Width at Bottom */}
          {(isProcessingBatch || callStatuses.length > 0) && (
            <div className="mt-8">
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <BatchStatusPanel 
                  isProcessing={isProcessingBatch}
                  currentProgress={currentProgress}
                  totalCalls={totalCalls}
                  callStatuses={callStatuses}
                  startTime={batchStartTime}
                />
              </div>
            </div>
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

export default Outbound;