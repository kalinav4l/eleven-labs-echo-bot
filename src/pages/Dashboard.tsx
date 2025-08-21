import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
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
import { Bot, Phone, Clock, Activity, FileText, MessageSquare, CreditCard, Zap } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnimatedCounter from '@/components/AnimatedCounter';
import SkeletonCard from '@/components/SkeletonCard';
import VoiceChart from '@/components/VoiceChart';
import CreditsPlanDisplay from '@/components/CreditsPlanDisplay';
import { calculateCostFromSeconds } from '@/utils/costCalculations';

const Dashboard = () => {
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
  const { data: userBalance } = useQuery({
    queryKey: ['user-balance', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_balance')
        .select('balance_usd')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching balance:', error);
        return null;
      }

      return data;
    },
    enabled: !!user,
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
      const { data } = await supabase.functions.invoke('get-elevenlabs-conversation', {
        body: { conversationId }
      });
      
      console.log(`Conversation data received:`, data?.metadata);
      
      if (data?.metadata) {
        const duration = Math.round(data.metadata.call_duration_secs || 0);
        // Calculate cost based on call duration, not ElevenLabs cost
        const costUsd = calculateCostFromSeconds(duration);
        
        console.log(`Calculated cost: $${costUsd} for ${duration} seconds`);
        
        // Deduct cost from user balance and update statistics
        if (costUsd > 0 && user?.id) {
          console.log(`Attempting to deduct $${costUsd} from user ${user.id}`);
          
          try {
            const { data: deductResult, error: deductError } = await supabase.rpc('deduct_balance', {
              p_user_id: user.id,
              p_amount: costUsd,
              p_description: `Apel conversație ${conversationId}`,
              p_conversation_id: null // Nu folosim conversation_id pentru ElevenLabs IDs
            });

            console.log('Deduct balance result:', { deductResult, deductError });

            if (!deductError && deductResult) {
              // Update user statistics with spending
              const { error: statsError } = await supabase.rpc('update_user_statistics_with_spending', {
                p_user_id: user.id,
                p_duration_seconds: duration,
                p_cost_usd: costUsd
              });
              
              console.log('Statistics update error:', statsError);
              console.log(`Successfully deducted $${costUsd} for conversation ${conversationId}`);
            } else {
              console.error('Failed to deduct balance:', deductError);
            }
          } catch (error) {
            console.error('Error deducting balance:', error);
          }
        }
        
        setConversationDurations(prev => ({ ...prev, [conversationId]: duration }));
        setConversationCosts(prev => ({ ...prev, [conversationId]: costUsd }));
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
        const promises = conversationsToLoad.map(call => 
          call.conversation_id ? getConversationData(call.conversation_id) : Promise.resolve(0)
        );
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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
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
  const totalCalls = callHistory?.length || 0;

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
  // KPIs (no duplicates of the same metric across the page)
  const kpis = [
    {
      label: 'Sold Curent',
      value: `$${currentBalance.toFixed(2)}`,
      icon: CreditCard,
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Cost Total',
      value: `$${totalCost.toFixed(2)}`,
      icon: FileText,
      accent: 'from-rose-500 to-red-500',
    },
    {
      label: 'Timp Vorbire',
      value: totalTimeFormatted,
      sub: `${Math.floor(totalSecondsFromCalls / 60)}m ${totalSecondsFromCalls % 60}s`,
      icon: Clock,
      accent: 'from-indigo-500 to-blue-500',
    },
    {
      label: 'Agenți Activi',
      value: totalAgents.toString(),
      icon: Bot,
      accent: 'from-violet-500 to-purple-500',
    },
  ];

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
    return <DashboardLayout>
        <div className="min-h-screen bg-white">
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
      </DashboardLayout>;
  }

  return <DashboardLayout>
  <div className="min-h-screen bg-white">
        {/* Header */}
  <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between animate-fade-in">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Dashboard - {displayName}!
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
      Panou monocrom, metrici clare și activitate — fără secțiuni duplicate
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <CreditsPlanDisplay />
                <div
      className="relative overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={handleSignOut}
                >
                  <div className="px-4 py-2.5 flex items-center justify-center min-w-[80px]">
                    <span className="text-sm font-medium text-gray-900">Ieșire</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 space-y-8">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => (
              <Card key={kpi.label} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 truncate">{kpi.label}</p>
                      <p className="text-2xl font-bold text-gray-900 truncate">{kpi.value}</p>
                      {kpi.sub && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{kpi.sub}</p>
                      )}
                    </div>
                    <div className="p-3 rounded-lg flex-shrink-0 ml-2 bg-gray-900 text-white shadow-sm">
                      <kpi.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analytics + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Usage Overview */}
      <Card className="lg:col-span-2 bg-white ">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 text-lg">Prezentare utilizare</h2>
                  <div className="flex items-center gap-2">
                    <Link to="/account/kalina-agents">
            <Button variant="outline" size="sm" className="hover:shadow-sm">
                        <Bot className="w-4 h-4 mr-2" /> Agenți
                      </Button>
                    </Link>
                    <Link to="/account/conversation-analytics">
            <Button variant="outline" size="sm" className="hover:shadow-sm">
                        <FileText className="w-4 h-4 mr-2" /> Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center shadow-sm">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Durată medie apel</p>
                        <p className="text-lg font-semibold text-gray-900">{averageCallDurationFormatted}</p>
                      </div>
                    </div>
                  </div>
          <div className="p-4 rounded-xl border border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center shadow-sm">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Apeluri</p>
                        <p className="text-lg font-semibold text-gray-900">{totalCalls}</p>
                      </div>
                    </div>
                  </div>
          <div className="p-4 rounded-xl border border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center shadow-sm">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Conversații</p>
                        <p className="text-lg font-semibold text-gray-900">{totalConversations}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voice Chart */}
                <div className="mt-6">
                  <VoiceChart />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h2 className="font-semibold text-gray-900 text-lg mb-4">Activitate recentă</h2>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                          <activity.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Nu există activitate recentă</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Acțiuni rapide</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Link to="/account/kalina-agents">
                      <Button variant="outline" size="sm" className="w-full justify-start text-left h-auto p-3">
                        <Bot className="w-4 h-4 mr-3" />
                        <div>
                          <div className="font-medium">Creează agent</div>
                          <div className="text-xs text-gray-500">Nou agent AI</div>
                        </div>
                      </Button>
                    </Link>
                    <Link to="/account/outbound">
                      <Button variant="outline" size="sm" className="w-full justify-start text-left h-auto p-3">
                        <Phone className="w-4 h-4 mr-3" />
                        <div>
                          <div className="font-medium">Apel nou</div>
                          <div className="text-xs text-gray-500">Inițiază apel</div>
                        </div>
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-600">Transcrieri salvate</p>
                    <p className="text-xl font-bold text-gray-900">
                      <AnimatedCounter target={totalTranscripts} />
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/account/transcript">
                    <Button variant="outline" size="sm" className="w-full">
                      Vezi toate
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-600">Rate de succes</p>
                    <p className="text-xl font-bold text-gray-900">
                      {callHistory && callHistory.length > 0 
                        ? `${Math.round((callHistory.filter(call => call.call_status === 'completed').length / callHistory.length) * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/account/conversation-analytics">
                    <Button variant="outline" size="sm" className="w-full">
                      Vezi analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-600">Conversații active</p>
                    <p className="text-xl font-bold text-gray-900">
                      <AnimatedCounter target={recentConversations?.length || 0} />
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/account/calls">
                    <Button variant="outline" size="sm" className="w-full">
                      Vezi istoric
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>;
};

export default Dashboard;