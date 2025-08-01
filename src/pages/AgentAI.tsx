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
import { useIsMobile } from '@/hooks/use-mobile';
import { Send, Bot, User } from 'lucide-react';

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
  const isMobile = useIsMobile();
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
        .maybeSingle();
      
      if (error) throw error;
      setUserBalance(data?.balance_usd || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);


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


  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
          <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between'}`}>
            <div>
              <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Agent AI</h1>
              <p className={`text-muted-foreground ${isMobile ? 'mt-1 text-sm' : 'mt-2'}`}>
                Întreabă-mă orice despre datele tale din conversații. Cost: $0.08 per întrebare.
              </p>
            </div>
            <div className={`${isMobile ? 'text-left' : 'text-right'}`}>
              <p className="text-sm text-muted-foreground">Sold disponibil</p>
              <p className={`font-bold text-primary ${isMobile ? 'text-xl' : 'text-2xl'}`}>${userBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Chat Area - Full Width */}
        <div className="w-full">
          <Card className={`${isMobile ? 'h-[calc(100vh-12rem)] min-h-[400px]' : 'h-[600px]'} flex flex-col mobile-card`}>
            <CardHeader className={`border-b ${isMobile ? 'p-4' : ''}`}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
                <Bot className={`text-primary ${isMobile ? 'w-5 h-5' : 'w-5 h-5'}`} />
                Conversație AI
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className={`flex-1 ${isMobile ? 'p-3' : 'p-4'}`} ref={scrollAreaRef}>
                {messages.length === 0 ? (
                  <div className={`text-center text-muted-foreground ${isMobile ? 'py-8' : 'py-12'}`}>
                    <Bot className={`mx-auto mb-4 text-muted-foreground/50 ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`} />
                    <p className={isMobile ? 'text-sm' : ''}>Începe o conversație! Întreabă-mă orice despre datele tale din conversații.</p>
                  </div>
                ) : (
                  <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 sm:gap-3 ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.sender === 'ai' && (
                          <div className={`bg-primary rounded-full flex items-center justify-center flex-shrink-0 ${isMobile ? 'w-7 h-7' : 'w-8 h-8'}`}>
                            <Bot className={`text-white ${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                          </div>
                        )}
                        
                        <div
                          className={`${isMobile ? 'max-w-[85%]' : 'max-w-[80%]'} rounded-lg ${isMobile ? 'p-2.5' : 'p-3'} ${
                            message.sender === 'user'
                              ? 'bg-primary text-white'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className={`whitespace-pre-wrap ${isMobile ? 'text-sm' : ''}`}>{message.content}</p>
                          <div className={`flex items-center gap-2 ${isMobile ? 'mt-1.5' : 'mt-2'}`}>
                            <span className={`opacity-70 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {message.functionCalled && (
                              <Badge variant="outline" className={isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'}>
                                {message.functionCalled}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {message.sender === 'user' && (
                          <div className={`bg-muted rounded-full flex items-center justify-center flex-shrink-0 ${isMobile ? 'w-7 h-7' : 'w-8 h-8'}`}>
                            <User className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className={`flex ${isMobile ? 'gap-2' : 'gap-3'} justify-start`}>
                        <div className={`bg-primary rounded-full flex items-center justify-center flex-shrink-0 ${isMobile ? 'w-7 h-7' : 'w-8 h-8'}`}>
                          <Bot className={`text-white animate-pulse ${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                        </div>
                        <div className={`bg-muted rounded-lg ${isMobile ? 'p-2.5' : 'p-3'}`}>
                          <div className="flex space-x-1">
                            <div className={`bg-muted-foreground rounded-full animate-bounce ${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}></div>
                            <div className={`bg-muted-foreground rounded-full animate-bounce ${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} style={{ animationDelay: '0.1s' }}></div>
                            <div className={`bg-muted-foreground rounded-full animate-bounce ${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
              
              <div className={`border-t ${isMobile ? 'p-3' : 'p-4'} mobile-safe-area`}>
                <form onSubmit={handleSubmit} className={`flex ${isMobile ? 'gap-2' : 'gap-2'}`}>
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={userBalance >= 0.08 ? "Întreabă despre conversațiile tale..." : "Sold insuficient pentru întrebări"}
                    disabled={isLoading || userBalance < 0.08}
                    className={`flex-1 mobile-input ${isMobile ? 'text-base' : ''}`}
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !inputMessage.trim() || userBalance < 0.08}
                    className={`mobile-button ${userBalance < 0.08 ? "bg-gray-400" : ""} ${isMobile ? 'px-3' : ''}`}
                  >
                    <Send className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentAI;