
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import HamburgerMenu from '@/components/HamburgerMenu';

const Account = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      } else if (data) {
        setProfile(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    try {
      const updates = {
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        email: user.email,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) {
        console.error('Error updating profile:', error);
      } else {
        alert('Profilul a fost actualizat cu succes!');
        loadProfile();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <HamburgerMenu />
      
      <div className="container mx-auto px-4 py-20 animate-fade-in">
        <Card className="max-w-2xl mx-auto bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-center">Cabinetul Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Prenume
                </label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-black border-gray-800 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nume
                </label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-black border-gray-800 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={user.email || ''}
                disabled
                className="bg-black border-gray-800 text-gray-500"
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={updateProfile}
                className="bg-white text-black hover:bg-gray-200"
              >
                Actualizează Profilul
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-gray-800 text-white hover:bg-gray-900"
              >
                Deconectare
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Funcții Disponibile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black border border-gray-800 p-4 rounded-lg hover:border-gray-700 transition-colors">
                  <h4 className="text-white font-medium">Istoricul Apelurilor</h4>
                  <p className="text-gray-400 text-sm mt-1">Vezi toate apelurile efectuate</p>
                </div>
                <div className="bg-black border border-gray-800 p-4 rounded-lg hover:border-gray-700 transition-colors">
                  <h4 className="text-white font-medium">Statistici</h4>
                  <p className="text-gray-400 text-sm mt-1">Analizează performanța agentului</p>
                </div>
                <div className="bg-black border border-gray-800 p-4 rounded-lg hover:border-gray-700 transition-colors">
                  <h4 className="text-white font-medium">Setări Avansate</h4>
                  <p className="text-gray-400 text-sm mt-1">Personalizează experiența</p>
                </div>
                <div className="bg-black border border-gray-800 p-4 rounded-lg hover:border-gray-700 transition-colors">
                  <h4 className="text-white font-medium">Suport</h4>
                  <p className="text-gray-400 text-sm mt-1">Obține ajutor rapid</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
