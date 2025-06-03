
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { User, Mail, Calendar, Shield, Coins, Gift } from 'lucide-react';

const AccountSettings = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: credits } = useQuery({
    queryKey: ['user-credits', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast({
        title: "Deconectat cu succes",
        description: "Ai fost deconectat din cont.",
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut să te deconectez. Încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-6">Nu ești conectat.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-black mb-6">Setări Cont</h1>
        
        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informații Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prenume</Label>
                <Input
                  id="firstName"
                  value={profile?.first_name || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nume</Label>
                <Input
                  id="lastName"
                  value={profile?.last_name || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <Input
                  id="email"
                  value={user.email || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div>
              <Label>Planul Curent</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Shield className="w-4 h-4 text-green-600" />
                <Badge variant="outline" className="capitalize">
                  {profile?.plan || 'starter'}
                </Badge>
              </div>
            </div>
            
            <div>
              <Label>Membru din</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ro-RO') : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credits Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="w-5 h-5 mr-2" />
              Informații Credite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {credits && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {credits.total_credits.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">Credite Totale</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {credits.used_credits.toLocaleString()}
                  </div>
                  <div className="text-sm text-red-600">Credite Folosite</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {credits.remaining_credits?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-green-600">Credite Rămase</div>
                </div>
              </div>
            )}
            
            <Separator />
            
            {/* Recent Transactions */}
            <div>
              <h3 className="font-semibold text-black mb-3">Tranzacții Recente</h3>
              <div className="space-y-2">
                {recentTransactions && recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.amount > 0 ? (
                            <Gift className="w-4 h-4 text-green-600" />
                          ) : (
                            <Coins className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-black">
                            {transaction.description || transaction.transaction_type}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString('ro-RO')}
                          </div>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} credite
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Nu există tranzacții recente.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Instrucțiuni pentru Administrator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">Pentru a adăuga credite manual unui utilizator:</h4>
              <div className="text-sm text-yellow-700 space-y-2">
                <p><strong>1.</strong> Accesează Supabase Dashboard → SQL Editor</p>
                <p><strong>2.</strong> Folosește această comandă pentru a adăuga credite:</p>
                <code className="block bg-yellow-100 p-2 rounded mt-2 text-xs">
                  SELECT public.admin_add_credits('email@utilizator.com', 50000, 'Bonus credite');
                </code>
                <p><strong>3.</strong> Pentru a verifica creditele unui utilizator:</p>
                <code className="block bg-yellow-100 p-2 rounded mt-2 text-xs">
                  SELECT * FROM public.admin_get_user_credits('email@utilizator.com');
                </code>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Email-ul acestui utilizator:</h4>
              <code className="text-blue-700 font-mono">{user.email}</code>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acțiuni Cont</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSignOut}
              disabled={loading}
              variant="destructive"
              className="w-full md:w-auto"
            >
              {loading ? 'Se deconectează...' : 'Deconectare'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
