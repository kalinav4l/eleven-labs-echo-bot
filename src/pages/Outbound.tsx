import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Phone, FileText, Play, Users, Globe, MapPin, User, Search, Clock, DollarSign, MessageSquare, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Pause, Trash2, Trash } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCallHistory } from '@/hooks/useCallHistory';
interface Contact {
  id: string;
  name: string;
  phone: string;
  country: string;
  location: string;
}
interface CallHistory {
  id: string;
  phone_number: string;
  contact_name: string;
  call_status: 'success' | 'failed' | 'busy' | 'no-answer' | 'unknown';
  summary: string;
  dialog_json: string;
  call_date: string;
  cost_usd: number;
  agent_id?: string;
  language?: string;
}
const Outbound = () => {
  const {
    user
  } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [customAgentId, setCustomAgentId] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [selectedCallIds, setSelectedCallIds] = useState<Set<string>>(new Set());
  const [isCallingAll, setIsCallingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDialog, setExpandedDialog] = useState<Set<string>>(new Set());
  const [expandedSummary, setExpandedSummary] = useState<Set<string>>(new Set());
  const [currentCallIndex, setCurrentCallIndex] = useState(0);
  const [processedContacts, setProcessedContacts] = useState<Set<string>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const {
    callHistory,
    isLoading,
    saveCallResults,
    deleteCallHistory,
    deleteAllCallHistory,
    refetch
  } = useCallHistory();
  const WEBHOOK_URL = 'https://zuckerberg.aichat.md/webhook/telefonie-sunat';
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  const formatObjectAsJson = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      console.error('Error formatting object as JSON:', error);
      return String(obj);
    }
  };
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
      // Reset progress when new contacts are loaded
      setCurrentCallIndex(0);
      setProcessedContacts(new Set());
      setIsPaused(false);
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
  const extractDialogFromJson = (dialogJson: string): string => {
    try {
      const parsed = JSON.parse(dialogJson);
      const cleanConversations = parsed?.clean_conversations;
      const dialog = cleanConversations?.dialog || [];
      if (Array.isArray(dialog) && dialog.length > 0) {
        return dialog.map((item: any, index: number) => `${index + 1}. ${item.speaker || 'Unknown'}: ${item.message || 'No message'}`).join('\n');
      }
      return 'Nu există dialog disponibil';
    } catch (error) {
      console.error('Error parsing dialog JSON:', error);
      return 'Eroare la parsarea dialogului';
    }
  };
  const sendSingleContactToWebhook = async (contact: Contact) => {
    try {
      console.log('Sending single contact to webhook:', contact);
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_id: customAgentId,
          contacts: [contact],
          timestamp: new Date().toISOString(),
          user_id: user?.id
        })
      });
      console.log('Webhook response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseText = await response.text();
      console.log('Response body (raw):', responseText);
      try {
        const result = JSON.parse(responseText);
        console.log('Processing JSON response:', result);
        await processWebhookResponse(result);
        return result;
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        console.log('Raw response that failed JSON parsing:', responseText);
        throw new Error('Răspunsul nu este JSON valid');
      }
    } catch (error) {
      console.error('Error sending to webhook:', error);
      throw error;
    }
  };
  const processWebhookResponse = async (result: any) => {
    try {
      console.log('Processing webhook response:', result);
      let callResults: any[] = [];
      if (Array.isArray(result)) {
        callResults = result;
        console.log('Result is array, using directly');
      } else if (result?.response?.body && Array.isArray(result.response.body)) {
        callResults = result.response.body;
        console.log('Found call results in response.body');
      } else if (result?.calls && Array.isArray(result.calls)) {
        callResults = result.calls;
        console.log('Found calls array in result');
      }
      console.log('Extracted call results:', callResults);
      if (callResults.length > 0) {
        try {
          await saveCallResults.mutateAsync(callResults);
          toast({
            title: "Apel finalizat",
            description: `Rezultatul pentru apelul curent a fost salvat.`
          });
        } catch (saveError) {
          console.error('Error saving call results:', saveError);
          toast({
            title: "Eroare la salvare",
            description: "Nu s-au putut salva rezultatele apelului.",
            variant: "destructive"
          });
        }
      } else {
        console.log('No call results found in response');
        toast({
          title: "Rezultat primit",
          description: "Răspunsul a fost primit dar nu conține rezultate de apel.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing webhook response:', error);
      toast({
        title: "Eroare de procesare",
        description: "Nu s-a putut procesa răspunsul de la webhook.",
        variant: "destructive"
      });
    }
  };
  const processContactsSequentially = async () => {
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
    setIsPaused(false);
    const selectedContacts = contacts.filter(c => selectedContactIds.has(c.id));
    const startIndex = currentCallIndex;
    toast({
      title: "Procesare secvențială inițiată",
      description: `Se vor procesa ${selectedContacts.length - startIndex} contacte unul câte unul.`
    });
    for (let i = startIndex; i < selectedContacts.length; i++) {
      // Check if paused
      if (isPaused) {
        console.log('Processing paused by user');
        break;
      }
      const contact = selectedContacts[i];
      setCurrentCallIndex(i);
      toast({
        title: "Procesez contact",
        description: `Apelând ${contact.name} (${i + 1}/${selectedContacts.length})`
      });
      try {
        await sendSingleContactToWebhook(contact);

        // Mark contact as processed
        setProcessedContacts(prev => new Set([...prev, contact.id]));

        // Wait 2 seconds before next call (to prevent overwhelming the webhook)
        if (i < selectedContacts.length - 1 && !isPaused) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error processing contact ${contact.name}:`, error);
        toast({
          title: "Eroare la contact",
          description: `Nu s-a putut procesa ${contact.name}. Se continuă cu următorul.`,
          variant: "destructive"
        });
      }
    }
    if (!isPaused) {
      setCurrentCallIndex(0);
      setProcessedContacts(new Set());
      toast({
        title: "Procesare completă",
        description: "Toate contactele selectate au fost procesate."
      });
    }
    setIsCallingAll(false);
  };
  const handlePauseResume = () => {
    if (isCallingAll) {
      setIsPaused(!isPaused);
      toast({
        title: isPaused ? "Procesare reluată" : "Procesare întreruptă",
        description: isPaused ? "Continuă cu următorul contact." : "Procesarea a fost întreruptă."
      });
    }
  };
  const handleStopProcessing = () => {
    setIsCallingAll(false);
    setIsPaused(false);
    setCurrentCallIndex(0);
    setProcessedContacts(new Set());
    toast({
      title: "Procesare oprită",
      description: "Procesarea contactelor a fost oprită."
    });
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
  const handleSelectAllCalls = () => {
    if (selectedCallIds.size === filteredCallHistory.length) {
      setSelectedCallIds(new Set());
    } else {
      setSelectedCallIds(new Set(filteredCallHistory.map(call => call.id)));
    }
  };
  const handleDeleteSelected = async () => {
    if (selectedCallIds.size === 0) {
      toast({
        title: "Eroare",
        description: "Te rog selectează cel puțin un apel pentru ștergere.",
        variant: "destructive"
      });
      return;
    }
    try {
      await deleteCallHistory.mutateAsync(Array.from(selectedCallIds));
      setSelectedCallIds(new Set());
      toast({
        title: "Succes",
        description: `${selectedCallIds.size} apeluri au fost șterse cu succes.`
      });
    } catch (error) {
      console.error('Error deleting calls:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut șterge apelurile selectate.",
        variant: "destructive"
      });
    }
  };
  const handleDeleteAll = async () => {
    if (callHistory.length === 0) {
      toast({
        title: "Eroare",
        description: "Nu există apeluri pentru ștergere.",
        variant: "destructive"
      });
      return;
    }
    try {
      await deleteAllCallHistory.mutateAsync();
      setSelectedCallIds(new Set());
      toast({
        title: "Succes",
        description: "Toate apelurile au fost șterse cu succes."
      });
    } catch (error) {
      console.error('Error deleting all calls:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut șterge toate apelurile.",
        variant: "destructive"
      });
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
      const result = await sendSingleContactToWebhook(contact);
      toast({
        title: "Apel inițiat",
        description: `Apelul către ${contact.name} a fost trimis pentru procesare.`
      });
      console.log('Single call result:', result);
    } catch (error) {
      console.error('Error initiating call:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut iniția apelul.",
        variant: "destructive"
      });
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
  const toggleExpandedDialog = (callId: string) => {
    const newExpanded = new Set(expandedDialog);
    if (newExpanded.has(callId)) {
      newExpanded.delete(callId);
    } else {
      newExpanded.add(callId);
    }
    setExpandedDialog(newExpanded);
  };
  const toggleExpandedSummary = (callId: string) => {
    const newExpanded = new Set(expandedSummary);
    if (newExpanded.has(callId)) {
      newExpanded.delete(callId);
    } else {
      newExpanded.add(callId);
    }
    setExpandedSummary(newExpanded);
  };
  const filteredCallHistory = callHistory.filter(call => call.phone_number.includes(searchTerm) || call.contact_name.toLowerCase().includes(searchTerm.toLowerCase()));
  return <DashboardLayout>
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
                    <input type="file" accept=".csv" onChange={handleCsvSelect} className="hidden" id="csv-upload" />
                    <Button variant="outline" onClick={() => document.getElementById('csv-upload')?.click()} className="mt-2">
                      Selectează CSV
                    </Button>
                  </div>
                </div>

                {csvFile && <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-accent" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{csvFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(csvFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </div>}
              </div>

              <Button onClick={handleUploadCsv} disabled={!csvFile || isUploadingCsv} className="w-full bg-accent hover:bg-accent/90 text-white">
                {isUploadingCsv ? <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesează CSV...
                  </div> : <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Încarcă Contacte
                  </div>}
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
                <Input id="agent-id" value={customAgentId} onChange={e => setCustomAgentId(e.target.value)} placeholder="agent_id_pentru_apeluri" className="glass-input" />
              </div>

              {contacts.length > 0 && <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {contacts.length} contacte încărcate, {selectedContactIds.size} selectate
                    </p>
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                      {selectedContactIds.size === contacts.length ? 'Deselectează Tot' : 'Selectează Tot'}
                    </Button>
                  </div>

                  {/* Progress indicator */}
                  {isCallingAll && <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">
                          Progres: {currentCallIndex + 1} / {contacts.filter(c => selectedContactIds.has(c.id)).length}
                        </span>
                        <span className="text-sm text-blue-700">
                          {isPaused ? 'Întrerupt' : 'În procesare...'}
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{
                    width: `${(currentCallIndex + 1) / contacts.filter(c => selectedContactIds.has(c.id)).length * 100}%`
                  }} />
                      </div>
                    </div>}

                  <div className="flex gap-2">
                    <Button onClick={processContactsSequentially} disabled={!customAgentId.trim() || selectedContactIds.size === 0 || isCallingAll} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                      {isCallingAll ? <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Procesează Secvențial...
                        </div> : <div className="flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          Procesează Secvențial ({selectedContactIds.size})
                        </div>}
                    </Button>

                    {isCallingAll && <>
                        <Button onClick={handlePauseResume} variant="outline" className="px-3">
                          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        </Button>
                        <Button onClick={handleStopProcessing} variant="destructive" className="px-3">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>}
                  </div>
                </div>}
            </CardContent>
          </Card>
        </div>

        {/* Contacts Table */}
        {contacts.length > 0 && <Card className="liquid-glass mt-8">
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
                        <input type="checkbox" checked={selectedContactIds.size === contacts.length && contacts.length > 0} onChange={handleSelectAll} className="rounded" />
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
                      <TableHead>Status</TableHead>
                      <TableHead>Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map(contact => <TableRow key={contact.id}>
                        <TableCell>
                          <input type="checkbox" checked={selectedContactIds.has(contact.id)} onChange={() => handleContactSelect(contact.id)} className="rounded" />
                        </TableCell>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell className="font-mono text-sm">{contact.phone}</TableCell>
                        <TableCell>{contact.country}</TableCell>
                        <TableCell>{contact.location}</TableCell>
                        <TableCell>
                          {processedContacts.has(contact.id) ? <span className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Procesat
                            </span> : selectedContactIds.has(contact.id) && isCallingAll && contacts.indexOf(contact) === currentCallIndex ? <span className="flex items-center gap-1 text-blue-600 text-sm">
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              În procesare
                            </span> : <span className="text-gray-500 text-sm">În așteptare</span>}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleInitiateCall(contact)} disabled={!customAgentId.trim() || isCallingAll} className="border-accent text-accent hover:bg-accent/10">
                            <Phone className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>}

        {/* Call History Section */}
        <Card className="liquid-glass mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-accent" />
                Istoric Apeluri ({callHistory.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                {selectedCallIds.size > 0 && <Button onClick={handleDeleteSelected} variant="destructive" size="sm" disabled={deleteCallHistory.isPending} className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Șterge Selectate ({selectedCallIds.size})
                  </Button>}
                {callHistory.length > 0 && <Button onClick={handleDeleteAll} variant="destructive" size="sm" disabled={deleteAllCallHistory.isPending} className="flex items-center gap-2">
                    <Trash className="w-4 h-4" />
                    Șterge Tot
                  </Button>}
                
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Caută după numărul de telefon sau nume..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCallHistory.length > 0 ? <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox checked={selectedCallIds.size === filteredCallHistory.length && filteredCallHistory.length > 0} onCheckedChange={handleSelectAllCalls} />
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Contact
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
                          Rezumat
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
                    {filteredCallHistory.map(call => <TableRow key={call.id}>
                        <TableCell>
                          <Checkbox checked={selectedCallIds.has(call.id)} onCheckedChange={() => handleCallSelect(call.id)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(call.call_status)}
                            <span className="text-sm">{getStatusText(call.call_status)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{call.contact_name}</TableCell>
                        <TableCell className="font-mono text-sm">{call.phone_number}</TableCell>
                        <TableCell className="text-sm">
                          <Collapsible>
                            <CollapsibleTrigger className="flex items-center gap-2 hover:text-accent cursor-pointer" onClick={() => toggleExpandedSummary(call.id)}>
                              <span className="truncate max-w-[150px]">
                                {call.summary || 'Nu există rezumat'}
                              </span>
                              {expandedSummary.has(call.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2">
                              <div className="bg-gray-50 p-3 rounded max-w-xs whitespace-pre-wrap text-sm">
                                {call.summary || 'Nu există rezumat disponibil'}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </TableCell>
                        <TableCell className="text-sm">
                          <Collapsible>
                            <CollapsibleTrigger className="flex items-center gap-2 hover:text-accent cursor-pointer" onClick={() => toggleExpandedDialog(call.id)}>
                              <span className="text-blue-600 underline">Vezi Dialog</span>
                              {expandedDialog.has(call.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2">
                              <div className="bg-gray-50 p-3 rounded max-w-sm max-h-64 overflow-auto">
                                <pre className="whitespace-pre-wrap text-xs">
                                  {extractDialogFromJson(call.dialog_json)}
                                </pre>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </TableCell>
                        <TableCell className="text-sm">{call.call_date}</TableCell>
                        <TableCell className="text-sm font-mono">{call.cost_usd}</TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div> : <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nu s-au găsit apeluri care să se potrivească cu termenul de căutare.' : 'Nu există încă apeluri în istoric.'}
                </p>
                {searchTerm && <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-2">
                    Șterge filtrul
                  </Button>}
              </div>}
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
                <h3 className="font-semibold text-foreground mb-2">Procesare Secvențială</h3>
                <p className="text-sm text-muted-foreground">Un contact la un timp</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Rezultate</h3>
                <p className="text-sm text-muted-foreground">Real-time Updates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>;
};
export default Outbound;