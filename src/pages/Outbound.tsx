
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Phone, FileText, Play, Users, Globe, MapPin, User } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from '@/components/ui/use-toast';
import { useCallInitiation } from '@/hooks/useCallInitiation';

interface Contact {
  id: string;
  name: string;
  phone: string;
  country: string;
  location: string;
}

const Outbound = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [customAgentId, setCustomAgentId] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [isCallingAll, setIsCallingAll] = useState(false);

  const { initiateCall, isInitiating } = useCallInitiation({
    customAgentId,
    createdAgentId: '',
    phoneNumber: ''
  });

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

    await initiateCall(customAgentId, contact.phone);
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
    
    for (const contact of selectedContacts) {
      try {
        await initiateCall(customAgentId, contact.phone);
        // Add delay between calls
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to call ${contact.name}:`, error);
      }
    }
    
    setIsCallingAll(false);
    toast({
      title: "Apeluri finalizate",
      description: `S-au inițiat apelurile pentru ${selectedContacts.length} contacte.`
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
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
                            disabled={!customAgentId.trim() || isInitiating}
                            className="border-accent text-accent hover:bg-accent/10"
                          >
                            {isInitiating ? (
                              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Phone className="w-4 h-4" />
                            )}
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

        {/* Info Section */}
        <Card className="liquid-glass mt-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Format CSV</h3>
                <p className="text-sm text-muted-foreground">Nume, Telefon, Țara, Locație</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Mărime Maximă</h3>
                <p className="text-sm text-muted-foreground">1 MB per fișier</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Telefonie</h3>
                <p className="text-sm text-muted-foreground">ElevenLabs Outbound</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Outbound;
