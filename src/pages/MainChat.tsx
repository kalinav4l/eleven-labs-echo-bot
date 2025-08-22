import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/utils';
import { Send, Plus, Bot, User, MessageSquare, Trash2, Menu, Mic, Paperclip, MoreHorizontal } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on input when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

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
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Header - Always visible */}
      <div className="absolute top-0 left-0 right-0 z-10 h-12 flex items-center border-b border-border bg-card/95 backdrop-blur-sm">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          variant="ghost"
          size="sm"
          className="ml-3 mr-2"
        >
          <Menu className="w-4 h-4" />
        </Button>
        <h1 className="text-lg font-semibold">ChatGPT</h1>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "flex flex-col transition-all duration-300 bg-card border-r border-border mt-12 z-20",
        sidebarOpen ? "w-80" : "w-0",
        "absolute md:relative h-[calc(100vh-3rem)]"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button 
            onClick={handleNewChat}
            className="flex items-center gap-2 flex-1 justify-start h-10 px-3 rounded-lg border border-border hover:bg-muted/50 bg-background text-foreground mr-2"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            <span>Nou chat</span>
          </Button>
          <Button
            onClick={() => setSidebarOpen(false)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 md:hidden"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors relative",
                  currentConversationId === conversation.id 
                    ? "bg-muted" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => loadConversation(conversation.id)}
              >
                <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-foreground">
                    {conversation.title}
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0 hover:bg-destructive/10"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col mt-12 transition-all duration-300",
        sidebarOpen ? "md:ml-0" : "ml-0"
      )}>
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          {localMessages.length === 0 ? (
            // Welcome State - ChatGPT Style - Centered
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-6">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-medium text-foreground mb-4">
                Над чем ты работаешь?
              </h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Întreabă-mă orice despre contul tău, apelurile tale, contactele, agenții sau orice altceva. Pot să te ajut cu programări, verificări și multe altele.
              </p>
            </div>
          ) : (
            // Messages - Normal flow from top
            <div className="max-w-3xl mx-auto px-4 py-6">
              <div className="space-y-6">
                {localMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-4 group",
                      message.isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    {!message.isUser && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-[85%] space-y-2",
                      message.isUser && "items-end"
                    )}>
                      <div className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        message.isUser 
                          ? "bg-primary text-primary-foreground ml-auto" 
                          : "bg-muted text-foreground"
                      )}>
                        <div className="whitespace-pre-wrap">
                          {message.text}
                        </div>
                      </div>
                      <div className={cn(
                        "text-xs text-muted-foreground px-1",
                        message.isUser ? "text-right" : "text-left"
                      )}>
                        {message.timestamp.toLocaleTimeString('ro-RO', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>

                    {message.isUser && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area - ChatGPT Style - Always at bottom */}
        <div className="border-t border-border bg-card/95 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto p-4">
            <form onSubmit={handleSendMessage} className="relative">
              <div className="relative flex items-end gap-2 bg-background border border-border rounded-2xl p-3 shadow-sm focus-within:border-primary/50 transition-colors">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Спросите что-нибудь..."
                  className="flex-1 min-h-[24px] max-h-32 resize-none border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={isLoading}
                />
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  {inputValue.trim() ? (
                    <Button 
                      type="submit" 
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg"
                      disabled={isLoading}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </form>
            
            <div className="mt-2 text-xs text-muted-foreground text-center">
              ChatGPT poate să facă greșeli. Verifică informațiile importante.
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainChat;