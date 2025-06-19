
import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, User, Download, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserConversations } from '@/hooks/useUserConversations';
import { useState } from 'react';

const AccountChatHistory = () => {
  const { user } = useAuth();
  const { data: conversations, isLoading } = useUserConversations();
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const filteredConversations = conversations?.filter(conversation => 
    conversation.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.agent_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-muted-foreground">Se încarcă conversațiile...</div>
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

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Caută conversații..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-input"
          />
        </div>

        <div className="space-y-4">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
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
                            {new Date(conversation.created_at).toLocaleString('ro-RO')}
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
                        {conversation.duration_minutes || 0} min
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {conversation.message_count} mesaje
                      </div>
                      {conversation.cost_usd && (
                        <div className="text-muted-foreground text-sm">
                          ${conversation.cost_usd.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="liquid-glass">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <MessageSquare className="w-12 h-12 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    {searchQuery ? 'Nu s-au găsit conversații' : 'Nu ai încă conversații'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 
                      `Nu există conversații care să corespundă căutării "${searchQuery}"` : 
                      'Începe prima ta conversație cu un agent AI'
                    }
                  </p>
                </div>
                {!searchQuery && (
                  <Button className="glass-button">
                    Creează primul agent
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination - only show if there are conversations */}
        {filteredConversations.length > 0 && (
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
