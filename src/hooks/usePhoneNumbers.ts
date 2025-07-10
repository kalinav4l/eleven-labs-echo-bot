import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

interface PhoneNumber {
  id: string;
  phone_number: string;
  label: string;
  elevenlabs_phone_id: string | null;
}

export const usePhoneNumbers = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('phone_numbers')
          .select('id, phone_number, label, elevenlabs_phone_id')
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (error) throw error;
        setPhoneNumbers(data || []);
      } catch (error) {
        console.error('Error fetching phone numbers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhoneNumbers();
  }, [user]);

  return { phoneNumbers, isLoading };
};