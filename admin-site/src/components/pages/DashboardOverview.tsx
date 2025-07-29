import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AdminStats } from '@/types/admin';
import { Users, Phone, DollarSign, UserCheck, UserX } from 'lucide-react';

export function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Get total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get total calls
        const { count: totalCalls } = await supabase
          .from('call_history')
          .select('*', { count: 'exact', head: true });

        // Get banned users
        const { count: bannedUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('account_type', 'banned');

        // Get active users today (last sign in within 24h)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const { count: activeUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', yesterday.toISOString());

        // Calculate total revenue (simplified - using total spent from user statistics)
        const { data: revenueData } = await supabase
          .from('user_statistics')
          .select('total_spent_usd');
        
        const totalRevenue = revenueData?.reduce((sum, stat) => sum + (stat.total_spent_usd || 0), 0) || 0;

        setStats({
          total_users: totalUsers || 0,
          total_calls: totalCalls || 0,
          total_revenue: totalRevenue,
          active_users_today: activeUsers || 0,
          banned_users: bannedUsers || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return <div>Se încarcă statisticile...</div>;
  }

  const statCards = [
    {
      title: 'Utilizatori Totali',
      value: stats?.total_users || 0,
      icon: Users,
      description: 'Numărul total de utilizatori înregistrați',
    },
    {
      title: 'Apeluri Totale',
      value: stats?.total_calls || 0,
      icon: Phone,
      description: 'Numărul total de apeluri efectuate',
    },
    {
      title: 'Venituri Totale',
      value: `$${(stats?.total_revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      description: 'Venitul total generat',
    },
    {
      title: 'Utilizatori Activi Azi',
      value: stats?.active_users_today || 0,
      icon: UserCheck,
      description: 'Utilizatori activi în ultimele 24h',
    },
    {
      title: 'Utilizatori Blocați',
      value: stats?.banned_users || 0,
      icon: UserX,
      description: 'Numărul de utilizatori blocați',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Privire de ansamblu asupra statisticilor sistemului
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}