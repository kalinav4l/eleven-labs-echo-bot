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
import { Search, Users, Phone, CreditCard, Activity } from 'lucide-react';

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

  // Check if user is the specific admin user
  const isSpecificAdmin = user?.id === 'a698e3c2-f0e6-4f42-8955-971d91e725ce' && 
                         user?.email === 'mariusvirlan109@gmail.com';

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
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administrare</h1>
            <p className="text-muted-foreground">
              Gestionați utilizatorii și monitorizați activitatea platformei
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            Admin Panel
          </Badge>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Utilizatori</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_users}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Apeluri</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_calls}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Venituri Totale</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.total_revenue.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activi Astăzi</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_users_today}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilizatori Banaţi</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.banned_users}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestionare Utilizatori</CardTitle>
            <CardDescription>
              Vedeți și gestionați toți utilizatorii platformei
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Căutați utilizatori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {loadingData ? (
                <div className="text-center py-4">Se încarcă utilizatorii...</div>
              ) : (
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-12 px-4 text-left font-medium">Utilizator</th>
                          <th className="h-12 px-4 text-left font-medium">Rol</th>
                          <th className="h-12 px-4 text-left font-medium">Status</th>
                          <th className="h-12 px-4 text-left font-medium">Sold</th>
                          <th className="h-12 px-4 text-left font-medium">Apeluri</th>
                          <th className="h-12 px-4 text-left font-medium">Înregistrat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.user_id} className="border-b">
                            <td className="h-12 px-4">
                              <div>
                                <div className="font-medium">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {user.email}
                                </div>
                              </div>
                            </td>
                            <td className="h-12 px-4">
                              <Badge 
                                variant={user.user_role === 'admin' ? 'default' : 'outline'}
                              >
                                {user.user_role}
                              </Badge>
                            </td>
                            <td className="h-12 px-4">
                              <Badge 
                                variant={user.account_type === 'banned' ? 'destructive' : 'outline'}
                              >
                                {user.account_type}
                              </Badge>
                            </td>
                            <td className="h-12 px-4">
                              <div className="font-medium">
                                ${user.balance_usd.toFixed(2)}
                              </div>
                            </td>
                            <td className="h-12 px-4">
                              <div className="text-sm">
                                <div>{user.total_calls} apeluri</div>
                                <div className="text-muted-foreground text-xs">
                                  {user.total_minutes.toFixed(1)} min
                                </div>
                              </div>
                            </td>
                            <td className="h-12 px-4">
                              <div className="text-sm text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString('ro-RO')}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;