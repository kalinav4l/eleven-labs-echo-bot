import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'sonner';

export interface ContactDatabase {
  id: string;
  user_id: string;
  nume: string;
  telefon: string;
  info?: string;
  locatie?: string;
  tara?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContactInput {
  nume: string;
  telefon: string;
  info?: string;
  locatie?: string;
  tara?: string;
}

// Get all contacts for current user
export const useContactsDatabase = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contacts-database', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('contacts_database')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });
};

// Create new contact
export const useCreateContact = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (contactData: CreateContactInput) => {
      if (!user) throw new Error('User not authenticated');

      // Normalize phone number
      const normalizedPhone = contactData.telefon.replace(/[\s\-\(\)]/g, '');

      const { data, error } = await supabase
        .from('contacts_database')
        .insert({
          ...contactData,
          telefon: normalizedPhone,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts-database'] });
      toast.success('Contact adăugat cu succes');
    },
    onError: (error: any) => {
      console.error('Error creating contact:', error);
      if (error.code === '23505') {
        toast.error('Un contact cu acest număr de telefon există deja');
      } else {
        toast.error('Eroare la adăugarea contactului');
      }
    },
  });
};

// Update contact
export const useUpdateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContactDatabase> & { id: string }) => {
      // Normalize phone if provided
      if (updates.telefon) {
        updates.telefon = updates.telefon.replace(/[\s\-\(\)]/g, '');
      }

      const { data, error } = await supabase
        .from('contacts_database')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts-database'] });
      toast.success('Contact actualizat cu succes');
    },
    onError: (error: any) => {
      console.error('Error updating contact:', error);
      if (error.code === '23505') {
        toast.error('Un contact cu acest număr de telefon există deja');
      } else {
        toast.error('Eroare la actualizarea contactului');
      }
    },
  });
};

// Delete contact
export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contacts_database')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts-database'] });
      toast.success('Contact șters cu succes');
    },
    onError: (error) => {
      console.error('Error deleting contact:', error);
      toast.error('Eroare la ștergerea contactului');
    },
  });
};

// Import contacts from CSV data
export const useImportContacts = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (contacts: CreateContactInput[]) => {
      if (!user) throw new Error('User not authenticated');

      // Normalize phone numbers and add user_id
      const normalizedContacts = contacts.map(contact => ({
        ...contact,
        telefon: contact.telefon.replace(/[\s\-\(\)]/g, ''),
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from('contacts_database')
        .upsert(normalizedContacts, { 
          onConflict: 'user_id,telefon',
          ignoreDuplicates: false 
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts-database'] });
      toast.success(`${data?.length || 0} contacte importate cu succes`);
    },
    onError: (error) => {
      console.error('Error importing contacts:', error);
      toast.error('Eroare la importarea contactelor');
    },
  });
};

// Search contacts by phone number
export const useSearchContactByPhone = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      if (!user) throw new Error('User not authenticated');

      const normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

      const { data, error } = await supabase
        .from('contacts_database')
        .select('*')
        .eq('user_id', user.id)
        .eq('telefon', normalizedPhone)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
};