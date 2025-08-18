import React, { memo, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { Bot, Phone } from 'lucide-react';

import { useAuth } from '@/components/AuthContext';
import { useOptimizedUserData } from '@/hooks/useOptimizedData';
import LoadingSpinner from '@/components/LoadingSpinner';
import SkeletonCard from '@/components/SkeletonCard';

// Lazy load heavy components
const GlassWelcomeCard = React.lazy(() => import('@/components/dashboard/GlassWelcomeCard'));
const ModernGlassStatsGrid = React.lazy(() => import('@/components/dashboard/ModernGlassStatsGrid'));
const SuccessRateChart = React.lazy(() => import('@/components/dashboard/SuccessRateChart'));
const GlassActivityCard = React.lazy(() => import('@/components/dashboard/GlassActivityCard'));
const GlassQuickActions = React.lazy(() => import('@/components/dashboard/GlassQuickActions'));
const ExpenseStatsChart = React.lazy(() => import('@/components/dashboard/ExpenseStatsChart'));
const TopAgentsCard = React.lazy(() => import('@/components/dashboard/TopAgentsCard'));

// Optimized Agent Card Component
const OptimizedAgentCard = memo(({ agent }: { agent: any }) => (
  <div className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-medium text-gray-900 text-sm truncate">{agent.name}</h3>
      <span className={`text-xs px-2 py-1 rounded ${
        agent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}>
        {agent.is_active ? 'activ' : 'paused'}
      </span>
    </div>
    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{agent.description || 'Agent AI'}</p>
    <p className="text-xs text-gray-500">Creat: {new Date(agent.created_at).toLocaleDateString('ro-RO')}</p>
  </div>
));

OptimizedAgentCard.displayName = 'OptimizedAgentCard';

// Main Account Component
const AccountOptimized = memo(() => {
  const { user, loading: authLoading } = useAuth();
  const { data: userData, isLoading, error } = useOptimizedUserData();

  // Redirect if not authenticated
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600">Please refresh the page and try again.</p>
        </div>
      </div>
    );
  }

  // Loading state with optimized skeletons
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-6 py-8 space-y-8">
          {/* Header skeleton */}
          <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg animate-pulse" />
          
          {/* Stats grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const {
    balance,
    agents,
    recentCalls,
    statistics
  } = userData!;

  // Calculate display values
  const displayName = user?.user_metadata?.full_name || 
                     user?.user_metadata?.first_name || 
                     user?.email?.split('@')[0] || 
                     'User';

  const totalTimeFormatted = statistics.totalDuration > 0 
    ? `${Math.floor(statistics.totalDuration / 60)}:${(statistics.totalDuration % 60).toString().padStart(2, '0')}`
    : '0:00';

  // Recent activity from optimized data
  const recentActivity = [
    ...agents.slice(0, 2).map(agent => ({
      action: `Creat agentul "${agent.name}"`,
      time: new Date(agent.created_at).toLocaleDateString('ro-RO'),
      icon: Bot
    })),
    ...recentCalls.slice(0, 2).map(call => ({
      action: `Apel către ${call.contact_name} - ${call.call_status}`,
      time: call.call_date,
      icon: Phone
    }))
  ].slice(0, 4);

  return (
    <div className="min-h-screen bg-white relative">
      <div className="relative px-6 py-8 space-y-8">
          {/* Suspense wrapped components for better performance */}
          <Suspense fallback={<div className="h-32 bg-gray-100 rounded-lg animate-pulse" />}>
            <GlassWelcomeCard 
              displayName={displayName} 
              totalCalls={statistics.totalCalls} 
              totalCost={statistics.totalCost} 
            />
          </Suspense>
          
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>}>
            <ModernGlassStatsGrid 
              totalAgents={agents.length}
              totalCalls={statistics.totalCalls}
              currentBalance={balance}
              totalConversations={statistics.totalCalls}
              totalCost={statistics.totalCost}
              totalTimeFormatted={totalTimeFormatted}
            />
          </Suspense>
          
          {/* Metrics and Actions Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
              <TopAgentsCard callHistory={recentCalls} />
            </Suspense>
            
            <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
              <SuccessRateChart 
                successfulCalls={recentCalls.filter(c => c.call_status === 'success' || c.call_status === 'done').length}
                totalCalls={statistics.totalCalls}
              />
            </Suspense>
            
            <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
              <GlassQuickActions />
            </Suspense>
          </div>
          
          {/* Activity and Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
              <GlassActivityCard activities={recentActivity} />
            </Suspense>
            
            <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
              <ExpenseStatsChart callHistory={recentCalls} totalCost={statistics.totalCost} />
            </Suspense>
          </div>

          {/* Optimized Agent Overview */}
          <div className="border border-gray-200/50 rounded-lg bg-white/30 backdrop-blur-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium text-gray-900">Agenții Tăi ({agents.length})</h2>
            </div>
            <div className="p-4">
              {agents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.slice(0, 6).map((agent) => (
                    <OptimizedAgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 text-gray-300 mx-auto mb-4">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.9 21 5 21H11V19H5V3H13V9H21Z"/>
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4">Nu ai încă agenți creați</p>
                  <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Creează primul tău agent
                  </button>
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
});

AccountOptimized.displayName = 'AccountOptimized';

export default AccountOptimized;