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
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Phone, BarChart3, Users, TrendingUp, Calendar, Clock, Star, Activity, FileText, MessageSquare, Zap, Target } from 'lucide-react';
import StatCard from '@/components/StatCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnimatedCounter from '@/components/AnimatedCounter';
import SkeletonCard from '@/components/SkeletonCard';
import ElevenLabsChart from '@/components/ElevenLabsChart';
import CustomizableDashboard from '@/components/CustomizableDashboard';
import DashboardCustomizer from '@/components/DashboardCustomizer';

const Account = () => {
  const {
    user,
    signOut,
    loading: authLoading
  } = useAuth();

  // Redirect to landing if not authenticated
  if (!authLoading && !user) {
    window.location.href = '/';
    return null;
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
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
  
  // Dashboard customization
  const { preferences, updatePreferences } = useDashboardPreferences();
  const [showCustomizer, setShowCustomizer] = useState(false);

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
      <div className="min-h-screen bg-white">
        {/* Animated Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between animate-fade-in">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 animate-[slideInLeft_0.6s_ease-out]">
                  Bun venit, {displayName}!
                </h1>
                <p className="text-gray-600 mt-1 text-sm animate-[slideInLeft_0.6s_ease-out_0.2s_both]">
                  Gestionează agenții tăi AI și urmărește performanțele
                </p>
              </div>
              <Button onClick={handleSignOut} variant="outline" className="border-gray-300 hover:border-gray-400 text-gray-700 animate-[slideInRight_0.6s_ease-out] hover:scale-105 transition-transform">
                Ieșire
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 py-8">
          {/* Customizable Dashboard */}
          <CustomizableDashboard
            preferences={preferences}
            onOpenCustomizer={() => setShowCustomizer(true)}
            totalAgents={totalAgents}
            totalCalls={totalCalls}
            totalConsumedCredits={totalConsumedCredits}
            totalConversations={totalConversations}
            totalTranscripts={totalTranscripts}
            totalTimeFormatted={totalTimeFormatted}
            recentActivity={recentActivity}
            quickStats={quickStats}
          />

          {/* Dashboard Customizer Modal */}
          {showCustomizer && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <DashboardCustomizer
                onClose={() => setShowCustomizer(false)}
                onPreferencesChange={updatePreferences}
                currentPreferences={preferences}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>;
};

export default Account;
