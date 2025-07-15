import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, PlayCircle, Loader2, MessageSquare, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import TestCallHistory from '@/components/TestCallHistory';
import { useTestCallHistory } from '@/hooks/useTestCallHistory';
const TestCall = () => {
  const [agentId, setAgentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [conversation, setConversation] = useState(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { history, addToHistory, updateHistoryItem, clearHistory } = useTestCallHistory();
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
          batch_processing: false
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

  return <DashboardLayout>
      <div className="flex gap-6 p-6">
        <div className="flex-1 max-w-2xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">Test Call</h1>
                <p className="text-muted-foreground">
                  Testați un agent AI prin inițierea unui apel direct către numărul dvs. de telefon
                </p>
              </div>
            </div>
          </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Inițiază Test Call
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="agentId">ID Agent</Label>
              <Input id="agentId" placeholder="Introduceți ID-ul agentului ElevenLabs" value={agentId} onChange={e => setAgentId(e.target.value)} disabled={isLoading} />
              <p className="text-sm text-gray-500">
                ID-ul agentului din ElevenLabs pe care doriți să îl testați
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Numărul de telefon</Label>
              <Input id="phoneNumber" placeholder="+40712345678" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} disabled={isLoading} />
              <p className="text-sm text-gray-500">
                Numărul de telefon la care doriți să primiți apelul de test (format internațional)
              </p>
            </div>

            

            <Button onClick={handleTestCall} disabled={isLoading || !agentId || !phoneNumber} className="w-full" size="lg">
              {isLoading ? <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Se inițiază apelul...
                </> : <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Inițiază Apel de Test
                </>}
            </Button>
          </CardContent>
        </Card>

        {conversationId && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Conversația
                </span>
                <Button
                  onClick={() => fetchConversation()}
                  disabled={isLoadingConversation}
                  variant="outline"
                  size="sm"
                >
                  {isLoadingConversation ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Încarcă Conversația
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                ID Conversație: <code className="bg-gray-100 px-2 py-1 rounded">{conversationId}</code>
              </p>
              <p className="text-sm text-gray-500">
                După finalizarea apelului, apăsați "Încarcă Conversația" pentru a vedea dialogul.
              </p>
            </CardContent>
          </Card>
        )}

          {renderConversation()}
        </div>
        
        <div className="flex-shrink-0">
          <TestCallHistory
            history={history}
            onConversationDoubleClick={handleHistoryDoubleClick}
            onClearHistory={clearHistory}
          />
        </div>
      </div>
    </DashboardLayout>;
};
export default TestCall;