import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Plus, Trash2 } from "lucide-react";

interface AdminUserRow {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  account_type: string;
  user_role: "admin" | "moderator" | "user";
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

interface Props {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserDetailsModal: React.FC<Props> = ({ userId, open, onOpenChange }) => {
  const { user: adminUser } = useAuth();
  const [details, setDetails] = useState<AdminUserRow | null>(null);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [editAgent, setEditAgent] = useState<AgentRow | null>(null);
  const [form, setForm] = useState({ name: "", voice_id: "", description: "", system_prompt: "" });
  const canSubmit = useMemo(() => !!form.name && !!form.voice_id, [form]);

  const resetForm = () => {
    setEditAgent(null);
    setForm({ name: "", voice_id: "", description: "", system_prompt: "" });
  };

  const fetchAll = async () => {
    if (!open || !userId || !adminUser) return;
    setLoading(true);
    try {
      const [{ data: userData, error: userErr }, { data: agentsData, error: agentsErr }] = await Promise.all([
        (supabase as any).rpc("admin_get_user_by_id", { p_admin_user_id: adminUser.id, p_target_user_id: userId }),
        (supabase as any).rpc("admin_get_user_agents", { p_admin_user_id: adminUser.id, p_target_user_id: userId }),
      ]);
      if (userErr) throw userErr;
      if (agentsErr) throw agentsErr;
      setDetails((userData as any)?.[0] || null);
      setAgents((agentsData as any) || []);
    } catch (e) {
      console.error("Failed to load user details:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId, adminUser]);

  const saveAgent = async () => {
    if (!adminUser || !userId) return;
    try {
      if (editAgent) {
        const { error } = await (supabase as any).rpc("admin_update_agent", {
          p_admin_user_id: adminUser.id,
          p_agent_row_id: editAgent.id,
          p_name: form.name,
          p_voice_id: form.voice_id,
          p_description: form.description || null,
          p_system_prompt: form.system_prompt || null,
        });
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).rpc("admin_create_agent", {
          p_admin_user_id: adminUser.id,
          p_target_user_id: userId,
          p_name: form.name,
          p_voice_id: form.voice_id,
          p_description: form.description || null,
          p_system_prompt: form.system_prompt || null,
        });
        if (error) throw error;
      }
      resetForm();
      fetchAll();
    } catch (e) {
      console.error("Failed to save agent:", e);
    }
  };

  const deleteAgent = async (id: string) => {
    if (!adminUser) return;
    try {
      const { error } = await (supabase as any).rpc("admin_delete_agent", {
        p_admin_user_id: adminUser.id,
        p_agent_row_id: id,
      });
      if (error) throw error;
      fetchAll();
    } catch (e) {
      console.error("Failed to delete agent:", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detalii utilizator</DialogTitle>
          <DialogDescription>Vizualizează profilul și gestionează agenții utilizatorului selectat.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div>Se încarcă...</div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {details ? (
                  <>
                    <div className="font-medium">{details.first_name} {details.last_name}</div>
                    <div className="text-sm text-muted-foreground">{details.email}</div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge variant="secondary" className="capitalize">{details.user_role}</Badge>
                      <Badge variant="outline" className="capitalize">{details.account_type}</Badge>
                      <Badge variant="outline">Plan: {details.plan}</Badge>
                    </div>
                    <div className="pt-2 text-sm">
                      Sold: ${details.balance_usd?.toFixed(2)} · Apeluri: {details.total_calls} · Minute: {details.total_minutes?.toFixed(1)}
                    </div>
                  </>
                ) : (
                  <div>Nu am putut încărca profilul utilizatorului.</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Agenți</CardTitle>
                <Button size="sm" onClick={() => { setEditAgent(null); setForm({ name: "", voice_id: "", description: "", system_prompt: "" }); }}> 
                  <Plus className="mr-2 h-4 w-4" /> Adaugă agent
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
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
                          {a.is_active ? <Badge variant="secondary">Activ</Badge> : <Badge variant="outline">Inactiv</Badge>}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditAgent(a); setForm({ name: a.name || "", voice_id: a.voice_id || "", description: a.description || "", system_prompt: a.system_prompt || "" }); }}>
                            <Pencil className="mr-2 h-4 w-4" /> Editează
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteAgent(a.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Șterge
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {agents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">Niciun agent încă.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Create / Edit form */}
                <div className="border rounded-md p-4 space-y-3">
                  <div className="text-sm font-medium">{editAgent ? "Editează agent" : "Creează agent"}</div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Nume</label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Voice ID</label>
                      <Input value={form.voice_id} onChange={(e) => setForm({ ...form, voice_id: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-muted-foreground">Descriere</label>
                      <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-muted-foreground">System prompt</label>
                      <Textarea value={form.system_prompt} onChange={(e) => setForm({ ...form, system_prompt: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    {editAgent && (
                      <Button variant="outline" onClick={resetForm}>Anulează editarea</Button>
                    )}
                    <Button onClick={saveAgent} disabled={!canSubmit}>{editAgent ? "Salvează" : "Creează"}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Închide</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
