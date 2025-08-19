import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, Search, Plus, Edit, Trash2, Activity, MessageSquare, Phone, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  elevenlabs_agent_id?: string;
  voice_id?: string;
  user_email?: string;
  user_name?: string;
  total_calls?: number;
  total_minutes?: number;
}

export function AgentManagement() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      if (!user) return;

      try {
        const { data: agentsData, error } = await supabase
          .from('kalina_agents')
          .select(`
            *,
            profiles!inner(first_name, last_name, email)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get call statistics for each agent
        const agentsWithStats = await Promise.all(
          (agentsData || []).map(async (agent) => {
            const { count: totalCalls } = await supabase
              .from('call_history')
              .select('*', { count: 'exact', head: true })
              .eq('agent_id', agent.agent_id);

            const { data: callDurations } = await supabase
              .from('call_history')
              .select('duration_seconds')
              .eq('agent_id', agent.agent_id);

            const totalMinutes = callDurations?.reduce((sum, call) => 
              sum + (call.duration_seconds || 0) / 60, 0
            ) || 0;

            return {
              ...agent,
              user_email: agent.profiles?.email,
              user_name: `${agent.profiles?.first_name || ''} ${agent.profiles?.last_name || ''}`.trim(),
              total_calls: totalCalls || 0,
              total_minutes: Math.round(totalMinutes)
            };
          })
        );

        setAgents(agentsWithStats);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [user]);

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditDialogOpen(true);
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Sigur doriți să ștergeți acest agent?')) return;

    try {
      const { error } = await supabase
        .from('kalina_agents')
        .delete()
        .eq('id', agentId);

      if (error) throw error;

      setAgents(agents.filter(a => a.id !== agentId));
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const handleToggleActive = async (agentId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('kalina_agents')
        .update({ is_active: !isActive })
        .eq('id', agentId);

      if (error) throw error;

      setAgents(agents.map(a => 
        a.id === agentId ? { ...a, is_active: !isActive } : a
      ));
    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  };

  if (loading) {
    return <div>Se încarcă agenții...</div>;
  }

  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.is_active).length;
  const totalCalls = agents.reduce((sum, a) => sum + (a.total_calls || 0), 0);
  const totalMinutes = agents.reduce((sum, a) => sum + (a.total_minutes || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestionare Agenți AI</h2>
          <p className="text-muted-foreground">
            Administrați toți agenții AI din platformă
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Căutare agenți..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agenți</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgents}</div>
            <p className="text-xs text-muted-foreground">Agenți înregistrați</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agenți Activi</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAgents}</div>
            <p className="text-xs text-muted-foreground">Din {totalAgents} totali</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Apeluri</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls}</div>
            <p className="text-xs text-muted-foreground">Apeluri efectuate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Minute</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMinutes}</div>
            <p className="text-xs text-muted-foreground">Minute conversație</p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agenți AI ({filteredAgents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Proprietar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Statistici</TableHead>
                <TableHead>Creat</TableHead>
                <TableHead>Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {agent.description || 'Fără descriere'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{agent.user_name || 'Necunoscut'}</div>
                      <div className="text-sm text-muted-foreground">{agent.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={agent.is_active ? "success" : "secondary"}>
                      {agent.is_active ? 'Activ' : 'Inactiv'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{agent.total_calls || 0} apeluri</div>
                      <div className="text-muted-foreground">{agent.total_minutes || 0} minute</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(agent.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAgent(agent)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(agent.id, agent.is_active)}
                      >
                        <Activity className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAgent(agent.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Agent Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editare Agent: {selectedAgent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nume Agent</label>
              <Input value={selectedAgent?.name || ''} readOnly />
            </div>
            <div>
              <label className="text-sm font-medium">Descriere</label>
              <Textarea value={selectedAgent?.description || ''} readOnly />
            </div>
            <div>
              <label className="text-sm font-medium">System Prompt</label>
              <Textarea 
                value={selectedAgent?.system_prompt || ''} 
                readOnly 
                className="min-h-32"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Voice ID</label>
              <Input value={selectedAgent?.voice_id || ''} readOnly />
            </div>
            <div>
              <label className="text-sm font-medium">ElevenLabs Agent ID</label>
              <Input value={selectedAgent?.elevenlabs_agent_id || 'Nu este setat'} readOnly />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}