
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { elevenLabsApi, InitiateCallRequest } from '../utils/apiService';
import { API_CONFIG, MESSAGES } from '../constants/constants';

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
      // Note: In production, this should use Supabase Edge Functions for security
      const request: InitiateCallRequest = {
        agent_id: agentId,
        agent_phone_number_id: API_CONFIG.AGENT_PHONE_NUMBER_ID,
        to_number: phoneNumber,
      };

      console.warn('Direct API calls should be avoided - consider using Supabase Edge Functions for security');
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
