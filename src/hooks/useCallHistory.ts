
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

export interface CallHistoryRecord {
  id: string;
  phone_number: string;
  contact_name: string;
  call_status: 'success' | 'failed' | 'busy' | 'no-answer' | 'unknown';
  summary: string;
  dialog_json: string;
  call_date: string;
  cost_usd: number;
  agent_id?: string;
  language?: string;
}

export const useCallHistory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const callHistoryQuery = useQuery({
    queryKey: ['call-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('call_history')
        .select('*')
        .order('call_date', { ascending: false });

      if (error) {
        console.error('Error fetching call history:', error);
        throw error;
      }

      return data?.map((record: any) => ({
        id: record.id,
        phone_number: record.phone_number || '',
        contact_name: record.contact_name || 'Necunoscut',
        call_status: record.call_status || 'unknown',
        summary: record.summary || '',
        dialog_json: record.dialog_json || '',
        call_date: record.call_date ? new Date(record.call_date).toLocaleString('ro-RO') : '',
        cost_usd: record.cost_usd ? Number(record.cost_usd) : 0,
        agent_id: record.agent_id,
        language: record.language
      })) || [];
    },
    enabled: !!user,
  });

  const saveCallResults = useMutation({
    mutationFn: async (callResults: any[]) => {
      if (!user) throw new Error('User not authenticated');

      const recordsToInsert = callResults.map((result) => {
        const cleanConversations = result?.clean_conversations ?? {};
        const callInfo = cleanConversations?.call_info ?? {};
        const phoneNumbers = callInfo?.phone_numbers ?? {};
        const costInfo = cleanConversations?.['']?.cost_info ?? {};
        
        const phoneNumber = phoneNumbers?.user ?? '';
        const costCents = costInfo?.total_cost ?? 0;
        const costUsd = costCents / 100;
        const status = cleanConversations?.status ?? 'unknown';
        const summary = cleanConversations?.summary ?? '';
        const timestamps = cleanConversations?.timestamps ?? '';
        const language = callInfo?.language ?? 'ro';
        
        const dialogJson = JSON.stringify(result, null, 2);
        
        let callDate = new Date().toISOString();
        if (timestamps) {
          try {
            const timestampPart = timestamps.split('-')[0];
            callDate = new Date(timestampPart).toISOString();
          } catch (timestampError) {
            console.warn('Error parsing timestamp:', timestampError);
          }
        }
        
        return {
          user_id: user.id,
          phone_number: phoneNumber,
          contact_name: phoneNumber || 'Necunoscut',
          call_status: status === 'done' ? 'success' : 'failed',
          summary: summary,
          dialog_json: dialogJson,
          call_date: callDate,
          cost_usd: costUsd,
          language: language,
          timestamps: timestamps
        };
      });

      const { data, error } = await supabase
        .from('call_history')
        .insert(recordsToInsert)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-history', user?.id] });
    },
  });

  return {
    callHistory: callHistoryQuery.data || [],
    isLoading: callHistoryQuery.isLoading,
    error: callHistoryQuery.error,
    saveCallResults,
    refetch: callHistoryQuery.refetch,
  };
};
