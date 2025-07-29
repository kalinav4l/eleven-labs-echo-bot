import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AdminUser } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Ban, CreditCard, DollarSign, Shield, UserCheck, UserX } from 'lucide-react';

interface UserActionsDialogProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActionComplete: () => void;
}

export function UserActionsDialog({ user, open, onOpenChange, onActionComplete }: UserActionsDialogProps) {
  const { user: adminUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditOperation, setCreditOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [newRole, setNewRole] = useState<'admin' | 'moderator' | 'user'>(user.user_role);

  const handleBanUser = async () => {
    if (!adminUser) return;
    setLoading(true);

    try {
      const { error } = await supabase.rpc('admin_ban_user', {
        p_target_user_id: user.user_id,
        p_ban_status: user.account_type !== 'banned',
        p_admin_user_id: adminUser.id
      });

      if (error) throw error;
      onActionComplete();
    } catch (error) {
      console.error('Error banning user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModifyCredits = async () => {
    if (!adminUser || !creditAmount) return;
    setLoading(true);

    try {
      const { error } = await supabase.rpc('admin_modify_credits', {
        p_target_user_id: user.user_id,
        p_credit_amount: parseInt(creditAmount),
        p_operation: creditOperation,
        p_admin_user_id: adminUser.id,
        p_description: `Admin ${creditOperation}: ${creditAmount} credits`
      });

      if (error) throw error;
      setCreditAmount('');
      onActionComplete();
    } catch (error) {
      console.error('Error modifying credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModifyBalance = async () => {
    if (!adminUser || !balanceAmount) return;
    setLoading(true);

    try {
      const { error } = await supabase.rpc('admin_modify_balance', {
        p_target_user_id: user.user_id,
        p_balance_amount: parseFloat(balanceAmount),
        p_operation: balanceOperation,
        p_admin_user_id: adminUser.id
      });

      if (error) throw error;
      setBalanceAmount('');
      onActionComplete();
    } catch (error) {
      console.error('Error modifying balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!adminUser || newRole === user.user_role) return;
    setLoading(true);

    try {
      const { error } = await supabase.rpc('admin_change_role', {
        p_target_user_id: user.user_id,
        p_new_role: newRole,
        p_admin_user_id: adminUser.id
      });

      if (error) throw error;
      onActionComplete();
    } catch (error) {
      console.error('Error changing role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Acțiuni pentru {user.first_name} {user.last_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="credits" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="credits">Credite</TabsTrigger>
            <TabsTrigger value="balance">Sold</TabsTrigger>
            <TabsTrigger value="role">Rol</TabsTrigger>
            <TabsTrigger value="account">Cont</TabsTrigger>
          </TabsList>

          <TabsContent value="credits">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Gestionare Credite
                </CardTitle>
                <CardDescription>
                  Credite curente: {user.remaining_credits} / {user.total_credits} (Folosite: {user.used_credits})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="creditOperation">Operațiune</Label>
                  <Select value={creditOperation} onValueChange={(value: any) => setCreditOperation(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Adaugă credite</SelectItem>
                      <SelectItem value="subtract">Scade credite</SelectItem>
                      <SelectItem value="set">Setează total</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="creditAmount">Numărul de credite</Label>
                  <Input
                    id="creditAmount"
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="Introduceți numărul de credite"
                  />
                </div>
                <Button onClick={handleModifyCredits} disabled={loading || !creditAmount}>
                  {loading ? 'Se procesează...' : `${creditOperation === 'add' ? 'Adaugă' : creditOperation === 'subtract' ? 'Scade' : 'Setează'} credite`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Gestionare Sold
                </CardTitle>
                <CardDescription>
                  Sold curent: ${user.balance_usd.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="balanceOperation">Operațiune</Label>
                  <Select value={balanceOperation} onValueChange={(value: any) => setBalanceOperation(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Adaugă la sold</SelectItem>
                      <SelectItem value="subtract">Scade din sold</SelectItem>
                      <SelectItem value="set">Setează sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="balanceAmount">Suma (USD)</Label>
                  <Input
                    id="balanceAmount"
                    type="number"
                    step="0.01"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    placeholder="Introduceți suma în USD"
                  />
                </div>
                <Button onClick={handleModifyBalance} disabled={loading || !balanceAmount}>
                  {loading ? 'Se procesează...' : `${balanceOperation === 'add' ? 'Adaugă' : balanceOperation === 'subtract' ? 'Scade' : 'Setează'} sold`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="role">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Schimbare Rol
                </CardTitle>
                <CardDescription>
                  Rol curent: {user.user_role}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="newRole">Rol nou</Label>
                  <Select value={newRole} onValueChange={(value: any) => setNewRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Utilizator</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={newRole === user.user_role}>
                      Schimbă rolul
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmați schimbarea rolului</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sunteți sigur că doriți să schimbați rolul utilizatorului {user.first_name} {user.last_name} de la "{user.user_role}" la "{newRole}"?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anulare</AlertDialogCancel>
                      <AlertDialogAction onClick={handleChangeRole} disabled={loading}>
                        {loading ? 'Se procesează...' : 'Confirmă'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {user.account_type === 'banned' ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                  Status Cont
                </CardTitle>
                <CardDescription>
                  Status curent: {user.account_type === 'banned' ? 'Blocat' : 'Activ'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant={user.account_type === 'banned' ? "default" : "destructive"}
                      className="w-full"
                    >
                      {user.account_type === 'banned' ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Deblochează utilizatorul
                        </>
                      ) : (
                        <>
                          <Ban className="h-4 w-4 mr-2" />
                          Blochează utilizatorul
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {user.account_type === 'banned' ? 'Deblochează utilizatorul' : 'Blochează utilizatorul'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {user.account_type === 'banned' 
                          ? `Sunteți sigur că doriți să deblocați utilizatorul ${user.first_name} ${user.last_name}? Va putea din nou să acceseze aplicația.`
                          : `Sunteți sigur că doriți să blocați utilizatorul ${user.first_name} ${user.last_name}? Nu va mai putea accesa aplicația.`
                        }
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anulare</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBanUser} disabled={loading}>
                        {loading ? 'Se procesează...' : 'Confirmă'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}