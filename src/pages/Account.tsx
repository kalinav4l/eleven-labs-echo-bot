
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, MessageSquare, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';

const Account = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalConversations: 0,
    activeAgents: 0,
    totalCalls: 0,
    messagesThisMonth: 0
  });

  useEffect(() => {
    if (user) {
      // Aici poți adăuga logica pentru a obține statisticile
      setStats({
        totalConversations: 45,
        activeAgents: 3,
        totalCalls: 12,
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
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Privire de ansamblu asupra activității tale</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Conversații Totale</p>
                  <p className="text-2xl font-bold text-white">{stats.totalConversations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Agenți Activi</p>
                  <p className="text-2xl font-bold text-white">{stats.activeAgents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Phone className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Apeluri Luna Aceasta</p>
                  <p className="text-2xl font-bold text-white">{stats.totalCalls}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Mesaje Luna Aceasta</p>
                  <p className="text-2xl font-bold text-white">{stats.messagesThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Activitate Recentă</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Conversație nouă cu clientul</p>
                    <p className="text-gray-400 text-xs">Acum 5 minute</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Agent actualizat cu succes</p>
                    <p className="text-gray-400 text-xs">Acum 1 oră</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Apel vocal finalizat</p>
                    <p className="text-gray-400 text-xs">Acum 2 ore</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Agenți Configurați</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <div>
                    <p className="text-white font-medium">Assistant Personal</p>
                    <p className="text-gray-400 text-sm">Activ • Română</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <div>
                    <p className="text-white font-medium">Support Client</p>
                    <p className="text-gray-400 text-sm">Activ • Română/Engleză</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <div>
                    <p className="text-white font-medium">Vânzări</p>
                    <p className="text-gray-400 text-sm">Inactiv • Română</p>
                  </div>
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
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
