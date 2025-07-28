
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

export interface ConversationData {
  agent_id: string;
  agent_name: string;
  phone_number?: string;
  contact_name?: string;
  summary?: string;
  duration_seconds?: number;
  cost_usd?: number;
  elevenlabs_history_id?: string;
  conversation_id?: string;
  transcript?: any[];
  status?: 'success' | 'failed' | 'busy' | 'no-answer';
}

export const useConversationTracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const saveConversation = useMutation({
    mutationFn: async (conversationData: ConversationData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Saving conversation to Analytics Hub:', conversationData);

      // LOGICA IDEALĂ: Capta agent_id-ul exact din conversația ElevenLabs activă
      let realAgentId = conversationData.agent_id;
      
      // Prioritate 1: Din ElevenLabs conversation dacă este disponibil
      if (conversationData.elevenlabs_history_id || conversationData.conversation_id) {
        try {
          console.log('🎯 Obțin agent_id-ul REAL din conversația ElevenLabs activă...');
          const conversationId = conversationData.elevenlabs_history_id || conversationData.conversation_id;
          
          const { data: conversationDetails, error: conversationError } = await supabase.functions.invoke('get-elevenlabs-conversation', {
            body: {
              conversationId: conversationId
            }
          });

          if (conversationDetails && !conversationError && conversationDetails.agent_id) {
            realAgentId = conversationDetails.agent_id;
            console.log('✅ AGENT_ID REAL identificat din ElevenLabs:', realAgentId);
            console.log('📊 Conversația va fi asociată cu agentul corect:', realAgentId);
          } else {
            console.warn('⚠️ Nu s-a putut obține agent_id din conversația ElevenLabs:', conversationError);
            console.log('🔄 Folosesc agent_id-ul furnizat:', conversationData.agent_id);
          }
        } catch (error) {
          console.warn('❌ Eroare la obținerea agent_id din ElevenLabs:', error);
          console.log('🔄 Folosesc agent_id-ul furnizat ca fallback:', conversationData.agent_id);
        }
      } else {
        console.log('📝 Nu există conversation_id ElevenLabs, folosesc agent_id furnizat:', conversationData.agent_id);
      }

      // Find agent owner for callback purposes
      let agentOwnerId = null;
      if (realAgentId) {
        try {
          console.log('🔍 Căutare proprietar pentru agentul:', realAgentId);
          
          // First try by elevenlabs_agent_id
          const { data: agentByElevenlabs } = await supabase
            .from('kalina_agents')
            .select('user_id, name')
            .eq('elevenlabs_agent_id', realAgentId)
            .maybeSingle();
          
          if (agentByElevenlabs) {
            agentOwnerId = agentByElevenlabs.user_id;
            console.log('✅ Proprietar găsit prin elevenlabs_agent_id:', agentOwnerId);
          } else {
            // Fallback to agent_id column  
            const { data: agentByAgentId } = await supabase
              .from('kalina_agents')
              .select('user_id, name')
              .eq('agent_id', realAgentId)
              .maybeSingle();
              
            if (agentByAgentId) {
              agentOwnerId = agentByAgentId.user_id;
              console.log('✅ Proprietar găsit prin agent_id:', agentOwnerId);
            } else {
              console.warn('⚠️ Nu s-a găsit proprietar pentru agentul:', realAgentId);
            }
          }
        } catch (error) {
          console.error('❌ Eroare la căutarea proprietarului agentului:', error);
        }
      }

      // Check for callback intent in transcript
      const transcriptText = conversationData.transcript
        ?.map((entry: any) => entry.message || entry.text || '')
        .join(' ') || '';
      
      if (transcriptText) {
        try {
          console.log('Checking for callback intent in conversation...');
          
          const { data: callbackData, error: callbackError } = await supabase.functions.invoke('detect-callback-intent', {
            body: {
              text: transcriptText,
              conversationId: conversationData.conversation_id,
              phoneNumber: conversationData.phone_number,
              contactName: conversationData.contact_name,
              agentId: realAgentId,
              userId: agentOwnerId // Pass the agent owner's user_id
            }
          });

          if (callbackError) {
            console.warn('Callback detection failed:', callbackError);
          } else if (callbackData?.callbackDetected) {
            console.log('Callback detected and scheduled:', callbackData);
          }
        } catch (callbackError) {
          console.warn('Error during callback detection:', callbackError);
        }
      }

      // Create the call history record using the real agent_id
      const callRecord = {
        user_id: user.id,
        phone_number: conversationData.phone_number || 'Web Chat',
        contact_name: conversationData.contact_name || conversationData.agent_name,
        call_status: conversationData.status || 'success',
        summary: conversationData.summary || 'Agent conversation',
        dialog_json: JSON.stringify({
          agent_id: realAgentId, // Use real agent_id
          agent_name: conversationData.agent_name,
          transcript: conversationData.transcript || [],
          conversation_id: conversationData.conversation_id,
          elevenlabs_history_id: conversationData.elevenlabs_history_id,
          original_agent_id: conversationData.agent_id // Keep track of original for debugging
        }),
        call_date: new Date().toISOString(),
        cost_usd: conversationData.cost_usd || 0,
        agent_id: realAgentId, // Use real agent_id
        language: 'ro',
        conversation_id: conversationData.conversation_id,
        elevenlabs_history_id: conversationData.elevenlabs_history_id,
        duration_seconds: conversationData.duration_seconds || 0
      };

      const { data, error } = await supabase
        .from('call_history')
        .insert([callRecord])
        .select()
        .single();

      if (error) {
        console.error('Error saving conversation:', error);
        throw error;
      }

      console.log('Conversation saved successfully:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate call history to refresh the list
      queryClient.invalidateQueries({ queryKey: ['call-history', user?.id] });
    },
  });

  const updateConversation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<ConversationData> }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('call_history')
        .update({
          summary: updates.summary,
          dialog_json: updates.transcript ? JSON.stringify(updates.transcript) : undefined,
          cost_usd: updates.cost_usd,
          duration_seconds: updates.duration_seconds,
          elevenlabs_history_id: updates.elevenlabs_history_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-history', user?.id] });
    },
  });

  return {
    saveConversation,
    updateConversation,
  };
};
