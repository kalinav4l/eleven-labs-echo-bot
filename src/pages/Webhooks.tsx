import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Settings, Trash2, Copy, Activity, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

interface WebhookConfig {
  id: string;
  webhook_name: string;
  webhook_url: string;
  description: string;
  is_active: boolean;
  webhook_events: string[];
  webhook_headers: Record<string, string>;
  webhook_timeout: number;
  retry_attempts: number;
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  last_triggered_at: string | null;
  created_at: string;
}

interface WebhookLog {
  id: string;
  request_method: string;
  request_payload: any;
  response_status: number;
  response_body: string;
  response_time_ms: number;
  error_message: string | null;
  triggered_at: string;
}

const Webhooks = () => {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    webhook_name: '',
    webhook_url: '',
    description: '',
    is_active: true,
    webhook_timeout: 30,
    retry_attempts: 3,
    webhook_headers: '{}',
    webhook_events: ['call_completed', 'call_started', 'call_failed']
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_configs' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks((data as unknown as WebhookConfig[]) || []);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      toast({
        title: "Error",
        description: "Failed to load webhooks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhookLogs = async (webhookId: string) => {
    try {
      const { data, error } = await supabase
        .from('webhook_logs' as any)
        .select('*')
        .eq('webhook_config_id', webhookId)
        .order('triggered_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setWebhookLogs((data as unknown as WebhookLog[]) || []);
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
    }
  };

  const createWebhook = async () => {
    try {
      let headers = {};
      try {
        headers = JSON.parse(formData.webhook_headers);
      } catch {
        headers = {};
      }

      const { data, error } = await supabase
        .from('webhook_configs' as any)
        .insert({
          webhook_name: formData.webhook_name,
          webhook_url: formData.webhook_url,
          description: formData.description,
          is_active: formData.is_active,
          webhook_timeout: formData.webhook_timeout,
          retry_attempts: formData.retry_attempts,
          webhook_headers: headers,
          webhook_events: formData.webhook_events,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setWebhooks([data as unknown as WebhookConfig, ...webhooks]);
      setIsCreateDialogOpen(false);
      
      // Reset form
      setFormData({
        webhook_name: '',
        webhook_url: '',
        description: '',
        is_active: true,
        webhook_timeout: 30,
        retry_attempts: 3,
        webhook_headers: '{}',
        webhook_events: ['call_completed', 'call_started', 'call_failed']
      });

      toast({
        title: "Success",
        description: "Webhook created successfully"
      });
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast({
        title: "Error",
        description: "Failed to create webhook",
        variant: "destructive"
      });
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('webhook_configs' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWebhooks(webhooks.filter(w => w.id !== id));
      toast({
        title: "Success",
        description: "Webhook deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive"
      });
    }
  };

  const toggleWebhook = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('webhook_configs' as any)
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      setWebhooks(webhooks.map(w => 
        w.id === id ? { ...w, is_active: isActive } : w
      ));

      toast({
        title: "Success",
        description: `Webhook ${isActive ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      console.error('Error updating webhook:', error);
      toast({
        title: "Error",
        description: "Failed to update webhook",
        variant: "destructive"
      });
    }
  };

  const copyWebhookUrl = (webhook: WebhookConfig) => {
    const webhookEndpoint = `https://pwfczzxwjfxomqzhhwvj.supabase.co/functions/v1/webhook-handler/${webhook.id}`;
    navigator.clipboard.writeText(webhookEndpoint);
    toast({
      title: "Copied",
      description: "Webhook URL copied to clipboard"
    });
  };

  const getSuccessRate = (webhook: WebhookConfig) => {
    if (webhook.total_calls === 0) return 0;
    return Math.round((webhook.successful_calls / webhook.total_calls) * 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Webhooks</h1>
            <p className="text-muted-foreground">Manage your webhook configurations and monitor activity</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Webhook</DialogTitle>
                <DialogDescription>
                  Configure a new webhook to receive real-time notifications
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="webhook_name">Webhook Name</Label>
                    <Input
                      id="webhook_name"
                      value={formData.webhook_name}
                      onChange={(e) => setFormData({...formData, webhook_name: e.target.value})}
                      placeholder="My API Webhook"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook_url">Webhook URL</Label>
                    <Input
                      id="webhook_url"
                      value={formData.webhook_url}
                      onChange={(e) => setFormData({...formData, webhook_url: e.target.value})}
                      placeholder="https://api.example.com/webhook"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Description of this webhook..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeout">Timeout (seconds)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={formData.webhook_timeout}
                      onChange={(e) => setFormData({...formData, webhook_timeout: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="retry_attempts">Retry Attempts</Label>
                    <Input
                      id="retry_attempts"
                      type="number"
                      value={formData.retry_attempts}
                      onChange={(e) => setFormData({...formData, retry_attempts: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="headers">Custom Headers (JSON)</Label>
                  <Textarea
                    id="headers"
                    value={formData.webhook_headers}
                    onChange={(e) => setFormData({...formData, webhook_headers: e.target.value})}
                    placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <Button onClick={createWebhook} className="w-full">
                  Create Webhook
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="webhooks" className="w-full">
            <TabsList>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="webhooks" className="space-y-4">
              {webhooks.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No webhooks configured</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first webhook to start receiving real-time notifications
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Webhook
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {webhooks.map((webhook) => (
                    <Card key={webhook.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle className="text-lg">{webhook.webhook_name}</CardTitle>
                          <CardDescription>{webhook.description}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={webhook.is_active ? "default" : "secondary"}>
                            {webhook.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyWebhookUrl(webhook)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedWebhook(webhook);
                              fetchWebhookLogs(webhook.id);
                            }}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Switch
                            checked={webhook.is_active}
                            onCheckedChange={(checked) => toggleWebhook(webhook.id, checked)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteWebhook(webhook.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">URL</div>
                            <div className="truncate">{webhook.webhook_url}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Total Calls</div>
                            <div className="font-medium">{webhook.total_calls}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Success Rate</div>
                            <div className="font-medium">{getSuccessRate(webhook)}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Last Triggered</div>
                            <div>{webhook.last_triggered_at ? new Date(webhook.last_triggered_at).toLocaleDateString() : 'Never'}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              {selectedWebhook ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Logs - {selectedWebhook.webhook_name}</CardTitle>
                    <CardDescription>Recent webhook activity and responses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Response Time</TableHead>
                          <TableHead>Triggered At</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {webhookLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {log.response_status >= 200 && log.response_status < 300 ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span>{log.response_status}</span>
                              </div>
                            </TableCell>
                            <TableCell>{log.request_method}</TableCell>
                            <TableCell>{log.response_time_ms}ms</TableCell>
                            <TableCell>{new Date(log.triggered_at).toLocaleString()}</TableCell>
                            <TableCell>
                              {log.error_message && (
                                <span className="text-red-500 text-sm">{log.error_message}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a webhook</h3>
                    <p className="text-muted-foreground">
                      Choose a webhook from the list to view its activity logs
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Webhooks;