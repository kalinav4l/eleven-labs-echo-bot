
import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, User, Download } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserConversations } from '@/hooks/useUserConversations';

const AccountChatHistory = () => {
  const { user } = useAuth();
  const { data: conversations, isLoading } = useUserConversations();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ro-RO');
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '0 min';
    return `${Math.round(minutes)} min`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200/50 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200/50 rounded-xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Istoric Chat</h1>
            <p className="text-muted-foreground">Toate conversațiile tale cu agenții AI</p>
          </div>
          <Button variant="outline" className="glass-button">
            <Download className="w-4 h-4 mr-2" />
            Exportă Istoric
          </Button>
        </div>

        <div className="space-y-4">
          {conversations && conversations.length > 0 ? (
            conversations.map((conversation) => (
              <Card key={conversation.id} className="liquid-glass hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <MessageSquare className="w-8 h-8 text-accent" />
                      <div>
                        <h3 className="text-foreground font-medium text-lg">
                          {conversation.title || `Conversație cu ${conversation.agent_name}`}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(conversation.created_at)}
                          </div>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <User className="w-4 h-4 mr-1" />
                            {conversation.agent_name}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-foreground font-medium">
                        {formatDuration(conversation.duration_minutes)}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {conversation.message_count} mesaje
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nu există conversații încă</h3>
              <p className="text-muted-foreground">Începe prima ta conversație cu un agent AI</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {conversations && conversations.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="glass-button">
                Anterior
              </Button>
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">1</Button>
              <Button variant="outline" size="sm" className="glass-button">
                Următor
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AccountChatHistory;
