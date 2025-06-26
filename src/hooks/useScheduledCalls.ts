
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface ScheduledCall {
  id: string;
  user_id: string;
  agent_id?: string;
  client_name: string;
  phone_number: string;
  scheduled_datetime: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  call_duration_minutes: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledCallData {
  agent_id?: string;
  client_name: string;
  phone_number: string;
  scheduled_datetime: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export const useScheduledCalls = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: scheduledCalls = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['scheduled-calls', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('scheduled_calls')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_datetime', { ascending: true });

      if (error) throw error;
      return data as ScheduledCall[];
    },
    enabled: !!user?.id,
  });

  const createScheduledCall = useMutation({
    mutationFn: async (callData: CreateScheduledCallData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('scheduled_calls')
        .insert({
          user_id: user.id,
          ...callData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-calls'] });
      toast({
        title: "Succes",
        description: "Apelul a fost programat cu succes!"
      });
    },
    onError: (error) => {
      console.error('Error creating scheduled call:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut programa apelul.",
        variant: "destructive"
      });
    }
  });

  const updateScheduledCall = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ScheduledCall> & { id: string }) => {
      const { data, error } = await supabase
        .from('scheduled_calls')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-calls'] });
      toast({
        title: "Succes",
        description: "Apelul a fost actualizat cu succes!"
      });
    },
    onError: (error) => {
      console.error('Error updating scheduled call:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza apelul.",
        variant: "destructive"
      });
    }
  });

  const deleteScheduledCall = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_calls')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-calls'] });
      toast({
        title: "Succes",
        description: "Apelul a fost șters cu succes!"
      });
    },
    onError: (error) => {
      console.error('Error deleting scheduled call:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge apelul.",
        variant: "destructive"
      });
    }
  });

  return {
    scheduledCalls,
    isLoading,
    error,
    refetch,
    createScheduledCall,
    updateScheduledCall,
    deleteScheduledCall
  };
};
