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
  'no_answer': 'bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/40 dark:to-rose-950/60 border-t-4 border-t-red-500 shadow-red-100/50 dark:shadow-red-900/20',
  'long_calls': 'bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/40 dark:to-green-950/60 border-t-4 border-t-emerald-500 shadow-emerald-100/50 dark:shadow-emerald-900/20',
  'multiple_calls': 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/60 border-t-4 border-t-blue-500 shadow-blue-100/50 dark:shadow-blue-900/20',
  'callback': 'bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/40 dark:to-violet-950/60 border-t-4 border-t-purple-500 shadow-purple-100/50 dark:shadow-purple-900/20',
  'short_calls': 'bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/40 dark:to-amber-950/60 border-t-4 border-t-orange-500 shadow-orange-100/50 dark:shadow-orange-900/20',
  'recent': 'bg-gradient-to-br from-cyan-50 to-sky-100 dark:from-cyan-950/40 dark:to-sky-950/60 border-t-4 border-t-cyan-500 shadow-cyan-100/50 dark:shadow-cyan-900/20',
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">`
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Workflow Database
          </h1>
          <p className="text-muted-foreground text-lg">Agregare inteligentă cu coloane predefinite personalizabile</p>
          <link rel="prerender" href="/account/workflow-database" />
      </header>

        <div className="flex items-center justify-between mb-6 bg-card/50 backdrop-blur-sm p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">{phones.length} numere unice</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()} className="shadow-sm hover:shadow-md transition-all duration-200">
              <RefreshCw className="w-4 h-4 mr-2" /> Reîncarcă
            </Button>
            <Dialog open={openColumnSelector} onOpenChange={setOpenColumnSelector}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" /> Selectează coloane
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg bg-card/95 backdrop-blur-sm border-2">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Alege coloanele (maxim 4)
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    Selectate: <span className="font-bold text-primary">{selectedColumns.length}/4</span>
                  </div>
                  {PREDEFINED_COLUMNS.map((col) => (
                    <div key={col.key} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <Checkbox
                        id={col.key}
                        checked={selectedColumns.includes(col.key)}
                        onCheckedChange={(checked) => handleColumnToggle(col.key, !!checked)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor={col.key} className="text-sm font-semibold cursor-pointer text-foreground">
                          {col.title}
                        </label>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{col.description}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={() => setOpenColumnSelector(false)} className="bg-gradient-to-r from-primary to-blue-600">
                      Închide
                    </Button>
                  </div>
                </div>
              </DialogContent>
          </Dialog>
        </div>
      </div>

        {selectedColumns.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              {selectedColumns.map((key) => {
                const col = PREDEFINED_COLUMNS.find(c => c.key === key)!;
                return (
                  <Badge key={key} variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-card/60 hover:bg-card border-2 shadow-sm hover:shadow-md transition-all duration-200">
                    {col.title}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 hover:bg-destructive/20 hover:text-destructive rounded-full"
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
          <div className="py-32 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-blue-600 animate-pulse"></div>
            <p className="text-muted-foreground text-lg">Se încarcă datele...</p>
          </div>
        ) : selectedColumns.length === 0 ? (
          <div className="py-32 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <Database className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">Selectează coloane pentru a vedea datele organizate</p>
          </div>
        ) : (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {board.map((col) => (
                <Card key={col.key} className={`${COLUMN_COLORS[col.key]} min-h-[500px] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-foreground">{col.title}</CardTitle>
                      <Badge 
                        variant="secondary" 
                        className="text-sm font-bold bg-white/80 text-foreground shadow-sm px-3 py-1"
                      >
                        {col.items.length}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">{col.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    {col.items.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/50 flex items-center justify-center">
                          <Phone className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm text-muted-foreground/60 font-medium">Nicio înregistrare</p>
                      </div>
                    ) : (
                      col.items.map((item) => (
                        <div key={item.phone_number} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/90 border border-white/40">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-semibold text-sm text-foreground truncate flex-1 mr-3">
                              {item.contact_name || 'Necunoscut'}
                            </div>
                            <Badge variant="outline" className="text-xs px-2 py-1 h-6 shrink-0 bg-white/60 border-muted">
                              {item.phone_number}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                              <Phone className="w-3 h-3" /> 
                              <span className="font-medium">{item.total_calls}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-green-500/60"></div>
                              <Clock className="w-3 h-3" /> 
                              <span className="font-medium">{(Math.round((item.total_duration||0)/60*10)/10).toFixed(1)}m</span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground/70 font-medium">
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
      </div>
    </DashboardLayout>
  );
}
