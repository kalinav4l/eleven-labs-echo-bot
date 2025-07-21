import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { format, subDays, startOfDay } from 'date-fns';

interface DailyStats {
  date: string;
  calls: number;
  credits: number;
  duration: number;
}

export const useElevenLabsStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['elevenlabs-stats', user?.id],
    queryFn: async (): Promise<DailyStats[]> => {
      if (!user) return [];
      
      // Obținem datele pentru ultimele 30 de zile
      const endDate = new Date();
      const startDate = subDays(endDate, 29);

      // Obținem apelurile din call_history
      const { data: callHistory, error: callError } = await supabase
        .from('call_history')
        .select('call_date, cost_usd, duration_seconds')
        .eq('user_id', user.id)
        .gte('call_date', startDate.toISOString())
        .lte('call_date', endDate.toISOString());

      if (callError) {
        console.error('Error fetching call history:', callError);
      }

      // Obținem tranzacțiile de credite (doar cele de utilizare)
      const { data: creditTransactions, error: creditError } = await supabase
        .from('credit_transactions')
        .select('created_at, amount')
        .eq('user_id', user.id)
        .eq('transaction_type', 'usage')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (creditError) {
        console.error('Error fetching credit transactions:', creditError);
      }

      // Creăm un map pentru statistici zilnice
      const dailyStatsMap = new Map<string, DailyStats>();

      // Inițializăm toate zilele cu 0
      for (let i = 0; i < 30; i++) {
        const date = subDays(endDate, 29 - i);
        const dateKey = format(date, 'MMM dd');
        dailyStatsMap.set(dateKey, {
          date: dateKey,
          calls: 0,
          credits: 0,
          duration: 0
        });
      }

      // Procesăm apelurile
      if (callHistory) {
        callHistory.forEach(call => {
          const callDate = new Date(call.call_date);
          const dateKey = format(callDate, 'MMM dd');
          
          if (dailyStatsMap.has(dateKey)) {
            const stats = dailyStatsMap.get(dateKey)!;
            stats.calls += 1;
            stats.duration += call.duration_seconds || 0;
          }
        });
      }

      // Procesăm creditele cheltuite
      if (creditTransactions) {
        creditTransactions.forEach(transaction => {
          const transactionDate = new Date(transaction.created_at);
          const dateKey = format(transactionDate, 'MMM dd');
          
          if (dailyStatsMap.has(dateKey)) {
            const stats = dailyStatsMap.get(dateKey)!;
            // Creditele de utilizare sunt negative, le facem pozitive pentru afișare
            stats.credits += Math.abs(transaction.amount);
          }
        });
      }

      // Convertim map-ul în array
      return Array.from(dailyStatsMap.values());
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // Reîmprospătare la fiecare minut
  });
};