import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Bot, Users, TrendingUp, Plus, Phone } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserStats } from '@/hooks/useUserStats';
import { useUserAgents } from '@/hooks/useUserAgents';
import { useUserConversations } from '@/hooks/useUserConversations';
const Account = () => {
  const {
    user
  } = useAuth();
  const {
    data: stats
  } = useUserStats();
  const {
    data: userAgents
  } = useUserAgents();
  const {
    data: conversations
  } = useUserConversations();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const conversationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - conversationDate.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) {
      return `Acum ${diffInMinutes} ${diffInMinutes === 1 ? 'minut' : 'minute'}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Acum ${hours} ${hours === 1 ? 'oră' : 'ore'}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Acum ${days} ${days === 1 ? 'zi' : 'zile'}`;
    }
  };
  return <DashboardLayout>
      <div className="p-6 mx-0 my-[60px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Bun venit, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">Iată o privire de ansamblu asupra activității tale</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Conversații Totale
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {stats?.total_conversations || 0}
              </div>
              <p className="text-xs text-gray-600">
                +{Math.floor((stats?.total_conversations || 0) * 0.1)} din luna trecută
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Agenți Activi
              </CardTitle>
              <Bot className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {userAgents?.length || 0}
              </div>
              <p className="text-xs text-gray-600">
                +{userAgents?.length || 0} agenți configurați
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Minute Vorbite
              </CardTitle>
              <Phone className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {Math.floor(stats?.total_minutes_talked || 0)}
              </div>
              <p className="text-xs text-gray-600">
                Total minute de conversație
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Rata de Succes
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">0%</div>
              <p className="text-xs text-gray-600">
                Satisfacția clienților
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Conversations */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-black">Conversații Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversations && conversations.length > 0 ? conversations.map((conversation, index) => <div key={conversation.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-black">
                          {conversation.title || `Conversație cu ${conversation.agent_name}`}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatTimeAgo(conversation.created_at)}
                        </p>
                      </div>
                      <div className="text-xs text-gray-600">
                        {conversation.message_count} mesaje
                      </div>
                    </div>) : <div className="text-center py-8">
                    <p className="text-gray-600 text-sm">Nu ai conversații încă</p>
                    <p className="text-gray-500 text-xs mt-1">Creează un agent pentru a începe</p>
                  </div>}
              </div>
            </CardContent>
          </Card>

          {/* Configured Agents */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-black">Agenți Configurați</CardTitle>
              <Link to="/account/agent-consultant">
                <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                  <Plus className="w-4 h-4 mr-2" />
                  Adaugă Agent
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userAgents && userAgents.length > 0 ? userAgents.slice(0, 3).map(agent => <div key={agent.id} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Bot className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-black">{agent.name}</p>
                        <p className="text-xs text-gray-600">
                          {agent.provider} • Creat {formatTimeAgo(agent.created_at)}
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                    </div>) : <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Bot className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-sm">Nu ai agenți configurați</p>
                    <Link to="/account/agent-consultant">
                      <Button size="sm" className="mt-3 bg-black hover:bg-gray-800 text-white">
                        Creează primul agent
                      </Button>
                    </Link>
                  </div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>;
};
export default Account;