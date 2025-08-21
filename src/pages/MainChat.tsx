import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { cn } from '@/utils/utils';
import { Send, Plus, Bot, User, MessageSquare, Trash2, Edit3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useChatConversations } from '@/hooks/useChatConversations';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const MainChat = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    conversations,
    currentConversationId,
    messages: chatMessages,
    isLoading: conversationLoading,
    createConversation,
    addMessage,
    deleteConversation,
    loadConversation,
    startNewConversation
  } = useChatConversations();

  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Convert chat messages to local format
  useEffect(() => {
    const converted = chatMessages.map(msg => ({
      id: msg.id,
      text: msg.content,
      isUser: msg.is_user,
      timestamp: new Date(msg.created_at)
    }));
    setLocalMessages(converted);
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  // Redirect to auth if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Se încarcă...</div>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessageText = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      let conversationId = currentConversationId;

      // Create new conversation if none exists
      if (!conversationId) {
        const title = userMessageText.length > 50 
          ? userMessageText.substring(0, 50) + '...'
          : userMessageText;
        
        conversationId = await createConversation(title);
        if (!conversationId) {
          throw new Error('Nu s-a putut crea conversația');
        }
      }

      // Add user message to database and local state
      const userMessage: Message = {
        id: Date.now().toString(),
        text: userMessageText,
        isUser: true,
        timestamp: new Date()
      };
      setLocalMessages(prev => [...prev, userMessage]);

      // Save user message to database
      await addMessage(conversationId, userMessageText, true);

      // Send to GPT
      const conversationHistory = localMessages.slice(-10).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));

      const { data, error } = await supabase.functions.invoke('chat-with-agent', {
        body: {
          message: userMessageText,
          userId: user?.id,
          agentId: 'agent_zbrv9gu3rklu8n8wmhd6fqmgpy9x', // Gal Trans Kalina agent
          conversationHistory
        }
      });

      if (error) throw error;

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Ne pare rău, nu am putut procesa cererea.',
        isUser: false,
        timestamp: new Date()
      };

      setLocalMessages(prev => [...prev, aiResponse]);

      // Save AI response to database
      await addMessage(conversationId, aiResponse.text, false);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Eroare la trimiterea mesajului');
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Ne pare rău, a apărut o eroare tehnică. Te rog să încerci din nou.',
        isUser: false,
        timestamp: new Date()
      };
      setLocalMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    startNewConversation();
    setLocalMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
        {/* Conversations Sidebar */}
        <div className={cn(
          "transition-all duration-300 border-r border-border/20 liquid-glass",
          sidebarOpen ? "w-80" : "w-0 md:w-80"
        )}>
          <div className="h-full flex flex-col p-4">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Conversații</h3>
              <Button 
                onClick={handleNewChat}
                size="sm"
                className="glass-button"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "p-3 rounded-xl cursor-pointer transition-all duration-200 group liquid-glass",
                    currentConversationId === conversation.id 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-black/5"
                  )}
                  onClick={() => loadConversation(conversation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conversation.updated_at).toLocaleDateString('ro-RO')}
                      </p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-border/20 liquid-glass">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-y-1">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    variant="ghost"
                    size="sm"
                    className="md:hidden glass-button"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      Kalina AI
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Bună, cum pot să te ajut astăzi?
                    </p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleNewChat}
                variant="outline"
                size="sm"
                className="glass-button flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nou Chat</span>
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {localMessages.length === 0 ? (
                <div className="text-center py-20">
                  <div className="liquid-glass mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-6">
                    <Bot className="w-16 h-16 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Începe o conversație
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Scrie mesajul tău mai jos pentru a începe să vorbești cu Kalina AI. 
                    Pot să te ajut cu diverse întrebări și sarcini.
                  </p>
                </div>
              ) : (
                localMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full animate-fade-in",
                      message.isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "flex max-w-[85%] gap-3",
                        message.isUser ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 liquid-glass",
                        message.isUser 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}>
                        {message.isUser ? (
                          <User className="w-5 h-5" />
                        ) : (
                          <Bot className="w-5 h-5" />
                        )}
                      </div>
                      <div className={cn(
                        "px-6 py-4 rounded-2xl liquid-glass transition-all duration-200",
                        message.isUser 
                          ? "bg-primary/5 border border-primary/20" 
                          : "bg-muted/30 border border-border/20"
                      )}>
                        <div className="prose prose-sm max-w-none">
                          <p className="mb-0 whitespace-pre-wrap leading-relaxed text-foreground">
                            {message.text}
                          </p>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString('ro-RO', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-10 h-10 rounded-full bg-muted liquid-glass flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="px-6 py-4 rounded-2xl bg-muted/30 border border-border/20 liquid-glass">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="ml-2 text-sm text-muted-foreground">Kalina scrie...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-border/20 liquid-glass">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Scrie mesajul tău aici..."
                    className="min-h-[52px] max-h-32 resize-none pr-12 glass-input transition-all duration-200 focus:shadow-lg"
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  size="sm"
                  className="h-[52px] px-6 glass-button"
                  disabled={!inputValue.trim() || isLoading}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
              
              <div className="mt-2 text-xs text-muted-foreground text-center">
                Apasă Enter pentru a trimite, Shift+Enter pentru linie nouă
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MainChat;