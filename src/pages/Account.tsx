import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserAgents } from '@/hooks/useUserAgents';
import { useUserStats } from '@/hooks/useUserStats';
import { useUserConversations } from '@/hooks/useUserConversations';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useUserBalance } from '@/hooks/useUserBalance';
import { supabase } from '@/integrations/supabase/client';

// New dashboard components
import StatsCards from '@/components/dashboard/StatsCards';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import SatisfactionChart from '@/components/dashboard/SatisfactionChart';
import ReferralChart from '@/components/dashboard/ReferralChart';
import SalesChart from '@/components/dashboard/SalesChart';
import ActiveUsersChart from '@/components/dashboard/ActiveUsersChart';
import ProjectsList from '@/components/dashboard/ProjectsList';
import OrdersList from '@/components/dashboard/OrdersList';

const Account = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { data: agents, isLoading: agentsLoading } = useUserAgents();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: conversations } = useUserConversations();
  const { callHistory } = useCallHistory();
  const { data: balance } = useUserBalance();

  const [conversationDurations, setConversationDurations] = useState<Record<string, number>>({});
  const [conversationCosts, setConversationCosts] = useState<Record<string, number>>({});

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profileLoading || agentsLoading || statsLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen">
          <div className="px-6 py-6">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate dashboard data
  const userName = profile?.first_name || user.email?.split('@')[0] || 'User';
  const totalAgents = agents?.length || 0;
  const totalCalls = callHistory?.length || 0;
  const totalConversations = conversations?.length || 0;
  const totalCost = balance?.balance_usd ? Math.max(0, 100 - balance.balance_usd) : 0;
  const todaysCalls = callHistory?.filter(call => {
    const callDate = new Date(call.call_date);
    const today = new Date();
    return callDate.toDateString() === today.toDateString();
  }).length || 0;

  // Mock data for charts (you can replace with real data)
  const monthlyData = [
    { month: 'Jan', amount: 10 },
    { month: 'Feb', amount: 25 },
    { month: 'Mar', amount: 40 },
    { month: 'Apr', amount: 30 },
    { month: 'May', amount: 55 },
    { month: 'Jun', amount: 45 },
    { month: 'Jul', amount: 60 },
    { month: 'Aug', amount: 70 },
    { month: 'Sep', amount: 65 },
    { month: 'Oct', amount: 80 },
    { month: 'Nov', amount: 85 },
    { month: 'Dec', amount: 90 }
  ];

  const dailyData = [
    { day: 'Mon', calls: 120, conversations: 450, agents: 12, cost: 25 },
    { day: 'Tue', calls: 180, conversations: 380, agents: 15, cost: 35 },
    { day: 'Wed', calls: 90, conversations: 280, agents: 8, cost: 18 },
    { day: 'Thu', calls: 250, conversations: 520, agents: 20, cost: 45 },
    { day: 'Fri', calls: 200, conversations: 480, agents: 18, cost: 38 },
    { day: 'Sat', calls: 150, conversations: 350, agents: 10, cost: 28 },
    { day: 'Sun', calls: 80, conversations: 200, agents: 6, cost: 15 }
  ];

  const projects = [
    { id: '1', name: 'Customer Support Agent', members: 3, budget: '$14,000', completion: 60, type: 'agent' as const },
    { id: '2', name: 'Sales Outreach Campaign', members: 2, budget: '$3,000', completion: 10, type: 'call' as const },
    { id: '3', name: 'Lead Generation Bot', members: 4, budget: 'Not set', completion: 100, type: 'agent' as const },
    { id: '4', name: 'Voice Assistant Training', members: 5, budget: '$32,000', completion: 100, type: 'conversation' as const },
    { id: '5', name: 'Multi-language Support', members: 3, budget: '$400', completion: 25, type: 'agent' as const },
    { id: '6', name: 'Analytics Dashboard', members: 2, budget: '$7,600', completion: 40, type: 'conversation' as const }
  ];

  const recentOrders = [
    { id: '1', title: 'Created agent "Customer Support"', time: new Date(Date.now() - 1000 * 60 * 30), amount: 1, type: 'agent' as const },
    { id: '2', title: 'Incoming call completed', time: new Date(Date.now() - 1000 * 60 * 45), amount: 1, type: 'call' as const },
    { id: '3', title: 'New conversation started', time: new Date(Date.now() - 1000 * 60 * 60), amount: 1, type: 'conversation' as const },
    { id: '4', title: 'Agent usage cost', time: new Date(Date.now() - 1000 * 60 * 90), amount: 2.40, type: 'cost' as const },
    { id: '5', title: 'Voice call processed', time: new Date(Date.now() - 1000 * 60 * 120), amount: 1, type: 'call' as const },
    { id: '6', title: 'Created agent "Sales Bot"', time: new Date(Date.now() - 1000 * 60 * 180), amount: 1, type: 'agent' as const }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Cards */}
          <StatsCards
            todaysCalls={todaysCalls}
            totalAgents={totalAgents}
            newConversations={totalConversations}
            totalCost={totalCost}
          />

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome Section - Full Width */}
            <div className="lg:col-span-3">
              <WelcomeSection userName={userName} />
            </div>

            {/* First Row */}
            <div className="lg:col-span-1">
              <SatisfactionChart satisfaction={95} />
            </div>
            <div className="lg:col-span-1">
              <ReferralChart 
                invitedCount={totalAgents}
                bonusAmount={totalCost}
                score={9.3}
              />
            </div>
            <div className="lg:col-span-1">
              <ActiveUsersChart dailyData={dailyData} />
            </div>

            {/* Second Row */}
            <div className="lg:col-span-2">
              <SalesChart monthlyData={monthlyData} />
            </div>
            <div className="lg:col-span-1">
              <OrdersList orders={recentOrders} />
            </div>

            {/* Third Row */}
            <div className="lg:col-span-3">
              <ProjectsList projects={projects} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Account;