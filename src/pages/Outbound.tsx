import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Upload, Phone, Users, FileText, Loader2, Download, Clock, CheckCircle, AlertCircle, PhoneCall, Mic } from 'lucide-react';
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
    totalCalls,
    currentContact,
    callStatuses,
    currentCallStatus
  } = useCallInitiation({
    agentId,
    phoneNumber
  });

  const { callHistory, isLoading: historyLoading, refetch: refetchHistory } = useCallHistory();

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

    const conversationId = await initiateCall(agentId, phoneNumber, contactName || phoneNumber);
    
    if (conversationId) {
      toast({
        title: "Procesare",
        description: "Apelul a fost inițiat. Se monitorizează statusul în timp real...",
      });
      
      // Refresh history after a delay to show the new call
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
        variant: "destructive",
      });
      return;
    }
    
    const contactsToProcess = contacts.filter(c => selectedContacts.has(c.id));
    await processBatchCalls(contactsToProcess, agentId);
    
    // Refresh history after batch processing
    setTimeout(() => {
      refetchHistory();
    }, 5000);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'calling':
        return <PhoneCall className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'talking':
        return <Mic className="w-4 h-4 text-green-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
      case 'no-answer':
      case 'busy':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const progressPercentage = totalCalls > 0 ? (currentProgress / totalCalls) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Apeluri Outbound</h1>
            <p className="text-gray-600 text-sm">Gestionați apelurile automate cu monitorizare în timp real prin ElevenLabs API</p>
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
                          disabled={isProcessingBatch}
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
                              disabled={isProcessingBatch}
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

                      {/* Enhanced Real-time Status Display */}
                      {isProcessingBatch && (
                        <div className="space-y-4 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progres: {currentProgress} / {totalCalls}</span>
                            <span>{Math.round(progressPercentage)}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                          
                          {/* Current Status */}
                          {currentCallStatus && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">{currentCallStatus}</span>
                              </div>
                            </div>
                          )}

                          {/* Detailed Call Statuses */}
                          {callStatuses.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-900">Status Detaliat Apeluri:</h4>
                              <div className="max-h-40 overflow-y-auto space-y-1">
                                {callStatuses.map(callStatus => (
                                  <div key={callStatus.contactId} className="flex items-center justify-between p-2 bg-white border rounded text-sm">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(callStatus.status)}
                                      <span className="font-medium">{callStatus.contactName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        callStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        callStatus.status === 'talking' ? 'bg-blue-100 text-blue-800' :
                                        callStatus.status === 'calling' ? 'bg-yellow-100 text-yellow-800' :
                                        callStatus.status === 'failed' ? 'bg-red-100 text-red-800' :
                                        callStatus.status === 'no-answer' ? 'bg-gray-100 text-gray-800' :
                                        callStatus.status === 'busy' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {callStatus.status === 'waiting' ? 'În așteptare' :
                                         callStatus.status === 'calling' ? 'Se apelează...' :
                                         callStatus.status === 'talking' ? 'În conversație' :
                                         callStatus.status === 'completed' ? 'Finalizat' :
                                         callStatus.status === 'failed' ? 'Eșuat' :
                                         callStatus.status === 'no-answer' ? 'Nu răspunde' :
                                         callStatus.status === 'busy' ? 'Ocupat' : 'Necunoscut'}
                                      </span>
                                      {callStatus.duration && (
                                        <span className="text-xs text-gray-600">{callStatus.duration}s</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <p className="text-sm text-green-800 font-medium">
                                Monitorizare API ElevenLabs Activă
                              </p>
                            </div>
                            <p className="text-sm text-green-700 mt-1">
                              Verificare status la 5 secunde. Următorul apel începe doar după confirmarea finalizării celui curent.
                            </p>
                          </div>
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
                            Monitorizează... ({currentProgress}/{totalCalls})
                          </>
                        ) : (
                          <>
                            <Phone className="w-4 h-4 mr-2" />
                            Procesează cu Monitorizare ({selectedContacts.size} contacte)
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
                              <div className="flex items-center gap-2">
                                {call.call_status === 'success' ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                )}
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  call.call_status === 'success' 
                                    ? 'bg-green-100 text-green-800' 
                                    : call.call_status === 'initiated'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {call.call_status === 'success' ? 'Finalizat' : 
                                   call.call_status === 'initiated' ? 'Inițiat' : 'Eșuat'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{call.call_date}</p>
                              {call.cost_usd > 0 && (
                                <p className="text-xs text-gray-500">{call.cost_usd} credite</p>
                              )}
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
