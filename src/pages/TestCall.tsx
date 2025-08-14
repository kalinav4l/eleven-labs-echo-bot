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
// Temporarily removing TestCallHistory to fix module loading issue
// import TestCallHistory from '@/components/TestCallHistory';
// import { useTestCallHistory } from '@/hooks/useTestCallHistory';
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
  // Temporarily removing test call history to fix module loading issue
  // const { history, addToHistory, updateHistoryItem, clearHistory } = useTestCallHistory();

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
          is_test_call: true,
          caller_number: 'phnum_01jz5v97bgfmdsvyy3hb095k3c' // Always use moldcel number
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
          title: "✅ Apel inițiat cu succes!",
          description: `Apelul a fost pornit către ${phoneNumber}. Se va conecta în câteva secunde.`,
          duration: 5000
        });

        // Store conversation ID for later retrieval
        setConversationId(data.conversationId);
        
        // Temporarily disabled history feature
        // addToHistory({
        //   conversationId: data.conversationId,
        //   agentId,
        //   phoneNumber,
        // });
        
        // Clear form after successful call
        setAgentId('');
        setPhoneNumber('');
        
        // Refresh balance after call
        fetchBalance();
      } else {
        toast({
          title: "❌ Apelul nu a putut fi inițiat",
          description: data?.error || "A apărut o eroare necunoscută. Încearcă din nou.",
          variant: "destructive",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Test call error:', error);
      toast({
        title: "❌ Eroare la conectare",
        description: "Nu s-a putut conecta la serviciul de apeluri. Verifică conexiunea internet.",
        variant: "destructive",
        duration: 5000
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
      
      // Temporarily disabled history feature
      // if (data.cost) {
      //   updateHistoryItem(idToFetch, { cost: parseFloat(data.cost) });
      // }
      
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
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          
          {/* Main Card */}
          <Card className="bg-white border shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8 space-y-6">
              
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Test Apel
                  </h1>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {isAdmin ? (
                      <Badge className="bg-green-500 text-white border-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Apeluri nelimitate
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-50 border-blue-200">
                        <Wallet className="w-3 h-3 mr-1" />
                        ${userBalance.toFixed(2)} disponibili
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Selectează agentul</Label>
                  <AgentSelector
                    selectedAgentId={agentId}
                    onAgentSelect={setAgentId}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Numărul de telefon</Label>
                  <Input
                    placeholder="Ex: +40 123 456 789"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                    className="text-center text-lg py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {hasInsufficientBalance && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      Sold insuficient pentru a efectua apelul. Necesită cel puțin ${estimatedCostPerMinute.toFixed(2)}.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleTestCall}
                  disabled={isLoading || !agentId || !phoneNumber || hasInsufficientBalance}
                  className="w-full h-12 text-lg font-semibold rounded-xl bg-gray-800 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Se pornește...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Inițiază Test
                    </>
                  )}
                </Button>
              </div>

              {/* Balance Info */}
              {!isAdmin && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Minute disponibile:</span>
                    <span className="font-semibold text-blue-700">{availableMinutes} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Cost estimat/min:</span>
                    <span className="font-semibold text-blue-700">${estimatedCostPerMinute.toFixed(2)}</span>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TestCall;