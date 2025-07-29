import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  account_type: string;
  user_role: 'admin' | 'moderator' | 'user';
  balance_usd: number;
  plan: string;
}

interface UserEditModalProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  open,
  onOpenChange,
  onUserUpdated
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    account_type: 'regular',
    user_role: 'user' as 'admin' | 'moderator' | 'user',
    balance_usd: 0,
    plan: 'starter'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        account_type: user.account_type || 'regular',
        user_role: user.user_role || 'user',
        balance_usd: user.balance_usd || 0,
        plan: user.plan || 'starter'
      });
    }
  }, [user]);

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
          email: formData.email,
          account_type: formData.account_type,
          plan: formData.plan
        })
        .eq('id', user.user_id);

      if (profileError) throw profileError;

      // Update role
      const { error: roleError } = await supabase.rpc('admin_change_role', {
        p_target_user_id: user.user_id,
        p_new_role: formData.user_role,
        p_admin_user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (roleError) throw roleError;

      // Update balance
      const { error: balanceError } = await supabase.rpc('admin_modify_balance', {
        p_target_user_id: user.user_id,
        p_balance_amount: formData.balance_usd,
        p_operation: 'set',
        p_admin_user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (balanceError) throw balanceError;

      toast({
        title: "Succes",
        description: "Utilizatorul a fost actualizat cu succes.",
      });

      onUserUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut actualiza utilizatorul.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editează Utilizator</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prenume</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nume</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account_type">Tip Cont</Label>
              <Select 
                value={formData.account_type}
                onValueChange={(value) => setFormData({ ...formData, account_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="banned">Blocat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_role">Rol</Label>
              <Select 
                value={formData.user_role}
                onValueChange={(value) => setFormData({ ...formData, user_role: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilizator</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Sold (USD)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={formData.balance_usd}
                onChange={(e) => setFormData({ ...formData, balance_usd: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <Select 
                value={formData.plan}
                onValueChange={(value) => setFormData({ ...formData, plan: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter (Gratuit)</SelectItem>
                  <SelectItem value="bronze">Bronze ($99/mo)</SelectItem>
                  <SelectItem value="silver">Silver ($500/mo)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (Custom)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Anulează
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Se salvează...' : 'Salvează'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};