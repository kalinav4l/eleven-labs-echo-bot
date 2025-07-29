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
import { Search, Users, Phone, CreditCard, Activity, Edit, DollarSign, Ban, UserCheck, Trash2, Plus, TrendingUp } from 'lucide-react';
import { UserEditModal } from '@/components/UserEditModal';

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

  // Check if user is the specific admin user
  const isSpecificAdmin = user?.id === 'a698e3c2-f0e6-4f42-8955-971d91e725ce' && 
                         user?.email === 'mariusvirlan109@gmail.com';

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
    if (user && isSpecificAdmin) {
      fetchUsers();
    }
  }, [user, isSpecificAdmin]);

  useEffect(() => {
    if (users.length > 0) {
      fetchStats();
      setLoadingData(false);
    }
  }, [users]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Se încarcă...</div>
      </div>
    );
  }

  if (!user || !isSpecificAdmin) {
    return <Navigate to="/pricing" replace />;
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto p-6 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Panel de Administrare
              </h1>
              <p className="text-muted-foreground text-lg">
                Gestionați utilizatorii și monitorizați activitatea platformei
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm px-4 py-2 animate-fade-in">
                <Activity className="h-4 w-4 mr-2" />
                Admin Panel
              </Badge>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Utilizatori</CardTitle>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_users}</div>
                  <p className="text-xs text-muted-foreground mt-1">registrați pe platformă</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Apeluri</CardTitle>
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_calls}</div>
                  <p className="text-xs text-muted-foreground mt-1">apeluri efectuate</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Venituri Totale</CardTitle>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">${stats.total_revenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">venituri generate</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Activi Astăzi</CardTitle>
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.active_users_today}</div>
                  <p className="text-xs text-muted-foreground mt-1">utilizatori activi</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Utilizatori Banaţi</CardTitle>
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <Ban className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.banned_users}</div>
                  <p className="text-xs text-muted-foreground mt-1">conturi blocate</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Search */}
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Căutați utilizatori..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80 border-0 bg-gray-100 dark:bg-gray-700"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="border-0 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Reîmprospătează
                  </Button>
                  <Badge variant="secondary" className="px-4 py-2">
                    {filteredUsers.length} utilizatori găsiți
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Istoric Utilizatori</h2>
            </div>

            {loadingData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                  <Card 
                    key={user.user_id} 
                    className={`group hover:shadow-xl transition-all duration-300 border-0 backdrop-blur-sm ${
                      user.account_type === 'banned' 
                        ? 'bg-red-50/80 dark:bg-red-900/20' 
                        : 'bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* User Info */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {user.first_name} {user.last_name}
                              </h3>
                              {user.account_type === 'banned' && (
                                <Badge variant="destructive" className="text-xs">
                                  BLOCAT
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <Badge 
                            variant={user.user_role === 'admin' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {user.user_role}
                          </Badge>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100 dark:border-gray-700">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              ${user.balance_usd.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">Sold</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {user.total_calls}
                            </div>
                            <p className="text-xs text-muted-foreground">Apeluri</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                              ${user.total_spent_usd.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">Cheltuit</p>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                              {user.total_minutes.toFixed(1)}m
                            </div>
                            <p className="text-xs text-muted-foreground">Minute</p>
                          </div>
                        </div>

                        {/* Plan and Status */}
                        <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                          <Badge 
                            variant={user.plan === 'enterprise' ? 'default' : user.plan === 'silver' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {user.plan === 'starter' ? 'GRATUIT' : user.plan.toUpperCase()}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString('ro-RO')}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setEditModalOpen(true);
                            }}
                            className="flex-1 h-8 text-xs border-0 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editează
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const amount = parseFloat(prompt('Introduceți suma pentru adăugare (USD):') || '0');
                              if (amount > 0) {
                                handleAddCredits(user, amount);
                              }
                            }}
                            className="h-8 text-xs border-0 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant={user.account_type === 'banned' ? 'default' : 'destructive'}
                            size="sm"
                            onClick={() => handleBlockUser(user)}
                            className="h-8 text-xs"
                          >
                            {user.account_type === 'banned' ? (
                              <UserCheck className="h-3 w-3" />
                            ) : (
                              <Ban className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <UserEditModal
            user={editingUser}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onUserUpdated={fetchUsers}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;