import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface AuditLog {
  id: string;
  admin_email: string;
  action: string;
  target_user_email: string;
  details: any;
  created_at: string;
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAuditLogs();
    }
  }, [user]);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase.rpc('admin_get_audit_logs');
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const variant = action.includes('ban') ? 'destructive' : 
                   action.includes('credit') || action.includes('balance') ? 'default' : 
                   'secondary';
    return <Badge variant={variant}>{action}</Badge>;
  };

  if (loading) {
    return <div>Se încarcă jurnalul de audit...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Jurnal de Audit</h2>
        <p className="text-muted-foreground">
          Urmăriți toate acțiunile administrative
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activitate Recentă</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Administrator</TableHead>
                <TableHead>Acțiune</TableHead>
                <TableHead>Utilizator Țintă</TableHead>
                <TableHead>Detalii</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.admin_email}</TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>{log.target_user_email}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {JSON.stringify(log.details)}
                    </code>
                  </TableCell>
                  <TableCell>
                    {new Date(log.created_at).toLocaleString('ro-RO')}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nu există intrări în jurnalul de audit
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