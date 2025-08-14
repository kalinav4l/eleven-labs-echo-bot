import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Activity, Eye, MousePointerClick } from 'lucide-react';

interface Props {
  open: boolean;
  userId: string | null;
  onOpenChange: (open: boolean) => void;
}

interface ActivityEvent {
  id: string;
  event_type: string;
  page_path: string | null;
  action: string | null;
  description: string | null;
  created_at: string;
}

export default function UserActivityModal({ open, userId, onOpenChange }: Props) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_get_user_activity', {
      _user_id: userId,
      since_hours: 48,
      limit_count: 200
    });
    if (!error && data) setEvents(data as any);
    setLoading(false);
  };

  useEffect(() => { if (open) load(); }, [open, userId]);

  useEffect(() => {
    if (!open || !userId) return;
    const channel = supabase
      .channel('user-activity-modal')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_activity_events', filter: `user_id=eq.${userId}` }, (payload: any) => {
        setEvents(prev => [payload.new as any, ...prev].slice(0, 200));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [open, userId]);

  const IconFor = (t: string) => t === 'page_view' ? Eye : t === 'ui_click' ? MousePointerClick : Activity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Activitatea utilizatorului</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="text-muted-foreground p-4">Se încarcă...</div>
        ) : (
          <ScrollArea className="h-[520px] pr-2">
            <ul className="space-y-3">
              {events.map((ev) => {
                const Icon = IconFor(ev.event_type);
                return (
                  <li key={ev.id} className="rounded-xl border border-border/60 bg-background/50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{ev.event_type}</div>
                          <div className="text-xs text-muted-foreground">{ev.page_path || '—'} {ev.action ? `• ${ev.action}` : ''}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(ev.created_at).toLocaleString('ro-RO')}</div>
                    </div>
                    {ev.description && (
                      <div className="mt-2 text-xs text-muted-foreground">{ev.description}</div>
                    )}
                  </li>
                );
              })}
              {events.length === 0 && (
                <li className="text-center text-muted-foreground py-8">Nu există evenimente în ultimele 48h.</li>
              )}
            </ul>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
