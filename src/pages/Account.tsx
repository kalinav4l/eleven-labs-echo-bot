import React, { useState, useEffect, useRef } from 'react';
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
  
  // 3D scroll effect refs
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const performanceRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // 3D scroll animations
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Stats cards 3D rotation based on scroll
      if (statsRef.current) {
        const rect = statsRef.current.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distanceFromCenter = (viewportHeight / 2 - elementCenter) / viewportHeight;
        const rotateX = distanceFromCenter * 15;
        statsRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) translateZ(20px)`;
      }
      
      // Performance section parallax
      if (performanceRef.current) {
        const rect = performanceRef.current.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distanceFromCenter = (viewportHeight / 2 - elementCenter) / viewportHeight;
        const rotateY = distanceFromCenter * 10;
        const translateZ = Math.abs(distanceFromCenter) * 30;
        performanceRef.current.style.transform = `perspective(1200px) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
      }
      
      // Chart floating effect
      if (chartRef.current) {
        const rect = chartRef.current.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distanceFromCenter = (viewportHeight / 2 - elementCenter) / viewportHeight;
        const translateY = distanceFromCenter * 20;
        const rotateZ = distanceFromCenter * 5;
        chartRef.current.style.transform = `perspective(800px) translateY(${translateY}px) rotateZ(${rotateZ}deg) translateZ(40px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <DashboardLayout>
      <div ref={containerRef} className="min-h-screen bg-white relative overflow-hidden">
        {/* Floating 3D Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-xl animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-green-100/20 to-blue-100/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-100/20 to-pink-100/20 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-orange-100/20 to-yellow-100/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Animated Header with 3D effect */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between animate-fade-in">
              <div className="relative">
                <h1 className="text-3xl font-bold text-gray-900 animate-[slideInLeft_0.6s_ease-out] hover:scale-105 transition-all duration-500 cursor-pointer hover:text-blue-600 transform-gpu hover:translateZ-10">
                  Bun venit, {displayName}!
                </h1>
                <p className="text-gray-600 mt-1 text-sm animate-[slideInLeft_0.6s_ease-out_0.2s_both] transform transition-all duration-300 hover:translateY-1">
                  Gestionează agenții tăi AI și urmărește performanțele
                </p>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 hover:w-full group-hover:w-full"></div>
              </div>
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                className="border-gray-300 hover:border-gray-400 text-gray-700 animate-[slideInRight_0.6s_ease-out] hover:scale-110 transition-all duration-500 transform-gpu hover:shadow-2xl hover:translateZ-20 hover:rotate-1"
              >
                Ieșire
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 relative">
          {/* 3D Stats Cards with Scroll Animations */}
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 perspective-1000">
            {quickStats.map((stat, index) => (
              <div 
                key={index} 
                className="animate-fade-in group relative"
                style={{ 
                  animationDelay: `${index * 150}ms`,
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-110"></div>
                <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-2xl transition-all duration-700 transform-gpu hover:translateY-2 hover:rotateX-5 hover:rotateY-5 hover:translateZ-20 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg">
                        <stat.icon className="w-6 h-6 text-gray-600 group-hover:text-white transition-all duration-500 group-hover:scale-110" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-all duration-500 transform group-hover:scale-110">
                          <AnimatedCounter target={parseInt(stat.value) || 0} />
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 3D Shine Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine transition-opacity duration-500"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* 3D Performance Overview */}
            <div ref={performanceRef} className="relative group" style={{ transformStyle: 'preserve-3d' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000 transform group-hover:scale-110"></div>
              <div className="relative border border-gray-200/50 rounded-3xl bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-700 animate-scale-in group overflow-hidden transform-gpu hover:translateY-4 hover:rotateX-10 hover:rotateY-5 hover:translateZ-30">
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
                      <p className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors duration-300">Credite Consumate</p>
                      <p className="text-xs text-gray-500">Total utilizate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-300">
                      <AnimatedCounter target={totalConsumedCredits} />
                    </p>
                    <p className="text-xs text-gray-500">credite</p>
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

            {/* 3D Recent Activity */}
            <div className="relative group" style={{ transformStyle: 'preserve-3d', animationDelay: '200ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000 transform group-hover:scale-110"></div>
              <div className="relative border border-gray-200/50 rounded-3xl bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-700 animate-scale-in group overflow-hidden transform-gpu hover:translateY-4 hover:rotateX-10 hover:rotateY-5 hover:translateZ-30">
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
          </div>

          {/* 3D Floating Chart */}
          <div ref={chartRef} className="relative mb-12" style={{ transformStyle: 'preserve-3d' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl opacity-50 animate-pulse"></div>
            <div className="relative transform-gpu hover:translateY-6 hover:rotateX-5 hover:translateZ-40 transition-all duration-1000">
              <ElevenLabsChart />
            </div>
          </div>

          {/* 3D Agent Overview */}
          <div className="relative group mt-8" style={{ transformStyle: 'preserve-3d' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
            <div className="relative border border-gray-200/50 rounded-3xl bg-white/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-700 transform-gpu hover:translateY-2 hover:rotateX-3 hover:translateZ-20">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-medium text-gray-900">Agenții Tăi</h2>
              </div>
              <div className="p-4">
                {userAgents && userAgents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userAgents.slice(0, 6).map((agent, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900 text-sm">{agent.name}</h3>
                          <Badge variant={agent.is_active ? 'default' : 'secondary'} className="text-xs">
                            {agent.is_active ? 'activ' : 'paused'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{agent.description || 'Agent AI'}</p>
                        <p className="text-xs text-gray-500">Creat: {new Date(agent.created_at).toLocaleDateString('ro-RO')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Nu ai încă agenți creați</p>
                    <Link to="/account/kalina-agents">
                      <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                        <Bot className="w-4 h-4 mr-2" />
                        Creează primul tău agent
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Account;
