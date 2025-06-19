
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Phone, Upload, Download, Play, Pause, MoreHorizontal, Search, Filter, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useUserAgents } from '@/hooks/useUserAgents';
import { toast } from '@/components/ui/use-toast';

const Outbound = () => {
  const { user } = useAuth();
  const { callHistory, isLoading: callHistoryLoading, saveCallResults } = useCallHistory();
  const { data: userAgents, isLoading: agentsLoading } = useUserAgents();
  const [selectedAgent, setSelectedAgent] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [isInitiating, setIsInitiating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleInitiateCalls = async () => {
    if (!selectedAgent || !phoneNumbers.trim()) {
      toast({
        title: "Eroare",
        description: "Selectează un agent și adaugă numere de telefon",
        variant: "destructive"
      });
      return;
    }

    setIsInitiating(true);
    try {
      // Simulate call initiation - in real implementation this would call an API
      const numbers = phoneNumbers.split('\n').filter(num => num.trim());
      toast({
        title: "Apeluri inițiate",
        description: `S-au inițiat ${numbers.length} apeluri cu agentul selectat`
      });
      
      // Clear form
      setPhoneNumbers('');
      setSelectedAgent('');
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu s-au putut iniția apelurile",
        variant: "destructive"
      });
    } finally {
      setIsInitiating(false);
    }
  };

  const filteredCallHistory = callHistory?.filter(call => 
    call.phone_number.includes(searchQuery) ||
    call.contact_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (callHistoryLoading || agentsLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-muted-foreground">Se încarcă datele...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Apeluri Outbound</h1>
            <p className="text-muted-foreground">Inițiază apeluri automate cu agenții tăi AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Call Initiation */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Inițiere Apeluri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-muted-foreground text-sm mb-2">Selectează Agent</label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Alege agentul pentru apeluri" />
                  </SelectTrigger>
                  <SelectContent>
                    {userAgents && userAgents.length > 0 ? (
                      userAgents
                        .filter(agent => agent.is_active)
                        .map((agent) => (
                          <SelectItem key={agent.id} value={agent.agent_id}>
                            {agent.name}
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="no-agents" disabled>
                        Nu ai agenți activi
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-muted-foreground text-sm mb-2">
                  Numere de Telefon (câte unul pe linie)
                </label>
                <Textarea
                  placeholder="0721234567&#10;0731234567&#10;0741234567"
                  value={phoneNumbers}
                  onChange={(e) => setPhoneNumbers(e.target.value)}
                  className="glass-input min-h-[120px]"
                />
              </div>

              <Button 
                onClick={handleInitiateCalls}
                disabled={isInitiating || !selectedAgent || !phoneNumbers.trim()}
                className="w-full glass-button"
              >
                {isInitiating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Se inițiază apelurile...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Inițiază Apeluri
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Campaign Statistics */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="text-foreground">Statistici Campanii</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-accent/10">
                  <div className="text-2xl font-bold text-foreground">{callHistory?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Apeluri</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-100">
                  <div className="text-2xl font-bold text-foreground">
                    {callHistory?.filter(call => call.call_status === 'success').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Apeluri Reușite</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-100">
                  <div className="text-2xl font-bold text-foreground">
                    {callHistory?.filter(call => call.call_status === 'failed').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Apeluri Eșuate</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-100">
                  <div className="text-2xl font-bold text-foreground">
                    ${callHistory?.reduce((sum, call) => sum + (call.cost_usd || 0), 0).toFixed(2) || '0.00'}
                  </div>
                  <div className="text-sm text-muted-foreground">Cost Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call History */}
        <Card className="liquid-glass">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-foreground">Istoric Apeluri</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Caută număr sau nume..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glass-input w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCallHistory.length > 0 ? (
              <div className="space-y-4">
                {filteredCallHistory.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-foreground">{call.contact_name}</div>
                        <div className="text-sm text-muted-foreground">{call.phone_number}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge variant={call.call_status === 'success' ? 'default' : 'destructive'}>
                        {call.call_status === 'success' ? 'Reușit' : 
                         call.call_status === 'failed' ? 'Eșuat' : 
                         call.call_status === 'busy' ? 'Ocupat' : 
                         call.call_status === 'no-answer' ? 'Fără răspuns' : 'Necunoscut'}
                      </Badge>
                      
                      <div className="text-sm text-muted-foreground">
                        {call.call_date}
                      </div>
                      
                      <div className="text-sm font-medium text-foreground">
                        ${call.cost_usd.toFixed(4)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchQuery ? 'Niciun apel găsit' : 'Nu ai încă istoric de apeluri'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Încearcă o căutare diferită' : 'Inițiază primul tău apel outbound'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Outbound;
