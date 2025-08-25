import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/utils';
import { Send, Plus, Bot, User, Sparkles, Mic, Info } from 'lucide-react';
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
  const {
    user,
    loading: authLoading
  } = useAuth();
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);
  const isNewChat = localMessages.length === 0;

  // Redirect to auth if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while checking auth
  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Se încarcă...</div>
      </div>;
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
        const title = userMessageText.length > 50 ? userMessageText.substring(0, 50) + '...' : userMessageText;
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
      const {
        data,
        error
      } = await supabase.functions.invoke('chat-with-agent', {
        body: {
          message: userMessageText,
          userId: user?.id,
          agentId: 'agent_zbrv9gu3rklu8n8wmhd6fqmgpy9x',
          // Gal Trans Kalina agent
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
    // focus the input instantly so the user can type
    requestAnimationFrame(() => textareaRef.current?.focus());
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };
  return <DashboardLayout>

        {/* Header */}
        <div className=" border-b border-border flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <ChatHistoryDrawer conversations={conversations} currentConversationId={currentConversationId} onLoadConversation={loadConversation} onDeleteConversation={deleteConversation} onNewChat={handleNewChat} />
            <h1 className="text-xl font-semibold">Kalina AI</h1>
          </div>
          <Button onClick={handleNewChat} variant="ghost" size="sm" className="rounded-full hover:bg-muted">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Full-bleed background wrapper - fills available interior width and height */}
          <div className="w-full bg-white min-h-[calc(90vh-8rem)]">
            <div ref={messagesContainerRef} className="relative max-w-3xl mx-auto px-4 py-6 pb-32">
            {isNewChat ? <div className="min-h-[65vh] flex flex-col items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8">
                    Bună! Sunt Kalina AI, gata să începi?
                  </h2>
                </div>

                {/* Centered rounded-full input */}
                <form onSubmit={handleSendMessage} className="w-full">
                  <div className="mx-auto w-full max-w-3xl">
                    <div className="relative rounded-full border border-border/60 bg-muted/20 shadow-sm hover:shadow transition-shadow">

                      <Textarea ref={textareaRef} value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask anything" rows={1} className={cn('min-h-[48px] max-h-40 resize-none w-full bg-transparent border-0 pl-10 pr-16 py-3 text-left', 'focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-relaxed')} />

                      {/* right actions */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Button type="submit" size="icon" className="rounded-full w-9 h-9" disabled={!inputValue.trim() || isLoading}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* footnote */}
                <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Apasă Enter pentru a trimite • Shift+Enter pentru linie nouă</span>
                </div>
              </div> :
          // ===== Conversation View =====
          <div className="space-y-6">
                {localMessages.map(message => <div key={message.id} className={cn('group', message.isUser ? 'ml-12 md:ml-24' : 'mr-12 md:mr-24')}>
                    <div className="flex gap-3">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white', message.isUser ? 'bg-primary' : 'bg-muted-foreground')}>
                        {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{message.isUser ? 'Tu' : 'Kalina AI'}</span>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString('ro-RO', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                          </span>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-foreground whitespace-pre-wrap leading-relaxed">{message.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>)}

                {isLoading && <div className="mr-12 md:mr-24">
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
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{
                      animationDelay: '0.1s'
                    }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{
                      animationDelay: '0.2s'
                    }} />
                        </div>
                      </div>
                    </div>
                  </div>}

                <div ref={messagesEndRef} />
              </div>}
          </div>
        </div>

        {/* Bottom Input (fixed and always visible when chat active) */}
        {!isNewChat && <div className="fixed inset-x-0 bottom-12 z-50 pointer-events-none">
            <div className="flex justify-center px-4 pb-6 transform translate-x-24">
              <div className="w-full max-w-2xl pointer-events-auto px-2">
                <form onSubmit={handleSendMessage} className="relative">
                  <div className="relative flex items-end gap-2 min-h-[56px] px-4 py-3 bg-background rounded-2xl border border-border/50 focus-within:border-primary/50 transition-colors shadow-lg">
                    <Textarea ref={textareaRef} value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Trimite un mesaj..." className="flex-1 min-h-[24px] max-h-32 resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm placeholder:text-muted-foreground" disabled={isLoading} rows={1} />
                    <Button type="submit" size="sm" className="rounded-full w-8 h-8 p-0 flex-shrink-0" disabled={!inputValue.trim() || isLoading}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>}
      </div>
    </DashboardLayout>;
};
export default MainChat;