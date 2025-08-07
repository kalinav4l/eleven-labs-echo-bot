import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, PlayCircle, Loader2, MessageSquare, RefreshCw, Wallet, 
  AlertTriangle, Zap, Sparkles, Activity, History, Clock,
  Signal, Check
} from 'lucide-react';
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
      <div className="min-h-screen p-6 space-y-8">
        {/* Modern Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          <div className="relative p-8 lg:p-12">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <Signal className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Test Apel AI
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Testează puterea agenților tăi AI prin apeluri directe și analizează performanța în timp real
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <Badge variant="secondary" className="px-3 py-1">
                    <Activity className="w-3 h-3 mr-1" />
                    Live Testing
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Powered
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Test Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Soldul Actual</p>
                      <p className="text-2xl font-bold">
                        {isAdmin ? '∞' : `$${userBalance.toFixed(2)}`}
                      </p>
                    </div>
                    <Wallet className="w-8 h-8 text-primary opacity-80" />
                  </div>
                  <div className="mt-2">
                    <Badge variant={hasInsufficientBalance ? "destructive" : "secondary"} className="text-xs">
                      {isAdmin ? 'Admin' : availableMinutes + ' min disponibile'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-green-200 bg-gradient-to-br from-green-50 to-background">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Apeluri Realizate</p>
                      <p className="text-2xl font-bold">{history.length}</p>
                    </div>
                    <History className="w-8 h-8 text-green-600 opacity-80" />
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      Istoric Complet
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50 to-background">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Cost/Minut</p>
                      <p className="text-2xl font-bold">${estimatedCostPerMinute.toFixed(2)}</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600 opacity-80" />
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                      Preț Fix
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Test Form */}
            <Card className="relative overflow-hidden border-2 border-primary/20 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-background opacity-50" />
              <CardHeader className="relative bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/10">
                <CardTitle className="flex items-center text-xl">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mr-3">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  Configurare Test Apel
                </CardTitle>
              </CardHeader>
              <CardContent className="relative p-8 space-y-8">
                {/* Agent Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <Label className="text-lg font-semibold">Selectează Agentul AI</Label>
                  </div>
                  <div className="pl-9">
                    <AgentSelector
                      selectedAgentId={agentId}
                      onAgentSelect={setAgentId}
                    />
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Alege agentul care va răspunde la apelul de test
                    </p>
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <Label className="text-lg font-semibold">Numărul Tău de Telefon</Label>
                  </div>
                  <div className="pl-9">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="phoneNumber" 
                        placeholder="+40712345678" 
                        value={phoneNumber} 
                        onChange={e => setPhoneNumber(e.target.value)} 
                        disabled={isLoading}
                        className="pl-10 h-12 text-lg border-2 focus:border-primary"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                      <Signal className="w-4 h-4" />
                      Vei primi apelul pe acest număr (format internațional)
                    </p>
                  </div>
                </div>

                {/* Balance Warning */}
                {hasInsufficientBalance && (
                  <Alert className="border-destructive/50 bg-destructive/10">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-destructive">
                      <strong>Sold insuficient!</strong> Ai nevoie de minim ${estimatedCostPerMinute.toFixed(2)} pentru un test call.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Admin Status */}
                {isAdmin && (
                  <Alert className="border-green-500/50 bg-green-50">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      <strong>Admin Access</strong> - Ai apeluri nelimitate disponibile
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Button */}
                <div className="pt-4">
                  <Button 
                    onClick={handleTestCall} 
                    disabled={isLoading || !agentId || !phoneNumber || hasInsufficientBalance} 
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Se inițiază apelul...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-5 h-5 mr-3" />
                        Inițiază Test Call Acum
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Conversation Display */}
            {conversationId && (
              <Card className="border-2 border-blue-200 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent border-b border-blue-100">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                      Conversația Live
                    </span>
                    <Button
                      onClick={() => fetchConversation()}
                      disabled={isLoadingConversation}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 hover:bg-blue-50"
                    >
                      {isLoadingConversation ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Actualizează
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <p className="text-sm text-muted-foreground mb-2">ID Conversație:</p>
                    <code className="bg-background px-3 py-2 rounded border text-sm font-mono">
                      {conversationId}
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    După finalizarea apelului, apasă "Actualizează" pentru a vedea transcriptul complet.
                  </p>
                </CardContent>
              </Card>
            )}

            {renderConversation()}
          </div>
          
          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <TestCallHistory
              history={history}
              onConversationDoubleClick={handleHistoryDoubleClick}
              onClearHistory={clearHistory}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TestCall;