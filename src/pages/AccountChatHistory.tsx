
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Clock, User, Download, Trash2, Eye, Search, DollarSign } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  conversation_id: string;
  agent_id: string;
  agent_name?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  duration_minutes?: number;
  cost_usd?: number;
}

const AccountChatHistory = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalSpent, setTotalSpent] = useState(0);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchUserConversations();
  }, [user?.id]);

  const fetchUserConversations = async () => {
    try {
      // Fetch user's conversations from Supabase
      const { data: userConversations, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user conversations:', error);
        // Fallback to empty array if no conversations found
        setConversations([]);
        setTotalSpent(0);
        return;
      }

      console.log('User conversations:', userConversations);
      setConversations(userConversations || []);
      
      // Calculate total spent
      const total = userConversations?.reduce((sum, conv) => sum + (conv.cost_usd || 0), 0) || 0;
      setTotalSpent(total);

    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
      setTotalSpent(0);
    } finally {
      setLoading(false);
    }
  };

  const viewConversationDetails = async (conversationId: string) => {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`, {
        method: "GET",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873"
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const body = await response.json();
      console.log('Conversation details:', body);
      
      toast({
        title: "Detalii conversație",
        description: `Conversația ${conversationId} a fost încărcată în consolă.`
      });
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut încărca detaliile conversației.",
        variant: "destructive"
      });
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      // Delete from Supabase first
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Remove from local state
      setConversations(prev => prev.filter(conv => conv.conversation_id !== conversationId));
      
      // Recalculate total spent
      const updatedConversations = conversations.filter(conv => conv.conversation_id !== conversationId);
      const total = updatedConversations.reduce((sum, conv) => sum + (conv.cost_usd || 0), 0);
      setTotalSpent(total);
      
      toast({
        title: "Șters",
        description: "Conversația a fost ștearsă cu succes."
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut șterge conversația.",
        variant: "destructive"
      });
    }
  };

  const downloadConversationAudio = async (conversationId: string) => {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`, {
        method: "GET",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873"
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `conversation_${conversationId}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Descărcat",
        description: "Audio-ul conversației a fost descărcat."
      });
    } catch (error) {
      console.error('Error downloading conversation audio:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut descărca audio-ul conversației.",
        variant: "destructive"
      });
    }
  };

  const sendFeedback = async (conversationId: string, feedback: 'like' | 'dislike') => {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/feedback`, {
        method: "POST",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "feedback": feedback
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Feedback trimis",
        description: `Feedback-ul "${feedback}" a fost trimis.`
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut trimite feedback-ul.",
        variant: "destructive"
      });
    }
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.conversation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.agent_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ro-RO');
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
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
            <h1 className="text-3xl font-bold text-black mb-2">Istoric Chat</h1>
            <p className="text-gray-600">Toate conversațiile tale cu agenții AI</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-lg font-semibold text-gray-700">
                Total cheltuit: {formatCost(totalSpent)}
              </span>
            </div>
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={fetchUserConversations}
            >
              <Download className="w-4 h-4 mr-2" />
              Reîncarcă
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Caută conversații..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredConversations.map((conversation) => (
            <Card key={conversation.conversation_id} className="bg-white border-gray-200 hover:bg-gray-50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <MessageSquare className="w-8 h-8 text-gray-700" />
                    <div>
                      <h3 className="text-black font-medium text-lg">
                        {conversation.agent_name || `Agent ${conversation.agent_id.slice(-8)}`}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(conversation.created_at)}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <User className="w-4 h-4 mr-1" />
                          {conversation.duration_minutes ? `${conversation.duration_minutes} min` : 'Chat'}
                        </div>
                        {conversation.cost_usd && (
                          <div className="flex items-center text-green-600 text-sm font-medium">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {formatCost(conversation.cost_usd)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewConversationDetails(conversation.conversation_id)}
                      className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      title="Vezi detalii"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadConversationAudio(conversation.conversation_id)}
                      className="text-gray-600 hover:text-green-600 hover:bg-green-50"
                      title="Descarcă audio"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => sendFeedback(conversation.conversation_id, 'like')}
                      className="text-gray-600 hover:text-green-600 hover:bg-green-50"
                      title="Like"
                    >
                      👍
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => sendFeedback(conversation.conversation_id, 'dislike')}
                      className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                      title="Dislike"
                    >
                      👎
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteConversation(conversation.conversation_id)}
                      className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                      title="Șterge"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredConversations.length === 0 && !loading && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">Nu există conversații</p>
            <p className="text-gray-400">Conversațiile tale vor apărea aici după ce vei începe să vorbești cu agenții AI.</p>
          </div>
        )}

        {/* Conversation Count */}
        <div className="mt-6 text-sm text-gray-600">
          Afișez {filteredConversations.length} din {conversations.length} conversații
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountChatHistory;
