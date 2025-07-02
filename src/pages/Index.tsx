
import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bot, Phone, TrendingUp, MessageSquare, Plus, BarChart3, PhoneCall } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserStats } from '@/hooks/useUserStats';

const Index = () => {
  const { user } = useAuth();
  const { data: stats } = useUserStats();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const statCards = [
    {
      title: "Total Agents",
      value: stats?.agents_used || 1,
      icon: Bot,
      color: "text-blue-600"
    },
    {
      title: "Calls This Month", 
      value: stats?.total_voice_calls || 0,
      icon: Phone,
      color: "text-green-600"
    },
    {
      title: "Success Rate",
      value: "0%",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Conversations",
      value: stats?.total_conversations || 0,
      icon: MessageSquare,
      color: "text-orange-600"
    }
  ];

  const quickActions = [
    {
      title: "Create New Agent",
      description: "Set up a new AI agent for your business",
      icon: Plus,
      link: "/account/kalina-agents",
      primary: true
    },
    {
      title: "View Analytics", 
      description: "Check performance metrics and insights",
      icon: BarChart3,
      link: "/account/conversation-analytics"
    },
    {
      title: "Start Test Call",
      description: "Test your agents with a quick call",
      icon: PhoneCall,
      link: "/account/outbound"
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome back!
            </h1>
            <p className="text-gray-600">Manage your AI agents and track performance</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="p-6 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.link}>
                    <div className={`p-4 rounded-lg border transition-all duration-200 hover:bg-gray-50 cursor-pointer ${
                      action.primary 
                        ? 'bg-gray-900 text-white hover:bg-gray-800 border-gray-900' 
                        : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          action.primary 
                            ? 'bg-white/10' 
                            : 'bg-gray-100'
                        }`}>
                          <action.icon className={`w-5 h-5 ${
                            action.primary 
                              ? 'text-white' 
                              : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-medium ${
                            action.primary 
                              ? 'text-white' 
                              : 'text-gray-900'
                          }`}>
                            {action.title}
                          </h3>
                          <p className={`text-sm ${
                            action.primary 
                              ? 'text-gray-300' 
                              : 'text-gray-600'
                          }`}>
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Created agent "domic.md Kalina"</p>
                    <p className="text-xs text-gray-500">02.07.2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Agents */}
          <div className="mt-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Agents</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">domic.md Kalina</h3>
                      <p className="text-sm text-gray-600">AI consulting agent generated automatically for domic.md Kalina</p>
                      <p className="text-xs text-gray-500 mt-1">Created: 02.07.2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
