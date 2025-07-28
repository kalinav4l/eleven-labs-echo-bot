
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useCreditTracking = () => {
  const { user } = useAuth();

  const deductCredits = async (
    amount: number, 
    description: string, 
    conversationId?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount: amount,
        p_description: description,
        p_conversation_id: conversationId
      });

      if (error) throw error;

      if (!data) {
        toast({
          title: "Credite insuficiente",
          description: "Nu ai suficiente credite pentru această acțiune. Te rog să cumperi mai multe credite.",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deducting credits:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut deduce creditele. Încearcă din nou.",
        variant: "destructive",
      });
      return false;
    }
  };

  const trackConversation = async (
    agentId: string,
    agentName: string,
    durationMinutes: number = 0,
    messageCount: number = 1
  ) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user?.id,
          agent_id: agentId,
          agent_name: agentName,
          duration_minutes: durationMinutes,
          message_count: messageCount,
          credits_used: Math.ceil(durationMinutes * 10) // 10 credits per minute
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error tracking conversation:', error);
      return null;
    }
  };

  return {
    deductCredits,
    trackConversation
  };
};
