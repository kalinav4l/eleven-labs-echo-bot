import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';

const Textarea = ({ value, onChange, placeholder, className = '' }: { value?: string; onChange?: any; placeholder?: string; className?: string }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

interface AdminUserRow {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  account_type: string;
  user_role: 'admin' | 'moderator' | 'user';
  balance_usd: number;
  total_calls: number;
  total_minutes: number;
  total_spent_usd: number;
  plan: string;
  created_at: string;
  last_sign_in: string | null;
}

interface AgentRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  system_prompt: string | null;
  voice_id: string | null;
  is_active: boolean;
  provider: string | null;
  elevenlabs_agent_id: string | null;
  agent_id: string | null;
  created_at: string;
  updated_at: string;
}

export function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();

  const [userRow, setUserRow] = useState<AdminUserRow | null>(null);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [editAgent, setEditAgent] = useState<AgentRow | null>(null);
  const [form, setForm] = useState({
    name: '',
    voice_id: '',
    description: '',
    system_prompt: ''
  });

  const canSubmit = useMemo(() => !!form.name && !!form.voice_id, [form]);

  const fetchData = async () => {
    if (!adminUser || !id) return;
    setLoading(true);
    try {
      const [{ data: userData, error: userErr }, { data: agentsData, error: agentsErr }] = await Promise.all([
        supabase.rpc('admin_get_user_by_id', { p_admin_user_id: adminUser.id, p_target_user_id: id }),
        supabase.rpc('admin_get_user_agents', { p_admin_user_id: adminUser.id, p_target_user_id: id }),
      ]);
      if (userErr) throw userErr;
      if (agentsErr) throw agentsErr;
      setUserRow(userData?.[0] || null);
      setAgents(agentsData || []);
    } catch (e) {
      console.error('Failed to load user details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminUser, id]);

  const openCreate = () => {
    setEditAgent(null);
    setForm({ name: '', voice_id: '', description: '', system_prompt: '' });
    setAgentDialogOpen(true);
  };

  const openEdit = (agent: AgentRow) => {
    setEditAgent(agent);
    setForm({
      name: agent.name || '',
      voice_id: agent.voice_id || '',
      description: agent.description || '',
      system_prompt: agent.system_prompt || ''
    });
    setAgentDialogOpen(true);
  };

  const handleSaveAgent = async () => {
    if (!adminUser || !id) return;
    try {
      if (editAgent) {
        const { error } = await supabase.rpc('admin_update_agent', {
          p_admin_user_id: adminUser.id,
          p_agent_row_id: editAgent.id,
          p_name: form.name,
          p_voice_id: form.voice_id,
          p_description: form.description || null,
          p_system_prompt: form.system_prompt || null,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('admin_create_agent', {
          p_admin_user_id: adminUser.id,
          p_target_user_id: id,
          p_name: form.name,
          p_voice_id: form.voice_id,
          p_description: form.description || null,
          p_system_prompt: form.system_prompt || null,
        });
        if (error) throw error;
      }
      setAgentDialogOpen(false);
      fetchData();
    } catch (e) {
      console.error('Failed to save agent:', e);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!adminUser) return;
    try {
      const { error } = await supabase.rpc('admin_delete_agent', {
        p_admin_user_id: adminUser.id,
        p_agent_row_id: agentId,
      });
      if (error) throw error;
      fetchData();
    } catch (e) {
      console.error('Failed to delete agent:', e);
    }
  };

  if (loading) {
    return <div>Se încarcă detaliile utilizatorului...</div>;
  }

  if (!userRow) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Înapoi
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Utilizator inexistent</CardTitle>
          </CardHeader>
          <CardContent>
            Nu am putut încărca datele utilizatorului solicitat.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detalii utilizator</h2>
          <p className="text-muted-foreground">Gestionați profilul și agenții utilizatorului</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Înapoi
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="font-medium">
              {userRow.first_name} {userRow.last_name}
            </div>
            <div className="text-sm text-muted-foreground">{userRow.email}</div>
            <div className="flex gap-2 pt-2">
              <Badge variant="secondary" className="capitalize">{userRow.user_role}</Badge>
              <Badge variant="outline" className="capitalize">{userRow.account_type}</Badge>
              <Badge variant="outline">Plan: {userRow.plan}</Badge>
            </div>
            <div className="pt-2 text-sm">
              Sold: ${userRow.balance_usd?.toFixed(2)} · Apeluri: {userRow.total_calls} · Minute: {userRow.total_minutes?.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Agenți</CardTitle>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Adaugă agent
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nume</TableHead>
                  <TableHead>Voice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="font-medium">{a.name}</div>
                      {a.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">{a.description}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{a.voice_id || '-'}</TableCell>
                    <TableCell>
                      {a.is_active ? (
                        <Badge variant="secondary">Activ</Badge>
                      ) : (
                        <Badge variant="outline">Inactiv</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                        <Pencil className="mr-2 h-4 w-4" /> Editează
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteAgent(a.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Șterge
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {agents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Niciun agent încă.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={agentDialogOpen} onOpenChange={setAgentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editAgent ? 'Editează agent' : 'Creează agent'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm">Nume</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Voice ID</label>
              <Input value={form.voice_id} onChange={(e) => setForm({ ...form, voice_id: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Descriere</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">System prompt</label>
              <Textarea value={form.system_prompt} onChange={(e) => setForm({ ...form, system_prompt: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAgentDialogOpen(false)}>Anulează</Button>
            <Button onClick={handleSaveAgent} disabled={!canSubmit}>{editAgent ? 'Salvează' : 'Creează'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
