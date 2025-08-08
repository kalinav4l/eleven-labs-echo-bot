import React, { useEffect, useMemo, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Phone, Clock, Filter, Database, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WorkflowColumn {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface PhoneAggregate {
  phone_number: string;
  contact_name?: string | null;
  last_call_date?: string | null;
  last_status?: string | null;
  total_calls: number;
  total_duration: number; // seconds
}

const DEFAULT_COLUMNS = [
  { key: 'callback', title: 'Callback Programat' },
  { key: 'answered', title: 'Au Răspuns' },
  { key: 'no_answer', title: 'Nu au răspuns' },
  { key: 'unknown', title: 'Necategorizat' },
] as const;

type DefaultColumnKey = typeof DEFAULT_COLUMNS[number]['key'];

type BoardColumn = {
  key: DefaultColumnKey | `custom_${string}`;
  title: string;
  prompt?: string;
  items: PhoneAggregate[];
};

export default function WorkflowDatabase() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState<WorkflowColumn[]>([]);
  const [phones, setPhones] = useState<PhoneAggregate[]>([]);
  const [callbackPhones, setCallbackPhones] = useState<Set<string>>(new Set());
  const [openNewCol, setOpenNewCol] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [saving, setSaving] = useState(false);

  // SEO: title, description, canonical
  useEffect(() => {
    document.title = 'Workflow Database — Phone Numbers & Statuses';
    const desc = 'Workflow database board: phone numbers grouped by status with custom GPT-based columns.';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.content = desc;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.href = window.location.href;
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        // Load custom workflow columns
        const { data: cols, error: colErr } = await supabase
          .from('workflow_columns')
          .select('*')
          .eq('user_id', user.id)
          .order('sort_order', { ascending: true });
        if (colErr) console.error('Columns error', colErr);
        setColumns(cols || []);

        // Load recent call history for aggregation
        const { data: calls, error: callErr } = await supabase
          .from('call_history')
          .select('phone_number, contact_name, call_date, call_status, duration_seconds')
          .eq('user_id', user.id)
          .order('call_date', { ascending: false })
          .limit(500);
        if (callErr) console.error('Calls error', callErr);

        // Aggregate by phone number
        const map = new Map<string, PhoneAggregate>();
        (calls || []).forEach((c) => {
          const pn = c.phone_number;
          const existing = map.get(pn);
          if (!existing) {
            map.set(pn, {
              phone_number: pn,
              contact_name: c.contact_name,
              last_call_date: c.call_date,
              last_status: c.call_status,
              total_calls: 1,
              total_duration: c.duration_seconds || 0,
            });
          } else {
            existing.total_calls += 1;
            existing.total_duration += c.duration_seconds || 0;
            // keep the latest entry as last_* since calls are sorted desc
          }
        });
        setPhones(Array.from(map.values()));

        // Load scheduled callbacks (for callback column)
        const { data: scalls, error: scErr } = await supabase
          .from('scheduled_calls')
          .select('phone_number')
          .eq('user_id', user.id)
          .eq('status', 'scheduled');
        if (scErr) console.error('Scheduled calls error', scErr);
        setCallbackPhones(new Set((scalls || []).map((s: any) => s.phone_number)));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const classifyDefault = useCallback(
    (p: PhoneAggregate): DefaultColumnKey => {
      if (callbackPhones.has(p.phone_number)) return 'callback';
      const last = (p.last_status || '').toLowerCase();
      const answered = (p.total_duration || 0) > 0 || ['success','done','completed','answered','ok'].some(k => last.includes(k));
      if (answered) return 'answered';
      const noAns = ['no_answer','failed','busy','unreachable','canceled','missed','not answered'].some(k => last.includes(k)) || (p.total_duration || 0) === 0;
      if (noAns) return 'no_answer';
      return 'unknown';
    },
    [callbackPhones]
  );

  const board: BoardColumn[] = useMemo(() => {
    const buckets: Record<DefaultColumnKey, PhoneAggregate[]> = {
      callback: [],
      answered: [],
      no_answer: [],
      unknown: [],
    };
    phones.forEach((p) => buckets[classifyDefault(p)].push(p));

    const defaults: BoardColumn[] = DEFAULT_COLUMNS.map(dc => ({ key: dc.key, title: dc.title, items: buckets[dc.key] }));
    const customs: BoardColumn[] = (columns || []).map((c) => ({
      key: `custom_${c.id}`,
      title: c.title,
      prompt: c.prompt,
      items: [], // TODO: AI-based classification to be added
    }));
    return [...defaults, ...customs];
  }, [phones, classifyDefault, columns]);

  const onCreateColumn = async () => {
    if (!user) {
      toast({ title: 'Eroare', description: 'Trebuie să fii autentificat.', variant: 'destructive' });
      return;
    }
    if (!newTitle.trim() || !newPrompt.trim()) {
      toast({ title: 'Completează câmpurile', description: 'Titlul și promptul sunt obligatorii.', variant: 'destructive' });
      return;
    }
    try {
      setSaving(true);
      const { error } = await supabase
        .from('workflow_columns')
        .insert({
          user_id: user.id,
          title: newTitle.trim(),
          prompt: newPrompt.trim(),
          sort_order: (columns?.length || 0) + 1,
        });
      if (error) throw error;

      toast({ title: 'Coloană creată', description: 'Coloana a fost adăugată cu succes.' });

      setNewTitle('');
      setNewPrompt('');
      setOpenNewCol(false);
      // refresh
      const { data } = await supabase
        .from('workflow_columns')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });
      setColumns(data || []);
    } catch (error: any) {
      console.error('Create column error', error);
      toast({ title: 'Eroare la salvare', description: String(error?.message || error), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <DashboardLayout>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Workflow Database</h1>
        <p className="text-muted-foreground">Telefon agregat pe status + coloane personalizate (prompt)</p>
        <link rel="prerender" href="/account/workflow-database" />
      </header>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Database className="w-4 h-4" />
          <span>{phones.length} numere unice</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Reîncarcă
          </Button>
          <Dialog open={openNewCol} onOpenChange={setOpenNewCol}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Coloană personalizată
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Coloană nouă (prompt GPT)</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Titlu coloană</label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Vor să cumpere" />
                </div>
                <div>
                  <label className="text-sm font-medium">Prompt (descrie criteriile)</label>
                  <Input value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)} placeholder="Ex: Toți care au exprimat intenția de a cumpăra" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpenNewCol(false)}>Anulează</Button>
                  <Button onClick={onCreateColumn} disabled={saving || !newTitle.trim() || !newPrompt.trim()}>
                    <Sparkles className="w-4 h-4 mr-2" /> Salvează
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Se încarcă datele...</div>
      ) : (
        <section className="overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {board.map((col) => (
              <Card key={col.key} className="w-80 shrink-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{col.title}</span>
                    <Badge variant="secondary">{col.items.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {col.prompt && (
                    <div className="text-xs text-muted-foreground">{col.prompt}</div>
                  )}
                  {col.items.length === 0 && (
                    <div className="text-sm text-muted-foreground">{col.prompt ? 'Necesită clasificare AI' : 'Nicio înregistrare'}</div>
                  )}
                  {col.items.map((item) => (
                    <div key={item.phone_number} className="border rounded-lg p-3 bg-background/60">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{item.contact_name || 'Necunoscut'}</div>
                        <Badge variant="outline">{item.phone_number}</Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" /> {item.total_calls} apeluri
                        <span className="mx-1">•</span>
                        <Clock className="w-3 h-3" /> {(Math.round((item.total_duration||0)/60*10)/10).toFixed(1)} min
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">Ultimul: {item.last_call_date ? new Date(item.last_call_date).toLocaleString('ro-RO') : '-'}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </DashboardLayout>
  );
}
