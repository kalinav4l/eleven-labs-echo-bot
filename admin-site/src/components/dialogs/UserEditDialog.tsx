import React, { useState } from 'react';
import { AdminUser } from '../../types/admin';
import { supabase } from '../../lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface UserEditDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function UserEditDialog({ user, open, onOpenChange, onUserUpdated }: UserEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    account_type: user?.account_type || 'regular',
    user_role: user?.user_role || 'user',
    balance_usd: user?.balance_usd?.toString() || '0',
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        account_type: user.account_type || 'regular',
        user_role: user.user_role || 'user',
        balance_usd: user.balance_usd?.toString() || '0',
      });
    }
  }, [user]);

  const handleChangeEmail = async () => {
    if (!user || formData.email === user.email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.admin.updateUserById(user.user_id, {
        email: formData.email
      });

      if (error) throw error;

      // Update profile table as well
      await supabase
        .from('profiles')
        .update({ email: formData.email })
        .eq('id', user.user_id);

      alert('Email-ul a fost schimbat cu succes!');
      onUserUpdated();
    } catch (error) {
      console.error('Error changing email:', error);
      alert('Eroare la schimbarea email-ului');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          account_type: formData.account_type,
        })
        .eq('id', user.user_id);

      if (profileError) throw profileError;

      // Update user role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.user_id);

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.user_id,
          role: formData.user_role,
        });

      if (roleError) throw roleError;

      // Update balance
      const { error: balanceError } = await supabase
        .from('user_balance')
        .update({
          balance_usd: parseFloat(formData.balance_usd),
        })
        .eq('user_id', user.user_id);

      if (balanceError) throw balanceError;

      onUserUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Eroare la actualizarea utilizatorului');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editează Utilizator</DialogTitle>
          <DialogDescription>
            Modifică datele utilizatorului selectat.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="first_name" className="text-right">
              Prenume
            </Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="last_name" className="text-right">
              Nume
            </Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleChangeEmail}
                disabled={loading || formData.email === user?.email}
              >
                Schimbă
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account_type" className="text-right">
              Status Cont
            </Label>
            <Select
              value={formData.account_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, account_type: value }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="banned">Banat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user_role" className="text-right">
              Rol
            </Label>
            <Select
              value={formData.user_role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, user_role: value }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="balance_usd" className="text-right">
              Sold ($)
            </Label>
            <Input
              id="balance_usd"
              type="number"
              step="0.01"
              value={formData.balance_usd}
              onChange={(e) => setFormData(prev => ({ ...prev, balance_usd: e.target.value }))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Anulează
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Se salvează...' : 'Salvează'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}