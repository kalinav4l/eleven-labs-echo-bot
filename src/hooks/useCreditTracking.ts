
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useLLMUsageCalculation } from './useLLMUsageCalculation';

export const useCreditTracking = () => {
  const { user } = useAuth();
  const { calculateUsage } = useLLMUsageCalculation();

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
    messageCount: number = 1,
    promptLength?: number
  ) => {
    try {
      let actualCostUSD = durationMinutes * 0.0015; // fallback: 1 minute = $0.0015
      
      // Calculate exact LLM usage cost if prompt length is provided
      if (promptLength) {
        try {
          const usageResult = await calculateUsage.mutateAsync({
            prompt_length: promptLength,
            number_of_pages: Math.ceil(promptLength / 100), // estimate pages
            rag_enabled: true
          });
          
          if (usageResult?.estimated_cost_usd) {
            actualCostUSD = usageResult.estimated_cost_usd;
            console.log(`Calculated exact cost: $${actualCostUSD} for prompt length: ${promptLength}`);
          }
        } catch (error) {
          console.error('Failed to calculate exact LLM usage, using fallback cost:', error);
        }
      }

      const creditsUsed = Math.ceil(actualCostUSD / 0.0000017045); // Convert USD to credits

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user?.id,
          agent_id: agentId,
          agent_name: agentName,
          duration_minutes: durationMinutes,
          message_count: messageCount,
          credits_used: creditsUsed,
          cost_usd: actualCostUSD
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
