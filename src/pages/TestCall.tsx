import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, PlayCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
const TestCall = () => {
  const [agentId, setAgentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
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
  return <DashboardLayout>
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Call</h1>
          <p className="text-gray-600">
            Testați un agent AI prin inițierea unui apel direct către numărul dvs. de telefon
          </p>
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

        
      </div>
    </DashboardLayout>;
};
export default TestCall;