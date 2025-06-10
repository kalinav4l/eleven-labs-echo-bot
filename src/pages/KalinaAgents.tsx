
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, MoreHorizontal, Trash2, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from '@/components/ui/use-toast';

interface ElevenLabsAgent {
  agent_id: string;
  name: string;
  conversation_config?: {
    language_presets: Record<string, any>;
  };
  platform_settings?: Record<string, any>;
  created_at?: string;
}

const KalinaAgents = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<ElevenLabsAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
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
      const response = await fetch("https://api.elevenlabs.io/v1/convai/agents", {
        method: "GET",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
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

      const body = await response.json();
      console.log('Agent created:', body);

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

  const deleteAgent = async (agentId: string) => {
    setDeleting(agentId);
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        method: "DELETE",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873"
        },
      });

      if (response.ok) {
        toast({
          title: "Succes!",
          description: "Agentul a fost șters cu succes."
        });
        fetchAgents();
      } else {
        throw new Error('Failed to delete agent');
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

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
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
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.agent_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <TableCell className="font-medium text-black">{agent.name}</TableCell>
                  <TableCell className="text-gray-600">Mega Promoting</TableCell>
                  <TableCell className="text-gray-600">{formatDate(agent.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAgent(agent.agent_id)}
                        disabled={deleting === agent.agent_id}
                        className="text-gray-600 hover:text-red-600 hover:bg-red-50"
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
      </div>
    </DashboardLayout>
  );
};

export default KalinaAgents;
