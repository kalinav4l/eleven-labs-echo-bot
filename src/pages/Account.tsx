import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
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
import { Bot, Phone, BarChart3, Users, TrendingUp, Calendar, Clock, Star, Activity, FileText, MessageSquare, Zap, Target, CreditCard } from 'lucide-react';
import StatCard from '@/components/StatCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnimatedCounter from '@/components/AnimatedCounter';
import SkeletonCard from '@/components/SkeletonCard';
import VoiceChart from '@/components/VoiceChart';
import CreditsPlanDisplay from '@/components/CreditsPlanDisplay';
import { calculateCostFromSeconds } from '@/utils/costCalculations';
import GlassWelcomeCard from '@/components/dashboard/GlassWelcomeCard';
import ModernGlassStatsGrid from '@/components/dashboard/ModernGlassStatsGrid';
import GlassActivityCard from '@/components/dashboard/GlassActivityCard';
import GlassQuickActions from '@/components/dashboard/GlassQuickActions';
import GlassMetricCard from '@/components/dashboard/GlassMetricCard';

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
      <div className="min-h-screen flex items-center justify-center">
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
  const quickStats = [{
    label: 'Agenți Activi',
    value: totalAgents.toString(),
    icon: Bot,
    color: 'text-gray-600'
  }, {
    label: 'Apeluri Luna Aceasta',
    value: totalCalls.toString(),
    icon: Phone,
    color: 'text-gray-600'
  }, {
    label: 'Sold Curent',
    value: `$${currentBalance.toFixed(2)}`,
    icon: CreditCard,
    color: 'text-gray-600'
  }, {
    label: 'Conversații',
    value: totalConversations.toString(),
    icon: MessageSquare,
    color: 'text-gray-600'
  }, {
    label: 'Cost Total ($)',
    value: `$${totalCost.toFixed(2)}`,
    icon: FileText,
    color: 'text-gray-600'
  }, {
    label: 'Timp Vorbire',
    value: totalTimeFormatted,
    icon: Clock,
    color: 'text-gray-600'
  }];

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
      </DashboardLayout>;
  }

  return <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full -mr-36 -mt-36 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-primary/5 rounded-full -ml-48 -mb-48 animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="relative px-6 py-8 space-y-8">
          {/* Glass Welcome Section */}
          <GlassWelcomeCard 
            displayName={displayName} 
            totalCalls={totalCalls} 
            totalCost={totalCost} 
          />
          
          {/* Modern Glass Stats Grid */}
          <ModernGlassStatsGrid 
            totalAgents={totalAgents}
            totalCalls={totalCalls}
            currentBalance={currentBalance}
            totalConversations={totalConversations}
            totalCost={totalCost}
            totalTimeFormatted={totalTimeFormatted}
          />
          
          {/* Metrics and Actions Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Performance Metric */}
            <GlassMetricCard 
              title="Performanță Agenți"
              value={totalAgents.toString()}
              subtitle="agenți activi"
              percentage={totalAgents > 0 ? Math.min((totalCalls / totalAgents) * 10, 100) : 0}
              icon={Bot}
              gradient="from-blue-500 to-cyan-500"
            />
            
            {/* Success Rate Metric */}
            <GlassMetricCard 
              title="Rata de Succes"
              value="85%"
              subtitle="apeluri reușite"
              percentage={85}
              icon={TrendingUp}
              gradient="from-emerald-500 to-teal-500"
            />
            
            {/* Quick Actions */}
            <GlassQuickActions />
          </div>
          
          {/* Activity and Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Activity Timeline */}
            <GlassActivityCard activities={recentActivity} />
            
            {/* Voice Chart in Glass Container */}
            <div className="relative group animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg" />
              <div className="relative p-2">
                <VoiceChart />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Enhanced Performance Overview */}
            <div className="border border-gray-200/50 rounded-xl bg-white/30 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 animate-scale-in group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="p-6 border-b border-gray-200 relative z-10">
                <h2 className="font-semibold text-gray-900 text-lg flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full mr-3 animate-pulse shadow-sm"></div>
                  Performanță Generală
                </h2>
              </div>
              <div className="p-6 space-y-4 relative z-10">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-white rounded-xl border border-blue-100/50 hover:border-blue-200 transition-all duration-500 hover:scale-[1.03] hover:shadow-md group animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors duration-300">Sold Curent</p>
                      <p className="text-xs text-gray-500">Disponibil</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-300">
                      <AnimatedCounter target={currentBalance} />
                    </p>
                    <p className="text-xs text-gray-500">USD</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-white rounded-xl border border-green-100/50 hover:border-green-200 transition-all duration-500 hover:scale-[1.03] hover:shadow-md group animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-green-900 transition-colors duration-300">Durată Medie</p>
                      <p className="text-xs text-gray-500">Pe apel</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 group-hover:text-green-900 transition-colors duration-300">{averageCallDurationFormatted}</p>
                    <p className="text-xs text-gray-500">Total: {totalTimeFormatted}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/50 to-white rounded-xl border border-purple-100/50 hover:border-purple-200 transition-all duration-500 hover:scale-[1.03] hover:shadow-md group animate-fade-in" style={{ animationDelay: '300ms' }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-purple-900 transition-colors duration-300">Agenți Activi</p>
                      <p className="text-xs text-gray-500">În utilizare</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 group-hover:text-purple-900 transition-colors duration-300">
                      <AnimatedCounter target={totalAgents} />
                    </p>
                    <p className="text-xs text-gray-500">agenți creați</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <div className="flex space-x-3">
                    <Link to="/account/kalina-agents" className="flex-1 group">
                      <Button variant="outline" size="sm" className="w-full hover:scale-105 transition-all duration-300 hover:shadow-md hover:border-primary/30 group-hover:bg-primary/5">
                        <Bot className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Agenți
                      </Button>
                    </Link>
                    <Link to="/account/conversation-analytics" className="flex-1 group">
                      <Button variant="outline" size="sm" className="w-full hover:scale-105 transition-all duration-300 hover:shadow-md hover:border-primary/30 group-hover:bg-primary/5">
                        <BarChart3 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Recent Activity */}
            <div className="border border-gray-200/50 rounded-xl bg-white/30 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-secondary/5 transition-all duration-500 animate-scale-in group overflow-hidden relative" style={{ animationDelay: '200ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="p-6 border-b border-gray-200 relative z-10">
                <h2 className="font-semibold text-gray-900 text-lg flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-secondary to-primary rounded-full mr-3 animate-pulse shadow-sm"></div>
                  Activitate Recentă
                </h2>
              </div>
              <div className="p-6 relative z-10">
                <div className="space-y-3">
                  {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                    <div 
                      key={index} 
                      className="flex items-start space-x-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-500 hover:scale-[1.03] cursor-pointer group hover:shadow-md animate-slide-in-right border border-transparent hover:border-primary/10" 
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:from-primary/20 group-hover:to-secondary/20 group-hover:scale-110 transition-all duration-300 shadow-sm">
                        <activity.icon className="w-4 h-4 text-primary group-hover:text-secondary transition-colors duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium group-hover:text-primary transition-colors duration-300">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center group-hover:text-gray-600 transition-colors duration-300">
                          <Clock className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform duration-300" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 animate-fade-in">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <Activity className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">Nu există activitate recentă</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Voice Chart */}
          <VoiceChart />

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
    </DashboardLayout>;
};

export default Account;
