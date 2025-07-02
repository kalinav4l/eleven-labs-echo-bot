
import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Upload, Phone, Users, FileText, Loader2, Download } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useCallInitiation } from '@/hooks/useCallInitiation';
import { useCallHistory } from '@/hooks/useCallHistory';
import { toast } from '@/components/ui/use-toast';

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
    totalCalls 
  } = useCallInitiation({
    agentId,
    phoneNumber
  });

  const { callHistory, isLoading: historyLoading } = useCallHistory();

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
      toast({
        title: "Succes",
        description: `S-au încărcat ${parsedContacts.length} contacte din CSV.`,
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
        variant: "destructive",
      });
      return;
    }

    await initiateCall(agentId, phoneNumber, contactName || phoneNumber);
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
        variant: "destructive",
      });
      return;
    }
    
    const contactsToProcess = contacts.filter(c => selectedContacts.has(c.id));
    await processBatchCalls(contactsToProcess, agentId);
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

  const progressPercentage = totalCalls > 0 ? (currentProgress / totalCalls) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Apeluri Outbound</h1>
            <p className="text-gray-600 text-sm">Gestionați apelurile automate cu agenții AI</p>
          </div>

          <div className="mb-6">
            <Label htmlFor="agent-id" className="text-gray-900 font-medium">
              Agent ID ElevenLabs *
            </Label>
            <Input
              id="agent-id"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="agent_xxxxxxxxx"
              className="bg-white border-gray-300 text-gray-900 font-mono mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              ID-ul agentului vostru din ElevenLabs care va efectua apelurile
            </p>
          </div>

          <Tabs defaultValue="single" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="single">Apel Individual</TabsTrigger>
              <TabsTrigger value="batch">Apeluri Batch</TabsTrigger>
              <TabsTrigger value="history">Istoric</TabsTrigger>
            </TabsList>

            <TabsContent value="single">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Apel Individual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="contact-name" className="text-gray-900">
                      Nume Contact (opțional)
                    </Label>
                    <Input
                      id="contact-name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Numele persoanei"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone-number" className="text-gray-900">
                      Număr de Telefon *
                    </Label>
                    <Input
                      id="phone-number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+40712345678"
                      className="bg-white border-gray-300 text-gray-900 font-mono"
                    />
                  </div>

                  <Button
                    onClick={handleSingleCall}
                    disabled={!agentId.trim() || !phoneNumber.trim() || isInitiating}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {isInitiating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Se Inițiază Apel...
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 mr-2" />
                        Inițiază Apel
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="batch">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Încărcare Contacte CSV
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="bg-white text-gray-900 border-gray-300"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Selectează CSV
                      </Button>
                      <Button
                        onClick={downloadTemplate}
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descarcă Template
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      CSV-ul trebuie să conțină coloanele: nume, telefon, tara, locatie
                    </p>
                  </CardContent>
                </Card>

                {contacts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Contacte Încărcate ({contacts.length})
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                        >
                          {selectedContacts.size === contacts.length ? 'Deselectează Tot' : 'Selectează Tot'}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                        {contacts.map(contact => (
                          <div key={contact.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              checked={selectedContacts.has(contact.id)}
                              onChange={(e) => handleContactSelect(contact.id, e.target.checked)}
                              className="rounded"
                            />
                            <div className="flex-1">
                              <span className="font-medium">{contact.name}</span>
                              <span className="text-sm text-gray-600 ml-2">{contact.phone}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {contact.country}
                            </span>
                          </div>
                        ))}
                      </div>

                      {isProcessingBatch && (
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progres: {currentProgress} / {totalCalls}</span>
                            <span>{Math.round(progressPercentage)}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>
                      )}

                      <Button
                        onClick={handleBatchProcess}
                        disabled={!agentId.trim() || selectedContacts.size === 0 || isProcessingBatch}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isProcessingBatch ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Procesează... ({currentProgress}/{totalCalls})
                          </>
                        ) : (
                          <>
                            <Phone className="w-4 h-4 mr-2" />
                            Procesează Apeluri ({selectedContacts.size} contacte)
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Istoric Apeluri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p className="text-gray-600">Se încarcă istoricul...</p>
                    </div>
                  ) : callHistory.length > 0 ? (
                    <div className="space-y-3">
                      {callHistory.map((call) => (
                        <div key={call.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{call.contact_name}</h3>
                              <p className="text-sm text-gray-600">{call.phone_number}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                call.call_status === 'success' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {call.call_status === 'success' ? 'Succes' : 'Eșuat'}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">{call.call_date}</p>
                            </div>
                          </div>
                          {call.summary && (
                            <p className="text-sm text-gray-700 mt-2">{call.summary}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Niciun apel încă</h3>
                      <p className="text-gray-600">Apelurile vor apărea aici după ce sunt efectuate.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
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
