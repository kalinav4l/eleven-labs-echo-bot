import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Phone, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface PhoneMapping {
  id: string;
  phone_number: string;
  verified: boolean;
  primary_number: boolean;
  created_at: string;
}

export default function PhoneNumberMapping() {
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: phoneMappings, isLoading } = useQuery({
    queryKey: ['phone-mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_phone_mapping')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PhoneMapping[];
    }
  });

  const addPhoneMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const { data, error } = await supabase
        .from('user_phone_mapping')
        .insert({
          phone_number: phoneNumber,
          user_id: (await supabase.auth.getUser()).data.user!.id,
          verified: false,
          primary_number: (phoneMappings?.length || 0) === 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-mappings'] });
      setNewPhoneNumber('');
      toast({
        title: "Număr adăugat",
        description: "Numărul de telefon a fost adăugat cu succes."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut adăuga numărul de telefon.",
        variant: "destructive"
      });
    }
  });

  const deletePhoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_phone_mapping')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-mappings'] });
      toast({
        title: "Număr șters",
        description: "Numărul de telefon a fost șters cu succes."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut șterge numărul de telefon.",
        variant: "destructive"
      });
    }
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (id: string) => {
      // Reset all to false
      await supabase
        .from('user_phone_mapping')
        .update({ primary_number: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Set the selected one as primary
      const { error } = await supabase
        .from('user_phone_mapping')
        .update({ primary_number: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-mappings'] });
      toast({
        title: "Număr principal setat",
        description: "Numărul a fost setat ca număr principal."
      });
    }
  });

  const handleAddPhone = () => {
    if (!newPhoneNumber.trim()) return;
    
    // Simple phone validation
    const phoneRegex = /^\+?\d{8,15}$/;
    if (!phoneRegex.test(newPhoneNumber.replace(/\s/g, ''))) {
      toast({
        title: "Format invalid",
        description: "Introduceți un număr de telefon valid (8-15 cifre, opțional cu +).",
        variant: "destructive"
      });
      return;
    }
    
    addPhoneMutation.mutate(newPhoneNumber.trim());
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Numerele Mele de Telefon</h1>
          <p className="text-muted-foreground mt-2">
            Gestionați numerele de telefon pentru a primi callback-uri
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Adaugă Număr Nou
            </CardTitle>
            <CardDescription>
              Adăugați numerele de telefon pe care doriți să le primiți callback-uri de la agenți.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="phone">Număr de telefon</Label>
                <Input
                  id="phone"
                  placeholder="+373791234567"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPhone()}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleAddPhone}
                  disabled={addPhoneMutation.isPending || !newPhoneNumber.trim()}
                >
                  Adaugă
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Numerele Mele
            </CardTitle>
            <CardDescription>
              Lista numerelor de telefon înregistrate pentru callback-uri
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Încărcare...</div>
            ) : !phoneMappings || phoneMappings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nu aveți numere de telefon înregistrate
              </div>
            ) : (
              <div className="space-y-3">
                {phoneMappings.map((mapping) => (
                  <div
                    key={mapping.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{mapping.phone_number}</span>
                      <div className="flex gap-2">
                        {mapping.primary_number && (
                          <Badge variant="default">Principal</Badge>
                        )}
                        {mapping.verified && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verificat
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!mapping.primary_number && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPrimaryMutation.mutate(mapping.id)}
                          disabled={setPrimaryMutation.isPending}
                        >
                          Setează ca Principal
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePhoneMutation.mutate(mapping.id)}
                        disabled={deletePhoneMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cum funcționează?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                • Când un agent promite să sune înapoi, sistemul va căuta numărul sunat în această listă
              </p>
              <p>
                • Dacă găsește numărul, callback-ul va fi direcționat către contul dvs.
              </p>
              <p>
                • Dacă aveți mai multe numere, cel marcat ca "Principal" va fi folosit ca fallback
              </p>
              <p>
                • Callback-urile vor apărea în secțiunea "Programări" din meniul dvs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}