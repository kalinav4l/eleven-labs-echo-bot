import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

export interface AgentStats {
  agentId: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalDuration: number; // in seconds
  totalCost: number; // in credits
  averageDuration: number; // in seconds
  successRate: number; // percentage
  lastCallDate?: string;
  busyCalls: number;
  ongoingCalls: number;
}

export const useAgentStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['agent-stats', user?.id],
    queryFn: async (): Promise<Record<string, AgentStats>> => {
      if (!user) return {};

      // Get all call history for the user
      const { data: callHistory, error } = await supabase
        .from('call_history')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching call history for stats:', error);
        return {};
      }

      // Group calls by agent_id and calculate stats
      const statsMap: Record<string, AgentStats> = {};

      callHistory?.forEach((call) => {
        const agentId = call.agent_id;
        if (!agentId) return;

        if (!statsMap[agentId]) {
          statsMap[agentId] = {
            agentId,
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            totalDuration: 0,
            totalCost: 0,
            averageDuration: 0,
            successRate: 0,
            busyCalls: 0,
            ongoingCalls: 0,
          };
        }

        const stats = statsMap[agentId];
        stats.totalCalls++;

        // Count by status
        switch (call.call_status) {
          case 'success':
          case 'done':
          case 'completed':
            stats.successfulCalls++;
            break;
          case 'failed':
          case 'error':
            stats.failedCalls++;
            break;
          case 'busy':
            stats.busyCalls++;
            break;
          case 'initiated':
          case 'in_progress':
            stats.ongoingCalls++;
            break;
        }

        // Add duration and cost
        if (call.duration_seconds) {
          stats.totalDuration += call.duration_seconds;
        }
        if (call.cost_usd) {
          stats.totalCost += Number(call.cost_usd);
        }

        // Track last call date
        if (!stats.lastCallDate || new Date(call.call_date) > new Date(stats.lastCallDate)) {
          stats.lastCallDate = call.call_date;
        }
      });

      // Calculate derived stats
      Object.values(statsMap).forEach((stats) => {
        stats.averageDuration = stats.totalCalls > 0 ? Math.round(stats.totalDuration / stats.totalCalls) : 0;
        stats.successRate = stats.totalCalls > 0 ? Math.round((stats.successfulCalls / stats.totalCalls) * 100) : 0;
      });

      return statsMap;
    },
    enabled: !!user,
    refetchInterval: 300000, // Refresh every 5 minutes
  });
};