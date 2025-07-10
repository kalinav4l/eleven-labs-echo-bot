import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { useCallInitiation } from '@/hooks/useCallInitiation';
import { useCallHistory } from '@/hooks/useCallHistory';
import { toast } from '@/components/ui/use-toast';

// Import refactored components
import { OutboundHeader } from '@/components/outbound/OutboundHeader';
import { AgentIdInput } from '@/components/outbound/AgentIdInput';
import { SingleCallTab } from '@/components/outbound/SingleCallTab';
import { BatchTab } from '@/components/outbound/BatchTab';
import { CallHistoryTab } from '@/components/outbound/CallHistoryTab';
interface Contact {
  id: string;
  name: string;
  phone: string;
  country: string;
  location: string;
}
const Outbound = () => {
  const {
    user
  } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [agentId, setAgentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const {
    initiateCall,
    processBatchCalls,
    isInitiating,
    isProcessingBatch,
    currentProgress,
    totalCalls,
    currentContact,
    callStatuses,
    currentCallStatus
  } = useCallInitiation({
    agentId,
    phoneNumber
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
  const handleSingleCall = async () => {
    if (!agentId.trim() || !phoneNumber.trim()) {
      toast({
        title: "Eroare",
        description: "Agent ID și numărul de telefon sunt obligatorii",
        variant: "destructive"
      });
      return;
    }
    const conversationId = await initiateCall(agentId, phoneNumber, contactName || phoneNumber);
    if (conversationId) {
      toast({
        title: "Procesare",
        description: "Apelul a fost inițiat. Se monitorizează statusul în timp real..."
      });

      // The call will be automatically saved to history in useCallInitiation hook
      // Just refresh after a short delay
      setTimeout(() => {
        refetchHistory();
      }, 2000);
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
    if (!agentId.trim() || selectedContacts.size === 0) {
      toast({
        title: "Eroare",
        description: "Agent ID și contactele selectate sunt obligatorii",
        variant: "destructive"
      });
      return;
    }
    const contactsToProcess = contacts.filter(c => selectedContacts.has(c.id));
    await processBatchCalls(contactsToProcess, agentId);

    // Calls will be automatically saved to history in useCallInitiation hook
    // Refresh history after processing completes
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
  return <DashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-8">
            <OutboundHeader />

            {/* Debug Panel - Show Error Logs */}
            {(isInitiating || isProcessingBatch || callStatuses.some(s => s.status === 'failed')) && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4">Debug Logs - Monitorizare Erori</h3>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium text-red-700">Status curent:</span> {currentCallStatus}
                  </div>
                  {currentContact && (
                    <div className="text-sm">
                      <span className="font-medium text-red-700">Contact procesat:</span> {currentContact}
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium text-red-700">Agent ID:</span> {agentId || 'NU ESTE SETAT'}
                  </div>
                  {isProcessingBatch && (
                    <div className="text-sm">
                      <span className="font-medium text-red-700">Progres:</span> {currentProgress}/{totalCalls}
                    </div>
                  )}
                  
                  {/* Failed calls details */}
                  {callStatuses.filter(s => s.status === 'failed').length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-red-700 mb-2">Apeluri eșuate:</h4>
                      <div className="space-y-2">
                        {callStatuses.filter(s => s.status === 'failed').map(status => (
                          <div key={status.contactId} className="bg-red-100 p-3 rounded-xl text-sm">
                            <div className="font-medium">{status.contactName}</div>
                            <div>Status: {status.status}</div>
                            {status.startTime && (
                              <div>Început: {status.startTime.toLocaleTimeString()}</div>
                            )}
                            {status.endTime && (
                              <div>Sfârșit: {status.endTime.toLocaleTimeString()}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 p-3 bg-yellow-100 rounded-xl">
                    <h4 className="font-medium text-yellow-800 mb-2">Verificați:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Agent ID este completat și valid</li>
                      <li>• Numerele de telefon sunt în format internațional (+40...)</li>
                      <li>• API key ElevenLabs este valid</li>
                      <li>• Agentul există în contul ElevenLabs</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Configuration Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurare Agent</h2>
              <AgentIdInput agentId={agentId} setAgentId={setAgentId} />
              {!agentId.trim() && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800">
                    ⚠️ Agent ID este obligatoriu pentru inițierea apelurilor
                  </p>
                </div>
              )}
            </div>

            {/* Call Management Section */}
            <div className="bg-white border border-gray-200 rounded-2xl">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900">Management Apeluri</h2>
                <p className="text-sm text-gray-600 mt-1">Inițiați apeluri individuale sau în batch și monitorizați istoricul</p>
              </div>
              
              <Tabs defaultValue="single" className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-gray-200 bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="single" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent bg-transparent px-6 py-4"
                  >
                    Apel Individual
                  </TabsTrigger>
                  <TabsTrigger 
                    value="batch" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent bg-transparent px-6 py-4"
                  >
                    Apeluri Batch
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent bg-transparent px-6 py-4"
                  >
                    Istoric Apeluri
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="single" className="p-6">
                  <SingleCallTab contactName={contactName} setContactName={setContactName} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} handleSingleCall={handleSingleCall} agentId={agentId} isInitiating={isInitiating} />
                </TabsContent>

                <TabsContent value="batch" className="p-6">
                  <BatchTab contacts={contacts} selectedContacts={selectedContacts} onContactSelect={handleContactSelect} onSelectAll={handleSelectAll} onFileSelect={() => fileInputRef.current?.click()} onDownloadTemplate={downloadTemplate} onBatchProcess={handleBatchProcess} agentId={agentId} isProcessingBatch={isProcessingBatch} currentProgress={currentProgress} totalCalls={totalCalls} currentCallStatus={currentCallStatus} callStatuses={callStatuses} />
                </TabsContent>

                <TabsContent value="history" className="p-6">
                  <CallHistoryTab callHistory={callHistory} isLoading={historyLoading} />
                </TabsContent>
              </Tabs>
            </div>

            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          </div>
        </div>
      </div>
    </DashboardLayout>;
};
export default Outbound;