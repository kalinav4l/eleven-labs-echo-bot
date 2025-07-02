import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { useCallInitiation } from '@/hooks/useCallInitiation';
import { useCallHistory } from '@/hooks/useCallHistory';
import { toast } from '@/components/ui/use-toast';

// Import componente refactorizate
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
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [agentId, setAgentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // Pentru apel individual
  const [contactName, setContactName] = useState(''); // Pentru apel individual
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  // Noul hook conține toată logica complexă
  const {
    isProcessingBatch,
    currentProgress,
    totalCalls,
    callStatuses,
    processBatchCalls
  } = useCallInitiation();

  // Hook-ul pentru istoric rămâne la fel, dar va fi chemat mai inteligent
  const { callHistory, isLoading: historyLoading, refetch: refetchHistory } = useCallHistory();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({ title: "Eroare", description: "Vă rugăm să selectați un fișier CSV.", variant: "destructive" });
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
        toast({ title: "Eroare", description: "CSV-ul trebuie să conțină o coloană pentru telefon (phone/telefon).", variant: "destructive" });
        return;
      }

      const parsedContacts: Contact[] = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        return {
          id: `contact-${Date.now()}-${index}`, // ID unic
          name: nameIndex >= 0 ? values[nameIndex] || `Contact ${index + 1}` : `Contact ${index + 1}`,
          phone: values[phoneIndex] || '',
          country: countryIndex >= 0 ? values[countryIndex] || 'Necunoscut' : 'Necunoscut',
          location: locationIndex >= 0 ? values[locationIndex] || 'Necunoscut' : 'Necunoscut'
        };
      }).filter(contact => contact.phone);

      setContacts(parsedContacts);
      setSelectedContacts(new Set(parsedContacts.map(c => c.id))); // Selectează tot implicit
      toast({ title: "Succes", description: `S-au încărcat ${parsedContacts.length} contacte.` });
    };
    
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContactSelect = (contactId: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) newSelected.add(contactId);
    else newSelected.delete(contactId);
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === contacts.length) setSelectedContacts(new Set());
    else setSelectedContacts(new Set(contacts.map(c => c.id)));
  };
  
  const handleBatchProcess = async () => {
    if (!agentId.trim() || selectedContacts.size === 0) {
      toast({ title: "Eroare", description: "Agent ID și cel puțin un contact selectat sunt obligatorii", variant: "destructive" });
      return;
    }
    
    const contactsToProcess = contacts.filter(c => selectedContacts.has(c.id));
    
    // 1. Pornește procesul. `await` asigură că așteptăm finalizarea întregului batch.
    await processBatchCalls(contactsToProcess, agentId);
    
    // 2. DOAR DUPĂ ce toate apelurile s-au terminat, reîmprospătăm istoricul.
    // Acum este 100% sigur că vom avea date noi.
    refetchHistory();
  };

  const downloadTemplate = () => {
    const csvContent = "nume,telefon,tara,locatie\nJohn Doe,+40712345678,Romania,Bucuresti\nJane Smith,+40798765432,Romania,Cluj";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_contacte.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Logica pentru apelul individual poate fi adăugată similar, dacă este necesar
  const handleSingleCall = async () => {
      toast({ title: "Info", description: "Logica pentru apelul individual trebuie implementată separat în hook.", variant: "default" });
      // Aici ai adăuga logica similară cu `initiateAndMonitorSingleCall` pentru un singur număr
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <OutboundHeader />

          <AgentIdInput agentId={agentId} setAgentId={setAgentId} />

          <Tabs defaultValue="batch" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="single">Apel Individual</TabsTrigger>
              <TabsTrigger value="batch">Apeluri Batch</TabsTrigger>
              <TabsTrigger value="history">Istoric</TabsTrigger>
            </TabsList>

            <TabsContent value="single">
              <SingleCallTab
                contactName={contactName}
                setContactName={setContactName}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                handleSingleCall={handleSingleCall}
                agentId={agentId}
                isInitiating={false} // Trebuie legat la starea de apel individual
              />
            </TabsContent>

            <TabsContent value="batch">
              <BatchTab
                contacts={contacts}
                selectedContacts={selectedContacts}
                onContactSelect={handleContactSelect}
                onSelectAll={handleSelectAll}
                onFileSelect={() => fileInputRef.current?.click()}
                onDownloadTemplate={downloadTemplate}
                onBatchProcess={handleBatchProcess}
                agentId={agentId}
                isProcessingBatch={isProcessingBatch}
                currentProgress={currentProgress}
                totalCalls={totalCalls}
                callStatuses={callStatuses} // Pasează statusurile pentru a fi afișate
              />
            </TabsContent>

            <TabsContent value="history">
              <CallHistoryTab callHistory={callHistory} isLoading={historyLoading} />
            </TabsContent>
          </Tabs>

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