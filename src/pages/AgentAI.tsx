import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Send, Bot, User, Lightbulb, Database, TrendingUp, Phone, Users } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  functionCalled?: string;
  costDeducted?: number;
  remainingBalance?: string;
}

const AgentAI = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch user balance
  const fetchBalance = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_balance')
        .select('balance_usd')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      setUserBalance(data?.balance_usd || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  // Predefined suggestions
  const suggestions = [
    {
      icon: <Lightbulb className="w-4 h-4" />,
      text: "Explică-mi ce date ai disponibile și ce pot să întreb",
      category: "Început"
    },
    {
      icon: <Phone className="w-4 h-4" />,
      text: "Arată-mi toți clienții care au întrebat despre preț în ultima săptămână",
      category: "Căutare"
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      text: "Care sunt cele mai frecvente întrebări din ultimele 30 de zile?",
      category: "Analiză"
    },
    {
      icon: <Users className="w-4 h-4" />,
      text: "Cum au performat agenții mei în ultima lună?",
      category: "Performance"
    },
    {
      icon: <Database className="w-4 h-4" />,
      text: "Testează conexiunea - arată-mi 3 conversații recente",
      category: "Test"
    },
    {
      icon: <Database className="w-4 h-4" />,
      text: "Dă-mi numerele clienților nemulțumiți din ultimele conversații",
      category: "Contact"
    }
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Check balance before sending
      const COST_PER_QUESTION = 0.08;
      if (userBalance < COST_PER_QUESTION) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Sold insuficient! Ai nevoie de $${COST_PER_QUESTION} pentru a pune o întrebare. Soldul tău curent: $${userBalance.toFixed(2)}. Te rog să îți reîncarci contul.`,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      const { data, error } = await supabase.functions.invoke('agent-ai-chat', {
        body: {
          message: message,
          userId: user.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Handle insufficient balance response
      if (data.error === 'insufficient_balance') {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'Nu am putut procesa cererea.',
        sender: 'ai',
        timestamp: new Date(),
        functionCalled: data.functionCalled
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update balance if cost was deducted
      if (data.costDeducted && data.remainingBalance) {
        setUserBalance(parseFloat(data.remainingBalance));
        
        toast({
          title: "Întrebare procesată",
          description: `Cost: $${data.costDeducted} | Sold rămas: $${data.remainingBalance}`,
        });
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Scuze, am întâmpinat o problemă. Te rog să încerci din nou.',
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Eroare",
        description: error.message || "Nu am putut trimite mesajul",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Agent AI</h1>
              <p className="text-muted-foreground mt-2">
                Întreabă-mă orice despre datele tale din conversații. Cost: $0.08 per întrebare.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Sold disponibil</p>
              <p className="text-2xl font-bold text-primary">${userBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  Conversație AI
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>Încep o conversație! Întreabă-mă orice despre datele tale.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.sender === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.sender === 'ai' && (
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}
                          
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender === 'user'
                                ? 'bg-primary text-white'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                              {message.functionCalled && (
                                <Badge variant="outline" className="text-xs">
                                  {message.functionCalled}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {message.sender === 'user' && (
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="flex gap-3 justify-start">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white animate-pulse" />
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
                
                <div className="border-t p-4">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={userBalance >= 0.08 ? "Întreabă despre conversațiile tale..." : "Sold insuficient pentru întrebări"}
                      disabled={isLoading || !inputMessage.trim() || userBalance < 0.08}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoading || !inputMessage.trim() || userBalance < 0.08}
                      className={userBalance < 0.08 ? "bg-gray-400" : ""}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="w-5 h-5" />
                  Sugestii
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    disabled={isLoading}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start gap-2">
                      <div className="text-primary mt-0.5">
                        {suggestion.icon}
                      </div>
                      <div>
                        <Badge variant="secondary" className="text-xs mb-1">
                          {suggestion.category}
                        </Badge>
                        <p className="text-sm text-foreground leading-relaxed">
                          {suggestion.text}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Capacități</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span>Acces complet la toate datele din analitică</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Extragere numere telefon după criterii</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Analiză performanță agenți</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Statistici și tendințe detaliate</span>
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs font-medium">Cost per întrebare: $0.08</p>
                    <p className="text-xs">Soldul tău: ${userBalance.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentAI;