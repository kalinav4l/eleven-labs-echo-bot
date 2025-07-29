import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AdminUser } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Ban, CreditCard, DollarSign, Shield, UserCheck, UserX } from 'lucide-react';
import { UserActionsDialog } from '../dialogs/UserActionsDialog';

export function UsersManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);

  const fetchUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('admin_get_all_users', {
        p_admin_user_id: user.id
      });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserAction = (user: AdminUser) => {
    setSelectedUser(user);
    setActionDialogOpen(true);
  };

  const handleActionComplete = () => {
    setActionDialogOpen(false);
    setSelectedUser(null);
    fetchUsers(); // Refresh the users list
  };

  if (loading) {
    return <div>Se încarcă utilizatorii...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestionare Utilizatori</h2>
          <p className="text-muted-foreground">
            Gestionați utilizatorii, creditele și permisiunile
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Căutare utilizatori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utilizatori ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilizator</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Credite</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead>Apeluri</TableHead>
                <TableHead>Înregistrat</TableHead>
                <TableHead>Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((adminUser) => (
                <TableRow key={adminUser.user_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {adminUser.first_name} {adminUser.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {adminUser.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {adminUser.user_role === 'admin' && <Shield className="h-4 w-4 text-primary" />}
                      <span className="capitalize">{adminUser.user_role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {adminUser.account_type === 'banned' ? (
                        <>
                          <UserX className="h-4 w-4 text-destructive" />
                          <span className="text-destructive">Blocat</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Activ</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{adminUser.remaining_credits} / {adminUser.total_credits}</div>
                      <div className="text-muted-foreground">Folosite: {adminUser.used_credits}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(adminUser.balance_usd)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{adminUser.total_calls} apeluri</div>
                      <div className="text-muted-foreground">{adminUser.total_minutes.toFixed(1)} min</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(adminUser.created_at)}</div>
                      {adminUser.last_sign_in && (
                        <div className="text-muted-foreground">
                          Ultima: {formatDate(adminUser.last_sign_in)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUserAction(adminUser)}
                    >
                      Acțiuni
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedUser && (
        <UserActionsDialog
          user={selectedUser}
          open={actionDialogOpen}
          onOpenChange={setActionDialogOpen}
          onActionComplete={handleActionComplete}
        />
      )}
    </div>
  );
}