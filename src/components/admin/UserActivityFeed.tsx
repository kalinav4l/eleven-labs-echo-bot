import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Activity, MousePointerClick, Eye, LogIn, RefreshCw, Phone, CalendarDays, Brain, FileText, CreditCard, ShieldAlert } from 'lucide-react';

interface ActivityEvent {
  id: string;
  user_id: string;
  event_type: string;
  page_path: string | null;
  action: string | null;
  description: string | null;
  metadata: any;
  created_at: string;
}

interface ProfileInfo { id: string; first_name: string | null; last_name: string | null; email: string | null }

function formatTime(ts: string) {
  return new Date(ts).toLocaleString('ro-RO');
}

const iconForEvent = (ev: ActivityEvent) => {
  const type = (ev.event_type || '').toLowerCase();
  if (type === 'page_view') return Eye;
  if (type === 'ui_click') return MousePointerClick;
  if (type.includes('login')) return LogIn;
  if (type.includes('call')) return Phone;
  if (type.includes('schedule') || type.includes('callback')) return CalendarDays;
  if (type.includes('agent')) return Brain;
  if (type.includes('document') || type.includes('upload')) return FileText;
  if (type.includes('payment') || type.includes('balance')) return CreditCard;
  if (type.includes('error') || type.includes('fail')) return ShieldAlert;
  return Activity;
};

const colorClassesFor = (type: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('call')) return 'bg-primary/10 text-primary border-primary/20';
  if (t.includes('schedule') || t.includes('callback')) return 'bg-accent/10 text-accent-foreground border-accent/20';
  if (t.includes('agent')) return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
  if (t.includes('payment') || t.includes('balance')) return 'bg-foreground/10 text-foreground border-foreground/20';
  if (t.includes('error') || t.includes('fail')) return 'bg-destructive/10 text-destructive border-destructive/20';
  if (t === 'ui_click') return 'bg-accent/10 text-accent-foreground border-accent/20';
  if (t === 'page_view') return 'bg-muted text-muted-foreground border-border';
  return 'bg-muted text-foreground border-border';
};

export default function UserActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileInfo>>({});
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_activity_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error && data) {
      setEvents(data as any);
      const uniqueIds = Array.from(new Set((data as any[]).map(e => e.user_id)));
      if (uniqueIds.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', uniqueIds);
        const map: Record<string, ProfileInfo> = {};
        (profs || []).forEach(p => { map[p.id] = p as any; });
        setProfiles(map);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel('user-activity-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_activity_events' }, async (payload: any) => {
        const ev = payload.new as ActivityEvent;
        setEvents(prev => [ev, ...prev].slice(0, 50));
        if (!profiles[ev.user_id]) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .eq('id', ev.user_id)
            .maybeSingle();
          if (prof) setProfiles(p => ({ ...p, [prof.id]: prof as any }));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <CardTitle>Activitate în timp real</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={fetchEvents}>
          <RefreshCw className="w-4 h-4 mr-1" /> Reîmprospătează
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground">Se încarcă...</div>
        ) : events.length === 0 ? (
          <div className="text-muted-foreground">Nu există evenimente recente.</div>
        ) : (
          <ScrollArea className="h-[520px] pr-2">
            <ul className="space-y-3">
              {events.map((ev) => {
                const Icon = iconForEvent(ev);
                const prof = profiles[ev.user_id];

                const details: Array<{ label: string; value: string }> = [];
                const m = (ev.metadata || {}) as Record<string, any>;
                const add = (label: string, value?: any) => {
                  if (value === undefined || value === null) return;
                  const str = String(value).trim();
                  if (str) details.push({ label, value: str });
                };

                add('Agent', m.agent_name || m.agentId || m.agent_id || m.elevenlabs_agent_id);
                add('Telefon', m.phone || m.phone_number || m.to_number);
                add('Contact', m.contact_name);
                add('Programare', m.scheduled_time || m.scheduled_datetime || m.scheduled_at);
                add('Conversație', m.conversation_id || m.conv_id || m.cid);
                add('Status', m.call_status || m.status);
                add('Pagină', ev.page_path);
                if (ev.action) add('Acțiune', ev.action);

                const formatDetailValue = (label: string, value: string) => {
                  if (label === 'Programare') {
                    const d = new Date(value);
                    if (!isNaN(d.getTime())) return d.toLocaleString('ro-RO');
                  }
                  return value;
                };

                return (
                  <li key={ev.id} className="rounded-xl border border-border/60 bg-background/50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center border ${colorClassesFor(ev.event_type)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {prof ? `${prof.first_name ?? ''} ${prof.last_name ?? ''}`.trim() || prof.email : ev.user_id}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {ev.event_type} • {ev.page_path || '—'} {ev.action ? `• ${ev.action}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{formatTime(ev.created_at)}</div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className={`${colorClassesFor(ev.event_type)} text-[10px] px-2 py-0.5`}>{ev.event_type}</Badge>
                      {details.map((d) => (
                        <Badge key={`${ev.id}-${d.label}-${d.value}`} variant="outline" className="bg-muted/40 text-foreground border-border/50 text-[10px] px-2 py-0.5">
                          {d.label}: {formatDetailValue(d.label, d.value)}
                        </Badge>
                      ))}
                    </div>
                    {ev.description && (
                      <div className="mt-2 text-xs text-muted-foreground">{ev.description}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
