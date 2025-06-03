
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGuestRateLimit = () => {
  const [guestUsage, setGuestUsage] = useState<number>(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const GUEST_LIMIT = 10;

  useEffect(() => {
    checkGuestUsage();
  }, []);

  const checkGuestUsage = async () => {
    try {
      // Get user's IP address (in production, you'd get this from the server)
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();

      const { data, error } = await supabase
        .from('guest_usage')
        .select('usage_count')
        .eq('ip_address', ip)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking guest usage:', error);
        return;
      }

      const currentUsage = data?.usage_count || 0;
      setGuestUsage(currentUsage);
      setIsLimitReached(currentUsage >= GUEST_LIMIT);
    } catch (error) {
      console.error('Error getting IP:', error);
    }
  };

  const incrementGuestUsage = async (): Promise<boolean> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();

      // Check current usage
      const { data: existingData } = await supabase
        .from('guest_usage')
        .select('usage_count')
        .eq('ip_address', ip)
        .single();

      const currentUsage = existingData?.usage_count || 0;
      
      if (currentUsage >= GUEST_LIMIT) {
        setIsLimitReached(true);
        return false;
      }

      // Increment usage
      const { error } = await supabase
        .from('guest_usage')
        .upsert({
          ip_address: ip,
          usage_count: currentUsage + 1,
          last_usage: new Date().toISOString()
        }, {
          onConflict: 'ip_address'
        });

      if (error) {
        console.error('Error updating guest usage:', error);
        return false;
      }

      const newUsage = currentUsage + 1;
      setGuestUsage(newUsage);
      setIsLimitReached(newUsage >= GUEST_LIMIT);
      return true;
    } catch (error) {
      console.error('Error incrementing guest usage:', error);
      return false;
    }
  };

  return {
    guestUsage,
    isLimitReached,
    remainingUses: Math.max(0, GUEST_LIMIT - guestUsage),
    incrementGuestUsage,
    checkGuestUsage
  };
};
