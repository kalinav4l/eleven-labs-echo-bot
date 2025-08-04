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
import { ContactsManager } from '@/components/outbound/ContactsManager';
interface Contact {
  id: string;
  name: string;
  phone: string;
  country: string;
  location: string;
  info?: string;
}
interface SMSConfig {
  enabled: boolean;
  apiToken: string;
  senderId: string;
  message: string;
  delay: number;
}
const Outbound = () => {
  const {
    user
  } = useAuth();
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
  const {
    data: phoneNumbers
  } = useUserPhoneNumbers();
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
    reader.onload = e => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('nume'));
      const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('telefon'));
      const countryIndex = headers.findIndex(h => h.includes('country') || h.includes('tara'));
      const locationIndex = headers.findIndex(h => h.includes('location') || h.includes('locatie'));
      const infoIndex = headers.findIndex(h => h.includes('info') || h.includes('informatii'));
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
          location: locationIndex >= 0 ? values[locationIndex] || 'Necunoscut' : 'Necunoscut',
          info: infoIndex >= 0 ? values[infoIndex] || undefined : undefined
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
    const csvContent = "nume,telefon,info,locatie,tara\nJohn Doe,+40712345678,Client important - preferă dimineața,Bucuresti,Romania\nJane Smith,+40798765432,Antreprenor local - interesat de servicii premium,Cluj,Romania";
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_contacte.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return <DashboardLayout>
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Mobile Responsive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Apeluri Automate</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Automatizează conversațiile cu clienții tăi</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={downloadTemplate} className="flex items-center justify-center gap-2 w-full sm:w-auto">
              <Upload className="w-4 h-4" />
              Template
            </Button>
            <Button className="flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
              <Play className="w-4 h-4" />
              Începe
            </Button>
          </div>
        </div>

        {/* Mobile Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Main Content - Full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {!activeSection && <div className="text-center py-16 px-8">
                  {/* Phone Icon */}
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Phone className="w-10 h-10 text-blue-600" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Automatizează apelurile</h2>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Automatizează conversațiile cu multiple contacte simultan
                  </p>
                  
                  <div className="flex justify-center gap-4">
                    <Button onClick={() => setActiveSection('batch')} className="bg-black text-white hover:bg-gray-800 px-6 py-2">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurează
                    </Button>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="border-gray-300 px-6 py-2">
                      <Upload className="w-4 h-4 mr-2" />
                      Încarcă CSV
                    </Button>
                  </div>
                </div>}

              {/* Configuration Section */}
              {activeSection === 'batch' && <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Configurare Campanie</h2>
                    <Button variant="outline" size="sm" onClick={() => setActiveSection(null)}>
                      ← Înapoi
                    </Button>
                  </div>

                  {contacts.length === 0 ? <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Încarcă Lista de Contacte</h3>
                      <p className="text-gray-500 mb-4">Selectează un fișier CSV cu contactele pentru apeluri</p>
                      <div className="flex justify-center gap-3">
                        <Button onClick={() => fileInputRef.current?.click()}>
                          Selectează CSV
                        </Button>
                        <Button variant="outline" onClick={downloadTemplate}>
                          Descarcă Template
                        </Button>
                      </div>
                    </div> : <div className="space-y-6">
                      {/* Contacts Overview */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">Lista Contacte</h3>
                            <p className="text-sm text-gray-600">{contacts.length} contacte încărcate</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleSelectAll}>
                            {selectedContacts.size === contacts.length ? 'Deselectează tot' : 'Selectează tot'}
                          </Button>
                        </div>
                      </div>

                      {/* Contacts List */}
                      <div className="border rounded-lg max-h-64 overflow-y-auto">
                        {contacts.map((contact, index) => <div key={contact.id} className={`p-4 flex items-center gap-3 transition-colors ${index !== contacts.length - 1 ? 'border-b' : ''} ${selectedContacts.has(contact.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                            <input type="checkbox" checked={selectedContacts.has(contact.id)} onChange={e => handleContactSelect(contact.id, e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{contact.name}</div>
                              <div className="text-sm text-gray-500">{contact.phone}</div>
                            </div>
                            <div className="text-xs text-gray-400">{contact.country}</div>
                          </div>)}
                      </div>
                      
                      {/* Start Campaign Button */}
                      {selectedContacts.size > 0 && selectedAgentId && selectedPhoneId && <Button onClick={handleBatchProcess} className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
                          🚀 Începe Campania ({selectedContacts.size} contacte)
                        </Button>}
                      
                      {selectedContacts.size > 0 && (!selectedAgentId || !selectedPhoneId) && <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-amber-800 text-sm">
                            ⚠️ Configurează agentul și numărul de telefon în panoul din dreapta pentru a începe campania
                          </p>
                        </div>}
                    </div>}
                </div>}

              {/* History Section */}
              {activeSection === 'history' && <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Istoric Apeluri</h2>
                    <Button variant="outline" size="sm" onClick={() => setActiveSection(null)}>
                      ← Înapoi
                    </Button>
                  </div>
                  <CallHistoryTab callHistory={callHistory} isLoading={historyLoading} />
                </div>}

              {/* Contacts Management Section */}
              {activeSection === 'contacts' && <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Gestionare Contacte</h2>
                    <Button variant="outline" size="sm" onClick={() => setActiveSection(null)}>
                      ← Înapoi
                    </Button>
                  </div>
                  <ContactsManager />
                </div>}
            </div>
          </div>

          {/* Sidebar - Full width on mobile, 1/3 on desktop */}
          <div className="space-y-4 order-1 lg:order-2">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Acțiuni Rapide</h3>
              <div className="space-y-2">
                <button onClick={() => setActiveSection('batch')} className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${activeSection === 'batch' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">Apeluri în Lot</span>
                  </div>
                </button>
                
                <button onClick={() => fileInputRef.current?.click()} className="w-full p-3 rounded-lg text-left hover:bg-gray-50 border border-gray-200 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Import CSV</span>
                  </div>
                </button>
                
                <button onClick={() => setActiveSection('history')} className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${activeSection === 'history' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <History className="w-4 h-4" />
                    <span className="text-sm font-medium">Istoric</span>
                  </div>
                </button>
                
                <button onClick={() => setActiveSection('contacts')} className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${activeSection === 'contacts' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">Gestionare Contacte</span>
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
            />

            {/* Statistics */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Statistici</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Contacte încărcate</span>
                  <span className="font-semibold text-gray-900">{contacts.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Contacte selectate</span>
                  <span className="font-semibold text-blue-600">{selectedContacts.size}</span>
                </div>
              </div>
            </div>

            {/* Batch Status */}
            {(isProcessingBatch || currentProgress > 0) && <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Status Campanie</h3>
                <BatchStatusPanel isProcessing={isProcessingBatch} isPaused={isPaused} isStopped={isStopped} currentProgress={currentProgress} totalCalls={totalCalls} callStatuses={callStatuses} currentCallStatus={currentCallStatus} startTime={batchStartTime} onPause={pauseBatch} onResume={resumeBatch} onStop={stopBatch} />
              </div>}
          </div>
        </div>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
      </div>
    </DashboardLayout>;
};
export default Outbound;