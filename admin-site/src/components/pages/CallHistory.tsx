import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface CallRecord {
  id: string;
  user_email: string;
  agent_name: string;
  duration: number;
  status: string;
  created_at: string;
  cost: number;
}

export function CallHistory() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCallHistory();
    }
  }, [user]);

  const fetchCallHistory = async () => {
    try {
      const { data, error } = await supabase.rpc('admin_get_call_history');
      if (error) throw error;
      setCalls(data || []);
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Se încarcă istoricul apelurilor...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Istoric Apeluri</h2>
        <p className="text-muted-foreground">
          Monitorizați toate apelurile din sistem
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Toate Apelurile</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilizator</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Durată</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => (
                <TableRow key={call.id}>
                  <TableCell>{call.user_email}</TableCell>
                  <TableCell>{call.agent_name}</TableCell>
                  <TableCell>{call.duration}s</TableCell>
                  <TableCell>
                    <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                      {call.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${call.cost?.toFixed(4) || '0.0000'}</TableCell>
                  <TableCell>
                    {new Date(call.created_at).toLocaleDateString('ro-RO')}
                  </TableCell>
                </TableRow>
              ))}
              {calls.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nu există apeluri înregistrate
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}