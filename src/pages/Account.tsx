import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserAgents } from '@/hooks/useUserAgents';
import { useUserStats } from '@/hooks/useUserStats';
import { useUserConversations } from '@/hooks/useUserConversations';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useTranscripts } from '@/hooks/useTranscripts';
import { supabase } from '@/integrations/supabase/client';
import { calculateCostFromSeconds } from '@/utils/costCalculations';
import GlassWelcomeCard from '@/components/dashboard/GlassWelcomeCard';
import ModernGlassStatsGrid from '@/components/dashboard/ModernGlassStatsGrid';
import SuccessRateChart from '@/components/dashboard/SuccessRateChart';
import GlassActivityCard from '@/components/dashboard/GlassActivityCard';
import GlassQuickActions from '@/components/dashboard/GlassQuickActions';
import ExpenseStatsChart from '@/components/dashboard/ExpenseStatsChart';
import TopAgentsCard from '@/components/dashboard/TopAgentsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnimatedCounter from '@/components/AnimatedCounter';
import SkeletonCard from '@/components/SkeletonCard';
import { 
  Bot, Phone, DollarSign, Clock, TrendingUp, BarChart3, Users, 
  Calendar, Star, Activity, FileText, MessageSquare, Zap, 
  Target, CreditCard 
} from 'lucide-react';

const Account = () => {
  const navigate = useNavigate();
  const {
    user,
    signOut,
    loading: authLoading
  } = useAuth();
  const {
    displayName,
    loading: profileLoading
  } = useUserProfile();
  const {
    data: userAgents,
    isLoading: agentsLoading
  } = useUserAgents();
  const {
    data: userStats,
    isLoading: statsLoading
  } = useUserStats();
  const {
    data: recentConversations,
    isLoading: conversationsLoading
  } = useUserConversations();
  const {
    callHistory,
    isLoading: callHistoryLoading
  } = useCallHistory();
  const {
    savedTranscripts
  } = useTranscripts();

  // Fetch user balance data
  const {
    data: userBalance
  } = useQuery({
    queryKey: ['user-balance', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const {
        data,
        error
      } = await supabase.from('user_balance').select('balance_usd').eq('user_id', user.id).single();
      if (error) {
        console.error('Error fetching balance:', error);
        return null;
      }
      return data;
    },
    enabled: !!user
  });

  // State for enhanced analytics data
  const [conversationDurations, setConversationDurations] = useState<Record<string, number>>({});
  const [conversationCosts, setConversationCosts] = useState<Record<string, number>>({});

  // Function to get conversation data from ElevenLabs and deduct costs
  const getConversationData = async (conversationId: string) => {
    if (!conversationId || conversationDurations[conversationId] !== undefined) {
      return conversationDurations[conversationId] || 0;
    }
    console.log(`Processing conversation: ${conversationId}`);
    try {
      const {
        data
      } = await supabase.functions.invoke('get-elevenlabs-conversation', {
        body: {
          conversationId
        }
      });
      console.log(`Conversation data received:`, data?.metadata);
      if (data?.metadata) {
        const duration = Math.round(data.metadata.call_duration_secs || 0);
        // Calculate cost based on call duration, not ElevenLabs cost
        const costUsd = calculateCostFromSeconds(duration);
        console.log(`Calculated cost: $${costUsd} for ${duration} seconds`);

        // Note: Cost deduction is handled by the ElevenLabs webhook (atomic transaction)
        // We only compute and display estimated costs here.

        setConversationDurations(prev => ({
          ...prev,
          [conversationId]: duration
        }));
        setConversationCosts(prev => ({
          ...prev,
          [conversationId]: costUsd
        }));
        return duration;
      }
    } catch (error) {
      console.error('Error fetching conversation data:', error);
    }
    return 0;
  };

  // Load detailed conversation data automatically for all conversations
  useEffect(() => {
    const loadDetailedAnalytics = async () => {
      const conversationsToLoad = callHistory?.filter(call => call.conversation_id) || [];
      if (conversationsToLoad.length > 0) {
        // Process all conversations in parallel for faster loading
        const promises = conversationsToLoad.map(call => call.conversation_id ? getConversationData(call.conversation_id) : Promise.resolve(0));
        await Promise.all(promises);
      }
    };
    if (callHistory && callHistory.length > 0) {
      loadDetailedAnalytics();
    }
  }, [callHistory?.length]);

  // Redirect to landing if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while checking auth
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>;
  }
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      navigate('/auth');
    }
  };

  // Calculate real stats from user data
  const totalAgents = userAgents?.length || 0;
  const activeAgentsCount = (userAgents || []).filter((a: any) => a.is_active).length;
  const activeAgentsPercentage = totalAgents > 0 ? Math.round(activeAgentsCount / totalAgents * 100) : 0;
  const totalCalls = callHistory?.length || 0;
  const successfulCalls = (callHistory || []).filter((c: any) => c.call_status === 'success' || c.call_status === 'done').length;

  // Calculate total cost from conversation data (in USD)
  const totalCost = Object.values(conversationCosts).reduce((total, cost) => total + cost, 0);
  const totalConversations = userStats?.total_conversations || 0;
  const totalTranscripts = savedTranscripts?.length || 0;
  const currentBalance = userBalance?.balance_usd || 0;

  // Calculate total seconds from both sources - prioritize ElevenLabs data when available
  const totalSecondsFromCalls = callHistory?.reduce((total, call) => {
    // Use ElevenLabs conversation duration if available, otherwise fallback to duration_seconds
    const duration = call.conversation_id && conversationDurations[call.conversation_id] !== undefined ? conversationDurations[call.conversation_id] : call.duration_seconds || 0;
    return total + duration;
  }, 0) || 0;

  // Format total time as minutes:seconds
  const formatTotalTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const totalTimeFormatted = formatTotalTime(totalSecondsFromCalls);
  const averageCallDurationSecs = totalCalls > 0 ? Math.round(totalSecondsFromCalls / totalCalls) : 0;
  const averageCallDurationFormatted = formatTotalTime(averageCallDurationSecs);

  // Recent activity from actual user data
  const recentActivity = [...(userAgents?.slice(0, 2).map(agent => ({
    action: `Creat agentul "${agent.name}"`,
    time: new Date(agent.created_at).toLocaleDateString('ro-RO'),
    icon: Bot
  })) || []), ...(callHistory?.slice(0, 2).map(call => ({
    action: `Apel către ${call.contact_name} - ${call.call_status}`,
    time: call.call_date,
    icon: Phone
  })) || []), ...(recentConversations?.slice(0, 2).map(conv => ({
    action: `Conversație cu ${conv.agent_name}`,
    time: new Date(conv.created_at).toLocaleDateString('ro-RO'),
    icon: Activity
  })) || [])].slice(0, 4);
  
  if (profileLoading || agentsLoading || statsLoading) {
    return (
      <div className="min-h-screen">
          {/* Header with loading animation */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
                </div>
                <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          <div className="px-6 py-8">
            {/* Loading animation with elegant spinner */}
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner size="lg" className="mb-6" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 animate-pulse">
                  Se încarcă datele...
                </h3>
                <p className="text-gray-600 animate-pulse">
                  Calculăm statisticile tale
                </p>
              </div>
              
              {/* Animated dots */}
              <div className="flex space-x-1 mt-4">
                {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                animationDelay: `${i * 0.2}s`
              }} />)}
              </div>
            </div>

            {/* Skeleton cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({
              length: 6
            }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        </div>
      );
  }
  
  return (
    <div className="min-h-screen bg-white relative">
        <div className="relative px-6 py-8 space-y-8">
          {/* Glass Welcome Section */}
          <GlassWelcomeCard displayName={displayName} totalCalls={totalCalls} totalCost={totalCost} />
          
          {/* Modern Glass Stats Grid */}
          <ModernGlassStatsGrid totalAgents={totalAgents} totalCalls={totalCalls} currentBalance={currentBalance} totalConversations={totalConversations} totalCost={totalCost} totalTimeFormatted={totalTimeFormatted} />
          
          {/* Metrics and Actions Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Agents */}
            <TopAgentsCard callHistory={callHistory} />
            
            {/* Success Rate Chart */}
            <SuccessRateChart successfulCalls={successfulCalls} totalCalls={totalCalls} />
            
            {/* Quick Actions */}
            <GlassQuickActions />
          </div>
          
          {/* Activity and Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Activity Timeline */}
            <GlassActivityCard activities={recentActivity} />
            
            {/* Expense Statistics */}
            <ExpenseStatsChart callHistory={callHistory} totalCost={totalCost} />
          </div>

          {/* Agent Overview */}
          <div className="border border-gray-200/50 rounded-lg bg-white/30 backdrop-blur-sm mt-8">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium text-gray-900">Agenții Tăi</h2>
            </div>
            <div className="p-4">
              {userAgents && userAgents.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userAgents.slice(0, 6).map((agent, index) => <div key={index} className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-sm">{agent.name}</h3>
                        <Badge variant={agent.is_active ? 'default' : 'secondary'} className="text-xs">
                          {agent.is_active ? 'activ' : 'paused'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{agent.description || 'Agent AI'}</p>
                      <p className="text-xs text-gray-500">Creat: {new Date(agent.created_at).toLocaleDateString('ro-RO')}</p>
                    </div>)}
                </div> : <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nu ai încă agenți creați</p>
                  <Link to="/account/kalina-agents">
                    <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                      <Bot className="w-4 h-4 mr-2" />
                      Creează primul tău agent
                    </Button>
                  </Link>
                </div>}
            </div>
          </div>
        </div>
      </div>
    );
};

export default Account;