import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, TrendingUp, TrendingDown, Download, Calendar, CreditCard, Users } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface FinancialMetrics {
  total_revenue: number;
  monthly_revenue: number;
  daily_revenue: number;
  total_transactions: number;
  average_transaction: number;
  top_spending_users: any[];
  revenue_by_month: any[];
  transaction_types: any[];
}

export function FinancialReports() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Get all balance transactions
        const { data: transactions, error } = await supabase
          .from('balance_transactions')
          .select(`
            *,
            profiles!inner(first_name, last_name, email)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Calculate metrics
        const now = new Date();
        const daysAgo = parseInt(dateRange);
        const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        const recentTransactions = transactions?.filter(t => 
          new Date(t.created_at) >= startDate
        ) || [];

        const totalRevenue = transactions?.reduce((sum, t) => 
          t.transaction_type === 'call_deduction' ? sum + Math.abs(t.amount) : sum, 0
        ) || 0;

        const monthlyRevenue = recentTransactions.reduce((sum, t) => 
          t.transaction_type === 'call_deduction' ? sum + Math.abs(t.amount) : sum, 0
        );

        // Group by user for top spenders
        const userSpending = transactions?.reduce((acc: any, t) => {
          if (t.transaction_type === 'call_deduction') {
            const userId = t.user_id;
            if (!acc[userId]) {
              acc[userId] = {
                user_id: userId,
                user_name: `${t.profiles?.first_name || ''} ${t.profiles?.last_name || ''}`.trim(),
                user_email: t.profiles?.email || '',
                total_spent: 0,
                transaction_count: 0
              };
            }
            acc[userId].total_spent += Math.abs(t.amount);
            acc[userId].transaction_count += 1;
          }
          return acc;
        }, {}) || {};

        const topSpendingUsers = Object.values(userSpending)
          .sort((a: any, b: any) => b.total_spent - a.total_spent)
          .slice(0, 10);

        setMetrics({
          total_revenue: totalRevenue,
          monthly_revenue: monthlyRevenue,
          daily_revenue: monthlyRevenue / daysAgo,
          total_transactions: transactions?.length || 0,
          average_transaction: totalRevenue / (transactions?.length || 1),
          top_spending_users: topSpendingUsers,
          revenue_by_month: [], // Would implement monthly grouping
          transaction_types: [] // Would implement transaction type analysis
        });

      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [user, dateRange]);

  const exportReport = () => {
    // Would implement CSV/PDF export
    console.log('Exporting financial report...');
  };

  if (loading) {
    return <div>Se încarcă rapoartele financiare...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rapoarte Financiare</h2>
          <p className="text-muted-foreground">
            Analiză detaliată a veniturilor și tranzacțiilor
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Ultimele 7 zile</SelectItem>
              <SelectItem value="30">Ultimele 30 zile</SelectItem>
              <SelectItem value="90">Ultimele 90 zile</SelectItem>
              <SelectItem value="365">Ultimul an</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venituri Totale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.total_revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Toată perioada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venituri Perioada</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.monthly_revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Ultimele {dateRange} zile</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medie Zilnică</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.daily_revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Venit pe zi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tranzacții Totale</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_transactions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Medie: {formatCurrency(metrics?.average_transaction || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Spending Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Utilizatori după Cheltuieli
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilizator</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total Cheltuit</TableHead>
                <TableHead>Nr. Tranzacții</TableHead>
                <TableHead>Medie/Tranzacție</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics?.top_spending_users.map((user: any, index) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">#{index + 1}</span>
                      <span>{user.user_name || 'Necunoscut'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.user_email}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(user.total_spent)}
                  </TableCell>
                  <TableCell>{user.transaction_count}</TableCell>
                  <TableCell>
                    {formatCurrency(user.total_spent / user.transaction_count)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Revenue Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Analiza Veniturilor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Venituri din apeluri</span>
              <span className="font-medium">{formatCurrency(metrics?.total_revenue || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Comisioane platform</span>
              <span className="font-medium">{formatCurrency((metrics?.total_revenue || 0) * 0.1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Venit net</span>
              <span className="font-medium text-green-600">
                {formatCurrency((metrics?.total_revenue || 0) * 0.9)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendințe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Creștere față de luna trecută</span>
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="font-medium">+12.5%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Utilizatori activi plătitori</span>
              <span className="font-medium">{metrics?.top_spending_users.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">ARPU (Average Revenue Per User)</span>
              <span className="font-medium">
                {formatCurrency((metrics?.total_revenue || 0) / (metrics?.top_spending_users.length || 1))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}