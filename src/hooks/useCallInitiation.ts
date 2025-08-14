import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useCallSessionTracking } from '@/hooks/useCallSessionTracking';
import { useCampaignPersistence } from '@/hooks/useCampaignPersistence';
import { useActiveAgents } from '@/hooks/useActiveAgents';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { useSMSService } from './useSMSService';
import { validateUserHasPhoneNumber } from '@/utils/phoneNumberUtils';

interface SMSConfig {
  enabled: boolean;
  apiToken: string;
  senderId: string;
  message: string;
  delay: number;
}

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
  smsConfig?: SMSConfig;
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
  smsConfig,
}: UseCallInitiationProps) => {
  const { user } = useAuth();
  const { scheduleSMS } = useSMSService();
  const { saveCallSession } = useCallSessionTracking();
  const [isInitiating, setIsInitiating] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);
  const [currentContact, setCurrentContact] = useState<string>('');
  const [callStatuses, setCallStatuses] = useState<CallStatus[]>([]);
  const [currentCallStatus, setCurrentCallStatus] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Hook-uri pentru persistență și monitorizare
  const { 
    saveCampaignSession, 
    generateSessionId,
    campaignSession 
  } = useCampaignPersistence(sessionId);
  
  const { updateAgentStatus, removeActiveAgent } = useActiveAgents();

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

  // Simplified call monitoring - like a call factory
  const monitorCall = async (targetAgentId: string, contact: Contact, startTime: Date): Promise<any[]> => {
    logStep('🏭 FACTORY: Starting call monitoring', { 
      contactName: contact.name, 
      targetAgentId
    });
    
    // REDUCED DELAY: Wait only 10 seconds for faster feedback
    setCurrentCallStatus(`⏳ Procesează apel ${contact.name}...`);
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Get existing conversation IDs to compare
    const existingConversationIds = await getExistingConversationIds();
    
    // Single check for conversations
    try {
      logStep(`🔍 FACTORY: Checking conversations for ${contact.name}`);
      
      const conversationsData = await getAgentConversations(targetAgentId);
      if (conversationsData?.error) {
        logStep('⚠️ API Error, marking as failed', { 
          error: conversationsData.error,
          contactName: contact.name 
        });
        return [];
      }
      
      const conversations = conversationsData?.conversations || [];
      
      // Find new conversations after start time
      const newConversations = conversations.filter((conv: any) => {
        const convDate = new Date(conv.created_at || conv.start_time);
        const isNewer = convDate >= startTime;
        const isNotInDb = !existingConversationIds.includes(conv.conversation_id);
        return isNewer && isNotInDb;
      });
      
      if (newConversations.length > 0) {
        logStep(`✅ FACTORY: Found ${newConversations.length} conversations`, { 
          contactName: contact.name,
          conversationIds: newConversations.map(c => c.conversation_id) 
        });
        
        // Get details for each conversation
        const detailedConversations = [];
        
        for (const conv of newConversations) {
          const details = await getConversationDetails(conv.conversation_id);
          if (details && !details.error) {
            detailedConversations.push(details);
          }
        }
        
        return detailedConversations;
      }
      
      logStep('⏰ FACTORY: No new conversations found', { contactName: contact.name });
      return [];
      
    } catch (error) {
      logStep('❌ FACTORY: Error during monitoring', { 
        error: error.message,
        contactName: contact.name 
      });
      return [];
    }
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

  // Enhanced batch processing with instant feedback
  const processBatchCalls = useCallback(async (contacts: Contact[], targetAgentId: string) => {
    // INSTANT FEEDBACK: Toast imediat când se apasă butonul
    toast({
      title: "⏳ Inițiez apelurile...",
      description: `Pornesc procesarea pentru ${contacts.length} contacte`,
    });

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

    // INSTANT STATE UPDATES: Set states immediately
    setIsProcessingBatch(true);
    setIsPaused(false);
    setIsStopped(false);
    setTotalCalls(contacts.length);
    setCurrentProgress(0);
    setCurrentCallStatus('🚀 Pornind campania...');

    // Validate user has phone number before starting batch
    if (user?.id) {
      const phoneValidation = await validateUserHasPhoneNumber(user.id);
      if (!phoneValidation.hasPhone) {
        toast({
          title: "Număr de telefon lipsă",
          description: phoneValidation.error || "Nu aveți un număr de telefon înregistrat",
          variant: "destructive",
        });
        setIsProcessingBatch(false);
        return;
      }
      
      toast({
        title: "✅ Număr de telefon găsit",
        description: `Apelurile vor fi făcute de pe: ${phoneValidation.phoneNumber?.phone_number}`,
      });
    }
    
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
        // Check if batch is stopped
        if (isStopped) {
          logStep('BATCH PROCESSING: STOPPED by user');
          setCurrentCallStatus('🛑 Procesare oprită de utilizator');
          break;
        }

        // Check if batch is paused
        while (isPaused && !isStopped) {
          setCurrentCallStatus('⏸️ Procesare în pauză...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Check again if stopped after pause
        if (isStopped) {
          logStep('BATCH PROCESSING: STOPPED by user after pause');
          setCurrentCallStatus('🛑 Procesare oprită de utilizator');
          break;
        }

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
            
            // INSTANT ERROR FEEDBACK
            toast({
              title: "❌ Eroare tehnică",
              description: `Problemă la inițierea apelului către ${contact.name}`,
              variant: "destructive",
            });
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
            
            // DIFFERENTIATED ERROR FEEDBACK for busy vs failed
            const isBusyError = callInitData?.error?.includes('BUSY') || callInitData?.error?.includes('UNAVAILABLE');
            toast({
              title: isBusyError ? "📞 Număr ocupat" : "❌ Apel eșuat",
              description: isBusyError 
                ? `${contact.name} este ocupat/indisponibil momentan`
                : `Eroare la apelul către ${contact.name}: ${callInitData?.error}`,
              variant: isBusyError ? "default" : "destructive",
            });
            continue;
          }

          logStep(`BATCH CONTACT ${i + 1}: Call initiated successfully`, { 
            conversationId: callInitData.conversationId,
            contactName: contact.name 
          });

          // INSTANT SUCCESS FEEDBACK
          toast({
            title: "📞 Apel inițiat",
            description: `Apelul către ${contact.name} a fost trimis către ElevenLabs`,
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
            
            // Add 5-minute delay between calls (as requested)
            if (i < contacts.length - 1) { // Don't delay after the last contact
              setCurrentCallStatus(`⏰ Pauză de 5 minute între apeluri...`);
              await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000)); // 5 minutes
            }
          
          const newConversations = await monitorCall(targetAgentId, contact, callStartTime);
          
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
              
              // Send SMS if configured
              if (smsConfig?.enabled) {
                try {
                  await scheduleSMS.mutateAsync({
                    phoneNumber: contact.phone,
                    contactName: contact.name,
                    smsConfig,
                    conversationId
                  });
                  console.log(`✅ SMS scheduled for ${contact.name}`);
                } catch (smsError) {
                  console.error(`❌ SMS failed for ${contact.name}:`, smsError);
                }
              }
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
      setIsPaused(false);
      
      if (isStopped) {
        setCurrentCallStatus('🛑 Procesare oprită de utilizator');
        logStep('BATCH PROCESSING: STOPPED AND FINALIZED');
      } else {
        setCurrentCallStatus('✅ Procesare finalizată cu succes');
        logStep('BATCH PROCESSING: COMPLETED AND FINALIZED');
      }
      
      // Reset progress after showing final status
      setTimeout(() => {
        setCurrentProgress(0);
        setTotalCalls(0);
        setCurrentContact('');
        setCurrentCallStatus('');
        setIsStopped(false);
      }, 3000);
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
          user_id: user?.id,
          caller_number: 'phnum_01jz5v97bgfmdsvyy3hb095k3c' // Always use this number for test calls
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

        // Salvez sesiunea pentru callback-uri corecte
        if (data?.conversationId) {
          try {
            await saveCallSession.mutateAsync({
              session_id: data.conversationId,
              agent_id: targetAgentId,
              phone_number: targetPhone,
              contact_name: contactName || targetPhone,
              session_type: 'phone_call'
            });
            console.log('✅ Sesiune salvată pentru callback-uri corecte');
          } catch (sessionError) {
            console.warn('⚠️ Nu s-a putut salva sesiunea:', sessionError);
          }
        }

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

  // Control functions for batch processing
  const pauseBatch = useCallback(() => {
    setIsPaused(true);
    logStep('BATCH PROCESSING: PAUSED by user');
    toast({
      title: "Pauză",
      description: "Procesarea a fost pusă în pauză",
    });
  }, []);

  const resumeBatch = useCallback(() => {
    setIsPaused(false);
    logStep('BATCH PROCESSING: RESUMED by user');
    toast({
      title: "Reluare",
      description: "Procesarea a fost reluată",
    });
  }, []);

  const stopBatch = useCallback(() => {
    setIsStopped(true);
    setIsPaused(false);
    logStep('BATCH PROCESSING: STOPPED by user');
    toast({
      title: "Oprire",
      description: "Procesarea a fost oprită",
    });
  }, []);

  return {
    initiateCall,
    processBatchCalls,
    isInitiating,
    isProcessingBatch,
    isPaused,
    isStopped,
    currentProgress,
    totalCalls,
    currentContact,
    callStatuses,
    currentCallStatus,
    handleInitiateCall,
    pauseBatch,
    resumeBatch,
    stopBatch,
    sessionId,
    startTime,
    campaignSession,
  };
};
