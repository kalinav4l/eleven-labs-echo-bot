import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Phone, PhoneCall, Zap, Target, History, Settings, PlayCircle, Loader2, MessageSquare, RefreshCw, Wallet, AlertTriangle, Mic, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import TestCallHistory from '@/components/TestCallHistory';
import { useTestCallHistory } from '@/hooks/useTestCallHistory';
import { AgentSelector } from '@/components/outbound/AgentSelector';
import { COST_PER_MINUTE, calculateCostFromMinutes } from '@/utils/costCalculations';
const TestCall = () => {
  const [agentId, setAgentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [conversation, setConversation] = useState(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { history, addToHistory, updateHistoryItem, clearHistory } = useTestCallHistory();

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

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('is_admin_user', {
        _user_id: user.id
      });
      
      if (error) throw error;
      setIsAdmin(data || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    checkAdminStatus();
  }, [user]);

  // Calculate estimated cost for a 1-minute call
  const estimatedCostPerMinute = COST_PER_MINUTE;
  const availableMinutes = Math.floor(userBalance / COST_PER_MINUTE);
  const hasInsufficientBalance = !isAdmin && userBalance < estimatedCostPerMinute;
  const handleTestCall = async () => {
    if (!agentId || !phoneNumber) {
      toast({
        title: "Câmpuri obligatorii",
        description: "Vă rugăm să completați ID-ul agentului și numărul de telefon",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Eroare de autentificare",
        description: "Trebuie să fiți conectat pentru a iniția un apel",
        variant: "destructive"
      });
      return;
    }

    // Check if user has sufficient balance for at least 1 minute (skip for admins)
    if (hasInsufficientBalance) {
      toast({
        title: "Sold insuficient",
        description: `Ai nevoie de cel puțin $${estimatedCostPerMinute.toFixed(2)} pentru un apel de test. Soldul tău: $${userBalance.toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('initiate-scheduled-call', {
        body: {
          agent_id: agentId,
          phone_number: phoneNumber,
          contact_name: `Test Call - ${phoneNumber}`,
          user_id: user.id,
          batch_processing: false,
          is_test_call: true
        }
      });
      if (error) {
        console.error('Test call error:', error);
        toast({
          title: "Eroare la inițierea apelului",
          description: error.message || "A apărut o eroare la inițierea apelului de test",
          variant: "destructive"
        });
        return;
      }
      if (data?.success) {
        toast({
          title: "Apel de test inițiat cu succes!",
          description: `Apelul a fost inițiat către ${phoneNumber}. Conversation ID: ${data.conversationId}`
        });

        // Store conversation ID for later retrieval
        setConversationId(data.conversationId);
        
        // Add to history
        addToHistory({
          conversationId: data.conversationId,
          agentId,
          phoneNumber,
        });
        
        // Clear form after successful call
        setAgentId('');
        setPhoneNumber('');
      } else {
        toast({
          title: "Eroare la inițierea apelului",
          description: data?.error || "A apărut o eroare necunoscută",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Test call error:', error);
      toast({
        title: "Eroare la inițierea apelului",
        description: "A apărut o eroare la inițierea apelului de test",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversation = async (targetConversationId?: string) => {
    const idToFetch = targetConversationId || conversationId;
    
    if (!idToFetch) {
      toast({
        title: "Nu există conversație",
        description: "Vă rugăm să inițiați mai întâi un apel de test",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingConversation(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-elevenlabs-conversation', {
        body: { conversationId: idToFetch }
      });

      if (error) {
        console.error('Error fetching conversation:', error);
        toast({
          title: "Eroare la încărcarea conversației",
          description: error.message || "A apărut o eroare la încărcarea conversației",
          variant: "destructive"
        });
        return;
      }

      if (data?.error) {
        toast({
          title: "Conversația nu este încă disponibilă",
          description: "Încercați din nou în câteva momente după finalizarea apelului",
          variant: "destructive"
        });
        return;
      }

      setConversation(data);
      setConversationId(idToFetch);
      
      // Update history with cost if available
      if (data.cost) {
        updateHistoryItem(idToFetch, { cost: parseFloat(data.cost) });
      }
      
      toast({
        title: "Conversația a fost încărcată cu succes!",
        description: "Conversația este afișată mai jos"
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast({
        title: "Eroare la încărcarea conversației",
        description: "A apărut o eroare la încărcarea conversației",
        variant: "destructive"
      });
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const handleHistoryDoubleClick = (conversationId: string) => {
    fetchConversation(conversationId);
  };

  const renderConversation = () => {
    if (!conversation) return null;

    const messages = conversation.transcript || [];
    
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Conversația ({conversationId})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500">Nu sunt disponibile mesaje pentru această conversație.</p>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.role === 'agent' 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'bg-gray-50 border-l-4 border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">
                      {message.role === 'agent' ? 'Agent' : 'Utilizator'}
                    </span>
                    {message.timestamp && (
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{message.content || message.text}</p>
                </div>
              ))
            )}
          </div>
          
          {conversation.status && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm"><strong>Status:</strong> {conversation.status}</p>
              {conversation.duration_seconds && (
                <p className="text-sm"><strong>Durată:</strong> {conversation.duration_seconds} secunde</p>
              )}
              {conversation.cost && (
                <p className="text-sm"><strong>Cost:</strong> ${conversation.cost}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        {/* Header cu gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative px-6 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg">
                    <PhoneCall className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
                    Agent Voice Testing
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    Testează-ți agenții AI cu apeluri vocale în timp real și analizează performanțele
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sold disponibil</p>
                      <p className="text-xl font-bold">{isAdmin ? 'Nelimitat' : `$${userBalance.toFixed(2)}`}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Minute disponibile</p>
                      <p className="text-xl font-bold">{isAdmin ? '∞' : availableMinutes}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <History className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Apeluri test</p>
                      <p className="text-xl font-bold">{history.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Tabs defaultValue="test" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="test" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Test Rapid
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Istoric
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Setări
              </TabsTrigger>
            </TabsList>

            <TabsContent value="test" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Test Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Mic className="w-4 h-4 text-primary" />
                        </div>
                        Test Rapid
                      </CardTitle>
                      <Badge variant={hasInsufficientBalance ? "destructive" : "secondary"}>
                        {hasInsufficientBalance ? 'Sold insuficient' : 'Gata de test'}
                      </Badge>
                    </div>
                    <Progress value={agentId && phoneNumber ? 100 : agentId ? 50 : 0} className="h-2" />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">1</span>
                          </div>
                          Selectează Agent
                        </Label>
                        <AgentSelector
                          selectedAgentId={agentId}
                          onAgentSelect={setAgentId}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">2</span>
                          </div>
                          Numărul de telefon
                        </Label>
                        <Input 
                          placeholder="+40712345678" 
                          value={phoneNumber} 
                          onChange={e => setPhoneNumber(e.target.value)} 
                          disabled={isLoading}
                          className="bg-background/50 border-0 shadow-sm"
                        />
                      </div>

                      {hasInsufficientBalance && (
                        <Alert className="border-destructive/20 bg-destructive/5">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <AlertDescription className="text-destructive">
                            Sold insuficient pentru test. Cost minim: ${estimatedCostPerMinute.toFixed(2)}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <Button 
                      onClick={handleTestCall} 
                      disabled={isLoading || !agentId || !phoneNumber || hasInsufficientBalance} 
                      className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                      size="lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Se inițiază...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <PhoneCall className="w-5 h-5" />
                          <span>Inițiază Test</span>
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Live Status Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      Status Live
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {conversationId ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-green-700">Apel activ</span>
                          </div>
                          <p className="text-xs text-green-600 font-mono">{conversationId}</p>
                        </div>
                        <Button
                          onClick={() => fetchConversation()}
                          disabled={isLoadingConversation}
                          variant="outline"
                          className="w-full"
                        >
                          {isLoadingConversation ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                          )}
                          Actualizează Conversația
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
                          <Phone className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">Niciun apel activ</p>
                        <p className="text-xs text-muted-foreground mt-1">Inițiază un test pentru a vedea statusul</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Conversation Display */}
              {renderConversation()}
            </TabsContent>

            <TabsContent value="history">
              <TestCallHistory
                history={history}
                onConversationDoubleClick={handleHistoryDoubleClick}
                onClearHistory={clearHistory}
              />
            </TabsContent>

            <TabsContent value="settings">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Setări Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Informații Cost</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                          <span>Cost per minut:</span>
                          <span className="font-medium">${estimatedCostPerMinute.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                          <span>Minute disponibile:</span>
                          <span className="font-medium">{isAdmin ? 'Nelimitat' : availableMinutes}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Statistici</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                          <span>Apeluri test realizate:</span>
                          <span className="font-medium">{history.length}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                          <span>Status cont:</span>
                          <span className="font-medium">{isAdmin ? 'Administrator' : 'Utilizator'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default TestCall;