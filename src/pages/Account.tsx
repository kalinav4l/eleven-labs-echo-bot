
import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Bot, MessageSquare, Phone, Clock } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserStats } from '@/hooks/useUserStats';

const Account = () => {
  const { user } = useAuth();
  const { data: stats, isLoading } = useUserStats();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-[#FFD666] rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded border-2 border-[#FFBB00]"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-white min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Dashboard</h1>
          <p className="text-gray-600">Privire de ansamblu asupra activității tale</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-2 border-[#FFBB00] shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-[#FFBB00]" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversații Totale</p>
                  <p className="text-2xl font-bold text-black">{stats?.total_conversations || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-[#FFBB00] shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-[#FFBB00]" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Mesaje Totale</p>
                  <p className="text-2xl font-bold text-black">{stats?.total_messages || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-[#FFBB00] shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Phone className="h-8 w-8 text-[#FFBB00]" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Apeluri Vocale</p>
                  <p className="text-2xl font-bold text-black">{stats?.total_voice_calls || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-[#FFBB00] shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-[#FFBB00]" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Minute Vorbite</p>
                  <p className="text-2xl font-bold text-black">{Math.round(stats?.total_minutes_talked || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Agents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-2 border-[#FFBB00] shadow-md">
            <CardHeader className="bg-gradient-primary">
              <CardTitle className="text-black font-bold">Activitate Recentă</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-[#FFBB00] rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-black text-sm font-medium">Conversație nouă cu clientul</p>
                    <p className="text-gray-600 text-xs">Acum 5 minute</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-[#E6A600] rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-black text-sm font-medium">Agent actualizat cu succes</p>
                    <p className="text-gray-600 text-xs">Acum 1 oră</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-black text-sm font-medium">Test agent finalizat</p>
                    <p className="text-gray-600 text-xs">Acum 2 ore</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-[#FFBB00] shadow-md">
            <CardHeader className="bg-gradient-primary">
              <CardTitle className="text-black font-bold">Agenți Configurați</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#FFD666] rounded border border-[#FFBB00]">
                  <div>
                    <p className="text-black font-bold">Borea</p>
                    <p className="text-gray-700 text-sm">Activ • Agent Conversational</p>
                  </div>
                  <div className="w-3 h-3 bg-[#FFBB00] rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#FFD666] rounded border border-[#FFBB00]">
                  <div>
                    <p className="text-black font-bold">Jesica</p>
                    <p className="text-gray-700 text-sm">Activ • Assistant Personal</p>
                  </div>
                  <div className="w-3 h-3 bg-[#FFBB00] rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#FFD666] rounded border border-[#FFBB00]">
                  <div>
                    <p className="text-black font-bold">Ana</p>
                    <p className="text-gray-700 text-sm">Activ • Support Client</p>
                  </div>
                  <div className="w-3 h-3 bg-[#FFBB00] rounded-full"></div>
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
