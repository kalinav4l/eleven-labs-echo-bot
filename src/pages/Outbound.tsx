import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import { useCallInitiation } from '@/hooks/useCallInitiation';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useUserPhoneNumbers } from '@/hooks/useUserPhoneNumbers';
import { toast } from '@/components/ui/use-toast';
import { Phone, Upload, FileDown } from 'lucide-react';

// Import refactored components
import { OutboundHeader } from '@/components/outbound/OutboundHeader';
import { CallHistoryTab } from '@/components/outbound/CallHistoryTab';
import { BatchConfigPanel } from '@/components/outbound/BatchConfigPanel';
import { BatchStatusPanel } from '@/components/outbound/BatchStatusPanel';
import { ContactsList } from '@/components/outbound/ContactsList';
import { CSVUploadSection } from '@/components/outbound/CSVUploadSection';
import { SingleCallModal } from '@/components/outbound/SingleCallModal';
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
  
  // State for configuration
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedPhoneId, setSelectedPhoneId] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [batchStartTime, setBatchStartTime] = useState<Date | undefined>();
  const [isSingleCallModalOpen, setIsSingleCallModalOpen] = useState(false);

  // Get user's phone numbers
  const { data: phoneNumbers } = useUserPhoneNumbers();
  const {
    processBatchCalls,
    isProcessingBatch,
    currentProgress,
    totalCalls,
    callStatuses,
  } = useCallInitiation({
    agentId: selectedAgentId,
    phoneNumber: ''
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
  const getSelectedPhoneNumber = () => {
    if (!selectedPhoneId || !phoneNumbers) return '';
    const phone = phoneNumbers.find(p => p.id === selectedPhoneId);
    return phone?.phone_number || '';
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Apeluri Outbound</h2>
                <p className="text-gray-600">Gestionează și inițiază apeluri către clienți</p>
              </div>
              <Button 
                onClick={() => setIsSingleCallModalOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Phone className="w-4 h-4 mr-2" />
                Apel Individual
              </Button>
            </div>

            <Tabs defaultValue="batch" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white p-1 h-auto border border-gray-200">
                <TabsTrigger 
                  value="batch" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white py-3"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Apeluri Batch
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white py-3"
                >
                  Istoric Apeluri
                </TabsTrigger>
              </TabsList>

              <TabsContent value="batch" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Configuration Panel */}
                  <div className="lg:col-span-1">
                    <BatchConfigPanel
                      selectedAgentId={selectedAgentId}
                      onAgentSelect={setSelectedAgentId}
                      selectedPhoneId={selectedPhoneId}
                      onPhoneSelect={setSelectedPhoneId}
                      totalRecipients={contacts.length}
                      selectedRecipients={selectedContacts.size}
                    />
                  </div>

                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* CSV Upload Section */}
                    <CSVUploadSection
                      onFileSelect={() => fileInputRef.current?.click()}
                      onDownloadTemplate={downloadTemplate}
                    />

                    {/* Contacts List */}
                    {contacts.length > 0 && (
                      <ContactsList
                        contacts={contacts}
                        selectedContacts={selectedContacts}
                        onContactSelect={handleContactSelect}
                        onSelectAll={handleSelectAll}
                        isProcessingBatch={isProcessingBatch}
                      />
                    )}

                    {/* Action Button */}
                    {contacts.length > 0 && (
                      <Button
                        onClick={handleBatchProcess}
                        disabled={!selectedAgentId || !selectedPhoneId || selectedContacts.size === 0 || isProcessingBatch}
                        className="w-full py-3 bg-primary hover:bg-primary/90"
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
                    )}
                  </div>
                </div>

                {/* Status Panel */}
                {(isProcessingBatch || callStatuses.length > 0) && (
                  <BatchStatusPanel
                    isProcessing={isProcessingBatch}
                    currentProgress={currentProgress}
                    totalCalls={totalCalls}
                    callStatuses={callStatuses}
                    startTime={batchStartTime}
                  />
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <div className="bg-white rounded-lg border border-gray-200">
                  <CallHistoryTab callHistory={callHistory} isLoading={historyLoading} />
                </div>
              </TabsContent>
            </Tabs>

            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          </div>
        </div>
      </div>

      <SingleCallModal 
        isOpen={isSingleCallModalOpen}
        onClose={() => setIsSingleCallModalOpen(false)}
      />
    </DashboardLayout>
  );
};
export default Outbound;