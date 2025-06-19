
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  Bot, 
  Phone, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Calendar,
  Clock,
  Star,
  Activity
} from 'lucide-react';

const Account = () => {
  const { user, signOut } = useAuth();
  const { displayName, loading: profileLoading } = useUserProfile();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const quickStats = [
    { label: 'Total Agents', value: '3', icon: Bot, color: 'text-blue-600' },
    { label: 'Calls This Month', value: '127', icon: Phone, color: 'text-green-600' },
    { label: 'Success Rate', value: '94%', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Avg Rating', value: '4.8', icon: Star, color: 'text-yellow-600' },
  ];

  const recentActivity = [
    { action: 'Created new agent "Customer Support Pro"', time: '2 hours ago', icon: Bot },
    { action: 'Completed 12 successful calls', time: '4 hours ago', icon: Phone },
    { action: 'Updated voice settings for Sales Agent', time: '1 day ago', icon: Activity },
    { action: 'Generated analytics report', time: '2 days ago', icon: BarChart3 },
  ];

  if (profileLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A5B4C] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Bun venit, {displayName}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestionează agenții tăi AI și urmărește performanțele
                </p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-gray-300 hover:border-red-300 hover:text-red-600"
              >
                Ieșire
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Acțiuni Rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start bg-[#0A5B4C] hover:bg-[#0A5B4C]/90 text-white">
                  <Bot className="w-4 h-4 mr-2" />
                  Creează Agent Nou
                </Button>
                <Button variant="outline" className="w-full justify-start border-gray-300 hover:bg-gray-50">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Vezi Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start border-gray-300 hover:bg-gray-50">
                  <Phone className="w-4 h-4 mr-2" />
                  Inițiază Apel Test
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Activitate Recentă</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#0A5B4C]/10 flex items-center justify-center flex-shrink-0">
                        <activity.icon className="w-4 h-4 text-[#0A5B4C]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Overview */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm mt-8">
            <CardHeader>
              <CardTitle className="text-gray-900">Agenții Tăi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sample Agents */}
                {[
                  { name: 'Kalina Sales Pro', type: 'Sales', status: 'active', calls: 45 },
                  { name: 'Support Assistant', type: 'Support', status: 'active', calls: 32 },
                  { name: 'Lead Qualifier', type: 'Marketing', status: 'paused', calls: 18 },
                ].map((agent, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{agent.type}</p>
                    <p className="text-xs text-gray-500">{agent.calls} apeluri această lună</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Account;
