
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Plus, Copy, Settings, Code, Play, TestTube, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from '@/components/ui/use-toast';

interface ElevenLabsAgent {
  agent_id: string;
  name: string;
  conversation_config: {
    language_presets: Record<string, any>;
  };
  platform_settings: Record<string, any>;
  created_at?: string;
}

const KalinaAgents = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<ElevenLabsAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: 'romanian'
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchAgents();
  }, [user]);

  const fetchAgents = async () => {
    try {
      // Pentru moment vom simula date până când implementăm API-ul de listare
      setAgents([]);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut încărca agenții. Încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Eroare",
        description: "Numele agentului este obligatoriu.",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
        method: "POST",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "conversation_config": {
            "language_presets": {}
          },
          "name": formData.name,
          "platform_settings": {}
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const body = await response.json();
      console.log('Agent created:', body);

      toast({
        title: "Succes!",
        description: `Agentul "${formData.name}" a fost creat cu succes în ElevenLabs.`
      });

      setFormData({
        name: '',
        description: '',
        language: 'romanian'
      });
      setShowCreateForm(false);
      
      // Adăugăm agentul nou în lista locală
      setAgents(prev => [...prev, body]);
      
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut crea agentul în ElevenLabs. Verifică API key-ul.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const copyEmbedCode = (agentId: string, agentName: string) => {
    const embedCode = `<!-- ElevenLabs Widget pentru ${agentName} -->
<elevenlabs-convai agent-id="${agentId}"></elevenlabs-convai>
<script src="https://elevenlabs.io/convai-widget/index.js" async type="text/javascript"></script>`;

    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Cod copiat!",
      description: `Codul pentru ${agentName} a fost copiat în clipboard.`
    });
  };

  const createDemoAgent = async () => {
    setCreating(true);
    try {
      const response = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
        method: "POST",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "conversation_config": {
            "language_presets": {}
          },
          "name": "Demo Assistant",
          "platform_settings": {}
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const body = await response.json();
      console.log('Demo agent created:', body);
      
      toast({
        title: "Agent demo creat!",
        description: "Agentul demonstrativ a fost creat în ElevenLabs."
      });
      
      setAgents(prev => [...prev, body]);
      
    } catch (error) {
      console.error('Error creating demo agent:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut crea agentul demo.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">ElevenLabs Agents</h1>
            <p className="text-gray-600">Creează și gestionează agenții tăi AI folosind ElevenLabs API</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={createDemoAgent}
              variant="outline"
              disabled={creating}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4 mr-2" />
              )}
              Agent Demo
            </Button>
            <Button 
              onClick={() => setShowCreateForm(true)}
              disabled={creating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agent Nou
            </Button>
          </div>
        </div>

        {/* Create Agent Form */}
        {showCreateForm && (
          <Card className="mb-8 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Creează Agent ElevenLabs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume Agent *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="ex: Customer Support Assistant"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descriere
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descrie rolul și funcționalitatea agentului..."
                  rows={3}
                  className="w-full"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={createAgent} 
                  disabled={creating}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creez Agent...
                    </>
                  ) : (
                    'Creează Agent'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  Anulează
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agents List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <Card key={agent.agent_id} className="border-gray-200 hover:border-purple-300 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bot className="w-8 h-8 text-purple-600 mr-3" />
                    <div>
                      <CardTitle className="text-lg text-black">{agent.name}</CardTitle>
                      <p className="text-sm text-gray-600">ElevenLabs Agent</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">Agent ID:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(agent.agent_id);
                          toast({ title: "Agent ID copiat!" });
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <code className="text-xs text-gray-600 break-all">{agent.agent_id}</code>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-800 flex items-center">
                        <Code className="w-4 h-4 mr-1" />
                        Cod de Integrare
                      </span>
                      <Button
                        size="sm"
                        onClick={() => copyEmbedCode(agent.agent_id, agent.name)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copiază
                      </Button>
                    </div>
                    <div className="bg-white p-2 rounded border text-xs font-mono text-gray-600 overflow-x-auto">
{`<!-- ElevenLabs Widget pentru ${agent.name} -->
<elevenlabs-convai agent-id="${agent.agent_id}"></elevenlabs-convai>
<script src="https://elevenlabs.io/convai-widget/index.js" async type="text/javascript"></script>`}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Provider: ElevenLabs</span>
                    <span>Status: Activ</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {agents.length === 0 && !loading && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Niciun agent creat încă
            </h3>
            <p className="text-gray-600 mb-4">
              Creează primul tău agent ElevenLabs pentru conversații AI avansate.
            </p>
            <div className="flex justify-center gap-3">
              <Button 
                onClick={createDemoAgent}
                variant="outline"
                disabled={creating}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4 mr-2" />
                )}
                Creează Agent Demo
              </Button>
              <Button 
                onClick={() => setShowCreateForm(true)}
                disabled={creating}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Creează Primul Agent
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default KalinaAgents;
