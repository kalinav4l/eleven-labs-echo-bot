
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Award, 
  Clock, 
  Phone, 
  Star,
  Activity,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Bot,
  Headphones,
  BarChart3
} from 'lucide-react';

const TeamCollaborationHub = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data pentru echipă
  const teamMembers = [
    {
      id: 1,
      name: 'Alexandra Popescu',
      role: 'Senior AI Specialist',
      avatar: 'AP',
      status: 'online',
      callsToday: 24,
      satisfaction: 4.8,
      totalCalls: 1250,
      specialization: 'Customer Support',
      performance: 95
    },
    {
      id: 2,
      name: 'Mihai Ionescu',
      role: 'Voice Assistant Manager',
      avatar: 'MI',
      status: 'busy',
      callsToday: 18,
      satisfaction: 4.6,
      totalCalls: 980,
      specialization: 'Technical Support',
      performance: 92
    },
    {
      id: 3,
      name: 'Elena Radu',
      role: 'AI Training Specialist',
      avatar: 'ER',
      status: 'away',
      callsToday: 12,
      satisfaction: 4.9,
      totalCalls: 750,
      specialization: 'Sales Calls',
      performance: 98
    }
  ];

  const agents = [
    {
      id: 1,
      name: 'Kalina Sales Pro',
      type: 'Sales Assistant',
      status: 'active',
      callsToday: 45,
      successRate: 87,
      avgDuration: '4:32',
      satisfaction: 4.7
    },
    {
      id: 2,
      name: 'Kalina Support',
      type: 'Customer Support',
      status: 'active',
      callsToday: 67,
      successRate: 94,
      avgDuration: '3:15',
      satisfaction: 4.8
    },
    {
      id: 3,
      name: 'Kalina Tech Helper',
      type: 'Technical Support',
      status: 'maintenance',
      callsToday: 23,
      successRate: 91,
      avgDuration: '6:20',
      satisfaction: 4.6
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'call_completed',
      agent: 'Kalina Sales Pro',
      client: '+40 721 123 456',
      duration: '4:32',
      result: 'success',
      timestamp: '2 min ago',
      satisfaction: 5
    },
    {
      id: 2,
      type: 'agent_updated',
      agent: 'Kalina Support',
      action: 'Voice model updated',
      timestamp: '15 min ago'
    },
    {
      id: 3,
      type: 'call_completed',
      agent: 'Kalina Tech Helper',
      client: '+40 722 987 654',
      duration: '6:45',
      result: 'success',
      timestamp: '23 min ago',
      satisfaction: 4
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'away':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'active':
        return 'bg-[#0A5B4C]/10 text-[#0A5B4C] border-[#0A5B4C]/20';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#0A5B4C] to-[#0d6b56] rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Team Collaboration</h1>
                  <p className="text-gray-600">Manage your AI agents and team performance</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button className="bg-[#0A5B4C] hover:bg-[#0d6b56] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="futuristic-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Calls Today</p>
                    <p className="text-2xl font-bold text-[#0A5B4C]">156</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +23% vs yesterday
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#0A5B4C]/10 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-[#0A5B4C]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="futuristic-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-[#0A5B4C]">91%</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <Target className="w-3 h-3 mr-1" />
                      Above target
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#0A5B4C]/10 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-[#0A5B4C]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="futuristic-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Satisfaction</p>
                    <p className="text-2xl font-bold text-[#0A5B4C]">4.7</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <Star className="w-3 h-3 mr-1" />
                      Excellent rating
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#0A5B4C]/10 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-[#0A5B4C]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="futuristic-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Agents</p>
                    <p className="text-2xl font-bold text-[#0A5B4C]">3</p>
                    <p className="text-xs text-gray-600 flex items-center mt-1">
                      <Activity className="w-3 h-3 mr-1" />
                      All operational
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#0A5B4C]/10 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-[#0A5B4C]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/80 backdrop-blur-xl border border-gray-200/50 mb-6">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#0A5B4C] data-[state=active]:text-white">
                Team Overview
              </TabsTrigger>
              <TabsTrigger value="agents" className="data-[state=active]:bg-[#0A5B4C] data-[state=active]:text-white">
                AI Agents
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-[#0A5B4C] data-[state=active]:text-white">
                Performance
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-[#0A5B4C] data-[state=active]:text-white">
                Live Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Team Members */}
              <Card className="futuristic-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <Users className="w-5 h-5 mr-2 text-[#0A5B4C]" />
                    Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="bg-white/70 rounded-xl p-4 border border-gray-200/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#0A5B4C] to-[#0d6b56] rounded-full flex items-center justify-center text-white font-semibold">
                              {member.avatar}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{member.name}</h3>
                              <p className="text-sm text-gray-600">{member.role}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Calls Today</p>
                            <p className="font-semibold text-[#0A5B4C]">{member.callsToday}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Satisfaction</p>
                            <p className="font-semibold text-[#0A5B4C]">{member.satisfaction}/5</p>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Performance</span>
                            <span className="text-[#0A5B4C] font-semibold">{member.performance}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#0A5B4C] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${member.performance}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agents" className="space-y-6">
              <Card className="futuristic-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <Bot className="w-5 h-5 mr-2 text-[#0A5B4C]" />
                    AI Voice Agents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <div key={agent.id} className="bg-white/70 rounded-xl p-4 border border-gray-200/50 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-[#0A5B4C] to-[#0d6b56] rounded-xl flex items-center justify-center">
                              <Headphones className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                              <p className="text-sm text-gray-600">{agent.type}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <Badge className={getStatusColor(agent.status)}>
                              {agent.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-600">Calls Today</p>
                            <p className="font-semibold text-[#0A5B4C]">{agent.callsToday}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Success Rate</p>
                            <p className="font-semibold text-[#0A5B4C]">{agent.successRate}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Avg Duration</p>
                            <p className="font-semibold text-[#0A5B4C]">{agent.avgDuration}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Satisfaction</p>
                            <p className="font-semibold text-[#0A5B4C]">{agent.satisfaction}/5</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="futuristic-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900">
                      <BarChart3 className="w-5 h-5 mr-2 text-[#0A5B4C]" />
                      Daily Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Performance chart will be displayed here</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="futuristic-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900">
                      <Target className="w-5 h-5 mr-2 text-[#0A5B4C]" />
                      Goals & Targets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Daily Call Target</span>
                        <span className="text-sm font-semibold text-[#0A5B4C]">156/150</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0A5B4C] h-2 rounded-full w-full"></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Success Rate Target</span>
                        <span className="text-sm font-semibold text-[#0A5B4C]">91%/85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0A5B4C] h-2 rounded-full w-full"></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Satisfaction Target</span>
                        <span className="text-sm font-semibold text-[#0A5B4C]">4.7/4.5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0A5B4C] h-2 rounded-full w-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card className="futuristic-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <Activity className="w-5 h-5 mr-2 text-[#0A5B4C]" />
                    Real-time Activity Feed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-3 bg-white/70 rounded-lg border border-gray-200/50">
                        <div className="w-10 h-10 bg-[#0A5B4C]/10 rounded-full flex items-center justify-center">
                          {activity.type === 'call_completed' ? (
                            <Phone className="w-5 h-5 text-[#0A5B4C]" />
                          ) : (
                            <Zap className="w-5 h-5 text-[#0A5B4C]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">
                              {activity.type === 'call_completed' 
                                ? `Call completed by ${activity.agent}` 
                                : `${activity.agent} - ${activity.action}`
                              }
                            </p>
                            <span className="text-xs text-gray-500">{activity.timestamp}</span>
                          </div>
                          {activity.client && (
                            <p className="text-sm text-gray-600">
                              Client: {activity.client} • Duration: {activity.duration}
                              {activity.satisfaction && (
                                <span className="ml-2">• Rating: {activity.satisfaction}/5</span>
                              )}
                            </p>
                          )}
                        </div>
                        {activity.result === 'success' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamCollaborationHub;
