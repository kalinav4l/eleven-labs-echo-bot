
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import HamburgerMenu from '@/components/HamburgerMenu';

const Account = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || '',
          phone: data.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          first_name: profile.firstName,
          last_name: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      alert('Profil actualizat cu succes!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Eroare la actualizarea profilului');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-black">
      <HamburgerMenu />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Cabinet Personal</h1>
            <p className="text-gray-400">Gestionează-ți contul și preferințele</p>
          </div>

          <Card className="bg-black border-gray-800 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informații Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Prenume</label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    className="bg-black border-gray-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Nume</label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    className="bg-black border-gray-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </label>
                <Input
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="bg-black border-gray-800 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Telefon
                </label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="bg-black border-gray-800 text-white"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={updateProfile}
                  disabled={loading}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  {loading ? 'Se salvează...' : 'Salvează Modificările'}
                </Button>
                
                <Button
                  onClick={signOut}
                  variant="outline"
                  className="border-gray-800 text-gray-400 hover:bg-gray-900"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Deconectare
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;
