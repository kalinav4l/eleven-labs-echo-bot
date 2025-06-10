
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, MoreHorizontal, Trash2, X, Settings, Play, Calculator } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface KalinaAgent {
  id: string;
  agent_id: string;
  elevenlabs_agent_id: string;
  name: string;
  description?: string;
  created_at: string;
  user_id: string;
}

const KalinaAgents = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<KalinaAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<KalinaAgent | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [agentName, setAgentName] = useState('');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchAgents();
  }, [user]);

  const fetchAgents = async () => {
    try {
      // Încărcăm agenții din Supabase pentru utilizatorul curent
      const { data: supabaseAgents, error } = await supabase
        .from('kalina_agents')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching agents from Supabase:', error);
        setAgents([]);
      } else {
        setAgents(supabaseAgents || []);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async () => {
    if (!agentName.trim()) {
      toast({
        title: "Eroare",
        description: "Numele agentului este obligatoriu.",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      // Creăm agentul în ElevenLabs
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
          "name": agentName,
          "platform_settings": {}
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const elevenlabsAgent = await response.json();
      console.log('ElevenLabs agent created:', elevenlabsAgent);

      // Salvăm agentul în Supabase
      const { data: supabaseAgent, error: supabaseError } = await supabase
        .from('kalina_agents')
        .insert({
          agent_id: `agent_${Date.now()}`,
          elevenlabs_agent_id: elevenlabsAgent.agent_id,
          name: agentName,
          description: 'Agent conversational creat cu ElevenLabs',
          user_id: user.id
        })
        .select()
        .single();

      if (supabaseError) {
        console.error('Error saving agent to Supabase:', supabaseError);
        throw new Error('Nu am putut salva agentul în baza de date');
      }

      toast({
        title: "Succes!",
        description: `Agentul "${agentName}" a fost creat cu succes.`
      });

      setAgentName('');
      setShowCreateModal(false);
      fetchAgents();
      
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut crea agentul.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const updateAgent = async () => {
    if (!selectedAgent || !agentName.trim()) {
      return;
    }

    setUpdating(true);
    try {
      // Actualizăm agentul în ElevenLabs
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${selectedAgent.elevenlabs_agent_id}`, {
        method: "PATCH",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "platform_settings": {},
          "name": agentName,
          "tags": [],
          "conversation_config": {}
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Actualizăm agentul în Supabase
      const { error: supabaseError } = await supabase
        .from('kalina_agents')
        .update({ name: agentName })
        .eq('id', selectedAgent.id);

      if (supabaseError) {
        console.error('Error updating agent in Supabase:', supabaseError);
        throw new Error('Nu am putut actualiza agentul în baza de date');
      }

      toast({
        title: "Succes!",
        description: `Agentul a fost actualizat cu succes.`
      });

      setShowEditModal(false);
      setSelectedAgent(null);
      setAgentName('');
      fetchAgents();
      
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut actualiza agentul.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const deleteAgent = async (agent: KalinaAgent) => {
    setDeleting(agent.id);
    try {
      // Ștergem agentul din ElevenLabs
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agent.elevenlabs_agent_id}`, {
        method: "DELETE",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873"
        },
      });

      if (response.ok) {
        // Ștergem agentul din Supabase
        const { error: supabaseError } = await supabase
          .from('kalina_agents')
          .delete()
          .eq('id', agent.id);

        if (supabaseError) {
          console.error('Error deleting agent from Supabase:', supabaseError);
          throw new Error('Nu am putut șterge agentul din baza de date');
        }

        toast({
          title: "Succes!",
          description: "Agentul a fost șters cu succes."
        });
        fetchAgents();
      } else {
        throw new Error('Failed to delete agent from ElevenLabs');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut șterge agentul.",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  const simulateConversation = async (elevenlabsAgentId: string) => {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${elevenlabsAgentId}/simulate-conversation`, {
        method: "POST",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({}),
      });

      const body = await response.json();
      console.log('Conversation simulation:', body);
      
      toast({
        title: "Simulare pornită",
        description: "Conversația a fost simulată cu succes."
      });
    } catch (error) {
      console.error('Error simulating conversation:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut simula conversația.",
        variant: "destructive"
      });
    }
  };

  const calculateLLMUsage = async (elevenlabsAgentId: string) => {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agent/${elevenlabsAgentId}/llm-usage/calculate`, {
        method: "POST",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({}),
      });

      const body = await response.json();
      console.log('LLM usage calculation:', body);
      
      toast({
        title: "Calcul finalizat",
        description: "Utilizarea LLM a fost calculată."
      });
    } catch (error) {
      console.error('Error calculating LLM usage:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut calcula utilizarea LLM.",
        variant: "destructive"
      });
    }
  };

  const handleEditAgent = (agent: KalinaAgent) => {
    setSelectedAgent(agent);
    setAgentName(agent.name);
    setShowEditModal(true);
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Agents</h1>
            <p className="text-gray-600">Create and manage your AI agents</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Playground
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New agent
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>

        {/* Creator Filter */}
        <div className="mb-6">
          <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
            <Plus className="w-4 h-4 mr-2" />
            Creator
          </Button>
        </div>

        {/* Agents Table */}
        <div className="border border-gray-200 rounded-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="text-gray-700 font-medium">Name</TableHead>
                <TableHead className="text-gray-700 font-medium">Created by</TableHead>
                <TableHead className="text-gray-700 font-medium">Created at</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <TableCell 
                    className="font-medium text-black cursor-pointer hover:text-blue-600"
                    onClick={() => handleEditAgent(agent)}
                  >
                    {agent.name}
                  </TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell className="text-gray-600">{formatDate(agent.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => simulateConversation(agent.elevenlabs_agent_id)}
                        className="text-gray-600 hover:text-green-600 hover:bg-green-50"
                        title="Simulate Conversation"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => calculateLLMUsage(agent.elevenlabs_agent_id)}
                        className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        title="Calculate LLM Usage"
                      >
                        <Calculator className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAgent(agent)}
                        className="text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
                        title="Edit Agent"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAgent(agent)}
                        disabled={deleting === agent.id}
                        className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                        title="Delete Agent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAgents.length === 0 && !loading && (
            <div className="p-8 text-center">
              <p className="text-gray-500">No agents found</p>
            </div>
          )}
        </div>

        {/* Create Agent Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">Create an AI agent</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  AI Agent name
                </label>
                <Input
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Customer support agent"
                  className="w-full border-gray-300"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createAgent}
                  disabled={creating || !agentName.trim()}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {creating ? 'Creating...' : 'Create agent'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Agent Modal */}
        {showEditModal && selectedAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">Edit AI agent</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  AI Agent name
                </label>
                <Input
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Customer support agent"
                  className="w-full border-gray-300"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={updating}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={updateAgent}
                  disabled={updating || !agentName.trim()}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {updating ? 'Updating...' : 'Update agent'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default KalinaAgents;
