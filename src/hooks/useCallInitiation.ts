
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { elevenLabsApi, InitiateCallRequest } from '../utils/apiService';
import { MESSAGES } from '../constants/constants';

interface UseCallInitiationProps {
  customAgentId: string;
  createdAgentId: string;
  phoneNumber: string;
}

export const useCallInitiation = ({
  customAgentId,
  createdAgentId,
  phoneNumber,
}: UseCallInitiationProps) => {
  const [isInitiating, setIsInitiating] = useState(false);

  const initiateCall = useCallback(async (agentId: string, phoneNumber: string): Promise<void> => {
    if (!agentId || !phoneNumber.trim()) {
      toast({
        title: "Eroare",
        description: MESSAGES.ERRORS.MISSING_AGENT_ID_OR_PHONE,
        variant: "destructive",
      });
      return;
    }

    setIsInitiating(true);

    try {
      // Using Supabase Edge Functions for security - agent phone number ID is managed through Supabase Secrets
      const request: InitiateCallRequest = {
        agent_id: agentId,
        phone_number: phoneNumber,
      };

      await elevenLabsApi.initiateCall(request);

      toast({
        title: "Succes!",
        description: MESSAGES.SUCCESS.CALL_INITIATED,
      });
    } catch (error) {
      console.error('Error initiating call:', error);
      toast({
        title: "Eroare",
        description: MESSAGES.ERRORS.CALL_INITIATION_FAILED,
        variant: "destructive",
      });
    } finally {
      setIsInitiating(false);
    }
  }, []);

  // Handler for initiating call - moved into the hook
  const handleInitiateCall = useCallback(async () => {
    const agentIdToUse = customAgentId.trim() || createdAgentId;
    await initiateCall(agentIdToUse, phoneNumber);
  }, [initiateCall, customAgentId, createdAgentId, phoneNumber]);

  return {
    initiateCall,
    isInitiating,
    handleInitiateCall,
  };
};
