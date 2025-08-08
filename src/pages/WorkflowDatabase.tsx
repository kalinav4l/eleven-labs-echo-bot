import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, RefreshCw, Phone, Clock, Database, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const COLUMN_COLORS = {
  'no_answer': 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20',
  'long_calls': 'border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20',
  'multiple_calls': 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
  'callback': 'border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20',
  'short_calls': 'border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20',
  'recent': 'border-l-4 border-l-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20',
} as const;

interface PhoneAggregate {
  phone_number: string;
  contact_name?: string | null;
  last_call_date?: string | null;
  last_status?: string | null;
  total_calls: number;
  total_duration: number; // seconds
}

const PREDEFINED_COLUMNS = [
  { 
    key: 'no_answer', 
    title: 'Nu au răspuns',
    description: 'Persoane care nu au răspuns la apeluri',
    filter: (p: PhoneAggregate) => {
      const last = (p.last_status || '').toLowerCase();
      return ['no_answer','failed','busy','unreachable','canceled','missed','not answered'].some(k => last.includes(k)) || (p.total_duration || 0) === 0;
    }
  },
  { 
    key: 'long_calls', 
    title: 'Au vorbit mult',
    description: 'Persoane cu apeluri de peste 60 secunde',
    filter: (p: PhoneAggregate) => (p.total_duration || 0) > 60
  },
  { 
    key: 'multiple_calls', 
    title: 'Apeluri multiple',
    description: 'Persoane apelate de mai multe ori',
    filter: (p: PhoneAggregate) => p.total_calls > 1
  },
  { 
    key: 'callback', 
    title: 'Callback programat',
    description: 'Persoane cu callback-uri programate',
    filter: (p: PhoneAggregate, callbackPhones: Set<string>) => callbackPhones.has(p.phone_number)
  },
  { 
    key: 'short_calls', 
    title: 'Apeluri scurte',
    description: 'Persoane cu apeluri de sub 30 secunde',
    filter: (p: PhoneAggregate) => (p.total_duration || 0) > 0 && (p.total_duration || 0) <= 30
  },
  { 
    key: 'recent', 
    title: 'Recent apelați',
    description: 'Persoane apelate în ultimele 24 ore',
    filter: (p: PhoneAggregate) => {
      if (!p.last_call_date) return false;
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return new Date(p.last_call_date) > dayAgo;
    }
  },
] as const;

type PredefinedColumnKey = typeof PREDEFINED_COLUMNS[number]['key'];

type BoardColumn = {
  key: PredefinedColumnKey;
  title: string;
  description: string;
  items: PhoneAggregate[];
};

export default function WorkflowDatabase() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [phones, setPhones] = useState<PhoneAggregate[]>([]);
  const [callbackPhones, setCallbackPhones] = useState<Set<string>>(new Set());
  const [selectedColumns, setSelectedColumns] = useState<PredefinedColumnKey[]>([]);
  const [openColumnSelector, setOpenColumnSelector] = useState(false);

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

  const board: BoardColumn[] = useMemo(() => {
    return selectedColumns.map(key => {
      const col = PREDEFINED_COLUMNS.find(c => c.key === key)!;
      return {
        key,
        title: col.title,
        description: col.description,
        items: phones.filter(p => col.filter(p, callbackPhones))
      };
    });
  }, [selectedColumns, phones, callbackPhones]);

  const handleColumnToggle = (columnKey: PredefinedColumnKey, checked: boolean) => {
    if (checked && selectedColumns.length >= 4) {
      toast({ title: 'Limită atinsă', description: 'Poți selecta maxim 4 coloane.', variant: 'destructive' });
      return;
    }
    
    if (checked) {
      setSelectedColumns(prev => [...prev, columnKey]);
    } else {
      setSelectedColumns(prev => prev.filter(c => c !== columnKey));
    }
  };

  const removeColumn = (columnKey: PredefinedColumnKey) => {
    setSelectedColumns(prev => prev.filter(c => c !== columnKey));
  };
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <DashboardLayout>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Workflow Database</h1>
        <p className="text-muted-foreground">Agregare numere de telefon cu coloane predefinite personalizabile</p>
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
          <Dialog open={openColumnSelector} onOpenChange={setOpenColumnSelector}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Selectează coloane
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Alege coloanele (maxim 4)</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Selectate: {selectedColumns.length}/4
                </div>
                {PREDEFINED_COLUMNS.map((col) => (
                  <div key={col.key} className="flex items-start space-x-3">
                    <Checkbox
                      id={col.key}
                      checked={selectedColumns.includes(col.key)}
                      onCheckedChange={(checked) => handleColumnToggle(col.key, !!checked)}
                    />
                    <div className="flex-1">
                      <label htmlFor={col.key} className="text-sm font-medium cursor-pointer">
                        {col.title}
                      </label>
                      <p className="text-xs text-muted-foreground">{col.description}</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={() => setOpenColumnSelector(false)}>Închide</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedColumns.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {selectedColumns.map((key) => {
              const col = PREDEFINED_COLUMNS.find(c => c.key === key)!;
              return (
                <Badge key={key} variant="secondary" className="flex items-center gap-1">
                  {col.title}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeColumn(key)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Se încarcă datele...</div>
      ) : selectedColumns.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Selectează coloane pentru a vedea datele organizate</p>
        </div>
      ) : (
        <section className="overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {board.map((col) => (
              <Card key={col.key} className={`${COLUMN_COLORS[col.key]} min-h-[400px]`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{col.title}</CardTitle>
                    <Badge 
                      variant="secondary" 
                      className="text-xs font-bold"
                    >
                      {col.items.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">{col.description}</p>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {col.items.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-8 opacity-60">
                      Nicio înregistrare
                    </div>
                  ) : (
                    col.items.map((item) => (
                      <div key={item.phone_number} className="border rounded-md p-2 bg-background/80 hover:bg-background transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-xs truncate flex-1 mr-2">
                            {item.contact_name || 'Necunoscut'}
                          </div>
                          <Badge variant="outline" className="text-xs px-1 py-0 h-5 shrink-0">
                            {item.phone_number}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> 
                            <span>{item.total_calls}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 
                            <span>{(Math.round((item.total_duration||0)/60*10)/10).toFixed(1)}m</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 opacity-75">
                          {item.last_call_date ? new Date(item.last_call_date).toLocaleDateString('ro-RO') : '-'}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </DashboardLayout>
  );
}
