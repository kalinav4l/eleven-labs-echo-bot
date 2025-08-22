import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/utils';
import { Send, Plus, Bot, User, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useChatConversations } from '@/hooks/useChatConversations';
import { ChatHistoryDrawer } from '@/components/ChatHistoryDrawer';

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
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <ChatHistoryDrawer
              conversations={conversations}
              currentConversationId={currentConversationId}
              onLoadConversation={loadConversation}
              onDeleteConversation={deleteConversation}
              onNewChat={handleNewChat}
            />
            <h1 className="text-xl font-semibold">Kalina AI</h1>
          </div>
          <Button 
            onClick={handleNewChat}
            variant="ghost"
            size="sm"
            className="rounded-full hover:bg-muted"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {localMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
                <div className="mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">Bună! Sunt Kalina AI</h2>
                  <p className="text-muted-foreground text-lg">
                    Cum te pot ajuta astăzi?
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {localMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "group",
                      message.isUser ? "ml-12 md:ml-24" : "mr-12 md:mr-24"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white",
                        message.isUser 
                          ? "bg-primary" 
                          : "bg-muted-foreground"
                      )}>
                        {message.isUser ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {message.isUser ? 'Tu' : 'Kalina AI'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString('ro-RO', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                            {message.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div className="mr-12 md:mr-24">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted-foreground flex items-center justify-center flex-shrink-0 text-white">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">Kalina AI</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <form onSubmit={handleSendMessage} className="relative">
              <div className="relative flex items-end gap-2 min-h-[48px] px-4 py-3 bg-muted/30 rounded-2xl border border-border/50 focus-within:border-primary/50 transition-colors">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Trimite un mesaj..."
                  className="flex-1 min-h-[24px] max-h-32 resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm placeholder:text-muted-foreground"
                  disabled={isLoading}
                  rows={1}
                />
                <Button 
                  type="submit" 
                  size="sm"
                  className="rounded-full w-8 h-8 p-0 flex-shrink-0"
                  disabled={!inputValue.trim() || isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MainChat;