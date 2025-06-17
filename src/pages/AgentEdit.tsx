import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Bot, Save, Copy } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { toast } from '@/components/ui/use-toast';
import { API_CONFIG } from '@/constants/constants';
const AgentEdit = () => {
  const {
    agentId
  } = useParams<{
    agentId: string;
  }>();
  const navigate = useNavigate();
  const {
    copyToClipboard
  } = useClipboard();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agentData, setAgentData] = useState<any>(null);
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!agentId) return;
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
          method: 'GET',
          headers: {
            'Xi-Api-Key': API_CONFIG.ELEVENLABS_API_KEY
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAgentData(data);
        } else {
          toast({
            title: "Eroare",
            description: "Nu s-a putut încărca informațiile agentului",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching agent:', error);
        toast({
          title: "Eroare",
          description: "A apărut o eroare la încărcarea agentului",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgentData();
  }, [agentId]);
  const handleSave = async () => {
    if (!agentId || !agentData) return;
    setIsSaving(true);
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        method: 'PATCH',
        headers: {
          'Xi-Api-Key': API_CONFIG.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: agentData.name,
          conversation_config: agentData.conversation_config
        })
      });
      if (response.ok) {
        toast({
          title: "Succes!",
          description: "Agentul a fost salvat cu succes"
        });
      } else {
        throw new Error('Failed to save agent');
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva agentul",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) {
    return <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-muted-foreground">Se încarcă agentul...</div>
          </div>
        </div>
      </DashboardLayout>;
  }
  if (!agentData) {
    return <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-muted-foreground">Agentul nu a fost găsit</div>
          </div>
        </div>
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/account/kalina-agents')} className="glass-button border-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Editare Agent</h1>
              <p className="text-muted-foreground">Modifică setările agentului tău AI</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="text-foreground">Informații Generale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="agent-name" className="text-foreground">Numele Agentului</Label>
                <Input id="agent-name" value={agentData.name || ''} onChange={e => setAgentData({
                ...agentData,
                name: e.target.value
              })} className="glass-input" />
              </div>

              <div>
                <Label className="text-foreground">Agent ID</Label>
                <div className="flex items-center gap-2">
                  <Input value={agentData.agent_id || ''} readOnly className="glass-input bg-muted/50" />
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(agentData.agent_id)} className="glass-button border-border">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="voice-id" className="text-foreground">Voice ID</Label>
                <Input id="voice-id" value={agentData.conversation_config?.tts?.voice_id || ''} onChange={e => setAgentData({
                ...agentData,
                conversation_config: {
                  ...agentData.conversation_config,
                  tts: {
                    ...agentData.conversation_config?.tts,
                    voice_id: e.target.value
                  }
                }
              })} className="glass-input" />
              </div>

              <div>
                <Label htmlFor="language" className="text-foreground">Limba</Label>
                <Input id="language" value={agentData.conversation_config?.agent?.language || ''} onChange={e => setAgentData({
                ...agentData,
                conversation_config: {
                  ...agentData.conversation_config,
                  agent: {
                    ...agentData.conversation_config?.agent,
                    language: e.target.value
                  }
                }
              })} className="glass-input" />
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="text-foreground">Prompt Sistem</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="system-prompt" className="text-foreground">Prompt</Label>
                <Textarea id="system-prompt" value={agentData.conversation_config?.agent?.prompt?.prompt || ''} onChange={e => setAgentData({
                ...agentData,
                conversation_config: {
                  ...agentData.conversation_config,
                  agent: {
                    ...agentData.conversation_config?.agent,
                    prompt: {
                      ...agentData.conversation_config?.agent?.prompt,
                      prompt: e.target.value
                    }
                  }
                }
              })} className="glass-input min-h-[300px]" placeholder="Introdu prompt-ul pentru agent..." />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/account/kalina-agents')} className="glass-button border-border mx-[20px] py-[14px] my-[25px]">
            Anulează
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-white hover:bg-accent/90">
            {isSaving ? <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Se salvează...
              </> : <>
                <Save className="w-4 h-4 mr-2" />
                Salvează
              </>}
          </Button>
        </div>
      </div>
    </DashboardLayout>;
};
export default AgentEdit;