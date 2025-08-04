import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, Users, Upload } from 'lucide-react';
import { useContactsDatabase, useCreateContact, useUpdateContact, useDeleteContact, useImportContacts, ContactDatabase, CreateContactInput } from '@/hooks/useContactsDatabase';

interface ContactsManagerProps {
  onContactSelect?: (contact: ContactDatabase) => void;
}

export const ContactsManager: React.FC<ContactsManagerProps> = ({
  onContactSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactDatabase | null>(null);
  const [newContact, setNewContact] = useState<CreateContactInput>({
    nume: '',
    telefon: '',
    info: '',
    locatie: '',
    tara: ''
  });

  const { data: contacts = [], isLoading } = useContactsDatabase();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  const importContacts = useImportContacts();

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact =>
    contact.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.telefon.includes(searchTerm) ||
    contact.locatie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.tara?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateContact = async () => {
    if (!newContact.nume || !newContact.telefon) return;
    
    await createContact.mutateAsync(newContact);
    setNewContact({ nume: '', telefon: '', info: '', locatie: '', tara: '' });
    setIsAddDialogOpen(false);
  };

  const handleEditContact = async () => {
    if (!editingContact) return;
    
    await updateContact.mutateAsync(editingContact);
    setIsEditDialogOpen(false);
    setEditingContact(null);
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm('Ștergi acest contact?')) {
      await deleteContact.mutateAsync(id);
    }
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const contactsToImport: CreateContactInput[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 2) {
          const contact: CreateContactInput = {
            nume: values[headers.indexOf('nume')] || values[0] || '',
            telefon: values[headers.indexOf('telefon')] || values[1] || '',
            info: values[headers.indexOf('info')] || values[2] || '',
            locatie: values[headers.indexOf('locatie')] || values[3] || '',
            tara: values[headers.indexOf('tara')] || values[4] || ''
          };
          
          if (contact.nume && contact.telefon) {
            contactsToImport.push(contact);
          }
        }
      }
      
      if (contactsToImport.length > 0) {
        await importContacts.mutateAsync(contactsToImport);
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  if (isLoading) {
    return <div>Se încarcă contactele...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestionare Contacte ({contacts.length})
          </span>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
              id="csv-import"
            />
            <Label htmlFor="csv-import" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-1" />
                  Import CSV
                </span>
              </Button>
            </Label>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Adaugă Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adaugă Contact Nou</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nume">Nume *</Label>
                    <Input
                      id="nume"
                      value={newContact.nume}
                      onChange={(e) => setNewContact({...newContact, nume: e.target.value})}
                      placeholder="Numele contactului"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefon">Telefon *</Label>
                    <Input
                      id="telefon"
                      value={newContact.telefon}
                      onChange={(e) => setNewContact({...newContact, telefon: e.target.value})}
                      placeholder="+40123456789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="locatie">Locație</Label>
                    <Input
                      id="locatie"
                      value={newContact.locatie}
                      onChange={(e) => setNewContact({...newContact, locatie: e.target.value})}
                      placeholder="Orașul"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tara">Țara</Label>
                    <Input
                      id="tara"
                      value={newContact.tara}
                      onChange={(e) => setNewContact({...newContact, tara: e.target.value})}
                      placeholder="România"
                    />
                  </div>
                  <div>
                    <Label htmlFor="info">Informații Suplimentare</Label>
                    <Textarea
                      id="info"
                      value={newContact.info}
                      onChange={(e) => setNewContact({...newContact, info: e.target.value})}
                      placeholder="Detalii despre contact, preferințe, istoric..."
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateContact} 
                    disabled={!newContact.nume || !newContact.telefon || createContact.isPending}
                    className="w-full"
                  >
                    Adaugă Contact
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Caută contacte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Contacts List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredContacts.map(contact => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 cursor-pointer" onClick={() => onContactSelect?.(contact)}>
                  <div className="font-medium">{contact.nume}</div>
                  <div className="text-sm text-gray-600">{contact.telefon}</div>
                  {contact.locatie && contact.tara && (
                    <div className="text-xs text-gray-500">{contact.locatie}, {contact.tara}</div>
                  )}
                  {contact.info && (
                    <div className="text-xs text-gray-500 mt-1">{contact.info}</div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingContact(contact);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteContact(contact.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nu s-au găsit contacte' : 'Nu există contacte încă'}
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editează Contact</DialogTitle>
            </DialogHeader>
            {editingContact && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-nume">Nume *</Label>
                  <Input
                    id="edit-nume"
                    value={editingContact.nume}
                    onChange={(e) => setEditingContact({...editingContact, nume: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-telefon">Telefon *</Label>
                  <Input
                    id="edit-telefon"
                    value={editingContact.telefon}
                    onChange={(e) => setEditingContact({...editingContact, telefon: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-locatie">Locație</Label>
                  <Input
                    id="edit-locatie"
                    value={editingContact.locatie || ''}
                    onChange={(e) => setEditingContact({...editingContact, locatie: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tara">Țara</Label>
                  <Input
                    id="edit-tara"
                    value={editingContact.tara || ''}
                    onChange={(e) => setEditingContact({...editingContact, tara: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-info">Informații Suplimentare</Label>
                  <Textarea
                    id="edit-info"
                    value={editingContact.info || ''}
                    onChange={(e) => setEditingContact({...editingContact, info: e.target.value})}
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleEditContact} 
                  disabled={!editingContact.nume || !editingContact.telefon || updateContact.isPending}
                  className="w-full"
                >
                  Salvează Modificările
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};