import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { toast } from '@/components/ui/use-toast';

export interface CallbackRequest {
  id: string;
  client_name: string;
  phone_number: string;
  caller_number?: string;
  scheduled_datetime: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress' | 'failed';
  notes: string;
  agent_id?: string;
  task_type: 'callback' | 'follow_up' | 'reminder';
  original_conversation_id?: string;
  callback_reason?: string;
  created_at: string;
}

export const useCallbacks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch callback requests
  const {
    data: callbacks = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['callback-requests', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('scheduled_calls')
        .select('*')
        .eq('user_id', user.id)
        .in('task_type', ['callback', 'follow_up', 'reminder'])
        .order('scheduled_datetime', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(callback => ({
        ...callback,
        priority: callback.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: callback.status as 'scheduled' | 'completed' | 'cancelled' | 'in_progress' | 'failed',
        task_type: callback.task_type as 'callback' | 'follow_up' | 'reminder'
      })) as CallbackRequest[];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Create callback mutation
  const createCallback = useMutation({
    mutationFn: async (callbackData: Omit<CallbackRequest, 'id' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('scheduled_calls')
        .insert({
          user_id: user.id,
          client_name: callbackData.client_name,
          phone_number: callbackData.phone_number,
          caller_number: callbackData.caller_number,
          scheduled_datetime: callbackData.scheduled_datetime,
          description: callbackData.description,
          priority: callbackData.priority,
          status: callbackData.status,
          notes: callbackData.notes,
          agent_id: callbackData.agent_id,
          task_type: callbackData.task_type,
          callback_reason: callbackData.callback_reason,
          original_conversation_id: callbackData.original_conversation_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callback-requests', user?.id] });
      toast({
        title: "Callback creat cu succes!",
        description: "Callback-ul a fost programat în sistem.",
      });
    },
    onError: (error) => {
      console.error('Error creating callback:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut crea callback-ul.",
        variant: "destructive",
      });
    },
  });

  // Update callback mutation
  const updateCallback = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<CallbackRequest> }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('scheduled_calls')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callback-requests', user?.id] });
      toast({
        title: "Callback actualizat",
        description: "Detaliile callback-ului au fost actualizate cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error updating callback:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza callback-ul.",
        variant: "destructive",
      });
    },
  });

  // Delete callback mutation
  const deleteCallback = useMutation({
    mutationFn: async (callbackId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('scheduled_calls')
        .delete()
        .eq('id', callbackId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callback-requests', user?.id] });
      toast({
        title: "Callback șters",
        description: "Callback-ul a fost șters cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error deleting callback:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge callback-ul.",
        variant: "destructive",
      });
    },
  });

  // Execute callback mutation
  const executeCallback = useMutation({
    mutationFn: async (callback: CallbackRequest) => {
      if (!user) throw new Error('User not authenticated');

      // First, mark as in progress
      await updateCallback.mutateAsync({
        id: callback.id,
        updates: { status: 'in_progress' }
      });

      // Then initiate the call
      const { data, error } = await supabase.functions.invoke('initiate-scheduled-call', {
        body: {
          agent_id: callback.agent_id,
          phone_number: callback.phone_number,
          caller_number: callback.caller_number,
          contact_name: callback.client_name,
          user_id: user.id
        }
      });

      if (error) throw error;
      return { data, callback };
    },
    onSuccess: ({ data, callback }) => {
      updateCallback.mutate({
        id: callback.id,
        updates: { status: 'completed' }
      });
      
      toast({
        title: "Callback executat cu succes!",
        description: `Apelul către ${callback.client_name} a fost inițiat.`,
      });
    },
    onError: (error, callback) => {
      updateCallback.mutate({
        id: callback.id,
        updates: { status: 'failed' }
      });
      
      toast({
        title: "Eroare la executarea callback-ului",
        description: error.message || "Nu s-a putut iniția apelul.",
        variant: "destructive",
      });
    },
  });

  // Manual callback detection
  const detectCallbackIntent = useMutation({
    mutationFn: async ({ 
      text, 
      conversationId, 
      phoneNumber, 
      contactName, 
      agentId 
    }: {
      text: string;
      conversationId?: string;
      phoneNumber: string;
      contactName?: string;
      agentId?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('detect-callback-intent', {
        body: {
          text,
          conversationId: conversationId || `manual-${Date.now()}`,
          phoneNumber,
          contactName: contactName || 'Manual Entry',
          agentId,
          userId: user.id
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.callbackDetected) {
        queryClient.invalidateQueries({ queryKey: ['callback-requests', user?.id] });
        toast({
          title: "Callback detectat și programat!",
          description: data.message || "Callback-ul a fost programat automat.",
        });
      } else {
        toast({
          title: "Nu s-a detectat cerere de callback",
          description: "Textul nu conține o cerere clară de callback.",
        });
      }
    },
    onError: (error) => {
      console.error('Error detecting callback intent:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut analiza textul pentru callback.",
        variant: "destructive",
      });
    },
  });

  // Get callbacks grouped by status
  const groupedCallbacks = {
    overdue: callbacks.filter(cb => 
      new Date(cb.scheduled_datetime) < new Date() && cb.status === 'scheduled'
    ),
    upcoming: callbacks.filter(cb => 
      new Date(cb.scheduled_datetime) >= new Date() && cb.status === 'scheduled'
    ),
    completed: callbacks.filter(cb => cb.status === 'completed'),
    failed: callbacks.filter(cb => cb.status === 'failed' || cb.status === 'cancelled'),
  };

  // Get callbacks statistics
  const statistics = {
    total: callbacks.length,
    overdue: groupedCallbacks.overdue.length,
    upcoming: groupedCallbacks.upcoming.length,
    completed: groupedCallbacks.completed.length,
    failed: groupedCallbacks.failed.length,
  };

  return {
    callbacks,
    groupedCallbacks,
    statistics,
    isLoading,
    error,
    createCallback,
    updateCallback,
    deleteCallback,
    executeCallback,
    detectCallbackIntent,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['callback-requests', user?.id] })
  };
};

export default useCallbacks;