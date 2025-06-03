
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, Coins, Bot } from 'lucide-react';
import { format } from 'date-fns';

const AccountChatHistory = () => {
  const { user } = useAuth();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['user-conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: totalStats } = useQuery({
    queryKey: ['conversation-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('conversations')
        .select('message_count, duration_minutes, credits_used')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalMessages = data.reduce((sum, conv) => sum + conv.message_count, 0);
      const totalMinutes = data.reduce((sum, conv) => sum + (conv.duration_minutes || 0), 0);
      const totalCreditsUsed = data.reduce((sum, conv) => sum + conv.credits_used, 0);

      return {
        totalConversations: data.length,
        totalMessages,
        totalMinutes,
        totalCreditsUsed
      };
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center">Se încarcă...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-black mb-6">Istoric Conversații</h1>
        
        {/* Statistics Cards */}
        {totalStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <MessageSquare className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Conversații</p>
                    <p className="text-2xl font-bold text-black">{totalStats.totalConversations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Minute Totale</p>
                    <p className="text-2xl font-bold text-black">{Math.round(totalStats.totalMinutes)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <MessageSquare className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Mesaje Totale</p>
                    <p className="text-2xl font-bold text-black">{totalStats.totalMessages}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Coins className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Credite Folosite</p>
                    <p className="text-2xl font-bold text-black">{totalStats.totalCreditsUsed.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Conversations List */}
        <div className="space-y-4">
          {conversations && conversations.length > 0 ? (
            conversations.map((conversation) => (
              <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-black flex items-center">
                      <Bot className="w-5 h-5 mr-2 text-gray-600" />
                      {conversation.agent_name}
                    </CardTitle>
                    <Badge variant="outline">
                      {format(new Date(conversation.created_at), 'dd MMM yyyy, HH:mm')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span>{conversation.message_count} mesaje</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{Math.round(conversation.duration_minutes || 0)} minute</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Coins className="w-4 h-4 mr-2" />
                      <span>{conversation.credits_used.toLocaleString()} credite</span>
                    </div>
                    <div className="text-gray-600">
                      ID: {conversation.agent_id}
                    </div>
                  </div>
                  {conversation.title && (
                    <p className="text-gray-700 mt-2">{conversation.title}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black mb-2">
                  Nicio conversație încă
                </h3>
                <p className="text-gray-600">
                  Conversațiile tale cu asistenții AI vor apărea aici.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountChatHistory;
