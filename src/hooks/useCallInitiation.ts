
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

  // Function to check call status with ElevenLabs API
  const checkCallStatus = async (conversationId: string): Promise<any> => {
    try {
      console.log(`Checking call status for conversation ${conversationId}`);
      
      const { data, error } = await supabase.functions.invoke('get-elevenlabs-conversation', {
        body: { conversationId }
      });

      if (error) {
        console.error('Error checking call status:', error);
        return null;
      }

      console.log('Call status response:', data);
      return data;
    } catch (error) {
      console.error('Error in checkCallStatus:', error);
      return null;
    }
  };

  // Function to wait for call completion with real-time status updates
  const waitForCallCompletion = async (conversationId: string, contactName: string): Promise<any> => {
    const maxAttempts = 120; // 10 minutes max wait (5 seconds * 120)
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`Checking call status for ${contactName}, attempt ${attempts + 1}`);
        setCurrentCallStatus(`Verifică statusul apelului către ${contactName}...`);
        
        const callData = await checkCallStatus(conversationId);
        
        if (callData) {
          const status = callData.state || callData.status;
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
              setCurrentCallStatus(`În conversație cu ${contactName}`);
              break;
            case 'ended':
            case 'completed':
            case 'finished':
              setCurrentCallStatus(`Apel finalizat cu ${contactName}`);
              console.log('Call completed, returning data:', callData);
              return callData;
            case 'failed':
            case 'no_answer':
            case 'busy':
              setCurrentCallStatus(`Apel eșuat către ${contactName}: ${status}`);
              console.log('Call failed, returning data:', callData);
              return callData;
            default:
              setCurrentCallStatus(`Status necunoscut pentru ${contactName}: ${status}`);
          }
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
    setCurrentCallStatus(`Timeout pentru apelul către ${contactName}`);
    return null;
  };

  // Function to save complete call information
  const saveCompleteCallInfo = async (conversationId: string, contactInfo: Contact, callHistoryId?: string) => {
    try {
      console.log('Saving complete call info for:', conversationId);
      
      const callData = await waitForCallCompletion(conversationId, contactInfo.name);
      
      if (callData && callHistoryId) {
        // Extract relevant information from ElevenLabs response
        const summary = callData.summary || `Apel finalizat către ${contactInfo.name}`;
        const cost = callData.cost_details?.total_cost || callData.cost || 0;
        const duration = callData.duration_seconds || 0;
        const finalStatus = callData.state === 'ended' || callData.state === 'completed' ? 'success' : 'failed';
        
        // Update the call history record with complete information
        const { error: updateError } = await supabase
          .from('call_history')
          .update({
            dialog_json: JSON.stringify(callData),
            summary: summary,
            cost_usd: cost,
            duration_seconds: duration,
            call_status: finalStatus,
            elevenlabs_history_id: callData.history_id || conversationId,
            updated_at: new Date().toISOString()
          })
          .eq('id', callHistoryId);

        if (updateError) {
          console.error('Error updating call history:', updateError);
        } else {
          console.log('Call history updated successfully with complete data');
        }
        
        return callData;
      }
    } catch (error) {
      console.error('Error saving complete call info:', error);
    }
    return null;
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
              description: `Apelul către ${contact.name} a fost inițiat. Se monitorizează statusul...`,
            });

            // Wait for call completion and save complete information
            setCurrentCallStatus(`Monitorizează apelul către ${contact.name}...`);
            const completeCallData = await saveCompleteCallInfo(data.conversationId, contact, data.callHistoryId);
            
            // Update final status
            if (completeCallData) {
              const finalStatus = completeCallData.state === 'ended' || completeCallData.state === 'completed' ? 'completed' : 'failed';
              setCallStatuses(prev => prev.map(status => 
                status.contactId === contact.id 
                  ? { 
                      ...status, 
                      status: finalStatus, 
                      endTime: new Date(),
                      duration: completeCallData.duration_seconds,
                      cost: completeCallData.cost_details?.total_cost || completeCallData.cost
                    }
                  : status
              ));
              
              toast({
                title: "Apel finalizat",
                description: `Apelul către ${contact.name} s-a finalizat cu succes`,
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
        description: `Toate cele ${contacts.length} contacte au fost procesate cu informații complete.`,
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
        
        await saveCompleteCallInfo(conversationId, contact);
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
