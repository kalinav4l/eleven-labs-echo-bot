
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PhoneCall, Settings, TrendingUp, Clock, DollarSign, Users, BarChart3, CheckCircle, Globe, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const callsData = [
  { date: 'Jun 02', calls: 0 },
  { date: 'Jun 04', calls: 0 },
  { date: 'Jun 06', calls: 0 },
  { date: 'Jun 08', calls: 0 },
  { date: 'Jun 10', calls: 0 },
  { date: 'Jun 12', calls: 0 },
  { date: 'Jun 14', calls: 0 },
  { date: 'Jun 16', calls: 0 },
  { date: 'Jun 18', calls: 0 },
  { date: 'Jun 20', calls: 0 },
  { date: 'Jun 22', calls: 0 },
  { date: 'Jun 24', calls: 0 },
  { date: 'Jun 26', calls: 0 },
  { date: 'Jun 28', calls: 0 },
  { date: 'Jun 30', calls: 8 },
  { date: 'Jul 02', calls: 12 },
];

const successData = [
  { date: 'Jun 02', rate: 0 },
  { date: 'Jun 04', rate: 0 },
  { date: 'Jun 06', rate: 0 },
  { date: 'Jun 08', rate: 0 },
  { date: 'Jun 10', rate: 0 },
  { date: 'Jun 12', rate: 0 },
  { date: 'Jun 14', rate: 0 },
  { date: 'Jun 16', rate: 0 },
  { date: 'Jun 18', rate: 0 },
  { date: 'Jun 20', rate: 0 },
  { date: 'Jun 22', rate: 0 },
  { date: 'Jun 24', rate: 0 },
  { date: 'Jun 26', rate: 0 },
  { date: 'Jun 28', rate: 0 },
  { date: 'Jun 30', rate: 85 },
  { date: 'Jul 02', rate: 100 },
];

const agentsData = [
  { name: 'werget', calls: 7, minutes: 19, cost: 0.099, credits: 15543 },
  { name: 'Connect Imobil', calls: 4, minutes: 4, cost: 0.079, credits: 2432 },
  { name: 'Moldova GAZ Kalina 2', calls: 3, minutes: 2, cost: 0.038, credits: 1671 },
];

const languageData = [
  { language: 'Romanian', percentage: 96.0 },
  { language: 'English', percentage: 4.0 },
];

const Index = () => {
  const { user } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('last-month');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Active calls: 0
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">My Workspace</p>
              <h1 className="text-2xl font-bold text-gray-900">Good afternoon, {user.email?.split('@')[0] || 'User'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-32 bg-white border-gray-300">
                <SelectValue placeholder="All agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                <SelectItem value="werget">werget</SelectItem>
                <SelectItem value="connect">Connect Imobil</SelectItem>
                <SelectItem value="moldova">Moldova GAZ</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32 bg-white border-gray-300">
                <SelectValue placeholder="Last month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-month">Last month</SelectItem>
                <SelectItem value="last-week">Last week</SelectItem>
                <SelectItem value="last-year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="bg-white border-gray-300">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Number of calls</p>
                  <p className="text-3xl font-bold text-gray-900">25</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <PhoneCall className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average duration</p>
                  <p className="text-3xl font-bold text-gray-900">1:11</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total cost</p>
                  <p className="text-2xl font-bold text-gray-900">25.000 <span className="text-sm font-normal text-gray-600">credits</span></p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average cost</p>
                  <p className="text-2xl font-bold text-gray-900">1.000 <span className="text-sm font-normal text-gray-600">credits/call</span></p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total leads</p>
                  <p className="text-3xl font-bold text-gray-900">0,19</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calls Chart */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Call Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={callsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="calls" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Success Rate Chart */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <CardTitle className="text-lg font-semibold text-gray-900">Overall success rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={successData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Most Called Agents */}
          <Card className="lg:col-span-2 bg-white border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Most called agents</CardTitle>
                <Button variant="link" className="text-sm text-blue-600 hover:text-blue-700">
                  See all 14 agents
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-600 pb-2 border-b border-gray-200">
                  <div>Agent name</div>
                  <div className="text-center">Number of calls</div>
                  <div className="text-center">Call minutes</div>
                  <div className="text-center">LLM cost</div>
                  <div className="text-center">Credits spent</div>
                </div>
                {agentsData.map((agent, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 text-sm py-3 border-b border-gray-100 last:border-b-0">
                    <div className="font-medium text-gray-900">{agent.name}</div>
                    <div className="text-center text-gray-700">{agent.calls}</div>
                    <div className="text-center text-gray-700">{agent.minutes}</div>
                    <div className="text-center text-gray-700">{agent.cost.toFixed(3)} USD</div>
                    <div className="text-center text-gray-700">{agent.credits.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Language Distribution */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Globe className="w-5 h-5" />
                Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {languageData.map((lang, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{lang.language}</span>
                      <span className="text-sm text-gray-600">{lang.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </div>
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

export default Index;
