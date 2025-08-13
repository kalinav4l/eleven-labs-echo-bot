import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { useCallInitiation } from '@/hooks/useCallInitiation';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useUserPhoneNumbers } from '@/hooks/useUserPhoneNumbers';
import { toast } from '@/hooks/use-toast';
import { 
  Phone, 
  Upload, 
  History, 
  Settings, 
  Play, 
  Users, 
  CheckCircle, 
  Clock, 
  Target,
  FileText,
  BarChart3,
  ArrowRight,
  Download
} from 'lucide-react';

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
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Apeluri Automate
              </h1>
              <p className="text-slate-600 mt-2">
                Automatizează conversațiile cu clienții tăi folosind AI inteligent
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="flex items-center gap-2 hover:bg-blue-50 border-blue-200"
              >
                <Download className="w-4 h-4" />
                Template CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Contacte încărcate</p>
                  <p className="text-2xl font-bold">{contacts.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Contacte selectate</p>
                  <p className="text-2xl font-bold">{selectedContacts.size}</p>
                </div>
                <Target className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Agent configurat</p>
                  <p className="text-sm font-semibold">
                    {selectedAgentId ? "✓ Configurat" : "✗ Neconfigurat"}
                  </p>
                </div>
                <CheckCircle className={`w-8 h-8 ${selectedAgentId ? 'text-orange-200' : 'text-orange-300'}`} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Status campanie</p>
                  <p className="text-sm font-semibold">
                    {isProcessingBatch ? "În progres" : "Inactivă"}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Getting Started Card */}
            {!activeSection && (
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Phone className="w-12 h-12 text-white" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">
                      Începe o nouă campanie de apeluri
                    </h2>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                      Configurează-ți campania în 3 pași simpli și automatizează conversațiile cu clienții
                    </p>
                    
                    {/* Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-blue-600 font-bold">1</span>
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-2">Încarcă contacte</h3>
                        <p className="text-sm text-slate-600">Adaugă lista de contacte prin CSV</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-blue-600 font-bold">2</span>
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-2">Configurează</h3>
                        <p className="text-sm text-slate-600">Alege agentul și numărul de telefon</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-blue-600 font-bold">3</span>
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-2">Lansează</h3>
                        <p className="text-sm text-slate-600">Pornește campania automată</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 shadow-lg"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Începe cu CSV
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setActiveSection('batch')}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-3"
                      >
                        <Settings className="w-5 h-5 mr-2" />
                        Configurare manuală
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Campaign Configuration */}
            {activeSection === 'batch' && (
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader className="border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-slate-800">Configurare Campanie</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveSection(null)}
                      className="text-slate-600"
                    >
                      ← Înapoi
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {contacts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Upload className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-3">Încarcă lista de contacte</h3>
                      <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Pentru a începe campania, încarcă un fișier CSV cu contactele tale
                      </p>
                      <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Selectează fișier CSV
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={downloadTemplate}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descarcă template
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Contacts Overview */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                              <Users className="w-5 h-5 text-blue-600" />
                              Lista contacte
                            </h3>
                            <p className="text-slate-600 mt-1">
                              {contacts.length} contacte încărcate din CSV
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleSelectAll}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            {selectedContacts.size === contacts.length ? 'Deselectează tot' : 'Selectează tot'}
                          </Button>
                        </div>
                      </div>

                      {/* Contacts List */}
                      <div className="border border-slate-200 rounded-xl max-h-80 overflow-y-auto">
                        {contacts.map((contact, index) => (
                          <div 
                            key={contact.id} 
                            className={`p-4 flex items-center gap-4 transition-all duration-200 ${
                              index !== contacts.length - 1 ? 'border-b border-slate-100' : ''
                            } ${
                              selectedContacts.has(contact.id) 
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500' 
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={selectedContacts.has(contact.id)} 
                              onChange={(e) => handleContactSelect(contact.id, e.target.checked)} 
                              className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-slate-800">{contact.name}</div>
                              <div className="text-sm text-slate-600 flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                {contact.phone}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {contact.country}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      
                      {/* Campaign Launch */}
                      {selectedContacts.size > 0 && selectedAgentId && selectedPhoneId && (
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Gata de lansare
                              </h3>
                              <p className="text-emerald-700 text-sm">
                                Toate configurările sunt complete. Poți începe campania.
                              </p>
                            </div>
                          </div>
                          <Button 
                            onClick={handleBatchProcess} 
                            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-4 text-lg font-semibold shadow-lg"
                            disabled={isProcessingBatch}
                          >
                            {isProcessingBatch ? (
                              <>
                                <Clock className="w-5 h-5 mr-2 animate-spin" />
                                Procesare în curs...
                              </>
                            ) : (
                              <>
                                <Play className="w-5 h-5 mr-2" />
                                Lansează campania ({selectedContacts.size} contacte)
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      
                      {selectedContacts.size > 0 && (!selectedAgentId || !selectedPhoneId) && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                              <Settings className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-amber-800">Configurare incompletă</h3>
                              <p className="text-amber-700 text-sm">
                                Te rugăm să configurezi agentul și numărul de telefon în panoul din dreapta
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* History Section */}
            {activeSection === 'history' && (
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader className="border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Istoric apeluri
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveSection(null)}
                      className="text-slate-600"
                    >
                      ← Înapoi
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CallHistoryTab callHistory={callHistory} isLoading={historyLoading} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Acțiuni rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button 
                  onClick={() => setActiveSection('batch')} 
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                    activeSection === 'batch' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">Campanie nouă</div>
                      <div className="text-sm opacity-75">Configurează apeluri în lot</div>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </div>
                </button>
                
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-full p-4 rounded-xl text-left hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="font-semibold text-slate-800">Import contacte</div>
                      <div className="text-sm text-slate-600">Încarcă fișier CSV</div>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveSection('history')} 
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                    activeSection === 'history' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105' 
                      : 'hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">Istoric apeluri</div>
                      <div className="text-sm opacity-75">Vezi campaniile anterioare</div>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </div>
                </button>
              </CardContent>
            </Card>

            {/* Configuration Panel */}
            <BatchConfigPanel
              selectedAgentId={selectedAgentId}
              onAgentSelect={setSelectedAgentId}
              selectedPhoneId={selectedPhoneId}
              onPhoneSelect={setSelectedPhoneId}
              totalRecipients={contacts.length}
              selectedRecipients={selectedContacts.size}
            />

            {/* Batch Status */}
            {(isProcessingBatch || currentProgress > 0) && (
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Status campanie
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
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