
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

  // Funcție pentru a aștepta finalizarea apelului
  const waitForCallCompletion = async (conversationId: string): Promise<any> => {
    const maxAttempts = 60; // 5 minute max wait
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`Checking call status for conversation ${conversationId}, attempt ${attempts + 1}`);
        
        const { data, error } = await supabase.functions.invoke('get-elevenlabs-conversation', {
          body: { conversationId }
        });

        if (error) {
          console.error('Error checking call status:', error);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
          attempts++;
          continue;
        }

        console.log('Call status response:', data);

        // Verifică dacă apelul s-a terminat
        if (data && (data.state === 'ended' || data.state === 'completed' || data.state === 'finished')) {
          console.log('Call completed, returning data:', data);
          return data;
        }

        // Așteaptă 5 secunde înainte de următoarea verificare
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        console.error('Error in waitForCallCompletion:', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log('Call completion timeout reached');
    return null;
  };

  // Funcție pentru a salva informațiile complete ale apelului
  const saveCompleteCallInfo = async (conversationId: string, contactInfo: Contact, callHistoryId?: string) => {
    try {
      console.log('Saving complete call info for:', conversationId);
      
      const callData = await waitForCallCompletion(conversationId);
      
      if (callData && callHistoryId) {
        // Actualizează recordul existent cu informațiile complete
        const { error: updateError } = await supabase
          .from('call_history')
          .update({
            dialog_json: JSON.stringify(callData),
            summary: callData.summary || `Apel finalizat către ${contactInfo.name}`,
            cost_usd: callData.cost || 0,
            duration_seconds: callData.duration_seconds || 0,
            call_status: callData.state === 'ended' || callData.state === 'completed' ? 'success' : 'failed',
            elevenlabs_history_id: callData.history_id || conversationId,
            updated_at: new Date().toISOString()
          })
          .eq('id', callHistoryId);

        if (updateError) {
          console.error('Error updating call history:', updateError);
        } else {
          console.log('Call history updated successfully');
        }
      }
    } catch (error) {
      console.error('Error saving complete call info:', error);
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

    try {
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        setCurrentProgress(i + 1);
        setCurrentContact(contact.name);

        toast({
          title: "Procesez apel",
          description: `Apelând ${contact.name} (${i + 1}/${contacts.length})`,
        });

        try {
          // Inițiază apelul
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
            toast({
              title: "Eroare parțială",
              description: `Nu s-a putut apela ${contact.name}`,
              variant: "destructive",
            });
            continue;
          }

          if (data?.success && data?.conversationId) {
            console.log(`Successfully initiated call to ${contact.name}:`, data);
            
            toast({
              title: "Apel inițiat",
              description: `Se procesează apelul către ${contact.name}...`,
            });

            // Așteaptă finalizarea apelului și salvează informațiile complete
            // Rulează în background pentru a nu bloca următoarele apeluri
            if (data.callHistoryId) {
              // Pornește procesul de așteptare în background
              saveCompleteCallInfo(data.conversationId, contact, data.callHistoryId);
            }

          } else {
            console.error(`Failed to get conversation ID for ${contact.name}`);
            toast({
              title: "Eroare",
              description: `Nu s-a putut obține ID-ul conversației pentru ${contact.name}`,
              variant: "destructive",
            });
          }

          // Așteaptă 10 secunde între apeluri pentru a nu supraîncărca API-ul
          if (i < contacts.length - 1) {
            toast({
              title: "Așteptare",
              description: `Aștept 10 secunde înainte de următorul apel...`,
            });
            await new Promise(resolve => setTimeout(resolve, 10000));
          }

        } catch (contactError) {
          console.error(`Failed to call ${contact.name}:`, contactError);
          toast({
            title: "Eroare contact",
            description: `Nu s-a putut procesa ${contact.name}`,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Procesare completă",
        description: `Toate cele ${contacts.length} contacte au fost procesate. Informațiile se actualizează în background.`,
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
    }
  }, [user?.id]);

  const handleInitiateCall = useCallback(async () => {
    if (phoneNumber && agentId) {
      const conversationId = await initiateCall(agentId, phoneNumber);
      
      // Dacă e apel individual, așteaptă și informațiile complete
      if (conversationId) {
        toast({
          title: "Procesare",
          description: "Se recuperează informațiile complete ale apelului...",
        });
        
        // Salvează informațiile complete în background
        const contact = {
          id: 'single-call',
          name: phoneNumber,
          phone: phoneNumber,
          country: 'Unknown',
          location: 'Unknown'
        };
        
        saveCompleteCallInfo(conversationId, contact);
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
    handleInitiateCall,
  };
};
