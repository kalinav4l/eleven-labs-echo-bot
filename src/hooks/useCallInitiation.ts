
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

interface Contact {
  id: string;
  name: string;
  phone: string;
  country: string;
  location: string;
}

interface UseCallInitiationProps {
  agentId: string;
  phoneNumber?: string;
}

interface CallStatus {
  contactId: string;
  contactName: string;
  status: 'waiting' | 'calling' | 'in-progress' | 'processing' | 'completed' | 'failed';
  conversationId?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  cost?: number;
}

export const useCallInitiation = ({
  agentId,
  phoneNumber,
}: UseCallInitiationProps) => {
  const { user } = useAuth();
  const [isInitiating, setIsInitiating] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);
  const [currentContact, setCurrentContact] = useState<string>('');
  const [callStatuses, setCallStatuses] = useState<CallStatus[]>([]);
  const [currentCallStatus, setCurrentCallStatus] = useState<string>('');

  // Get all conversations for an agent
  const getAgentConversations = async (targetAgentId: string): Promise<any> => {
    try {
      console.log(`Getting all conversations for agent ${targetAgentId}`);
      
      const { data, error } = await supabase.functions.invoke('get-agent-conversations', {
        body: { agentId: targetAgentId }
      });

      if (error) {
        console.error('Error getting agent conversations:', error);
        return { error: error.message, status: 'api_error' };
      }

      if (data?.error) {
        console.error('ElevenLabs API error:', data.error);
        return { error: data.error, status: data.status || 'api_error' };
      }

      return data;
    } catch (error) {
      console.error('Error in getAgentConversations:', error);
      return { error: error.message, status: 'function_error' };
    }
  };

  // Get conversation details from ElevenLabs using conversation_id
  const getConversationDetails = async (conversationId: string): Promise<any> => {
    try {
      console.log(`Getting detailed conversation data for ${conversationId}`);
      
      const { data, error } = await supabase.functions.invoke('get-elevenlabs-conversation', {
        body: { conversationId }
      });

      if (error) {
        console.error('Error getting conversation details:', error);
        return { error: error.message, status: 'api_error' };
      }

      if (data?.error) {
        console.error('ElevenLabs API error:', data.error);
        return { error: data.error, status: data.status || 'api_error' };
      }

      return data;
    } catch (error) {
      console.error('Error in getConversationDetails:', error);
      return { error: error.message, status: 'function_error' };
    }
  };

  // Get existing conversation IDs from database
  const getExistingConversationIds = async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('call_history')
        .select('conversation_id')
        .eq('user_id', user?.id)
        .not('conversation_id', 'is', null);

      if (error) {
        console.error('Error fetching existing conversation IDs:', error);
        return [];
      }

      return data?.map(record => record.conversation_id).filter(Boolean) || [];
    } catch (error) {
      console.error('Error in getExistingConversationIds:', error);
      return [];
    }
  };

  // Monitor for new conversations after call initiation
  const monitorForNewConversations = async (targetAgentId: string, contact: Contact, startTime: Date): Promise<any[]> => {
    const maxAttempts = 24; // 2 minutes max (24 * 5 seconds)
    let attempts = 0;
    
    console.log(`🔍 Starting conversation monitoring for ${contact.name} with agent ${targetAgentId}`);
    
    // Get existing conversation IDs before we start monitoring
    const existingConversationIds = await getExistingConversationIds();
    console.log(`📋 Existing conversation IDs:`, existingConversationIds);
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`🔄 Monitoring attempt ${attempts}/${maxAttempts} for ${contact.name}`);
        setCurrentCallStatus(`Verifică conversații noi pentru ${contact.name} (${attempts}/${maxAttempts})`);
        
        // Wait 30 seconds before first check, then 5 seconds between checks
        if (attempts === 1) {
          console.log(`⏳ Initial wait of 30 seconds for ${contact.name}...`);
          await new Promise(resolve => setTimeout(resolve, 30000));
        } else {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        // Get all conversations for this agent
        const conversationsData = await getAgentConversations(targetAgentId);
        
        if (conversationsData?.error) {
          console.log(`⚠️ API error for ${contact.name}, continuing...`, conversationsData.error);
          continue;
        }
        
        const conversations = conversationsData?.conversations || [];
        console.log(`📞 Found ${conversations.length} total conversations for agent`);
        
        // Filter conversations that are newer than our start time and not in our database
        const newConversations = conversations.filter((conv: any) => {
          const convDate = new Date(conv.created_at || conv.start_time);
          const isNewer = convDate >= startTime;
          const isNotInDb = !existingConversationIds.includes(conv.conversation_id);
          
          console.log(`🔍 Conversation ${conv.conversation_id}: created=${convDate.toISOString()}, isNewer=${isNewer}, isNotInDb=${isNotInDb}`);
          
          return isNewer && isNotInDb;
        });
        
        if (newConversations.length > 0) {
          console.log(`✅ Found ${newConversations.length} new conversations for ${contact.name}!`);
          setCurrentCallStatus(`Găsit ${newConversations.length} conversații noi pentru ${contact.name} - extragere date...`);
          
          // Get detailed data for each new conversation
          const detailedConversations = [];
          for (const conv of newConversations) {
            console.log(`📝 Getting detailed data for conversation ${conv.conversation_id}`);
            const details = await getConversationDetails(conv.conversation_id);
            if (details && !details.error) {
              detailedConversations.push(details);
            }
          }
          
          console.log(`✅ Successfully retrieved ${detailedConversations.length} detailed conversations for ${contact.name}`);
          return detailedConversations;
        }
        
        console.log(`⏳ No new conversations found for ${contact.name} on attempt ${attempts}`);
        
      } catch (error) {
        console.error(`❌ Error monitoring ${contact.name} on attempt ${attempts}:`, error);
        setCurrentCallStatus(`Eroare temporară pentru ${contact.name}, se reîncearcă...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    // Timeout reached - still try to get any new conversations one last time
    console.log(`⏰ Monitoring timeout for ${contact.name} after ${maxAttempts} attempts - final check...`);
    try {
      const conversationsData = await getAgentConversations(targetAgentId);
      if (conversationsData?.conversations) {
        const conversations = conversationsData.conversations;
        const newConversations = conversations.filter((conv: any) => {
          const convDate = new Date(conv.created_at || conv.start_time);
          return convDate >= startTime && !existingConversationIds.includes(conv.conversation_id);
        });
        
        if (newConversations.length > 0) {
          console.log(`🎯 Final check found ${newConversations.length} conversations for ${contact.name}!`);
          const detailedConversations = [];
          for (const conv of newConversations) {
            const details = await getConversationDetails(conv.conversation_id);
            if (details && !details.error) {
              detailedConversations.push(details);
            }
          }
          return detailedConversations;
        }
      }
    } catch (error) {
      console.error(`❌ Error in final check for ${contact.name}:`, error);
    }
    
    console.log(`❌ No new conversations found for ${contact.name} after timeout`);
    return [];
  };

  // Save complete call data to history and analytics
  const saveCompleteCallData = async (conversationData: any, contact: Contact, conversationId: string) => {
    try {
      console.log(`💾 Saving complete call data for ${contact.name}:`, conversationData);
      
      // Extract all relevant information with better error handling
      const transcript = conversationData?.transcript || 
                        conversationData?.conversation_transcript || 
                        conversationData?.messages?.map((m: any) => `${m.role}: ${m.content}`).join('\n') ||
                        '';
                        
      const summary = conversationData?.summary || 
                     (transcript ? transcript.substring(0, 200) + (transcript.length > 200 ? '...' : '') : '') ||
                     `Apel către ${contact.name}`;
      
      const cost = conversationData?.cost_breakdown?.total_cost || 
                  conversationData?.cost || 
                  conversationData?.usage?.total_cost ||
                  0;
      
      const duration = conversationData?.duration_seconds || 
                      conversationData?.call_duration_seconds ||
                      conversationData?.duration ||
                      0;
      
      // Determine final status
      let finalStatus = 'success';
      if (conversationData?.status) {
        const status = conversationData.status.toLowerCase();
        if (status === 'failed' || status === 'error') {
          finalStatus = 'failed';
        }
      }
      
      // Create complete call record
      const callRecord = {
        user_id: user?.id,
        phone_number: contact.phone,
        contact_name: contact.name,
        call_status: finalStatus,
        summary: summary,
        dialog_json: JSON.stringify({
          conversation_id: conversationId,
          full_conversation_data: conversationData,
          contact_info: contact,
          processing_timestamp: new Date().toISOString()
        }, null, 2),
        call_date: new Date().toISOString(),
        cost_usd: Number(cost) || 0,
        duration_seconds: Number(duration) || 0,
        agent_id: agentId,
        conversation_id: conversationId,
        language: 'ro'
      };

      console.log(`📝 Inserting call record for ${contact.name}:`, callRecord);

      const { data: insertData, error: insertError } = await supabase
        .from('call_history')
        .insert(callRecord)
        .select();

      if (insertError) {
        console.error(`❌ Error saving call data for ${contact.name}:`, insertError);
        toast({
          title: "Eroare salvare",
          description: `Nu s-au putut salva datele pentru ${contact.name}: ${insertError.message}`,
          variant: "destructive",
        });
      } else {
        console.log(`✅ Successfully saved call data for ${contact.name}:`, insertData);
        toast({
          title: "Date salvate",
          description: `Datele complete pentru apelul către ${contact.name} au fost salvate în istoric`,
        });
      }
      
      return insertData;
    } catch (error) {
      console.error(`💥 Critical error saving call data for ${contact.name}:`, error);
      toast({
        title: "Eroare salvare",
        description: `Nu s-au putut salva datele pentru ${contact.name}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Process batch calls with the new monitoring strategy
  const processBatchCalls = useCallback(async (contacts: Contact[], targetAgentId: string) => {
    if (!targetAgentId || contacts.length === 0) {
      toast({
        title: "Eroare",
        description: "Agent ID și contactele sunt obligatorii",
        variant: "destructive",
      });
      return;
    }

    console.log(`🚀 Starting OPTIMIZED batch processing for ${contacts.length} contacts`);
    
    setIsProcessingBatch(true);
    setTotalCalls(contacts.length);
    setCurrentProgress(0);
    setCurrentCallStatus('Inițiere procesare optimizată...');
    
    // Initialize all contacts with 'waiting' status
    const initialStatuses: CallStatus[] = contacts.map(contact => ({
      contactId: contact.id,
      contactName: contact.name,
      status: 'waiting'
    }));
    setCallStatuses(initialStatuses);

    try {
      // Process contacts ONE BY ONE with optimized monitoring
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const callStartTime = new Date();
        console.log(`\n🎯 === PROCESSING CONTACT ${i + 1}/${contacts.length}: ${contact.name} ===`);
        
        setCurrentProgress(i + 1);
        setCurrentContact(contact.name);
        setCurrentCallStatus(`Inițiază apelul către ${contact.name}...`);

        // STEP 1: Mark current contact as 'calling'
        setCallStatuses(prev => prev.map(status => 
          status.contactId === contact.id 
            ? { ...status, status: 'calling', startTime: callStartTime }
            : status
        ));

        try {
          // STEP 2: Initiate the call
          console.log(`📞 Step 2: Initiating call to ${contact.name}`);
          
          const { data: callInitData, error: callInitError } = await supabase.functions.invoke('initiate-scheduled-call', {
            body: {
              agent_id: targetAgentId,
              phone_number: contact.phone,
              contact_name: contact.name,
              user_id: user?.id,
              batch_processing: true
            }
          });

          if (callInitError || !callInitData?.success) {
            console.error(`❌ Failed to initiate call for ${contact.name}:`, callInitError);
            
            setCallStatuses(prev => prev.map(status => 
              status.contactId === contact.id 
                ? { ...status, status: 'failed', endTime: new Date() }
                : status
            ));
            
            toast({
              title: "Eroare inițiere",
              description: `Nu s-a putut iniția apelul către ${contact.name}`,
              variant: "destructive",
            });
            
            continue; // Skip to next contact
          }

          console.log(`✅ Call initiated for ${contact.name}`);

          // STEP 3: Update status and start optimized monitoring
          setCallStatuses(prev => prev.map(status => 
            status.contactId === contact.id 
              ? { ...status, status: 'in-progress' }
              : status
          ));

          toast({
            title: "Apel inițiat",
            description: `Se monitorizează conversațiile noi pentru ${contact.name}...`,
          });

          // STEP 4: OPTIMIZED MONITORING - check for new conversations
          console.log(`👁️ Step 4: Starting optimized monitoring for ${contact.name}`);
          setCurrentCallStatus(`Monitorizează conversații noi pentru ${contact.name}...`);
          
          const newConversations = await monitorForNewConversations(targetAgentId, contact, callStartTime);
          
          // STEP 5: PROCESS ALL NEW CONVERSATIONS
          console.log(`💾 Step 5: Processing ${newConversations.length} new conversations for ${contact.name}`);
          
          if (newConversations.length > 0) {
            setCurrentCallStatus(`Salvează ${newConversations.length} conversații pentru ${contact.name}...`);
            
            for (const conversationData of newConversations) {
              const conversationId = conversationData.conversation_id || 
                                   conversationData.id || 
                                   `unknown_${Date.now()}`;
              
              await saveCompleteCallData(conversationData, contact, conversationId);
            }
            
            // Update status to completed
            setCallStatuses(prev => prev.map(status => 
              status.contactId === contact.id 
                ? { 
                    ...status, 
                    status: 'completed', 
                    endTime: new Date()
                  }
                : status
            ));

            toast({
              title: "Apel finalizat",
              description: `${contact.name}: ${newConversations.length} conversații salvate în istoric`,
            });
          } else {
            // No conversations found - mark as failed
            setCallStatuses(prev => prev.map(status => 
              status.contactId === contact.id 
                ? { ...status, status: 'failed', endTime: new Date() }
                : status
            ));
            
            toast({
              title: "Nicio conversație găsită",
              description: `Pentru ${contact.name} nu s-au găsit conversații noi`,
              variant: "destructive",
            });
          }

          console.log(`✅ === COMPLETED PROCESSING FOR ${contact.name} ===\n`);

        } catch (contactError) {
          console.error(`💥 Critical error processing ${contact.name}:`, contactError);
          
          setCallStatuses(prev => prev.map(status => 
            status.contactId === contact.id 
              ? { ...status, status: 'failed', endTime: new Date() }
              : status
          ));
          
          toast({
            title: "Eroare critică",
            description: `Eroare la procesarea apelului către ${contact.name}`,
            variant: "destructive",
          });
        }
        
        // Small delay before next contact
        if (i < contacts.length - 1) {
          console.log(`⏳ Brief pause before next contact...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Final completion
      setCurrentCallStatus('Procesare batch completată cu succes!');
      
      toast({
        title: "🎉 Procesare completă",
        description: `Toate cele ${contacts.length} contacte au fost procesate cu monitorizare optimizată.`,
      });

      console.log(`🏁 === OPTIMIZED BATCH PROCESSING COMPLETED FOR ALL ${contacts.length} CONTACTS ===`);

    } catch (batchError) {
      console.error('💥 Critical batch processing error:', batchError);
      toast({
        title: "Eroare procesare batch",
        description: "Eroare critică în timpul procesării",
        variant: "destructive",
      });
    } finally {
      setIsProcessingBatch(false);
      setCurrentProgress(0);
      setTotalCalls(0);
      setCurrentContact('');
    }
  }, [user?.id, agentId]);

  // Single call initiation (existing functionality)
  const initiateCall = useCallback(async (targetAgentId: string, targetPhone: string, contactName?: string): Promise<string | null> => {
    if (!targetAgentId || !targetPhone.trim()) {
      toast({
        title: "Eroare",
        description: "Agent ID și numărul de telefon sunt obligatorii",
        variant: "destructive",
      });
      return null;
    }

    setIsInitiating(true);

    try {
      const { data, error } = await supabase.functions.invoke('initiate-scheduled-call', {
        body: {
          agent_id: targetAgentId,
          phone_number: targetPhone,
          contact_name: contactName || targetPhone,
          user_id: user?.id
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Succes!",
          description: `Apelul către ${contactName || targetPhone} a fost inițiat cu succes`,
        });

        console.log('Single call initiated:', data);
        return data.conversationId || 'initiated';
      } else {
        throw new Error('Nu s-a putut iniția apelul');
      }
    } catch (error) {
      console.error('Error initiating single call:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut iniția apelul",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsInitiating(false);
    }
  }, [user?.id]);

  const handleInitiateCall = useCallback(async () => {
    if (phoneNumber && agentId) {
      await initiateCall(agentId, phoneNumber);
    }
  }, [initiateCall, agentId, phoneNumber]);

  return {
    initiateCall,
    processBatchCalls,
    isInitiating,
    isProcessingBatch,
    currentProgress,
    totalCalls,
    currentContact,
    callStatuses,
    currentCallStatus,
    handleInitiateCall,
  };
};
