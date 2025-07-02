
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
  status: 'waiting' | 'calling' | 'talking' | 'completed' | 'failed' | 'no-answer' | 'busy';
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

  // Get conversation details from ElevenLabs
  const getConversationDetails = async (conversationId: string): Promise<any> => {
    try {
      console.log(`Getting conversation details for ${conversationId}`);
      
      const { data, error } = await supabase.functions.invoke('get-elevenlabs-conversation', {
        body: { conversationId }
      });

      if (error) {
        console.error('Error getting conversation details:', error);
        return null;
      }

      console.log('Conversation details:', data);
      return data;
    } catch (error) {
      console.error('Error in getConversationDetails:', error);
      return null;
    }
  };

  // List conversations for agent to get latest conversation
  const getLatestConversation = async (agentId: string): Promise<any> => {
    try {
      console.log(`Getting latest conversations for agent ${agentId}`);
      
      const { data, error } = await supabase.functions.invoke('get-elevenlabs-conversations', {
        body: { agentId }
      });

      if (error) {
        console.error('Error getting conversations:', error);
        return null;
      }

      console.log('Latest conversations:', data);
      
      // Return the most recent conversation
      if (data && data.conversations && data.conversations.length > 0) {
        return data.conversations[0]; // Most recent first
      }
      
      return null;
    } catch (error) {
      console.error('Error in getLatestConversation:', error);
      return null;
    }
  };

  // Wait for call completion and get full details
  const waitForCallCompletion = async (conversationId: string, contactName: string): Promise<any> => {
    const maxAttempts = 60; // 5 minutes max wait
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`Checking call status for ${contactName}, attempt ${attempts + 1}`);
        setCurrentCallStatus(`Verifică statusul apelului către ${contactName}...`);
        
        const conversationData = await getConversationDetails(conversationId);
        
        if (conversationData) {
          const status = conversationData.status || conversationData.state || 'unknown';
          console.log(`Call status for ${contactName}:`, status);
          
          // Update current call status display
          switch (status) {
            case 'queued':
              setCurrentCallStatus(`Apel în coadă pentru ${contactName}`);
              break;
            case 'ringing':
              setCurrentCallStatus(`Sună la ${contactName}...`);
              break;
            case 'in_progress':
            case 'ongoing':
            case 'active':
              setCurrentCallStatus(`În conversație cu ${contactName}`);
              break;
            case 'ended':
            case 'completed':
            case 'finished':
            case 'done':
              setCurrentCallStatus(`Apel finalizat cu ${contactName}`);
              console.log('Call completed, returning full data:', conversationData);
              return conversationData;
            case 'failed':
            case 'no_answer':
            case 'busy':
            case 'rejected':
            case 'cancelled':
              setCurrentCallStatus(`Apel eșuat către ${contactName}: ${status}`);
              console.log('Call failed, returning data:', conversationData);
              return conversationData;
            default:
              setCurrentCallStatus(`Status: ${status} pentru ${contactName}`);
          }
        } else {
          console.log(`No conversation data for ${contactName}`);
        }

        // Wait 5 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        console.error('Error in waitForCallCompletion:', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log('Call completion timeout reached for', contactName);
    setCurrentCallStatus(`Timeout pentru apelul către ${contactName} - obținere date finale...`);
    
    // Try to get the latest conversation data one more time
    const finalData = await getConversationDetails(conversationId);
    return finalData || { state: 'timeout', error: 'timeout' };
  };

  // Save call to history with complete information
  const saveCallToHistory = async (conversationData: any, contactInfo: Contact, callHistoryId?: string) => {
    try {
      console.log('Saving call to history:', conversationData);
      
      const summary = conversationData.summary || 
                     conversationData.transcript || 
                     `Apel către ${contactInfo.name}`;
      
      const cost = conversationData.cost_details?.total_cost || 
                   conversationData.cost || 0;
      
      const duration = conversationData.duration_seconds || 
                      conversationData.duration || 0;
      
      const finalStatus = (conversationData.state === 'ended' || 
                          conversationData.state === 'completed' || 
                          conversationData.state === 'done') && 
                          !conversationData.error ? 'success' : 'failed';
      
      const callData = {
        user_id: user?.id,
        phone_number: contactInfo.phone,
        contact_name: contactInfo.name,
        call_status: finalStatus,
        summary: summary,
        dialog_json: JSON.stringify(conversationData),
        call_date: new Date().toISOString(),
        cost_usd: cost,
        duration_seconds: duration,
        agent_id: agentId,
        conversation_id: conversationData.conversation_id || conversationData.id,
        elevenlabs_history_id: conversationData.history_id || conversationData.conversation_id || conversationData.id,
        language: 'ro'
      };

      if (callHistoryId) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('call_history')
          .update(callData)
          .eq('id', callHistoryId);

        if (updateError) {
          console.error('Error updating call history:', updateError);
        } else {
          console.log('Call history updated successfully');
        }
      } else {
        // Insert new record
        const { data: insertData, error: insertError } = await supabase
          .from('call_history')
          .insert(callData)
          .select();

        if (insertError) {
          console.error('Error inserting call history:', insertError);
        } else {
          console.log('Call history inserted successfully:', insertData);
        }
      }
    } catch (error) {
      console.error('Error saving call to history:', error);
    }
  };

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

        console.log('Call initiated:', data);
        return data.conversationId;
      } else {
        throw new Error('Nu s-a putut iniția apelul');
      }
    } catch (error) {
      console.error('Error initiating call:', error);
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

  const processBatchCalls = useCallback(async (contacts: Contact[], targetAgentId: string) => {
    if (!targetAgentId || contacts.length === 0) {
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
    setCurrentCallStatus('Inițiere procesare batch...');
    
    // Initialize call statuses
    const initialStatuses: CallStatus[] = contacts.map(contact => ({
      contactId: contact.id,
      contactName: contact.name,
      status: 'waiting'
    }));
    setCallStatuses(initialStatuses);

    try {
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        setCurrentProgress(i + 1);
        setCurrentContact(contact.name);
        setCurrentCallStatus(`Inițiază apelul către ${contact.name}...`);

        // Update status to calling
        setCallStatuses(prev => prev.map(status => 
          status.contactId === contact.id 
            ? { ...status, status: 'calling', startTime: new Date() }
            : status
        ));

        try {
          // Initiate the call
          const { data, error } = await supabase.functions.invoke('initiate-scheduled-call', {
            body: {
              agent_id: targetAgentId,
              phone_number: contact.phone,
              contact_name: contact.name,
              user_id: user?.id,
              batch_processing: true
            }
          });

          if (error) {
            console.error(`Error calling ${contact.name}:`, error);
            setCallStatuses(prev => prev.map(status => 
              status.contactId === contact.id 
                ? { ...status, status: 'failed', endTime: new Date() }
                : status
            ));
            
            toast({
              title: "Eroare apel",
              description: `Nu s-a putut apela ${contact.name}`,
              variant: "destructive",
            });
            continue;
          }

          if (data?.success && data?.conversationId) {
            console.log(`Successfully initiated call to ${contact.name}:`, data);
            
            // Update status to talking
            setCallStatuses(prev => prev.map(status => 
              status.contactId === contact.id 
                ? { ...status, status: 'talking', conversationId: data.conversationId }
                : status
            ));

            toast({
              title: "Apel inițiat",
              description: `Apelul către ${contact.name} a fost inițiat. Se monitorizează...`,
            });

            // Wait for call completion and get full data
            setCurrentCallStatus(`Monitorizează apelul către ${contact.name}...`);
            const completeCallData = await waitForCallCompletion(data.conversationId, contact.name);
            
            // Save complete call information to history
            await saveCallToHistory(completeCallData, contact, data.callHistoryId);
            
            // Update final status
            if (completeCallData) {
              const finalStatus = (completeCallData.state === 'ended' || 
                                 completeCallData.state === 'completed' || 
                                 completeCallData.state === 'done') && 
                                 !completeCallData.error ? 'completed' : 'failed';
              
              setCallStatuses(prev => prev.map(status => 
                status.contactId === contact.id 
                  ? { 
                      ...status, 
                      status: finalStatus, 
                      endTime: new Date(),
                      duration: completeCallData.duration_seconds || completeCallData.duration,
                      cost: completeCallData.cost_details?.total_cost || completeCallData.cost
                    }
                  : status
              ));
              
              toast({
                title: "Apel finalizat",
                description: `Apelul către ${contact.name} s-a finalizat și a fost salvat în istoric`,
              });
            } else {
              setCallStatuses(prev => prev.map(status => 
                status.contactId === contact.id 
                  ? { ...status, status: 'failed', endTime: new Date() }
                  : status
              ));
            }

          } else {
            console.error(`Failed to get conversation ID for ${contact.name}`);
            setCallStatuses(prev => prev.map(status => 
              status.contactId === contact.id 
                ? { ...status, status: 'failed', endTime: new Date() }
                : status
            ));
            
            toast({
              title: "Eroare",
              description: `Nu s-a putut obține ID-ul conversației pentru ${contact.name}`,
              variant: "destructive",
            });
          }

        } catch (contactError) {
          console.error(`Failed to call ${contact.name}:`, contactError);
          setCallStatuses(prev => prev.map(status => 
            status.contactId === contact.id 
              ? { ...status, status: 'failed', endTime: new Date() }
              : status
          ));
          
          toast({
            title: "Eroare contact",
            description: `Nu s-a putut procesa ${contact.name}`,
            variant: "destructive",
          });
        }
      }

      setCurrentCallStatus('Procesare batch completă');
      toast({
        title: "Procesare completă",
        description: `Toate cele ${contacts.length} contacte au fost procesate și salvate în istoric.`,
      });

    } catch (error) {
      console.error('Batch processing error:', error);
      toast({
        title: "Eroare procesare",
        description: "A apărut o eroare în timpul procesării batch",
        variant: "destructive",
      });
    } finally {
      setIsProcessingBatch(false);
      setCurrentProgress(0);
      setTotalCalls(0);
      setCurrentContact('');
      setCurrentCallStatus('');
    }
  }, [user?.id]);

  const handleInitiateCall = useCallback(async () => {
    if (phoneNumber && agentId) {
      const conversationId = await initiateCall(agentId, phoneNumber);
      
      if (conversationId) {
        toast({
          title: "Procesare",
          description: "Se monitorizează apelul și se recuperează informațiile complete...",
        });
        
        const contact = {
          id: 'single-call',
          name: phoneNumber,
          phone: phoneNumber,
          country: 'Unknown',
          location: 'Unknown'
        };
        
        // Wait for completion and save to history
        const completeCallData = await waitForCallCompletion(conversationId, phoneNumber);
        await saveCallToHistory(completeCallData, contact);
        
        toast({
          title: "Apel finalizat",
          description: "Apelul s-a finalizat și a fost salvat în istoric",
        });
      }
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
