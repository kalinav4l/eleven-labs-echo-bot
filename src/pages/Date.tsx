import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Database, Webhook, Copy, Settings, FileText } from 'lucide-react';
import { useEnhancedUserData, UserDataColumn } from '@/hooks/useEnhancedUserData';
import { CSVImportExport } from '@/components/contacts/CSVImportExport';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const DataPage = () => {
  const { 
    userData, 
    databases, 
    columns, 
    currentDatabase, 
    isLoading, 
    createDatabase,
    createColumn,
    createUserData, 
    updateUserData, 
    deleteUserData,
    exportToCSV,
    copyWebhookURL,
    switchDatabase
  } = useEnhancedUserData();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDatabaseOpen, setIsAddDatabaseOpen] = useState(false);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    location: '',
    info: '',
    date_user: new window.Date().toISOString().split('T')[0],
    custom_fields: {} as Record<string, any>
  });

  const [databaseForm, setDatabaseForm] = useState({
    name: '',
    description: ''
  });

  const [columnForm, setColumnForm] = useState({
    column_name: '',
    column_type: 'text' as UserDataColumn['column_type'],
    is_required: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      number: '',
      location: '',
      info: '',
      date_user: new window.Date().toISOString().split('T')[0],
      custom_fields: {}
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    const result = await createUserData({
      ...formData,
      date_user: new window.Date(formData.date_user).toISOString()
    });

    if (result) {
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      number: item.number || '',
      location: item.location || '',
      info: item.info || '',
      date_user: item.date_user.split('T')[0],
      custom_fields: item.custom_fields || {}
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem || !formData.name.trim()) {
      return;
    }

    const result = await updateUserData(editingItem.id, {
      ...formData,
      date_user: new window.Date(formData.date_user).toISOString()
    });

    if (result) {
      resetForm();
      setEditingItem(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Ești sigur că vrei să ștergi această înregistrare?')) {
      await deleteUserData(id);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new window.Date(dateString), 'dd MMM yyyy, HH:mm', { locale: ro });
    } catch {
      return dateString;
    }
  };

  const handleCreateDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!databaseForm.name.trim()) return;

    const result = await createDatabase(databaseForm.name, databaseForm.description);
    if (result) {
      setDatabaseForm({ name: '', description: '' });
      setIsAddDatabaseOpen(false);
    }
  };

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnForm.column_name.trim()) return;

    const result = await createColumn(
      columnForm.column_name,
      columnForm.column_type,
      columnForm.is_required
    );
    if (result) {
      setColumnForm({ column_name: '', column_type: 'text', is_required: false });
      setIsAddColumnOpen(false);
    }
  };

  const handleCSVImport = async (csvData: any[]) => {
    // Import CSV data into current database with enhanced mapping
    for (const row of csvData) {
      const customFields: Record<string, any> = {};
      
      // Extract custom fields
      columns.forEach(col => {
        if (row[col.column_name] !== undefined) {
          customFields[col.column_name] = row[col.column_name];
        }
      });

      // Enhanced mapping to handle automatic CSV detection
      const mappedData = {
        name: row.nume || row.Nume || row.name || row.Name || row.client || row.Client || '',
        number: row.telefon || row.Telefon || row.phone || row.Phone || row.tel || row.Tel || 
                row.mobile || row.Mobile || row.contact || row.Contact || row.numar || row.Număr || 
                row.number || row.Number || '',
        location: row.locatie || row.Locație || row.location || row.Location || row.city || row.City || 
                 row.oras || row.Oras || row.adresa || row.Adresa || row.address || row.Address || '',
        info: row.info || row.Info || row.informatii || row.Informații || row.details || row.Details || 
              row.description || row.Description || row.detalii || row.Detalii || '',
        date_user: row.data || row.Data || row.date || row.Date || row.datum || new Date().toISOString(),
        custom_fields: customFields
      };

      // Only create if we have at least a name
      if (mappedData.name.trim()) {
        await createUserData(mappedData);
      }
    }
  };

  const downloadTemplate = () => {
    const standardHeaders = ['Nume', 'Număr', 'Locație', 'Data', 'Informații'];
    const customHeaders = columns.map(col => col.column_name);
    const headers = [...standardHeaders, ...customHeaders];
    
    const csvContent = headers.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_date_utilizator.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentDb = databases.find(db => db.id === currentDatabase);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Date Utilizator</h1>
              <p className="text-muted-foreground">Gestionează datele tale personale și configurează webhook-urile</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={isAddDatabaseOpen} onOpenChange={setIsAddDatabaseOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Bază Nouă
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Creează Bază de Date Nouă</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateDatabase} className="space-y-4">
                  <div>
                    <Label htmlFor="db_name">Nume Bază de Date *</Label>
                    <Input
                      id="db_name"
                      value={databaseForm.name}
                      onChange={(e) => setDatabaseForm({ ...databaseForm, name: e.target.value })}
                      placeholder="Ex: Clienți Premium"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="db_description">Descriere</Label>
                    <Textarea
                      id="db_description"
                      value={databaseForm.description}
                      onChange={(e) => setDatabaseForm({ ...databaseForm, description: e.target.value })}
                      placeholder="Descrierea bazei de date..."
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">Creează</Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddDatabaseOpen(false)}>
                      Anulează
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Coloană Nouă
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adaugă Coloană Personalizată</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateColumn} className="space-y-4">
                  <div>
                    <Label htmlFor="col_name">Nume Coloană *</Label>
                    <Input
                      id="col_name"
                      value={columnForm.column_name}
                      onChange={(e) => setColumnForm({ ...columnForm, column_name: e.target.value })}
                      placeholder="Ex: Vârstă, Ocupație"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="col_type">Tip Coloană</Label>
                    <Select value={columnForm.column_type} onValueChange={(value: any) => setColumnForm({ ...columnForm, column_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Număr</SelectItem>
                        <SelectItem value="date">Dată</SelectItem>
                        <SelectItem value="boolean">Da/Nu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">Adaugă</Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddColumnOpen(false)}>
                      Anulează
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adaugă Date
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adaugă Date Noi</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nume *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Introduceți numele"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="number">Număr</Label>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      placeholder="Introduceți numărul"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Locație</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Introduceți locația"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date_user">Data</Label>
                    <Input
                      id="date_user"
                      type="date"
                      value={formData.date_user}
                      onChange={(e) => setFormData({ ...formData, date_user: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="info">Informații</Label>
                    <Textarea
                      id="info"
                      value={formData.info}
                      onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                      placeholder="Introduceți informații suplimentare"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">Adaugă</Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Anulează
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Database Selector */}
        {databases.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Selectează Baza de Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={currentDatabase} onValueChange={switchDatabase}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selectează baza de date" />
                </SelectTrigger>
                <SelectContent>
                  {databases.map((db) => (
                    <SelectItem key={db.id} value={db.id}>
                      {db.name} {db.is_default && '(Principală)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Înregistrări</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Baze de Date</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{databases.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Webhook Unic</CardTitle>
              <Webhook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground truncate">
                  {currentDb?.webhook_token ? `...${currentDb.webhook_token.slice(-8)}` : 'N/A'}
                </div>
                {currentDb && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyWebhookURL(currentDb)}
                    className="p-1 h-6 w-6"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ultima Actualizare</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {userData.length > 0 ? formatDate(userData[0].updated_at) : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CSV Import/Export */}
        <CSVImportExport
          onImportSuccess={handleCSVImport}
          onDownloadTemplate={downloadTemplate}
          expectedHeaders={['Nume', 'Număr', 'Locație', 'Data', 'Informații']}
          data={userData}
          filename={`date_utilizator_${currentDb?.name || 'export'}`}
        />

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Date Utilizator</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Se încarcă...</div>
              </div>
            ) : userData.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div className="text-muted-foreground">Nu există date încă</div>
                  <div className="text-sm text-muted-foreground">Adaugă prima înregistrare pentru a începe</div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nume</TableHead>
                      <TableHead>Număr</TableHead>
                      <TableHead>Locație</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Informații</TableHead>
                      {columns.map((col) => (
                        <TableHead key={col.id}>{col.column_name}</TableHead>
                      ))}
                      <TableHead>Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.number || '-'}</TableCell>
                        <TableCell>{item.location || '-'}</TableCell>
                        <TableCell>{formatDate(item.date_user)}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.info || '-'}</TableCell>
                        {columns.map((col) => (
                          <TableCell key={col.id} className="max-w-xs truncate">
                            {item.custom_fields[col.column_name] || '-'}
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editează Date</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="edit_name">Nume *</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Introduceți numele"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit_number">Număr</Label>
                <Input
                  id="edit_number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Introduceți numărul"
                />
              </div>
              
              <div>
                <Label htmlFor="edit_location">Locație</Label>
                <Input
                  id="edit_location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Introduceți locația"
                />
              </div>
              
              <div>
                <Label htmlFor="edit_date_user">Data</Label>
                <Input
                  id="edit_date_user"
                  type="date"
                  value={formData.date_user}
                  onChange={(e) => setFormData({ ...formData, date_user: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_info">Informații</Label>
                <Textarea
                  id="edit_info"
                  value={formData.info}
                  onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                  placeholder="Introduceți informații suplimentare"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Actualizează</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Anulează
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DataPage;