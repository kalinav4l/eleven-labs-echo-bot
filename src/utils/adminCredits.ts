
import { supabase } from '@/integrations/supabase/client';

export const addAdminCredits = async () => {
  try {
    const { data, error } = await supabase.rpc('admin_add_credits', {
      p_user_email: 'mariusvilran103@gmail.com',
      p_amount: 1000000,
      p_description: 'Admin bonus - 1,000,000 credits added'
    });

    if (error) {
      console.error('Error adding admin credits:', error);
      return false;
    }

    console.log('Successfully added 1,000,000 credits to mariusvilran103@gmail.com');
    return true;
  } catch (error) {
    console.error('Failed to add admin credits:', error);
    return false;
  }
};

// Execute the credit addition
addAdminCredits();
