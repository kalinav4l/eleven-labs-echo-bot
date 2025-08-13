import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface UserData {
  id: string;
  user_id: string;
  name: string;
  number?: string;
  location?: string;
  info?: string;
  date_user: string;
  created_at: string;
  updated_at: string;
}

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Eroare",
          description: "Nu s-au putut încărca datele.",
          variant: "destructive"
        });
        return;
      }

      setUserData(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare neașteptată.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createUserData = async (data: Partial<UserData>) => {
    if (!user) return;

    try {
      const { data: newData, error } = await supabase
        .from('user_data')
        .insert([
          {
            user_id: user.id,
            name: data.name,
            number: data.number,
            location: data.location,
            info: data.info,
            date_user: data.date_user || new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user data:', error);
        toast({
          title: "Eroare",
          description: "Nu s-a putut adăuga înregistrarea.",
          variant: "destructive"
        });
        return;
      }

      setUserData(prev => [newData, ...prev]);
      toast({
        title: "Succes",
        description: "Înregistrarea a fost adăugată cu succes."
      });

      // Trigger webhook notification
      triggerWebhook('add', newData);
      
      return newData;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare neașteptată.",
        variant: "destructive"
      });
    }
  };

  const updateUserData = async (id: string, data: Partial<UserData>) => {
    if (!user) return;

    try {
      const { data: updatedData, error } = await supabase
        .from('user_data')
        .update({
          name: data.name,
          number: data.number,
          location: data.location,
          info: data.info,
          date_user: data.date_user
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user data:', error);
        toast({
          title: "Eroare",
          description: "Nu s-a putut actualiza înregistrarea.",
          variant: "destructive"
        });
        return;
      }

      setUserData(prev => 
        prev.map(item => item.id === id ? updatedData : item)
      );
      
      toast({
        title: "Succes",
        description: "Înregistrarea a fost actualizată cu succes."
      });

      // Trigger webhook notification
      triggerWebhook('update', updatedData);
      
      return updatedData;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare neașteptată.",
        variant: "destructive"
      });
    }
  };

  const deleteUserData = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_data')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting user data:', error);
        toast({
          title: "Eroare",
          description: "Nu s-a putut șterge înregistrarea.",
          variant: "destructive"
        });
        return;
      }

      setUserData(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Succes",
        description: "Înregistrarea a fost ștearsă cu succes."
      });

      // Trigger webhook notification
      triggerWebhook('delete', { id });
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare neașteptată.",
        variant: "destructive"
      });
    }
  };

  const triggerWebhook = async (action: string, data: any) => {
    if (!user) return;

    try {
      // Get user's webhook configs
      const { data: webhookConfigs } = await supabase
        .from('webhook_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (!webhookConfigs || webhookConfigs.length === 0) return;

      // Send webhook notifications for each config
      for (const config of webhookConfigs) {
        const payload = {
          userid: user.id,
          action: action,
          data: data,
          timestamp: new Date().toISOString()
        };

        try {
          // For now, just log to console - webhook functionality will be expanded later
          console.log('Webhook triggered:', { config: config.id, payload });
        } catch (webhookError) {
          console.error('Webhook error:', webhookError);
        }
      }
    } catch (error) {
      console.error('Error triggering webhook:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  return {
    userData,
    isLoading,
    fetchUserData,
    createUserData,
    updateUserData,
    deleteUserData,
    refreshUserData: fetchUserData
  };
};