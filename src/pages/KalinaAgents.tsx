import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Plus, Copy, Settings, Code, Play, TestTube } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface KalinaAgent {
  id: string;
  agent_id: string;
  name: string;
  description: string | null;
  system_prompt: string | null;
  voice_id: string | null;
  provider: string | null;
  elevenlabs_agent_id?: string | null;
  created_at: string;
}

const KalinaAgents = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<KalinaAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    voice_id: '21m00Tcm4TlvDq8ikWAM',
    provider: 'custom' as 'custom' | 'elevenlabs'
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchAgents();
  }, [user]);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('kalina_agents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
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

    try {
      const agentId = `kalina_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error } = await supabase
        .from('kalina_agents')
        .insert([{
          agent_id: agentId,
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          system_prompt: formData.system_prompt || `Tu ești ${formData.name}, un asistent AI prietenos și util. Răspunde în română într-un mod profesional și empatic.`,
          voice_id: formData.voice_id,
          provider: formData.provider
        }]);

      if (error) throw error;

      toast({
        title: "Succes!",
        description: `Agentul "${formData.name}" a fost creat cu succes.`
      });

      setFormData({
        name: '',
        description: '',
        system_prompt: '',
        voice_id: '21m00Tcm4TlvDq8ikWAM',
        provider: 'custom'
      });
      setShowCreateForm(false);
      fetchAgents();
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut crea agentul. Încearcă din nou.",
        variant: "destructive"
      });
    }
  };

  const copyEmbedCode = (agentId: string, agentName: string) => {
    const embedCode = `<!-- Kalina AI Widget pentru ${agentName} -->
<kalina-chat-widget agent-id="${agentId}"></kalina-chat-widget>
<script src="https://pwfczzxwjfxomqzhhwvj.supabase.co/storage/v1/object/public/widgets/kalina-widget.js" async defer></script>`;

    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Cod copiat!",
      description: `Codul pentru ${agentName} a fost copiat în clipboard.`
    });
  };

  const createTestAgent = async () => {
    try {
      const testAgentId = `kalina_demo_${Date.now()}`;
      
      const { error } = await supabase
        .from('kalina_agents')
        .insert([{
          agent_id: testAgentId,
          user_id: user.id,
          name: 'Demo Kalina',
          description: 'Agent demonstrativ pentru testare',
          system_prompt: 'Tu ești Demo Kalina, un asistent AI demonstrativ. Ești foarte prietenos și răspunzi în română. Explici că ești o demonstrație a tehnologiei Kalina AI și îți place să ajuți utilizatorii să înțeleagă cum funcționezi.',
          voice_id: '21m00Tcm4TlvDq8ikWAM',
          provider: 'custom'
        }]);

      if (error) throw error;
      
      toast({
        title: "Agent demo creat!",
        description: "Agentul demonstrativ a fost adăugat în lista ta."
      });
      
      fetchAgents();
    } catch (error) {
      console.error('Error creating test agent:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut crea agentul demo.",
        variant: "destructive"
      });
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
            <h1 className="text-3xl font-bold text-black mb-2">Kalina AI Agents</h1>
            <p className="text-gray-600">Creează și gestionează agenții tăi AI conversaționali</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={createTestAgent}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Agent Demo
            </Button>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agent Nou
            </Button>
          </div>
        </div>

        {/* Demo Section */}
        {agents.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Demo Live Widget
              </CardTitle>
              <p className="text-blue-600 text-sm">
                Testează widget-ul direct aici! Folosește primul agent din lista ta.
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-6 rounded-lg border border-blue-200 relative min-h-[200px]">
                <p className="text-gray-700 mb-4">
                  Aceasta este o simulare a unei pagini web. Widget-ul Kalina va apărea în colțul din dreapta jos.
                </p>
                <div className="text-sm text-gray-500">
                  <code>Agent ID în folosire: {agents[0]?.agent_id}</code>
                </div>
                
                {/* Widget Integration */}
                <div 
                  dangerouslySetInnerHTML={{
                    __html: `
                      <kalina-chat-widget agent-id="${agents[0]?.agent_id}"></kalina-chat-widget>
                      <script>
                        if (!window.kalinaWidgetLoaded) {
                          const script = document.createElement('script');
                          script.src = 'https://pwfczzxwjfxomqzhhwvj.supabase.co/storage/v1/object/public/widgets/kalina-widget.js';
                          script.async = true;
                          script.defer = true;
                          document.head.appendChild(script);
                          window.kalinaWidgetLoaded = true;
                        }
                      </script>
                    `
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Agent Form */}
        {showCreateForm && (
          <Card className="mb-8 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Creează Agent Nou</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume Agent *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="ex: Kalina Assistant"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descriere
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="ex: Asistent pentru customer support"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Prompt (opțional)
                </label>
                <Textarea
                  value={formData.system_prompt}
                  onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
                  placeholder="Definește personalitatea și comportamentul agentului..."
                  rows={3}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice ID (ElevenLabs)
                </label>
                <Input
                  value={formData.voice_id}
                  onChange={(e) => setFormData({...formData, voice_id: e.target.value})}
                  placeholder="21m00Tcm4TlvDq8ikWAM"
                  className="w-full"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button onClick={createAgent} className="bg-purple-600 hover:bg-purple-700">
                  Creează Agent
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
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
            <Card key={agent.id} className="border-gray-200 hover:border-purple-300 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bot className="w-8 h-8 text-purple-600 mr-3" />
                    <div>
                      <CardTitle className="text-lg text-black">{agent.name}</CardTitle>
                      <p className="text-sm text-gray-600">{agent.description}</p>
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
{`<!-- Kalina AI Widget pentru ${agent.name} -->
<kalina-chat-widget agent-id="${agent.agent_id}"></kalina-chat-widget>
<script src="https://pwfczzxwjfxomqzhhwvj.supabase.co/storage/v1/object/public/widgets/kalina-widget.js" async defer></script>`}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Provider: {agent.provider}</span>
                    <span>Creat: {new Date(agent.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {agents.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Niciun agent creat încă
            </h3>
            <p className="text-gray-600 mb-4">
              Creează primul tău agent Kalina AI pentru a începe să oferi asistență conversațională pe site-urile tale.
            </p>
            <div className="flex justify-center gap-3">
              <Button 
                onClick={createTestAgent}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Creează Agent Demo
              </Button>
              <Button 
                onClick={() => setShowCreateForm(true)}
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
