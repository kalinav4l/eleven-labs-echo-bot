import { useCallback } from 'react';
import { useAutoRedial } from './useAutoRedial';
import { useAuth } from '@/components/AuthContext';

interface FailedCall {
  contactId: string;
  contactName: string;
  phoneNumber: string;
  agentId: string;
  reason: string;
  timestamp: Date;
}

export const useFailedCallTracker = () => {
  const { addToRedialQueue } = useAutoRedial();
  const { user } = useAuth();

  const trackFailedCall = useCallback((failedCall: FailedCall) => {
    console.log('🚨 Tracking failed call:', failedCall);

    // Add to auto-redial queue
    addToRedialQueue({
      id: `redial-${failedCall.contactId}-${Date.now()}`,
      name: failedCall.contactName,
      phone: failedCall.phoneNumber,
      agentId: failedCall.agentId,
      attempts: 0,
      status: 'pending',
      originalCallId: failedCall.contactId
    });

    // Log to analytics if needed
    console.log(`Added ${failedCall.contactName} to redial queue due to: ${failedCall.reason}`);
  }, [addToRedialQueue]);

  const shouldRetryCall = useCallback((reason: string): boolean => {
    const retryableReasons = [
      'no answer',
      'busy',
      'temporarily unavailable',
      'network error',
      'timeout',
      'call failed'
    ];
    
    return retryableReasons.some(retryable => 
      reason.toLowerCase().includes(retryable)
    );
  }, []);

  return {
    trackFailedCall,
    shouldRetryCall
  };
};