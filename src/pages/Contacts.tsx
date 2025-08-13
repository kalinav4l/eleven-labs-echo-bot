import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ContactsList } from '@/components/contacts/ContactsList';
import { ContactForm } from '@/components/contacts/ContactForm';
import { ContactInteractionHistory } from '@/components/contacts/ContactInteractionHistory';
import { ContactStats } from '@/components/contacts/ContactStats';
import { CSVImportExport } from '@/components/contacts/CSVImportExport';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';

export default function Contacts() {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInteractionHistory, setShowInteractionHistory] = useState(false);

  const {
    contacts,
    isLoading,
    createContact,
    updateContact,
    deleteContact,
    refreshContacts
  } = useContacts();

  const filteredContacts = contacts?.filter(contact => {
    const matchesSearch = contact.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.telefon.includes(searchTerm) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleEditContact = (contact: any) => {
    setSelectedContact(contact);
    setIsFormOpen(true);
  };

  const handleViewHistory = (contact: any) => {
    setSelectedContact(contact);
    setShowInteractionHistory(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedContact(null);
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedContact) {
      await updateContact({ id: selectedContact.id, ...data });
    } else {
      await createContact(data);
    }
    handleFormClose();
    refreshContacts();
  };

  const handleCSVImport = async (csvData: any[]) => {
    // Import CSV data into contacts
    for (const row of csvData) {
      try {
        await createContact({
          nume: row.nume || row.Nume || '',
          telefon: row.telefon || row.Telefon || '',
          email: row.email || row.Email || '',
          tara: row.tara || row.Tara || '',
          locatie: row.locatie || row.Locatie || '',
          company: row.company || row.Company || '',
          info: row.info || row.Info || '',
          notes: row.notes || row.Notes || '',
          status: row.status || row.Status || 'active'
        });
      } catch (error) {
        console.error('Error importing contact:', error);
      }
    }
    refreshContacts();
  };

  const downloadContactTemplate = () => {
    const template = 'nume,telefon,email,tara,locatie,company,info,notes,status\n"Ion Popescu","+40712345678","ion@example.com","Romania","Bucuresti","ABC Company","Client important","Contact preferat dimineata","active"';
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Baza de Date Contacte</h1>
            <p className="text-muted-foreground">Gestionează toate contactele și istoricul interacțiunilor</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedContact(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Contact Nou
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedContact ? 'Editează Contact' : 'Contact Nou'}
                </DialogTitle>
              </DialogHeader>
              <ContactForm
                contact={selectedContact}
                onSubmit={handleFormSubmit}
                onCancel={handleFormClose}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <ContactStats contacts={contacts} />

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Căutare și Filtrare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Caută după nume, telefon sau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrează după status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate</SelectItem>
                  <SelectItem value="active">Activ</SelectItem>
                  <SelectItem value="inactive">Inactiv</SelectItem>
                  <SelectItem value="blocked">Blocat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* CSV Import/Export */}
        <CSVImportExport 
          onImportSuccess={handleCSVImport}
          onDownloadTemplate={downloadContactTemplate}
          expectedHeaders={['nume', 'telefon']}
          data={contacts}
          filename="contacte"
        />

        {/* Contacts List */}
        <ContactsList
          contacts={filteredContacts}
          isLoading={isLoading}
          onEdit={handleEditContact}
          onDelete={deleteContact}
          onViewHistory={handleViewHistory}
        />

        {/* Interaction History Modal */}
        <Dialog open={showInteractionHistory} onOpenChange={setShowInteractionHistory}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Istoric Interacțiuni - {selectedContact?.nume}
              </DialogTitle>
            </DialogHeader>
            {selectedContact && (
              <ContactInteractionHistory contactId={selectedContact.id} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}