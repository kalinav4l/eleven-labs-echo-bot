import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Server, Database, Zap, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const Progress = ({ value = 0, className = '' }: { value?: number; className?: string }) => (
  <div className={`w-full h-2 bg-gray-200 rounded ${className}`}>
    <div
      className="h-2 bg-blue-500 rounded"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  api_response_time: number;
  database_connections: number;
  error_rate: number;
  uptime: string;
}

export function SystemMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Simulate system metrics - in real app would fetch from monitoring service
      const mockMetrics: SystemMetrics = {
        cpu_usage: Math.random() * 100,
        memory_usage: 60 + Math.random() * 30,
        disk_usage: 45 + Math.random() * 20,
        active_connections: Math.floor(150 + Math.random() * 100),
        api_response_time: 120 + Math.random() * 80,
        database_connections: Math.floor(20 + Math.random() * 30),
        error_rate: Math.random() * 5,
        uptime: '15 zile, 6 ore, 32 minute'
      };
      
      setMetrics(mockMetrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'destructive';
    if (value >= thresholds.warning) return 'warning';
    return 'success';
  };

  const getStatusIcon = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return AlertTriangle;
    return CheckCircle;
  };

  if (loading && !metrics) {
    return <div>Se încarcă metrici sistem...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Monitorizare Sistem</h2>
          <p className="text-muted-foreground">
            Status și performanța sistemului în timp real
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Ultima actualizare: {lastUpdate.toLocaleTimeString('ro-RO')}
          </span>
          <Button onClick={fetchMetrics} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizează
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.cpu_usage.toFixed(1)}%</div>
            <Progress value={metrics?.cpu_usage || 0} className="mt-2" />
            <div className="flex items-center mt-2">
              {React.createElement(
                getStatusIcon(metrics?.cpu_usage || 0, { warning: 70, critical: 90 }),
                { className: "h-3 w-3 mr-1" }
              )}
              <Badge variant={getStatusColor(metrics?.cpu_usage || 0, { warning: 70, critical: 90 }) as any}>
                {metrics?.cpu_usage && metrics.cpu_usage > 90 ? 'Critic' : 
                 metrics?.cpu_usage && metrics.cpu_usage > 70 ? 'Atenție' : 'Normal'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memorie</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.memory_usage.toFixed(1)}%</div>
            <Progress value={metrics?.memory_usage || 0} className="mt-2" />
            <div className="flex items-center mt-2">
              {React.createElement(
                getStatusIcon(metrics?.memory_usage || 0, { warning: 80, critical: 95 }),
                { className: "h-3 w-3 mr-1" }
              )}
              <Badge variant={getStatusColor(metrics?.memory_usage || 0, { warning: 80, critical: 95 }) as any}>
                {metrics?.memory_usage && metrics.memory_usage > 95 ? 'Critic' : 
                 metrics?.memory_usage && metrics.memory_usage > 80 ? 'Atenție' : 'Normal'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.disk_usage.toFixed(1)}%</div>
            <Progress value={metrics?.disk_usage || 0} className="mt-2" />
            <div className="flex items-center mt-2">
              {React.createElement(
                getStatusIcon(metrics?.disk_usage || 0, { warning: 80, critical: 95 }),
                { className: "h-3 w-3 mr-1" }
              )}
              <Badge variant={getStatusColor(metrics?.disk_usage || 0, { warning: 80, critical: 95 }) as any}>
                {metrics?.disk_usage && metrics.disk_usage > 95 ? 'Critic' : 
                 metrics?.disk_usage && metrics.disk_usage > 80 ? 'Atenție' : 'Normal'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.api_response_time.toFixed(0)}ms</div>
            <div className="flex items-center mt-2">
              {React.createElement(
                getStatusIcon(metrics?.api_response_time || 0, { warning: 500, critical: 1000 }),
                { className: "h-3 w-3 mr-1" }
              )}
              <Badge variant={getStatusColor(metrics?.api_response_time || 0, { warning: 500, critical: 1000 }) as any}>
                {metrics?.api_response_time && metrics.api_response_time > 1000 ? 'Lent' : 
                 metrics?.api_response_time && metrics.api_response_time > 500 ? 'Mediu' : 'Rapid'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed System Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conexiuni Active</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Conexiuni utilizatori</span>
              <span className="font-medium">{metrics?.active_connections}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Conexiuni bază de date</span>
              <span className="font-medium">{metrics?.database_connections}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Rata de erori</span>
              <span className="font-medium text-destructive">{metrics?.error_rate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Uptime sistem</span>
              <span className="font-medium text-green-600">{metrics?.uptime}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Servicii Sistem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">API Gateway</span>
              <Badge variant="success">Online</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Database</span>
              <Badge variant="success">Online</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Redis Cache</span>
              <Badge variant="success">Online</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">File Storage</span>
              <Badge variant="success">Online</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Email Service</span>
              <Badge variant="warning">Degradat</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">SMS Service</span>
              <Badge variant="success">Online</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}