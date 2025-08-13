import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Database, Webhook } from 'lucide-react';
import { useUserData, UserData } from '@/hooks/useUserData';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const DataPage = () => {
  const { userData, isLoading, createUserData, updateUserData, deleteUserData } = useUserData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    location: '',
    info: '',
    date_user: new window.Date().toISOString().split('T')[0]
  });

  const resetForm = () => {
    setFormData({
      name: '',
      number: '',
      location: '',
      info: '',
      date_user: new window.Date().toISOString().split('T')[0]
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

  const handleEdit = (item: UserData) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      number: item.number || '',
      location: item.location || '',
      info: item.info || '',
      date_user: item.date_user.split('T')[0]
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <CardTitle className="text-sm font-medium">Webhook Unic</CardTitle>
              <Webhook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                URL: /webhook/user123
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