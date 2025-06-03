
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Bot, MessageSquare } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const Account = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalConversations: 0,
    activeAgents: 0,
    messagesThisMonth: 0
  });

  useEffect(() => {
    if (user) {
      setStats({
        totalConversations: 45,
        activeAgents: 3,
        messagesThisMonth: 234
      });
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Dashboard</h1>
          <p className="text-gray-600">Privire de ansamblu asupra activității tale</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-gray-700" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversații Totale</p>
                  <p className="text-2xl font-bold text-black">{stats.totalConversations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bot className="h-8 w-8 text-gray-700" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Agenți Activi</p>
                  <p className="text-2xl font-bold text-black">{stats.activeAgents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-gray-700" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Mesaje Luna Aceasta</p>
                  <p className="text-2xl font-bold text-black">{stats.messagesThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-black">Activitate Recentă</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-black text-sm">Conversație nouă cu clientul</p>
                    <p className="text-gray-600 text-xs">Acum 5 minute</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-black text-sm">Agent actualizat cu succes</p>
                    <p className="text-gray-600 text-xs">Acum 1 oră</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-black text-sm">Test agent finalizat</p>
                    <p className="text-gray-600 text-xs">Acum 2 ore</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-black">Agenți Configurați</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded">
                  <div>
                    <p className="text-black font-medium">Borea</p>
                    <p className="text-gray-600 text-sm">Activ • Agent Conversational</p>
                  </div>
                  <div className="w-3 h-3 bg-black rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded">
                  <div>
                    <p className="text-black font-medium">Jesica</p>
                    <p className="text-gray-600 text-sm">Activ • Assistant Personal</p>
                  </div>
                  <div className="w-3 h-3 bg-black rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded">
                  <div>
                    <p className="text-black font-medium">Ana</p>
                    <p className="text-gray-600 text-sm">Activ • Support Client</p>
                  </div>
                  <div className="w-3 h-3 bg-black rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Account;
