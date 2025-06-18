
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Webhook, Plus, Play, Pause, Trash2, Edit, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface WebhookManagerProps {
  onChanges?: (hasChanges: boolean) => void;
}

const WebhookManager = ({ onChanges }: WebhookManagerProps) => {
  const [webhooks, setWebhooks] = useState([
    {
      id: 1,
      name: 'Salesforce Integration',
      url: 'https://api.salesforce.com/webhook/kalina',
      events: ['call_completed', 'transcript_ready'],
      status: 'active',
      lastTriggered: '2024-01-15 14:30:25',
      successRate: 98.5,
      totalCalls: 1247
    },
    {
      id: 2,
      name: 'Slack Notifications',
      url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      events: ['call_failed', 'agent_offline'],
      status: 'paused',
      lastTriggered: '2024-01-14 09:15:10',
      successRate: 95.2,
      totalCalls: 523
    },
    {
      id: 3,
      name: 'Analytics Tracker',
      url: 'https://analytics.company.com/webhook',
      events: ['call_started', 'call_completed', 'transcript_ready'],
      status: 'error',
      lastTriggered: '2024-01-15 08:45:33',
      successRate: 87.3,
      totalCalls: 2156
    }
  ]);

  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
    headers: '{\n  "Authorization": "Bearer YOUR_TOKEN",\n  "Content-Type": "application/json"\n}',
    retryCount: 3,
    timeout: 30
  });

  const availableEvents = [
    { id: 'call_started', label: 'Apel început', description: 'Când se inițiază un apel' },
    { id: 'call_completed', label: 'Apel finalizat', description: 'Când se încheie un apel cu succes' },
    { id: 'call_failed', label: 'Apel eșuat', description: 'Când un apel eșuează' },
    { id: 'transcript_ready', label: 'Transcript gata', description: 'Când transcriptul este disponibil' },
    { id: 'agent_offline', label: 'Agent offline', description: 'Când un agent devine indisponibil' },
    { id: 'sentiment_alert', label: 'Alertă sentiment', description: 'Când se detectează sentiment negativ' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEventToggle = (eventId: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }));
  };

  const handleCreateWebhook = () => {
    if (newWebhook.name && newWebhook.url && newWebhook.events.length > 0) {
      const webhook = {
        id: webhooks.length + 1,
        ...newWebhook,
        status: 'active',
        lastTriggered: 'Never',
        successRate: 100,
        totalCalls: 0
      };
      setWebhooks([...webhooks, webhook]);
      setNewWebhook({ name: '', url: '', events: [], headers: '{\n  "Authorization": "Bearer YOUR_TOKEN",\n  "Content-Type": "application/json"\n}', retryCount: 3, timeout: 30 });
      onChanges?.(true);
    }
  };

  const toggleWebhookStatus = (id: number) => {
    setWebhooks(webhooks.map(webhook => 
      webhook.id === id 
        ? { ...webhook, status: webhook.status === 'active' ? 'paused' : 'active' }
        : webhook
    ));
    onChanges?.(true);
  };

  const deleteWebhook = (id: number) => {
    setWebhooks(webhooks.filter(webhook => webhook.id !== id));
    onChanges?.(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manager Webhook-uri</h2>
          <p className="text-gray-600">Configurează și monitorizează webhook-urile pentru integrări</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adaugă webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Creează webhook nou</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="webhook-name">Nume webhook</Label>
                <Input
                  id="webhook-name"
                  placeholder="ex: Salesforce Integration"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL endpoint</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-service.com/webhook"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Evenimente</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableEvents.map((event) => (
                    <div key={event.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`event-${event.id}`}
                        checked={newWebhook.events.includes(event.id)}
                        onChange={() => handleEventToggle(event.id)}
                        className="rounded"
                      />
                      <label htmlFor={`event-${event.id}`} className="text-sm">
                        <div className="font-medium">{event.label}</div>
                        <div className="text-xs text-gray-600">{event.description}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-headers">Headers (JSON)</Label>
                <Textarea
                  id="webhook-headers"
                  value={newWebhook.headers}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, headers: e.target.value }))}
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Reîncercări</Label>
                  <Select value={newWebhook.retryCount.toString()} onValueChange={(value) => setNewWebhook(prev => ({ ...prev, retryCount: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timeout (secunde)</Label>
                  <Select value={newWebhook.timeout.toString()} onValueChange={(value) => setNewWebhook(prev => ({ ...prev, timeout: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="60">60</SelectItem>
                      <SelectItem value="120">120</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleCreateWebhook} className="w-full">
                Creează webhook
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhooks Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Total webhook-uri</span>
            </div>
            <div className="text-2xl font-bold mt-2">{webhooks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Active</span>
            </div>
            <div className="text-2xl font-bold mt-2">{webhooks.filter(w => w.status === 'active').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-gray-600">Erori</span>
            </div>
            <div className="text-2xl font-bold mt-2">{webhooks.filter(w => w.status === 'error').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(webhook.status)}
                    <h3 className="font-semibold text-lg">{webhook.name}</h3>
                    <Badge className={getStatusColor(webhook.status)}>
                      {webhook.status === 'active' ? 'Activ' : 
                       webhook.status === 'paused' ? 'În pauză' : 'Eroare'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 font-mono">{webhook.url}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {availableEvents.find(e => e.id === event)?.label || event}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Ultima declanșare: {webhook.lastTriggered}</span>
                    <span>•</span>
                    <span>Rata de succes: {webhook.successRate}%</span>
                    <span>•</span>
                    <span>{webhook.totalCalls} apeluri</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWebhookStatus(webhook.id)}
                  >
                    {webhook.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deleteWebhook(webhook.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Webhook Test Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Test webhook
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Selectează webhook</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Alege webhook" />
                </SelectTrigger>
                <SelectContent>
                  {webhooks.map((webhook) => (
                    <SelectItem key={webhook.id} value={webhook.id.toString()}>
                      {webhook.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tip eveniment</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Alege eveniment" />
                </SelectTrigger>
                <SelectContent>
                  {availableEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payload de test (JSON)</Label>
            <Textarea
              placeholder='{\n  "event": "call_completed",\n  "call_id": "test-123",\n  "timestamp": "2024-01-15T14:30:25Z"\n}'
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          <Button className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Trimite test webhook
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookManager;
