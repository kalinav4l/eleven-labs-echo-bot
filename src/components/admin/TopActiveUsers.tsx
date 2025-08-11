import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Flame } from 'lucide-react';

interface TopUser {
  user_id: string;
  event_count: number;
  last_event_at: string;
}

interface ProfileInfo { id: string; first_name: string | null; last_name: string | null; email: string | null }

interface Props {
  periodHours?: number;
  onUserClick?: (userId: string) => void;
}

export default function TopActiveUsers({ periodHours = 24, onUserClick }: Props) {
  const [rows, setRows] = useState<TopUser[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileInfo>>({});

  const load = async () => {
    const { data, error } = await supabase.rpc('admin_get_top_active_users', {
      period_hours: periodHours,
      limit_count: 10,
    });
    if (!error && data) {
      setRows(data as any);
      const ids = (data as any[]).map(r => r.user_id);
      if (ids.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', ids);
        const map: Record<string, ProfileInfo> = {};
        (profs || []).forEach(p => { map[p.id] = p as any; });
        setProfiles(map);
      }
    }
  };

  useEffect(() => { load(); }, [periodHours]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-primary" />
          <CardTitle>Cei mai activi (ultimele {periodHours}h)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilizator</TableHead>
              <TableHead className="text-right">Evenimente</TableHead>
              <TableHead className="text-right">Ultimul</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const p = profiles[r.user_id];
              const name = p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.email : r.user_id;
              return (
                <TableRow key={r.user_id} className="cursor-pointer" onClick={() => onUserClick?.(r.user_id)}>
                  <TableCell className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-medium">{name}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{r.event_count}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {new Date(r.last_event_at).toLocaleTimeString('ro-RO')}
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Nicio activitate în perioada selectată.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
