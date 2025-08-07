import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Phone, PlayCircle, Loader2, MessageSquare, RefreshCw, Wallet, AlertTriangle, Sparkles } from 'lucide-react';
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
        {/* Simple Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-light tracking-wide">Test Apel</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Testează agenții tăi AI cu apeluri reale
          </p>
        </div>

        {/* Main Content - Centered */}
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Balance Info - Simple */}
          <div className="text-center p-4 border rounded-lg bg-card/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sold disponibil</span>
            </div>
            <p className="text-2xl font-semibold">
              {isAdmin ? 'Nelimitat' : `$${userBalance.toFixed(2)}`}
            </p>
            {!isAdmin && (
              <p className="text-xs text-muted-foreground mt-1">
                {availableMinutes} minute disponibile
              </p>
            )}
          </div>

          {/* Test Form - Clean */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-6">
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Agent</Label>
                <AgentSelector
                  selectedAgentId={agentId}
                  onAgentSelect={setAgentId}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Telefon</Label>
                <Input
                  placeholder="+40712345678"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                  className="text-center"
                />
              </div>

              {hasInsufficientBalance && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Sold insuficient. Îți trebuie ${estimatedCostPerMinute.toFixed(2)} pentru test.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleTestCall}
                disabled={isLoading || !agentId || !phoneNumber || hasInsufficientBalance}
                className="w-full h-12"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Se pornește...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Începe Testul
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Active Call Status */}
          {conversationId && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">Apel activ</span>
                </div>
                <p className="text-xs font-mono text-green-700 mb-3">{conversationId}</p>
                <Button
                  onClick={() => fetchConversation()}
                  disabled={isLoadingConversation}
                  variant="outline"
                  size="sm"
                  className="w-full border-green-300 text-green-700 hover:bg-green-100"
                >
                  {isLoadingConversation ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Verifică Conversația
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Conversation Display - Simple */}
          {conversation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Conversația</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                {conversation.transcript?.length > 0 ? (
                  conversation.transcript.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        message.role === 'agent'
                          ? 'bg-primary/5 border-l-2 border-primary'
                          : 'bg-muted/50 border-l-2 border-muted'
                      }`}
                    >
                      <div className="font-medium text-xs mb-1 text-muted-foreground">
                        {message.role === 'agent' ? 'Agent' : 'Utilizator'}
                      </div>
                      <p>{message.content || message.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nu sunt mesaje disponibile încă...
                  </p>
                )}
                
                {conversation.status && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs space-y-1">
                    <p><span className="font-medium">Status:</span> {conversation.status}</p>
                    {conversation.duration_seconds && (
                      <p><span className="font-medium">Durată:</span> {conversation.duration_seconds}s</p>
                    )}
                    {conversation.cost && (
                      <p><span className="font-medium">Cost:</span> ${conversation.cost}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* History - Simple */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Istoric Recent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {history.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleHistoryDoubleClick(item.conversationId)}
                    className="p-3 rounded border cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.phoneNumber}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {item.cost && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Cost: ${item.cost.toFixed(2)}
                      </p>
                    )}
                  </div>
                ))}
                {history.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={clearHistory}
                  >
                    Vezi toate ({history.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TestCall;