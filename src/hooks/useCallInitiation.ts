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

  // Enhanced logging function
  const logStep = (step: string, details: any = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] ${step}:`, details);
  };

  // Get all conversations for an agent with enhanced logging
  const getAgentConversations = async (targetAgentId: string): Promise<any> => {
    try {
      logStep('STEP: Getting agent conversations', { targetAgentId });
      
      const { data, error } = await supabase.functions.invoke('get-agent-conversations', {
        body: { agentId: targetAgentId }
      });

      if (error) {
        logStep('ERROR: Supabase function error in getAgentConversations', { error, targetAgentId });
        return { error: error.message, status: 'api_error' };
      }

      if (data?.error) {
        logStep('ERROR: ElevenLabs API error in getAgentConversations', { error: data.error, status: data.status });
        return { error: data.error, status: data.status || 'api_error' };
      }

      logStep('SUCCESS: Agent conversations retrieved', { 
        conversationCount: data?.conversations?.length || 0,
        targetAgentId 
      });
      return data;
    } catch (error) {
      logStep('CRITICAL ERROR: Exception in getAgentConversations', { error: error.message, targetAgentId });
      return { error: error.message, status: 'function_error' };
    }
  };

  // Get conversation details with enhanced logging
  const getConversationDetails = async (conversationId: string): Promise<any> => {
    try {
      logStep('STEP: Getting conversation details', { conversationId });
      
      const { data, error } = await supabase.functions.invoke('get-elevenlabs-conversation', {
        body: { conversationId }
      });

      if (error) {
        logStep('ERROR: Supabase function error in getConversationDetails', { error, conversationId });
        return { error: error.message, status: 'api_error' };
      }

      if (data?.error) {
        logStep('ERROR: ElevenLabs API error in getConversationDetails', { error: data.error, conversationId });
        return { error: data.error, status: data.status || 'api_error' };
      }

      logStep('SUCCESS: Conversation details retrieved', { conversationId });
      return data;
    } catch (error) {
      logStep('CRITICAL ERROR: Exception in getConversationDetails', { error: error.message, conversationId });
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

  // Enhanced monitoring with detailed logging
  const monitorForNewConversations = async (targetAgentId: string, contact: Contact, startTime: Date): Promise<any[]> => {
    const maxAttempts = 24; // 2 minutes max (24 * 5 seconds)
    let attempts = 0;
    
    logStep('START: Conversation monitoring', { 
      contactName: contact.name, 
      targetAgentId, 
      startTime: startTime.toISOString(),
      maxAttempts 
    });
    
    // Get existing conversation IDs before we start monitoring
    const existingConversationIds = await getExistingConversationIds();
    logStep('STEP: Existing conversation IDs retrieved', { 
      count: existingConversationIds.length,
      ids: existingConversationIds 
    });
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        logStep('STEP: Monitoring attempt', { 
          attempt: attempts, 
          maxAttempts, 
          contactName: contact.name 
        });
        
        setCurrentCallStatus(`Verifică conversații noi pentru ${contact.name} (${attempts}/${maxAttempts})`);
        
        // Wait 30 seconds before first check, then 5 seconds between checks
        if (attempts === 1) {
          logStep('STEP: Initial wait period', { waitTime: '30 seconds', contactName: contact.name });
          await new Promise(resolve => setTimeout(resolve, 30000));
        } else {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        // Get all conversations for this agent
        const conversationsData = await getAgentConversations(targetAgentId);
        
        if (conversationsData?.error) {
          logStep('WARNING: API error during monitoring, continuing', { 
            error: conversationsData.error, 
            attempt: attempts,
            contactName: contact.name 
          });
          continue;
        }
        
        const conversations = conversationsData?.conversations || [];
        logStep('STEP: Conversations retrieved for monitoring', { 
          totalConversations: conversations.length,
          attempt: attempts,
          contactName: contact.name 
        });
        
        // Filter conversations that are newer than our start time and not in our database
        const newConversations = conversations.filter((conv: any) => {
          const convDate = new Date(conv.created_at || conv.start_time);
          const isNewer = convDate >= startTime;
          const isNotInDb = !existingConversationIds.includes(conv.conversation_id);
          
          logStep('STEP: Filtering conversation', { 
            conversationId: conv.conversation_id,
            createdAt: convDate.toISOString(),
            isNewer,
            isNotInDb,
            contactName: contact.name 
          });
          
          return isNewer && isNotInDb;
        });
        
        if (newConversations.length > 0) {
          logStep('SUCCESS: New conversations found!', { 
            count: newConversations.length,
            contactName: contact.name,
            conversationIds: newConversations.map(c => c.conversation_id) 
          });
          
          setCurrentCallStatus(`Găsit ${newConversations.length} conversații noi pentru ${contact.name} - extragere date...`);
          
          // Get detailed data for each new conversation
          const detailedConversations = [];
          for (const conv of newConversations) {
            logStep('STEP: Getting detailed data for conversation', { 
              conversationId: conv.conversation_id,
              contactName: contact.name 
            });
            
            const details = await getConversationDetails(conv.conversation_id);
            if (details && !details.error) {
              detailedConversations.push(details);
              logStep('SUCCESS: Detailed conversation data retrieved', { 
                conversationId: conv.conversation_id,
                contactName: contact.name 
              });
            } else {
              logStep('ERROR: Failed to get detailed conversation data', { 
                conversationId: conv.conversation_id,
                error: details?.error,
                contactName: contact.name 
              });
            }
          }
          
          logStep('SUCCESS: All detailed conversations retrieved', { 
            count: detailedConversations.length,
            contactName: contact.name 
          });
          return detailedConversations;
        }
        
        logStep('STEP: No new conversations found, continuing monitoring', { 
          attempt: attempts,
          contactName: contact.name 
        });
        
      } catch (error) {
        logStep('ERROR: Exception during monitoring', { 
          error: error.message,
          attempt: attempts,
          contactName: contact.name 
        });
        setCurrentCallStatus(`Eroare temporară pentru ${contact.name}, se reîncearcă...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    // Timeout reached - final check
    logStep('TIMEOUT: Monitoring timeout reached, final check', { 
      maxAttempts,
      contactName: contact.name 
    });
    
    try {
      const conversationsData = await getAgentConversations(targetAgentId);
      if (conversationsData?.conversations) {
        const conversations = conversationsData.conversations;
        const newConversations = conversations.filter((conv: any) => {
          const convDate = new Date(conv.created_at || conv.start_time);
          return convDate >= startTime && !existingConversationIds.includes(conv.conversation_id);
        });
        
        if (newConversations.length > 0) {
          logStep('SUCCESS: Final check found conversations', { 
            count: newConversations.length,
            contactName: contact.name 
          });
          
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
      logStep('ERROR: Exception in final check', { 
        error: error.message,
        contactName: contact.name 
      });
    }
    
    logStep('FAILURE: No conversations found after timeout', { contactName: contact.name });
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

  // Enhanced batch processing with detailed logging
  const processBatchCalls = useCallback(async (contacts: Contact[], targetAgentId: string) => {
    logStep('START: Batch processing initiated', { 
      contactCount: contacts.length,
      targetAgentId 
    });

    if (!targetAgentId || contacts.length === 0) {
      logStep('ERROR: Missing required parameters for batch processing', { 
        hasAgentId: !!targetAgentId,
        contactCount: contacts.length 
      });
      toast({
        title: "Eroare",
        description: "Agent ID și contactele sunt obligatorii",
        variant: "destructive",
      });
      return;
    }

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
      // Process contacts ONE BY ONE with detailed logging
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const callStartTime = new Date();
        
        logStep(`BATCH CONTACT ${i + 1}/${contacts.length}: Starting processing`, { 
          contactName: contact.name,
          phone: contact.phone,
          startTime: callStartTime.toISOString() 
        });
        
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
          // STEP 2: Initiate the call with detailed logging
          logStep(`BATCH CONTACT ${i + 1}: Initiating call`, { 
            contactName: contact.name,
            phone: contact.phone,
            targetAgentId 
          });
          
          const requestData = {
            agent_id: targetAgentId,
            phone_number: contact.phone,
            contact_name: contact.name,
            user_id: user?.id,
            batch_processing: true
          };
          
          logStep(`BATCH CONTACT ${i + 1}: Request payload prepared`, requestData);
          
          // Validate required fields
          if (!targetAgentId || targetAgentId.trim() === '') {
            logStep(`BATCH CONTACT ${i + 1}: VALIDATION ERROR - Empty Agent ID`, { contactName: contact.name });
            throw new Error(`Agent ID este gol pentru ${contact.name}`);
          }
          
          if (!contact.phone || contact.phone.trim() === '') {
            logStep(`BATCH CONTACT ${i + 1}: VALIDATION ERROR - Empty phone number`, { contactName: contact.name });
            throw new Error(`Numărul de telefon este gol pentru ${contact.name}`);
          }
          
          const { data: callInitData, error: callInitError } = await supabase.functions.invoke('initiate-scheduled-call', {
            body: requestData
          });

          logStep(`BATCH CONTACT ${i + 1}: ElevenLabs response received`, { 
            success: !!callInitData?.success,
            error: callInitError || callInitData?.error,
            statusCode: callInitData?.status_code,
            contactName: contact.name 
          });

          if (callInitError) {
            logStep(`BATCH CONTACT ${i + 1}: SUPABASE ERROR`, { 
              error: callInitError,
              contactName: contact.name 
            });
            
            setCallStatuses(prev => prev.map(status => 
              status.contactId === contact.id 
                ? { ...status, status: 'failed', endTime: new Date() }
                : status
            ));
            
            setCurrentCallStatus(`❌ Eroare Supabase pentru ${contact.name}: ${callInitError.message}`);
            continue;
          }
          
          if (!callInitData?.success) {
            logStep(`BATCH CONTACT ${i + 1}: ELEVENLABS ERROR`, { 
              error: callInitData?.error,
              statusCode: callInitData?.status_code,
              details: callInitData?.details,
              contactName: contact.name 
            });
            
            setCallStatuses(prev => prev.map(status => 
              status.contactId === contact.id 
                ? { ...status, status: 'failed', endTime: new Date() }
                : status
            ));
            
            setCurrentCallStatus(`❌ Apel eșuat pentru ${contact.name}: ${callInitData?.error}`);
            continue;
          }

          logStep(`BATCH CONTACT ${i + 1}: Call initiated successfully`, { 
            conversationId: callInitData.conversationId,
            contactName: contact.name 
          });

          // STEP 3: Update status and start monitoring
          setCallStatuses(prev => prev.map(status => 
            status.contactId === contact.id 
              ? { ...status, status: 'in-progress' }
              : status
          ));

          // STEP 4: Start monitoring
          logStep(`BATCH CONTACT ${i + 1}: Starting conversation monitoring`, { contactName: contact.name });
          setCurrentCallStatus(`Monitorizează conversații noi pentru ${contact.name}...`);
          
          const newConversations = await monitorForNewConversations(targetAgentId, contact, callStartTime);
          
          // STEP 5: Process results
          logStep(`BATCH CONTACT ${i + 1}: Monitoring completed`, { 
            foundConversations: newConversations.length,
            contactName: contact.name 
          });
          
          if (newConversations.length > 0) {
            setCurrentCallStatus(`Salvează ${newConversations.length} conversații pentru ${contact.name}...`);
            
            for (const conversationData of newConversations) {
              const conversationId = conversationData.conversation_id || 
                                   conversationData.id || 
                                   `unknown_${Date.now()}`;
              
              logStep(`BATCH CONTACT ${i + 1}: Saving conversation data`, { 
                conversationId,
                contactName: contact.name 
              });
              
              await saveCompleteCallData(conversationData, contact, conversationId);
            }
            
            setCallStatuses(prev => prev.map(status => 
              status.contactId === contact.id 
                ? { 
                    ...status, 
                    status: 'completed', 
                    endTime: new Date()
                  }
                : status
            ));

            logStep(`BATCH CONTACT ${i + 1}: COMPLETED SUCCESSFULLY`, { 
              conversationsFound: newConversations.length,
              contactName: contact.name 
            });
          } else {
            setCallStatuses(prev => prev.map(status => 
              status.contactId === contact.id 
                ? { ...status, status: 'failed', endTime: new Date() }
                : status
            ));
            
            logStep(`BATCH CONTACT ${i + 1}: FAILED - No conversations found`, { contactName: contact.name });
          }

        } catch (contactError) {
          logStep(`BATCH CONTACT ${i + 1}: CRITICAL ERROR`, { 
            error: contactError.message,
            stack: contactError.stack,
            contactName: contact.name 
          });
          
          setCallStatuses(prev => prev.map(status => 
            status.contactId === contact.id 
              ? { ...status, status: 'failed', endTime: new Date() }
              : status
          ));
        }
        
        // Brief pause before next contact
        if (i < contacts.length - 1) {
          logStep(`BATCH: Brief pause before next contact (${i + 2}/${contacts.length})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      logStep('BATCH PROCESSING: COMPLETED', { 
        totalContacts: contacts.length,
        completed: callStatuses.filter(s => s.status === 'completed').length,
        failed: callStatuses.filter(s => s.status === 'failed').length 
      });

    } catch (batchError) {
      logStep('BATCH PROCESSING: CRITICAL ERROR', { 
        error: batchError.message,
        stack: batchError.stack 
      });
    } finally {
      setIsProcessingBatch(false);
      setCurrentProgress(0);
      setTotalCalls(0);
      setCurrentContact('');
    }
  }, [user?.id, agentId]);

  // Enhanced single call initiation with detailed logging
  const initiateCall = useCallback(async (targetAgentId: string, targetPhone: string, contactName?: string): Promise<string | null> => {
    logStep('SINGLE CALL: Initiation started', { 
      targetAgentId, 
      targetPhone, 
      contactName 
    });

    if (!targetAgentId || !targetPhone.trim()) {
      logStep('SINGLE CALL: VALIDATION ERROR - Missing required fields', { 
        hasAgentId: !!targetAgentId,
        hasPhone: !!targetPhone?.trim() 
      });
      toast({
        title: "Eroare",
        description: "Agent ID și numărul de telefon sunt obligatorii",
        variant: "destructive",
      });
      return null;
    }

    setIsInitiating(true);

    try {
      logStep('SINGLE CALL: Making request to initiate-scheduled-call', { 
        targetAgentId, 
        targetPhone, 
        contactName 
      });

      const { data, error } = await supabase.functions.invoke('initiate-scheduled-call', {
        body: {
          agent_id: targetAgentId,
          phone_number: targetPhone,
          contact_name: contactName || targetPhone,
          user_id: user?.id
        }
      });

      logStep('SINGLE CALL: Response received', { 
        success: data?.success,
        error: error || data?.error,
        conversationId: data?.conversationId 
      });

      if (error) {
        logStep('SINGLE CALL: SUPABASE ERROR', { error });
        throw error;
      }

      if (data?.success) {
        logStep('SINGLE CALL: SUCCESS', { 
          conversationId: data.conversationId,
          contactName: contactName || targetPhone 
        });

        toast({
          title: "Succes!",
          description: `Apelul către ${contactName || targetPhone} a fost inițiat cu succes`,
        });

        return data.conversationId || 'initiated';
      } else {
        logStep('SINGLE CALL: FAILED', { 
          error: data?.error,
          statusCode: data?.status_code 
        });
        throw new Error(data?.error || 'Nu s-a putut iniția apelul');
      }
    } catch (error) {
      logStep('SINGLE CALL: CRITICAL ERROR', { 
        error: error.message,
        stack: error.stack 
      });
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
