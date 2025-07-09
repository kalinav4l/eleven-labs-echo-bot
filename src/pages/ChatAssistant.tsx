import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Bot, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export const ChatAssistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentId, setAgentId] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !agentId.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog completează mesajul și ID-ul agentului.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Eroare",
        description: "Trebuie să fii autentificat pentru a folosi chat-ul.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-agent', {
        body: {
          agentId,
          message: input,
          userId: user.id,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: data.response || 'Nu am putut genera un răspuns.',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut trimite mesajul. Te rog încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card className="liquid-glass h-[80vh] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <MessageSquare className="w-6 h-6 text-accent" />
            Chat Asistent AI
          </CardTitle>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">
                ID Agent ElevenLabs
              </label>
              <Input
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="Introdu ID-ul agentului tău"
                className="glass-input"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Bună! Sunt asistentul tău AI.</p>
                  <p className="text-sm mt-2">
                    Introdu ID-ul agentului și începe să vorbești cu documentele tale!
                  </p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user'
                          ? 'bg-accent text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-accent text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <p className="text-foreground">Scriu...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scrie mesajul tău aici..."
                disabled={isLoading || !agentId.trim()}
                className="glass-input flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim() || !agentId.trim()}
                className="bg-accent text-white hover:bg-accent/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};