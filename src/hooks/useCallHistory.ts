
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
      
      console.log('Fetching call history for user:', user.id);
      
      const { data, error } = await supabase
        .from('call_history')
        .select('*')
        .eq('user_id', user.id)
        .order('call_date', { ascending: false });

      if (error) {
        console.error('Error fetching call history:', error);
        throw error;
      }

      console.log('Raw call history data:', data);

      const mappedData = data?.map((record: any) => {
        console.log('Processing record:', record.id, record.phone_number);
        
        return {
          id: record.id,
          phone_number: record.phone_number || '',
          contact_name: record.contact_name || record.phone_number || 'Necunoscut',
          call_status: record.call_status || 'unknown',
          summary: record.summary || '',
          dialog_json: record.dialog_json || '',
          call_date: record.call_date ? new Date(record.call_date).toLocaleString('ro-RO') : '',
          cost_usd: record.cost_usd ? Number(record.cost_usd) : 0,
          agent_id: record.agent_id,
          language: record.language
        };
      }) || [];

      console.log('Mapped call history data:', mappedData);
      return mappedData;
    },
    enabled: !!user,
  });

  const saveCallResults = useMutation({
    mutationFn: async (callResults: any[]) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Saving call results:', callResults);

      const recordsToInsert = callResults.map((result) => {
        console.log('Processing call result:', result);
        
        // Handle different response structures
        let cleanConversations, callInfo, phoneNumbers, costInfo, status, summary, timestamps, language;
        
        if (result?.clean_conversations) {
          cleanConversations = result.clean_conversations;
          callInfo = cleanConversations?.call_info ?? {};
          phoneNumbers = callInfo?.phone_numbers ?? {};
          costInfo = cleanConversations?.['']?.cost_info ?? cleanConversations?.cost_info ?? {};
          status = cleanConversations?.status ?? 'unknown';
          summary = cleanConversations?.summary ?? '';
          timestamps = cleanConversations?.timestamps ?? '';
          language = callInfo?.language ?? 'ro';
        } else {
          // Fallback for different response structure
          callInfo = result?.call_info ?? {};
          phoneNumbers = callInfo?.phone_numbers ?? {};
          costInfo = result?.cost_info ?? {};
          status = result?.status ?? 'unknown';
          summary = result?.summary ?? '';
          timestamps = result?.timestamps ?? '';
          language = callInfo?.language ?? 'ro';
        }
        
        const phoneNumber = phoneNumbers?.user ?? phoneNumbers?.to ?? result?.phone_number ?? '';
        const costValue = costInfo?.total_cost ?? result?.cost ?? 0;
        
        const dialogJson = JSON.stringify(result, null, 2);
        
        let callDate = new Date().toISOString();
        if (timestamps) {
          try {
            const timestampPart = timestamps.split('-')[0];
            const parsedDate = new Date(timestampPart);
            if (!isNaN(parsedDate.getTime())) {
              callDate = parsedDate.toISOString();
            }
          } catch (timestampError) {
            console.warn('Error parsing timestamp:', timestampError);
          }
        }
        
        const record = {
          user_id: user.id,
          phone_number: phoneNumber,
          contact_name: phoneNumber || 'Necunoscut',
          call_status: status === 'done' || status === 'completed' ? 'success' : 'failed',
          summary: summary,
          dialog_json: dialogJson,
          call_date: callDate,
          cost_usd: costValue,
          language: language,
          timestamps: timestamps
        };

        console.log('Record to insert:', record);
        return record;
      });

      const { data, error } = await supabase
        .from('call_history')
        .insert(recordsToInsert)
        .select();

      if (error) {
        console.error('Error inserting call history:', error);
        throw error;
      }
      
      console.log('Successfully inserted call history:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Invalidating call history queries');
      queryClient.invalidateQueries({ queryKey: ['call-history', user?.id] });
    },
  });

  const deleteCallHistory = useMutation({
    mutationFn: async (callIds: string[]) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Deleting call history records:', callIds);

      const { error } = await supabase
        .from('call_history')
        .delete()
        .in('id', callIds)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting call history:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-history', user?.id] });
    },
  });

  const deleteAllCallHistory = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('Deleting all call history for user:', user.id);

      const { error } = await supabase
        .from('call_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting all call history:', error);
        throw error;
      }
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
    deleteCallHistory,
    deleteAllCallHistory,
    refetch: callHistoryQuery.refetch,
  };
};
