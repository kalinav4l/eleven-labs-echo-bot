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
  status: 'waiting' | 'calling' | 'in-progress' | 'processing' | 'completed' | 'failed' | 'no-answer' | 'busy' | 'rejected' | 'cancelled';
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

  // Get conversation details from ElevenLabs using conversation_id
  const getConversationDetails = async (conversationId: string): Promise<any> => {
    try {
      console.log(`Getting detailed conversation data for ${conversationId}`);
      
      const { data, error } = await supabase.functions.invoke('get-elevenlabs-conversation', {
        body: { conversationId }
      });

      if (error) {
        console.error('Error getting conversation details:', error);
        return null;
      }

      console.log('Retrieved conversation details:', data);
      return data;
    } catch (error) {
      console.error('Error in getConversationDetails:', error);
      return null;
    }
  };

  // Wait for call completion with strict monitoring using ElevenLabs statuses
  const waitForCallCompletion = async (conversationId: string, contactName: string): Promise<any> => {
    const maxAttempts = 120; // 10 minutes max (120 * 5 seconds)
    let attempts = 0;
    
    console.log(`Starting monitoring for ${contactName} with conversation ID: ${conversationId}`);
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`Monitoring attempt ${attempts} for ${contactName}`);
        setCurrentCallStatus(`Verifică statusul apelului către ${contactName} (${attempts}/${maxAttempts})`);
        
        const conversationData = await getConversationDetails(conversationId);
        
        if (conversationData && conversationData.status) {
          const status = conversationData.status.toLowerCase();
          console.log(`ElevenLabs status for ${contactName}: ${status}`);
          
          // Update real-time status display based on ElevenLabs statuses
          switch (status) {
            case 'initiated':
              setCurrentCallStatus(`Apel inițiat pentru ${contactName}`);
              setCallStatuses(prev => prev.map(cs => 
                cs.conversationId === conversationId 
                  ? { ...cs, status: 'calling' }
                  : cs
              ));
              break;
              
            case 'in-progress':
            case 'ongoing':
            case 'active':
              setCurrentCallStatus(`În conversație cu ${contactName}`);
              setCallStatuses(prev => prev.map(cs => 
                cs.conversationId === conversationId 
                  ? { ...cs, status: 'in-progress' }
                  : cs
              ));
              break;
              
            case 'processing':
              setCurrentCallStatus(`Se procesează apelul cu ${contactName}`);
              setCallStatuses(prev => prev.map(cs => 
                cs.conversationId === conversationId 
                  ? { ...cs, status: 'processing' }
                  : cs
              ));
              break;
              
            case 'ended':
            case 'completed':
            case 'finished':
            case 'done':
              console.log(`✅ Call COMPLETED for ${contactName}. Extracting final data...`);
              setCurrentCallStatus(`Apel finalizat cu ${contactName} - extragere date finale...`);
              setCallStatuses(prev => prev.map(cs => 
                cs.conversationId === conversationId 
                  ? { ...cs, status: 'completed', endTime: new Date() }
                  : cs
              ));
              return conversationData;
              
            case 'failed':
            case 'error':
              console.log(`❌ Call FAILED for ${contactName}`);
              setCurrentCallStatus(`Apel eșuat către ${contactName}`);
              setCallStatuses(prev => prev.map(cs => 
                cs.conversationId === conversationId 
                  ? { ...cs, status: 'failed', endTime: new Date() }
                  : cs
              ));
              return conversationData;
              
            case 'no_answer':
            case 'unanswered':
              console.log(`📵 No answer from ${contactName}`);
              setCurrentCallStatus(`${contactName} nu a răspuns`);
              setCallStatuses(prev => prev.map(cs => 
                cs.conversationId === conversationId 
                  ? { ...cs, status: 'no-answer', endTime: new Date() }
                  : cs
              ));
              return conversationData;
              
            case 'busy':
              console.log(`📞 ${contactName} is busy`);
              setCurrentCallStatus(`${contactName} este ocupat`);
              setCallStatuses(prev => prev.map(cs => 
                cs.conversationId === conversationId 
                  ? { ...cs, status: 'busy', endTime: new Date() }
                  : cs
              ));
              return conversationData;
              
            case 'rejected':
            case 'cancelled':
              console.log(`🚫 Call rejected/cancelled for ${contactName}`);
              setCurrentCallStatus(`Apel respins/anulat pentru ${contactName}`);
              setCallStatuses(prev => prev.map(cs => 
                cs.conversationId === conversationId 
                  ? { ...cs, status: 'rejected', endTime: new Date() }
                  : cs
              ));
              return conversationData;
              
            default:
              console.log(`Unknown status (${status}) for ${contactName}`);
              setCurrentCallStatus(`Status necunoscut (${status}) pentru ${contactName}`);
          }
        } else {
          console.log(`No valid conversation data for ${contactName} on attempt ${attempts}`);
          setCurrentCallStatus(`Așteptare date pentru ${contactName}...`);
        }

        // Wait 5 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        console.error(`Error monitoring ${contactName} on attempt ${attempts}:`, error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Timeout reached
    console.log(`⏰ Monitoring timeout for ${contactName} after ${maxAttempts} attempts`);
    setCurrentCallStatus(`Timeout pentru ${contactName} - salvare ultimele date disponibile...`);
    
    // Try to get final data one more time
    const finalData = await getConversationDetails(conversationId);
    return finalData || { status: 'timeout', error: 'monitoring_timeout' };
  };

  // Save complete call data to history and analytics
  const saveCompleteCallData = async (conversationData: any, contact: Contact, conversationId: string) => {
    try {
      console.log(`💾 Saving complete call data for ${contact.name}:`, conversationData);
      
      // Extract all relevant information
      const transcript = conversationData.transcript || 
                        conversationData.conversation_transcript || 
                        conversationData.messages?.map((m: any) => `${m.role}: ${m.content}`).join('\n') ||
                        '';
                        
      const summary = conversationData.summary || 
                     transcript.substring(0, 200) + (transcript.length > 200 ? '...' : '') ||
                     `Apel către ${contact.name}`;
      
      const cost = conversationData.cost_breakdown?.total_cost || 
                  conversationData.cost || 
                  conversationData.usage?.total_cost ||
                  0;
      
      const duration = conversationData.duration_seconds || 
                      conversationData.call_duration_seconds ||
                      conversationData.duration ||
                      0;
      
      // Determine final status
      let finalStatus = 'failed';
      if (conversationData.status) {
        const status = conversationData.status.toLowerCase();
        if (['ended', 'completed', 'finished', 'done'].includes(status)) {
          finalStatus = 'success';
        } else if (['no_answer', 'unanswered'].includes(status)) {
          finalStatus = 'no-answer';
        } else if (status === 'busy') {
          finalStatus = 'busy';
        } else if (['rejected', 'cancelled'].includes(status)) {
          finalStatus = 'rejected';
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
        elevenlabs_history_id: conversationId,
        language: 'ro'
      };

      console.log(`📝 Inserting call record for ${contact.name}:`, callRecord);

      const { data: insertData, error: insertError } = await supabase
        .from('call_history')
        .insert(callRecord)
        .select();

      if (insertError) {
        console.error(`❌ Error saving call data for ${contact.name}:`, insertError);
        throw insertError;
      } else {
        console.log(`✅ Successfully saved call data for ${contact.name}:`, insertData);
        toast({
          title: "Date salvate",
          description: `Informațiile complete pentru apelul către ${contact.name} au fost salvate în istoric`,
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

  // Process batch calls with strict sequential logic using ElevenLabs statuses
  const processBatchCalls = useCallback(async (contacts: Contact[], targetAgentId: string) => {
    if (!targetAgentId || contacts.length === 0) {
      toast({
        title: "Eroare",
        description: "Agent ID și contactele sunt obligatorii",
        variant: "destructive",
      });
      return;
    }

    console.log(`🚀 Starting SEQUENTIAL batch processing for ${contacts.length} contacts`);
    
    setIsProcessingBatch(true);
    setTotalCalls(contacts.length);
    setCurrentProgress(0);
    setCurrentCallStatus('Inițiere procesare secvențială...');
    
    // Initialize all contacts with 'waiting' status
    const initialStatuses: CallStatus[] = contacts.map(contact => ({
      contactId: contact.id,
      contactName: contact.name,
      status: 'waiting'
    }));
    setCallStatuses(initialStatuses);

    try {
      // Process contacts ONE BY ONE
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        console.log(`\n🎯 === PROCESSING CONTACT ${i + 1}/${contacts.length}: ${contact.name} ===`);
        
        setCurrentProgress(i + 1);
        setCurrentContact(contact.name);
        setCurrentCallStatus(`Inițiază apelul către ${contact.name}...`);

        // STEP 1: Mark current contact as 'calling'
        setCallStatuses(prev => prev.map(status => 
          status.contactId === contact.id 
            ? { ...status, status: 'calling', startTime: new Date() }
            : status
        ));

        try {
          // STEP 2: Initiate the call and get conversation_id immediately
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

          if (callInitError || !callInitData?.success || !callInitData?.conversationId) {
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

          const conversationId = callInitData.conversationId;
          console.log(`✅ Call initiated for ${contact.name}, conversation_id: ${conversationId}`);

          // STEP 3: Update status with conversation_id and start monitoring
          setCallStatuses(prev => prev.map(status => 
            status.contactId === contact.id 
              ? { ...status, status: 'calling', conversationId: conversationId }
              : status
          ));

          toast({
            title: "Apel inițiat",
            description: `Se monitorizează apelul către ${contact.name}...`,
          });

          // STEP 4: STRICT MONITORING until 'done' or 'failed' status
          console.log(`👁️ Step 4: Starting monitoring for ${contact.name} until 'done' or 'failed'`);
          setCurrentCallStatus(`Monitorizează apelul către ${contactName}...`);
          
          const finalConversationData = await waitForCallCompletion(conversationId, contact.name);
          
          // STEP 5: MANDATORY - Extract and save ALL data only after 'done' or 'failed'
          console.log(`💾 Step 5: MANDATORY data extraction for ${contact.name} - Status: ${finalConversationData?.status}`);
          setCurrentCallStatus(`Salvează datele pentru ${contact.name}...`);
          
          await saveCompleteCallData(finalConversationData, contact, conversationId);
          
          // STEP 6: Update final status
          const finalStatus = finalConversationData?.status?.toLowerCase();
          let displayStatus: CallStatus['status'] = 'completed';
          
          if (['failed', 'error'].includes(finalStatus)) {
            displayStatus = 'failed';
          } else if (['no_answer', 'unanswered'].includes(finalStatus)) {
            displayStatus = 'no-answer';
          } else if (finalStatus === 'busy') {
            displayStatus = 'busy';
          } else if (['rejected', 'cancelled'].includes(finalStatus)) {
            displayStatus = 'rejected';
          }
          
          setCallStatuses(prev => prev.map(status => 
            status.contactId === contact.id 
              ? { 
                  ...status, 
                  status: displayStatus, 
                  endTime: new Date(),
                  duration: finalConversationData?.duration_seconds || finalConversationData?.duration,
                  cost: finalConversationData?.cost_breakdown?.total_cost || finalConversationData?.cost
                }
              : status
          ));

          console.log(`✅ === COMPLETED PROCESSING FOR ${contact.name} - Status: ${finalStatus} ===\n`);
          
          toast({
            title: "Apel finalizat",
            description: `${contact.name}: Apel finalizat și salvat în istoric`,
          });

        } catch (contactError) {
          console.error(`💥 Critical error processing ${contact.name}:`, contactError);
          
          setCallStatuses(prev => prev.map(status => 
            status.contactId === contact.id 
              ? { ...status, status: 'failed', endTime: new Date() }
              : status
        ));
          
          toast({
            title: "Eroare critică",
            description: `Eroare la procesarea lui ${contact.name}`,
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
        description: `Toate cele ${contacts.length} contacte au fost procesate și salvate în istoric.`,
      });

      console.log(`🏁 === BATCH PROCESSING COMPLETED FOR ALL ${contacts.length} CONTACTS ===`);

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
      // Don't clear currentCallStatus and callStatuses so user can see final results
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

      if (data?.success && data?.conversationId) {
        toast({
          title: "Succes!",
          description: `Apelul către ${contactName || targetPhone} a fost inițiat cu succes`,
        });

        console.log('Single call initiated:', data);
        return data.conversationId;
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
