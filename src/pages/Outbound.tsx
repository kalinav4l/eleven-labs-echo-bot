
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Phone, FileText, Play, Users, Globe, MapPin, User, Search, Clock, DollarSign, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from '@/components/ui/use-toast';

interface Contact {
  id: string;
  name: string;
  phone: string;
  country: string;
  location: string;
}

interface CallHistory {
  id: string;
  phone: string;
  name: string;
  status: 'success' | 'failed' | 'busy' | 'no-answer';
  conclusion: string;
  dialog: string;
  date: string;
  cost: number;
}

const Outbound = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [customAgentId, setCustomAgentId] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [isCallingAll, setIsCallingAll] = useState(false);
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const WEBHOOK_URL = 'https://zuckerberg.aichat.md/webhook/telefonie-sunat';

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleCsvSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
        toast({
          title: "Eroare",
          description: "Te rog selectează un fișier CSV valid.",
          variant: "destructive"
        });
        return;
      }
      setCsvFile(file);
      toast({
        title: "Fișier selectat",
        description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`
      });
    }
  };

  const parseCsvData = (csvText: string): Contact[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const contacts: Contact[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
        if (columns.length >= 4) {
          contacts.push({
            id: Date.now().toString() + i,
            name: columns[0] || 'Necunoscut',
            phone: columns[1] || '',
            country: columns[2] || '',
            location: columns[3] || ''
          });
        }
      }
    }
    return contacts;
  };

  const handleUploadCsv = async () => {
    if (!csvFile) {
      toast({
        title: "Eroare",
        description: "Te rog selectează un fișier CSV.",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingCsv(true);
    try {
      const csvText = await csvFile.text();
      const parsedContacts = parseCsvData(csvText);
      
      if (parsedContacts.length === 0) {
        throw new Error('Nu s-au găsit contacte valide în fișierul CSV');
      }

      setContacts(parsedContacts);
      toast({
        title: "Succes",
        description: `${parsedContacts.length} contacte au fost încărcate cu succes!`
      });
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut procesa fișierul CSV.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingCsv(false);
    }
  };

  const sendContactsToWebhook = async (contactsToSend: Contact[]) => {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: customAgentId,
          contacts: contactsToSend,
          timestamp: new Date().toISOString(),
          user_id: user?.id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Webhook response:', result);
      
      return result;
    } catch (error) {
      console.error('Error sending to webhook:', error);
      throw error;
    }
  };

  const pollForResults = async (batchId: string) => {
    const maxAttempts = 30; // 5 minute timeout (10 seconds * 30)
    let attempts = 0;

    const poll = async (): Promise<void> => {
      try {
        const response = await fetch(`${WEBHOOK_URL}/results/${batchId}`);
        
        if (response.ok) {
          const results = await response.json();
          
          if (results.completed) {
            // Process the results and add to call history
            const newCallHistory: CallHistory[] = results.calls.map((call: any) => ({
              id: Date.now().toString() + Math.random(),
              phone: call.phone,
              name: call.name,
              status: call.status,
              conclusion: call.conclusion,
              dialog: call.dialog,
              date: new Date(call.date).toLocaleString('ro-RO'),
              cost: call.cost
            }));

            setCallHistory(prev => [...newCallHistory, ...prev]);
            
            toast({
              title: "Apeluri finalizate",
              description: `S-au primit rezultatele pentru ${newCallHistory.length} apeluri.`
            });
            
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(() => poll(), 10000); // Poll every 10 seconds
        } else {
          toast({
            title: "Timeout",
            description: "Rezultatele apelurilor nu au fost primite în timp util.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error polling for results:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(() => poll(), 10000);
        }
      }
    };

    poll();
  };

  const handleContactSelect = (contactId: string) => {
    const newSelected = new Set(selectedContactIds);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContactIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedContactIds.size === contacts.length) {
      setSelectedContactIds(new Set());
    } else {
      setSelectedContactIds(new Set(contacts.map(c => c.id)));
    }
  };

  const handleInitiateCall = async (contact: Contact) => {
    if (!customAgentId.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu ID-ul agentului.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await sendContactsToWebhook([contact]);
      
      toast({
        title: "Apel inițiat",
        description: `Apelul către ${contact.name} a fost trimis pentru procesare.`
      });

      if (result.batch_id) {
        pollForResults(result.batch_id);
      }
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut iniția apelul.",
        variant: "destructive"
      });
    }
  };

  const handleInitiateAllCalls = async () => {
    if (!customAgentId.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu ID-ul agentului.",
        variant: "destructive"
      });
      return;
    }

    if (selectedContactIds.size === 0) {
      toast({
        title: "Eroare",
        description: "Te rog selectează cel puțin un contact.",
        variant: "destructive"
      });
      return;
    }

    setIsCallingAll(true);
    const selectedContacts = contacts.filter(c => selectedContactIds.has(c.id));

    try {
      const result = await sendContactsToWebhook(selectedContacts);
      
      toast({
        title: "Apeluri inițiate",
        description: `${selectedContacts.length} apeluri au fost trimise pentru procesare.`
      });

      if (result.batch_id) {
        pollForResults(result.batch_id);
      }
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu s-au putut iniția apelurile.",
        variant: "destructive"
      });
    } finally {
      setIsCallingAll(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'busy':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'no-answer':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Succes';
      case 'failed':
        return 'Eșuat';
      case 'busy':
        return 'Ocupat';
      case 'no-answer':
        return 'Nu răspunde';
      default:
        return 'Necunoscut';
    }
  };

  const filteredCallHistory = callHistory.filter(call => 
    call.phone.includes(searchTerm) || 
    call.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 my-[60px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Outbound</h1>
            <p className="text-muted-foreground">Gestionează apelurile outbound și bazele de date de contacte</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CSV Upload Section */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Upload className="w-6 h-6 text-accent" />
                Upload Bază de Date CSV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-accent/50 transition-colors">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Drag & drop sau selectează un fișier CSV
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Format: Nume, Telefon, Țara, Locație
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvSelect}
                      className="hidden"
                      id="csv-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('csv-upload')?.click()}
                      className="mt-2"
                    >
                      Selectează CSV
                    </Button>
                  </div>
                </div>

                {csvFile && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-accent" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{csvFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(csvFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleUploadCsv}
                disabled={!csvFile || isUploadingCsv}
                className="w-full bg-accent hover:bg-accent/90 text-white"
              >
                {isUploadingCsv ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesează CSV...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Încarcă Contacte
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Call Configuration Section */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-accent" />
                Configurare Apeluri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="agent-id" className="text-foreground">
                  ID Agent pentru Apeluri
                </Label>
                <Input
                  id="agent-id"
                  value={customAgentId}
                  onChange={(e) => setCustomAgentId(e.target.value)}
                  placeholder="agent_id_pentru_apeluri"
                  className="glass-input"
                />
              </div>

              {contacts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {contacts.length} contacte încărcate, {selectedContactIds.size} selectate
                    </p>
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                      {selectedContactIds.size === contacts.length ? 'Deselectează Tot' : 'Selectează Tot'}
                    </Button>
                  </div>

                  <Button
                    onClick={handleInitiateAllCalls}
                    disabled={!customAgentId.trim() || selectedContactIds.size === 0 || isCallingAll}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isCallingAll ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Inițiază Apeluri...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Inițiază Apeluri Selectate ({selectedContactIds.size})
                      </div>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contacts Table */}
        {contacts.length > 0 && (
          <Card className="liquid-glass mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-accent" />
                Contacte Încărcate ({contacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedContactIds.size === contacts.length && contacts.length > 0}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Nume
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Telefon
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Țara
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Locație
                        </div>
                      </TableHead>
                      <TableHead>Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedContactIds.has(contact.id)}
                            onChange={() => handleContactSelect(contact.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell className="font-mono text-sm">{contact.phone}</TableCell>
                        <TableCell>{contact.country}</TableCell>
                        <TableCell>{contact.location}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInitiateCall(contact)}
                            disabled={!customAgentId.trim()}
                            className="border-accent text-accent hover:bg-accent/10"
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call History Section */}
        <Card className="liquid-glass mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-accent" />
              Istoric Apeluri ({callHistory.length})
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Caută după numărul de telefon sau nume..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCallHistory.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Number
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Telefon
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Concluzie
                        </div>
                      </TableHead>
                      <TableHead>Dialog</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Data
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Cost
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCallHistory.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(call.status)}
                            <span className="text-sm">{getStatusText(call.status)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{call.name}</TableCell>
                        <TableCell className="font-mono text-sm">{call.phone}</TableCell>
                        <TableCell className="text-sm">{call.conclusion}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate" title={call.dialog}>
                          {call.dialog}
                        </TableCell>
                        <TableCell className="text-sm">{call.date}</TableCell>
                        <TableCell className="text-sm font-mono">${call.cost.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Nu s-au găsit apeluri care să se potrivească cu termenul de căutare.' 
                    : 'Nu există încă apeluri în istoric.'
                  }
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-2">
                    Șterge filtrul
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="liquid-glass mt-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Format CSV</h3>
                <p className="text-sm text-muted-foreground">Nume, Telefon, Țara, Locație</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Webhook</h3>
                <p className="text-sm text-muted-foreground">N8N Integration</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Rezultate</h3>
                <p className="text-sm text-muted-foreground">Real-time Updates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Outbound;
