
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useDollarTracking = () => {
  const { user } = useAuth();

  const deductCost = async (
    amount: number, 
    description: string, 
    conversationId?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('deduct_balance', {
        p_user_id: user.id,
        p_amount: amount,
        p_description: description,
        p_conversation_id: conversationId
      });

      if (error) throw error;

      if (!data) {
        toast({
          title: "Fonduri insuficiente",
          description: "Nu ai suficiente fonduri pentru această acțiune. Te rog să adaugi fonduri.",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deducting cost:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut deduce costul. Încearcă din nou.",
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
      // Calculate cost: $0.0024 per minute for voice calls, $0.001 per message for text
      const costUsd = durationMinutes > 0 
        ? durationMinutes * 0.0024 
        : messageCount * 0.001;

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user?.id,
          agent_id: agentId,
          agent_name: agentName,
          duration_minutes: durationMinutes,
          message_count: messageCount,
          cost_usd: costUsd
        })
        .select()
        .single();

      if (error) throw error;

      // Deduct cost from user balance
      await deductCost(costUsd, `Conversație cu ${agentName}`, data.id);

      return data;
    } catch (error) {
      console.error('Error tracking conversation:', error);
      return null;
    }
  };

  return {
    deductCost,
    trackConversation
  };
};
