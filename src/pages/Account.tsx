import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { Bot, Phone, BarChart3, Users, TrendingUp, Calendar, Clock, Star, Activity, FileText, MessageSquare, Zap, Target } from 'lucide-react';
import StatCard from '@/components/StatCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnimatedCounter from '@/components/AnimatedCounter';
import SkeletonCard from '@/components/SkeletonCard';
import ElevenLabsChart from '@/components/ElevenLabsChart';

const Account = () => {
  const {
    user,
    signOut
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

  // State for enhanced analytics data
  const [conversationDurations, setConversationDurations] = useState<Record<string, number>>({});
  const [conversationCredits, setConversationCredits] = useState<Record<string, number>>({});

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Calculate real stats from user data
  const totalAgents = userAgents?.length || 0;
  const totalCalls = callHistory?.length || 0;

  // Calculate total consumed credits from ElevenLabs data - prioritize ElevenLabs when available
  const totalConsumedCredits = callHistory?.reduce((total, call) => {
    // Use ElevenLabs conversation credits if available, otherwise fallback to cost_usd
    const credits = call.conversation_id && conversationCredits[call.conversation_id] !== undefined ? conversationCredits[call.conversation_id] : Math.round((call.cost_usd || 0) * 1000); // Convert USD to credits

    return total + credits;
  }, 0) || 0;
  const totalConversations = userStats?.total_conversations || 0;
  const totalTranscripts = savedTranscripts?.length || 0;

  // Function to get conversation data from ElevenLabs
  const getConversationData = async (conversationId: string) => {
    if (!conversationId || conversationDurations[conversationId] !== undefined) {
      return conversationDurations[conversationId] || 0;
    }
    try {
      const {
        data
      } = await supabase.functions.invoke('get-elevenlabs-conversation', {
        body: {
          conversationId
        }
      });
      if (data?.metadata) {
        const duration = Math.round(data.metadata.call_duration_secs || 0);
        // Extract credits/cost from ElevenLabs metadata
        const cost = data.metadata.cost || 0;
        const llmCharge = data.metadata.charging?.llm_charge || 0;
        const callCharge = data.metadata.charging?.call_charge || 0;

        // Calculate total credits (convert USD to credits, 1 USD = 1000 credits)
        const totalCost = cost || llmCharge + callCharge;
        const credits = Math.round(totalCost * 1000);
        setConversationDurations(prev => ({
          ...prev,
          [conversationId]: duration
        }));
        setConversationCredits(prev => ({
          ...prev,
          [conversationId]: credits
        }));
        return duration;
      }
    } catch (error) {
      console.error('Error fetching conversation data:', error);
    }
    return 0;
  };

  // Load detailed conversation data
  useEffect(() => {
    const loadDetailedAnalytics = async () => {
      const conversationsToLoad = callHistory?.filter(call => call.conversation_id && conversationDurations[call.conversation_id] === undefined) || [];
      for (const call of conversationsToLoad) {
        if (call.conversation_id) {
          await getConversationData(call.conversation_id);
        }
      }
    };
    if (callHistory && callHistory.length > 0) {
      loadDetailedAnalytics();
    }
  }, [callHistory?.length]);

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
    label: 'Credite Consumate',
    value: totalConsumedCredits.toString(),
    icon: Zap,
    color: 'text-gray-600'
  }, {
    label: 'Conversații',
    value: totalConversations.toString(),
    icon: MessageSquare,
    color: 'text-gray-600'
  }, {
    label: 'Transcripturi',
    value: totalTranscripts.toString(),
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
      <div className="min-h-screen bg-gray-50">
        {/* Header with proper styling like in image */}
        <div className="bg-white">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Bun venit, {displayName}!
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Gestionează agenții tăi AI și urmărește performanțele
                </p>
              </div>
              <Button onClick={handleSignOut} variant="outline" className="border-gray-300 hover:border-gray-400 text-gray-700">
                Ieșire
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Stats Grid - 2x3 layout like in image */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1 uppercase tracking-wide font-medium">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <stat.icon className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Performance Overview */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 text-lg flex items-center">
                  <div className="w-2 h-2 bg-gray-900 rounded-full mr-3" />
                  Performanță Generală
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Credite Consumate</p>
                      <p className="text-sm text-gray-500">Total utilizate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {totalConsumedCredits.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">credite</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Durată Medie</p>
                      <p className="text-sm text-gray-500">Pe apel</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{averageCallDurationFormatted}</p>
                    <p className="text-sm text-gray-500">Total: {totalTimeFormatted}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Bot className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Agenți Activi</p>
                      <p className="text-sm text-gray-500">În utilizare</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {totalAgents}
                    </p>
                    <p className="text-sm text-gray-500">agenți creați</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex space-x-3">
                    <Link to="/account/kalina-agents" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Bot className="w-4 h-4 mr-2" />
                        Agenți
                      </Button>
                    </Link>
                    <Link to="/account/conversation-analytics" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 text-lg flex items-center">
                  <div className="w-2 h-2 bg-gray-900 rounded-full mr-3" />
                  Activitate Recentă
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <activity.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Activity className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">Nu există activitate recentă</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section with chart icon */}
          <div className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 text-lg flex items-center">
                  <div className="w-2 h-2 bg-gray-900 rounded-full mr-3" />
                  Statistici Apeluri
                  <TrendingUp className="w-5 h-5 ml-2 text-gray-600" />
                </h2>
              </div>
              <div className="p-6">
                <ElevenLabsChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>;
};

export default Account;
