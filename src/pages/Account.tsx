
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
            <div className="h-8 bg-gray-200/50 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200/50 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200/50 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Privire de ansamblu asupra activității tale</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="liquid-glass hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-accent" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Conversații Totale</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.total_conversations || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-accent" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Mesaje Totale</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.total_messages || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Phone className="h-8 w-8 text-accent" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Apeluri Vocale</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.total_voice_calls || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-accent" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Minute Vorbite</p>
                  <p className="text-2xl font-bold text-foreground">{Math.round(stats?.total_minutes_talked || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Agents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="liquid-glass hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-foreground">Activitate Recentă</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-foreground text-sm">Conversație nouă cu clientul</p>
                    <p className="text-muted-foreground text-xs">Acum 5 minute</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-foreground text-sm">Agent actualizat cu succes</p>
                    <p className="text-muted-foreground text-xs">Acum 1 oră</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-secondary-foreground rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-foreground text-sm">Test agent finalizat</p>
                    <p className="text-muted-foreground text-xs">Acum 2 ore</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-foreground">Agenți Configurați</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                  <div>
                    <p className="text-foreground font-medium">Borea</p>
                    <p className="text-muted-foreground text-sm">Activ • Agent Conversational</p>
                  </div>
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                  <div>
                    <p className="text-foreground font-medium">Jesica</p>
                    <p className="text-muted-foreground text-sm">Activ • Assistant Personal</p>
                  </div>
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                  <div>
                    <p className="text-foreground font-medium">Ana</p>
                    <p className="text-muted-foreground text-sm">Activ • Support Client</p>
                  </div>
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
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
