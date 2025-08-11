import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Activity, MousePointerClick, Eye, LogIn, RefreshCw } from 'lucide-react';

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

const iconFor = (type: string) => {
  if (type === 'page_view') return Eye;
  if (type === 'ui_click') return MousePointerClick;
  if (type.toLowerCase().includes('login')) return LogIn;
  return Activity;
};

const variantFor = (type: string) => {
  if (type === 'ui_click') return 'secondary' as const;
  if (type === 'page_view') return 'default' as const;
  return 'outline' as const;
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
                const Icon = iconFor(ev.event_type);
                const prof = profiles[ev.user_id];
                return (
                  <li key={ev.id} className="rounded-xl border border-border/60 bg-background/50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
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
