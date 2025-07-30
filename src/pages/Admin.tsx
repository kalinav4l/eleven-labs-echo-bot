import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, Phone, CreditCard, Activity, Edit, DollarSign, Ban, UserCheck, Trash2, Plus, TrendingUp, Settings } from 'lucide-react';
import { UserEditModal } from '@/components/UserEditModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApiKeyManager from '@/components/admin/ApiKeyManager';

interface AdminUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  account_type: string;
  user_role: 'admin' | 'moderator' | 'user';
  balance_usd: number;
  total_calls: number;
  total_minutes: number;
  total_spent_usd: number;
  plan: string;
  created_at: string;
  last_sign_in: string | null;
}

interface AdminStats {
  total_users: number;
  total_calls: number;
  total_revenue: number;
  active_users_today: number;
  banned_users: number;
}

const Admin = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Check if user has admin role through database
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdminStatus, setCheckingAdminStatus] = useState(true);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setCheckingAdminStatus(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('is_admin_user', {
        _user_id: user.id
      });

      if (error) throw error;
      setIsAdmin(data || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setCheckingAdminStatus(false);
    }
  };

  const handleBlockUser = async (targetUser: AdminUser) => {
    if (!user) return;

    try {
      const newBanStatus = targetUser.account_type !== 'banned';
      
      const { error } = await supabase.rpc('admin_ban_user', {
        p_target_user_id: targetUser.user_id,
        p_ban_status: newBanStatus,
        p_admin_user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Succes",
        description: `Utilizatorul a fost ${newBanStatus ? 'blocat' : 'deblocat'} cu succes.`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut modifica statusul utilizatorului.",
        variant: "destructive"
      });
    }
  };

  const handleAddCredits = async (targetUser: AdminUser, amount: number) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('admin_modify_balance', {
        p_target_user_id: targetUser.user_id,
        p_balance_amount: amount,
        p_operation: 'add',
        p_admin_user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Succes",
        description: `Am adăugat ${amount} USD în contul utilizatorului.`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error adding credits:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut adăuga credite.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (targetUser: AdminUser) => {
    if (!user) return;
    
    if (!confirm(`Sigur vrei să ștergi utilizatorul ${targetUser.first_name} ${targetUser.last_name}?`)) {
      return;
    }

    try {
      // For now, we'll just ban the user since there's no delete function
      const { error } = await supabase.rpc('admin_ban_user', {
        p_target_user_id: targetUser.user_id,
        p_ban_status: true,
        p_admin_user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Utilizatorul a fost blocat permanent.",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut bloca utilizatorul.",
        variant: "destructive"
      });
    }
  };

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
      toast({
        title: "Eroare",
        description: "Nu am putut încărca utilizatorii.",
        variant: "destructive"
      });
    }
  };

  const fetchStats = async () => {
    try {
      // Calculate basic stats from users data
      const totalUsers = users.length;
      const totalCalls = users.reduce((sum, user) => sum + user.total_calls, 0);
      const totalRevenue = users.reduce((sum, user) => sum + user.balance_usd, 0);
      const totalSpent = users.reduce((sum, user) => sum + user.total_spent_usd, 0);
      const bannedUsers = users.filter(user => user.account_type === 'banned').length;
      
      setStats({
        total_users: totalUsers,
        total_calls: totalCalls,
        total_revenue: totalRevenue,
        active_users_today: Math.floor(totalUsers * 0.1), // Estimated
        banned_users: bannedUsers
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (users.length > 0) {
      fetchStats();
      setLoadingData(false);
    }
  }, [users]);

  if (loading || checkingAdminStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Se încarcă...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    toast({
      title: "Acces restricționat",
      description: "Nu aveți permisiuni de administrator.",
      variant: "destructive"
    });
    return <Navigate to="/pricing" replace />;
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto p-6 max-w-6xl">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Panel
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestionează utilizatorii și monitorizează activitatea platformei
              </p>
            </div>
            <Button 
              variant="default"
              onClick={() => window.location.reload()}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Reîmprospătează
            </Button>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Utilizatori
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurări
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Caută utilizatori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-5 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_users}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Utilizatori</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_calls}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Apeluri</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">${stats.total_revenue.toFixed(2)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Venituri</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active_users_today}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Activi Astăzi</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-red-600">{stats.banned_users}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Banaţi</div>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="space-y-2">
            {loadingData ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                Se încarcă utilizatorii...
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div 
                  key={user.user_id} 
                  className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow ${
                    user.account_type === 'banned' ? 'border-red-200 dark:border-red-800' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left: User Icon + Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {user.first_name} {user.last_name}
                          </h3>
                          <Badge 
                            variant={user.account_type === 'banned' ? 'destructive' : 'default'}
                            className={user.account_type === 'banned' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}
                          >
                            {user.account_type === 'banned' ? 'Blocat' : 'Activ'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email} • {user.user_role} • ${user.balance_usd.toFixed(2)} • {user.total_calls} apeluri
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setEditModalOpen(true);
                        }}
                        className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editează
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const amount = parseFloat(prompt('Suma pentru adăugare (USD):') || '0');
                          if (amount > 0) {
                            handleAddCredits(user, amount);
                          }
                        }}
                        className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Credite
                      </Button>
                      <Button
                        variant={user.account_type === 'banned' ? 'outline' : 'destructive'}
                        size="sm"
                        onClick={() => handleBlockUser(user)}
                        className={user.account_type === 'banned' 
                          ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700' 
                          : 'bg-red-600 hover:bg-red-700 text-white'
                        }
                      >
                        {user.account_type === 'banned' ? (
                          <>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Deblocare
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4 mr-1" />
                            Blocare
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredUsers.length === 0 && !loadingData && (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Nu s-au găsit utilizatori.
            </div>
          )}

          <UserEditModal
            user={editingUser}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onUserUpdated={fetchUsers}
          />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <ApiKeyManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;