
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import VoiceDashboard from '@/components/voice/VoiceDashboard';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Voice = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user statistics
      const { data: stats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      // Fetch recent call history
      const { data: calls } = await supabase
        .from('call_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('call_date', { ascending: false })
        .limit(10);

      // Fetch active agents
      const { data: agents } = await supabase
        .from('kalina_agents')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      // Fetch recent conversations
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setDashboardData({
        statistics: stats,
        recentCalls: calls || [],
        activeAgents: agents || [],
        conversations: conversations || []
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut încărca datele dashboard-ului",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        <VoiceDashboard data={dashboardData} onRefresh={fetchDashboardData} />
      </div>
    </DashboardLayout>
  );
};

export default Voice;
