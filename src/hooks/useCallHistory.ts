
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

export interface CallHistoryRecord {
  id: string;
  phone_number: string;
  contact_name: string;
  call_status: 'success' | 'failed' | 'busy' | 'no-answer' | 'unknown' | 'initiated' | 'done';
  summary: string;
  dialog_json: string;
  call_date: string;
  cost_usd: number;
  agent_id?: string;
  agent_name?: string;
  language?: string;
  conversation_id?: string;
  elevenlabs_history_id?: string;
  duration_seconds?: number;
}

export const useCallHistory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const callHistoryQuery = useQuery({
    queryKey: ['call-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching call history for user:', user.id);
      
      // First, get all agents for this user
      const { data: agents, error: agentsError } = await supabase
        .from('kalina_agents')
        .select('agent_id, name')
        .eq('user_id', user.id);

      if (agentsError) {
        console.error('Error fetching agents:', agentsError);
      }

      // Create a map of agent_id to agent_name for quick lookup
      const agentMap = new Map(agents?.map(agent => [agent.agent_id, agent.name]) || []);

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
          agent_name: agentMap.get(record.agent_id) || record.agent_id || 'Agent necunoscut',
          language: record.language,
          conversation_id: record.conversation_id,
          elevenlabs_history_id: record.elevenlabs_history_id,
          duration_seconds: record.duration_seconds
        };
      }) || [];

      // Schedule updates for new calls (those without proper cost/duration data)
      mappedData.forEach(call => {
        if (call.conversation_id && (!call.cost_usd || call.cost_usd === 0) && (!call.duration_seconds || call.duration_seconds === 0)) {
          const callAge = Date.now() - new Date(call.call_date).getTime();
          const tenMinutes = 10 * 60 * 1000;
          
          // Only schedule if the call is less than 10 minutes old
          if (callAge < tenMinutes) {
            const remainingTime = tenMinutes - callAge;
            console.log(`Scheduling update for call ${call.id} in ${remainingTime}ms`);
            
            setTimeout(async () => {
              try {
                const { data: updateResult } = await supabase.functions.invoke('update-call-history-data', {
                  body: {
                    callHistoryId: call.id,
                    conversationId: call.conversation_id
                  }
                });
                console.log(`Updated call history data for ${call.id}:`, updateResult);
                // Refetch data after update
                queryClient.invalidateQueries({ queryKey: ['call-history', user?.id] });
              } catch (error) {
                console.error('Error updating call history:', error);
              }
            }, remainingTime);
          }
        }
      });

      console.log('Mapped call history data:', mappedData);
      return mappedData;
    },
    enabled: !!user,
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  const saveCallResults = useMutation({
    mutationFn: async (callResults: any[]) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Saving call results:', callResults);

      const recordsToInsert = callResults.map((result) => {
        console.log('Processing call result:', result);
        
        // Handle different response structures and extract conversation_id and elevenlabs_history_id
        let cleanConversations, callInfo, phoneNumbers, costInfo, status, summary, timestamps, language, conversationId, elevenLabsHistoryId;
        
        if (result?.clean_conversations) {
          cleanConversations = result.clean_conversations;
          callInfo = cleanConversations?.call_info ?? {};
          phoneNumbers = callInfo?.phone_numbers ?? {};
          costInfo = cleanConversations?.['']?.cost_info ?? cleanConversations?.cost_info ?? {};
          status = cleanConversations?.status ?? 'unknown';
          summary = cleanConversations?.summary ?? '';
          timestamps = cleanConversations?.timestamps ?? '';
          language = callInfo?.language ?? 'ro';
          conversationId = result.conversation_id || 
                          cleanConversations?.conversation_id || 
                          callInfo?.conversation_id || 
                          result?.metadata?.conversation_id ||
                          null;
          // Extract ElevenLabs history ID
          elevenLabsHistoryId = result.elevenlabs_history_id || 
                               cleanConversations?.elevenlabs_history_id || 
                               callInfo?.elevenlabs_history_id || 
                               result?.history_item_id ||
                               null;
        } else {
          // Fallback for different response structure
          callInfo = result?.call_info ?? {};
          phoneNumbers = callInfo?.phone_numbers ?? {};
          costInfo = result?.cost_info ?? {};
          status = result?.status ?? 'unknown';
          summary = result?.summary ?? '';
          timestamps = result?.timestamps ?? '';
          language = callInfo?.language ?? 'ro';
          conversationId = result.conversation_id || 
                          callInfo?.conversation_id || 
                          result?.metadata?.conversation_id ||
                          null;
          elevenLabsHistoryId = result.elevenlabs_history_id || 
                               callInfo?.elevenlabs_history_id || 
                               result?.history_item_id ||
                               null;
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
          call_status: status === 'done' || status === 'completed' ? 'done' : status,
          summary: summary,
          dialog_json: dialogJson,
          call_date: callDate,
          cost_usd: costValue,
          language: language,
          timestamps: timestamps,
          conversation_id: conversationId,
          elevenlabs_history_id: elevenLabsHistoryId
        };

        console.log('Record to insert with ElevenLabs history ID:', record);
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
      
      console.log('Successfully inserted call history with ElevenLabs history ID:', data);
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
