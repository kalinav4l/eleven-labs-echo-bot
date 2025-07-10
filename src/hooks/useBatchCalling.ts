import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface BatchCall {
  id: string;
  call_name: string;
  status: string;
  created_at: string;
  total_recipients: number;
  agent_id: string;
  agent_phone_id: string;
}

export interface BatchCallData {
  call_name: string;
  agent_id: string;
  agent_phone_id: string;
  recipients: Array<{
    phone_number: string;
    conversation_initiation_client_data?: any;
  }>;
}

export interface BatchCallDetails {
  id: string;
  call_name: string;
  status: string;
  created_at: string;
  agent_id: string;
  total_recipients: number;
  completed_calls: number;
  failed_calls: number;
  recipients: Array<{
    phone_number: string;
    status: string;
    conversation_id?: string;
    error?: string;
  }>;
}

export const useBatchCalling = () => {
  const [batchCalls, setBatchCalls] = useState<BatchCall[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBatchCalls = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-batch-calling', {
        body: { action: 'list_workspace_calls' }
      });

      if (error) throw error;

      // Transform data to match our interface
      const transformedData = data?.map((call: any) => ({
        id: call.id,
        call_name: call.call_name || 'Lot de apeluri',
        status: call.status,
        created_at: call.created_at,
        total_recipients: call.total_recipients || 0,
        agent_id: call.agent_id,
        agent_phone_id: call.agent_phone_number_id
      })) || [];

      setBatchCalls(transformedData);
    } catch (error) {
      console.error('Error fetching batch calls:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca loturile de apeluri",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitBatchCall = async (data: BatchCallData) => {
    try {
      const { data: response, error } = await supabase.functions.invoke('elevenlabs-batch-calling', {
        body: {
          action: 'submit_batch_call',
          ...data
        }
      });

      if (error) throw error;

      toast({
        title: "Succes",
        description: `Lotul "${data.call_name}" a fost inițiat cu succes`
      });

      return response;
    } catch (error) {
      console.error('Error submitting batch call:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut iniția lotul de apeluri",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getBatchDetails = async (batchId: string): Promise<BatchCallDetails | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-batch-calling', {
        body: {
          action: 'get_batch_call_details',
          batch_id: batchId
        }
      });

      if (error) throw error;

      return {
        id: data.id,
        call_name: data.call_name || 'Lot de apeluri',
        status: data.status,
        created_at: data.created_at,
        agent_id: data.agent_id,
        total_recipients: data.total_recipients || 0,
        completed_calls: data.completed_calls || 0,
        failed_calls: data.failed_calls || 0,
        recipients: data.recipients || []
      };
    } catch (error) {
      console.error('Error getting batch details:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca detaliile lotului",
        variant: "destructive"
      });
      return null;
    }
  };

  const cancelBatchCall = async (batchId: string) => {
    try {
      const { error } = await supabase.functions.invoke('elevenlabs-batch-calling', {
        body: {
          action: 'cancel_batch_call',
          batch_id: batchId
        }
      });

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Lotul a fost anulat cu succes"
      });
    } catch (error) {
      console.error('Error canceling batch call:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut anula lotul",
        variant: "destructive"
      });
      throw error;
    }
  };

  const retryBatchCall = async (batchId: string) => {
    try {
      const { error } = await supabase.functions.invoke('elevenlabs-batch-calling', {
        body: {
          action: 'retry_batch_call',
          batch_id: batchId
        }
      });

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Lotul a fost programat pentru reîncercare"
      });
    } catch (error) {
      console.error('Error retrying batch call:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut reîncerca lotul",
        variant: "destructive"
      });
      throw error;
    }
  };

  const refetchBatchCalls = () => {
    fetchBatchCalls();
  };

  useEffect(() => {
    fetchBatchCalls();
  }, []);

  return {
    batchCalls,
    isLoading,
    submitBatchCall,
    getBatchDetails,
    cancelBatchCall,
    retryBatchCall,
    refetchBatchCalls
  };
};