
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

  const initiateCall = useCallback(async (targetAgentId: string, targetPhone: string): Promise<void> => {
    if (!targetAgentId || !targetPhone.trim()) {
      toast({
        title: "Eroare",
        description: "Agent ID și numărul de telefon sunt obligatorii",
        variant: "destructive",
      });
      return;
    }

    setIsInitiating(true);

    try {
      const { data, error } = await supabase.functions.invoke('initiate-scheduled-call', {
        body: {
          agent_id: targetAgentId,
          phone_number: targetPhone,
          user_id: user?.id
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Succes!",
        description: "Apelul a fost inițiat cu succes",
      });

      console.log('Call initiated:', data);
    } catch (error) {
      console.error('Error initiating call:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut iniția apelul",
        variant: "destructive",
      });
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

        toast({
          title: "Procesez apel",
          description: `Apelând ${contact.name} (${i + 1}/${contacts.length})`,
        });

        try {
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
          } else {
            console.log(`Successfully initiated call to ${contact.name}:`, data);
          }

          // Așteaptă 2 secunde între apeluri pentru a nu supraîncărca API-ul
          if (i < contacts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
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
        description: `Toate cele ${contacts.length} contacte au fost procesate`,
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
    }
  }, [user?.id]);

  const handleInitiateCall = useCallback(async () => {
    if (phoneNumber) {
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
    handleInitiateCall,
  };
};
