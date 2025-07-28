import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, Phone, Calendar, Trash2, Edit, RefreshCw, 
  PhoneCall, MessageSquare, Bell, User, AlertCircle,
  CheckCircle2, XCircle, Play, Pause, RotateCcw
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface CallbackRequest {
  id: string;
  client_name: string;
  phone_number: string;
  caller_number?: string;
  scheduled_datetime: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress' | 'failed';
  notes: string;
  agent_id?: string;
  task_type: 'callback' | 'follow_up' | 'reminder';
  original_conversation_id?: string;
  callback_reason?: string;
  created_at: string;
  created_via_webhook?: boolean;
  webhook_payload?: any;
  sms_sent?: boolean;
  sms_response?: any;
}

const CallbackScheduler = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCallback, setSelectedCallback] = useState<CallbackRequest | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [editForm, setEditForm] = useState({
    client_name: '',
    phone_number: '',
    scheduled_datetime: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: '',
    callback_reason: ''
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Fetch callback requests
  const { data: callbacks = [], isLoading } = useQuery({
    queryKey: ['callback-requests', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_calls')
        .select('*')
        .eq('user_id', user.id)
        .in('task_type', ['callback', 'follow_up', 'reminder'])
        .order('scheduled_datetime', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(callback => ({
        ...callback,
        priority: callback.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: callback.status as 'scheduled' | 'completed' | 'cancelled' | 'in_progress' | 'failed',
        task_type: callback.task_type as 'callback' | 'follow_up' | 'reminder'
      })) as CallbackRequest[];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch user's agents
  const { data: userAgents = [] } = useQuery({
    queryKey: ['user-agents', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kalina_agents')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Update callback mutation
  const updateCallbackMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<CallbackRequest> }) => {
      const { data, error } = await supabase
        .from('scheduled_calls')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callback-requests', user.id] });
      toast({
        title: "Callback actualizat",
        description: "Detaliile callback-ului au fost actualizate cu succes.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error updating callback:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza callback-ul.",
        variant: "destructive",
      });
    },
  });

  // Delete callback mutation
  const deleteCallbackMutation = useMutation({
    mutationFn: async (callbackId: string) => {
      const { error } = await supabase
        .from('scheduled_calls')
        .delete()
        .eq('id', callbackId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callback-requests', user.id] });
      toast({
        title: "Callback șters",
        description: "Callback-ul a fost șters cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error deleting callback:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge callback-ul.",
        variant: "destructive",
      });
    },
  });

  // Execute callback mutation
  const executeCallbackMutation = useMutation({
    mutationFn: async (callback: CallbackRequest) => {
      // First, mark as in progress
      await updateCallbackMutation.mutateAsync({
        id: callback.id,
        updates: { status: 'in_progress' }
      });

      // Then initiate the call
      const { data, error } = await supabase.functions.invoke('initiate-scheduled-call', {
        body: {
          agent_id: callback.agent_id,
          phone_number: callback.phone_number,
          caller_number: callback.caller_number,
          contact_name: callback.client_name,
          user_id: user.id
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, callback) => {
      updateCallbackMutation.mutate({
        id: callback.id,
        updates: { status: 'completed' }
      });
      
      toast({
        title: "Callback executat cu succes!",
        description: `Apelul către ${callback.client_name} a fost inițiat.`,
      });
    },
    onError: (error, callback) => {
      updateCallbackMutation.mutate({
        id: callback.id,
        updates: { status: 'failed' }
      });
      
      toast({
        title: "Eroare la executarea callback-ului",
        description: error.message || "Nu s-a putut iniția apelul.",
        variant: "destructive",
      });
    },
  });

  // Filter callbacks
  const filteredCallbacks = callbacks.filter(callback => {
    const statusMatch = statusFilter === 'all' || callback.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || callback.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  // Group callbacks by status and time
  const groupedCallbacks = {
    overdue: filteredCallbacks.filter(cb => 
      new Date(cb.scheduled_datetime) < new Date() && cb.status === 'scheduled'
    ),
    upcoming: filteredCallbacks.filter(cb => 
      new Date(cb.scheduled_datetime) >= new Date() && cb.status === 'scheduled'
    ),
    completed: filteredCallbacks.filter(cb => cb.status === 'completed'),
    failed: filteredCallbacks.filter(cb => cb.status === 'failed' || cb.status === 'cancelled'),
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { 
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: <CheckCircle2 className="h-3 w-3" />
        };
      case 'in_progress':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <RefreshCw className="h-3 w-3 animate-spin" />
        };
      case 'failed':
      case 'cancelled':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle className="h-3 w-3" />
        };
      default:
        return { 
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: <Clock className="h-3 w-3" />
        };
    }
  };

  // Handle edit callback
  const handleEditCallback = (callback: CallbackRequest) => {
    setSelectedCallback(callback);
    setEditForm({
      client_name: callback.client_name,
      phone_number: callback.phone_number,
      scheduled_datetime: new Date(callback.scheduled_datetime).toISOString().slice(0, 16),
      description: callback.description,
      priority: callback.priority,
      notes: callback.notes,
      callback_reason: callback.callback_reason || ''
    });
    setIsEditDialogOpen(true);
  };

  // Handle update callback
  const handleUpdateCallback = () => {
    if (!selectedCallback) return;

    updateCallbackMutation.mutate({
      id: selectedCallback.id,
      updates: {
        client_name: editForm.client_name,
        phone_number: editForm.phone_number,
        scheduled_datetime: new Date(editForm.scheduled_datetime).toISOString(),
        description: editForm.description,
        priority: editForm.priority,
        notes: editForm.notes,
        callback_reason: editForm.callback_reason
      }
    });
  };

  // Get task type icon and label
  const getTaskTypeInfo = (taskType: string) => {
    switch (taskType) {
      case 'callback':
        return { icon: <PhoneCall className="h-3 w-3" />, label: 'Callback' };
      case 'follow_up':
        return { icon: <MessageSquare className="h-3 w-3" />, label: 'Follow-up' };
      case 'reminder':
        return { icon: <Bell className="h-3 w-3" />, label: 'Reminder' };
      default:
        return { icon: <Phone className="h-3 w-3" />, label: 'Call' };
    }
  };

  const renderCallbackCard = (callback: CallbackRequest) => {
    const statusInfo = getStatusInfo(callback.status);
    const taskTypeInfo = getTaskTypeInfo(callback.task_type);
    const isOverdue = new Date(callback.scheduled_datetime) < new Date() && callback.status === 'scheduled';

    return (
      <Card key={callback.id} className={`transition-all hover:shadow-md ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">{callback.client_name}</CardTitle>
              {isOverdue && <AlertCircle className="h-4 w-4 text-red-500" />}
              {callback.created_via_webhook && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Webhook
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getPriorityColor(callback.priority)}>
                {callback.priority}
              </Badge>
              <Badge variant="outline" className={statusInfo.color}>
                {statusInfo.icon}
                <span className="ml-1">{callback.status}</span>
              </Badge>
              {callback.sms_sent && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  SMS Trimis
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{callback.phone_number}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(callback.scheduled_datetime), 'dd MMM yyyy, HH:mm', { locale: ro })}
                {' '}
                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                  ({formatDistanceToNow(new Date(callback.scheduled_datetime), { 
                    addSuffix: true, 
                    locale: ro 
                  })})
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {taskTypeInfo.icon}
              <span>{taskTypeInfo.label}</span>
              {callback.callback_reason && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {callback.callback_reason}
                </span>
              )}
            </div>

            {callback.description && (
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {callback.description}
              </p>
            )}

            {callback.notes && (
              <p className="text-xs text-gray-500 italic">
                Note: {callback.notes}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditCallback(callback)}
                  disabled={callback.status === 'completed'}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editează
                </Button>
                
                {callback.status === 'scheduled' && (
                  <Button
                    size="sm"
                    onClick={() => executeCallbackMutation.mutate(callback)}
                    disabled={executeCallbackMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Execută Acum
                  </Button>
                )}

                {callback.status === 'failed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateCallbackMutation.mutate({
                      id: callback.id,
                      updates: { 
                        status: 'scheduled',
                        scheduled_datetime: new Date(Date.now() + 5 * 60 * 1000).toISOString()
                      }
                    })}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reprogramează
                  </Button>
                )}
              </div>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteCallbackMutation.mutate(callback.id)}
                disabled={deleteCallbackMutation.isPending}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Manual callback detection states
  const [manualTestText, setManualTestText] = useState('');
  const [manualTestPhone, setManualTestPhone] = useState('+37379416481');
  const [manualTestName, setManualTestName] = useState('Test Manual');

  // Manual callback detection mutation
  const manualDetectionMutation = useMutation({
    mutationFn: async ({ text, phoneNumber, contactName }: { text: string, phoneNumber: string, contactName: string }) => {
      const { data, error } = await supabase.functions.invoke('detect-callback-intent', {
        body: {
          text,
          conversationId: `manual-test-${Date.now()}`,
          phoneNumber,
          contactName,
          agentId: userAgents[0]?.elevenlabs_agent_id,
          userId: user.id
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['callback-requests', user.id] });
      toast({
        title: data.callbackDetected ? "Callback detectat!" : "Nu s-a detectat callback",
        description: data.message || "Test completat",
        variant: data.callbackDetected ? "default" : "destructive"
      });
    },
    onError: (error) => {
      toast({
        title: "Eroare la testare",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleManualTest = () => {
    if (!manualTestText.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu textul pentru testare",
        variant: "destructive"
      });
      return;
    }

    manualDetectionMutation.mutate({
      text: manualTestText,
      phoneNumber: manualTestPhone,
      contactName: manualTestName
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Callback Scheduler</h1>
            <p className="text-muted-foreground">
              Gestionează contactele care au cerut să fie sunați înapoi
            </p>
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                <SelectItem value="scheduled">Programate</SelectItem>
                <SelectItem value="completed">Completate</SelectItem>
                <SelectItem value="failed">Eșuate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Prioritate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">Mare</SelectItem>
                <SelectItem value="medium">Medie</SelectItem>
                <SelectItem value="low">Mică</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Webhook Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Webhook pentru Callback-uri Automate
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Folosește această adresă pentru a crea callback-uri automat din agentul tău
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Adresa Webhook</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value="https://pwfczzxwjfxomqzhhwvj.supabase.co/functions/v1/create-callback-webhook"
                  readOnly
                  className="flex-1 text-xs bg-muted"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText("https://pwfczzxwjfxomqzhhwvj.supabase.co/functions/v1/create-callback-webhook");
                    toast({
                      title: "Copiat!",
                      description: "Adresa webhook a fost copiată în clipboard",
                    });
                  }}
                >
                  Copiază
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <Label className="text-sm font-medium">Format Minim (doar 3 câmpuri):</Label>
                <pre className="bg-green-50 border border-green-200 p-3 rounded text-xs overflow-x-auto mt-1">
{`{
  "phone_number": "+37379123456",
  "callback_time": "30 minutes",
  "agent_name": "Numele Agentului"
}`}
                </pre>
                
                <Label className="text-sm font-medium mt-3">Format Complet (opțional):</Label>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto mt-1">
{`{
  "phone_number": "+37379123456",
  "callback_time": "30 minutes", 
  "agent_name": "Numele Agentului",
  "client_name": "Ion Popescu",
  "reason": "să mă gândesc la ofertă",
  "priority": "medium",
  "send_sms": true,
  "sms_message": "Te voi suna în {callback_time}!"
}`}
                </pre>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Identificarea Utilizatorului:</Label>
                <div className="bg-muted p-3 rounded text-xs mt-1 space-y-2">
                  <p className="font-medium text-green-700">Webhook-ul identifică automat utilizatorul prin:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>agent_name:</strong> Numele agentului (recomandat - simplu)</li>
                    <li><strong>user_id:</strong> ID-ul direct al utilizatorului</li>
                    <li><strong>user_email:</strong> Email-ul utilizatorului din sistem</li>
                    <li><strong>agent_id:</strong> ID-ul agentului ElevenLabs asociat</li>
                  </ul>
                  <p className="text-xs text-green-600 bg-green-50 p-2 rounded mt-2">
                    ✅ Folosește <strong>agent_name</strong> - cel mai simplu mod de identificare!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800 mb-2">⚠️ IMPORTANT - Configurare Tool în ElevenLabs:</p>
                  <p className="text-red-700 mb-3">
                    Agentul nu poate trimite callback-uri fără să configurezi un <strong>Client Tool</strong> în ElevenLabs Dashboard!
                  </p>
                  
                  <div className="bg-red-100 p-3 rounded text-red-800 space-y-2">
                    <p className="font-medium">Pași obligatorii:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Du-te în <strong>ElevenLabs Dashboard</strong></li>
                      <li>Editează agentul tău</li>
                      <li>Adaugă <strong>Client Tool</strong> nou</li>
                      <li>Numește-l: <strong>CreateCallback</strong></li>
                      <li>URL: <code className="bg-red-200 px-1 rounded">https://pwfczzxwjfxomqzhhwvj.supabase.co/functions/v1/create-callback-webhook</code></li>
                      <li>Method: <strong>POST</strong></li>
                      <li>Parametrii: phone_number, callback_time, agent_name</li>
                    </ol>
                    
                    <p className="font-medium text-red-900 mt-3">
                      Fără acest tool, agentul NU poate trimite datele la webhook!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-blue-800 mb-1">Actualizează promptul agentului:</p>
                  <pre className="bg-blue-100 p-2 rounded text-blue-800 overflow-x-auto text-xs">
{`"Când clientul cere callback:
1. Extrage: phone_number, callback_time, agent_name
2. Folosește tool-ul CreateCallback pentru a trimite datele
3. Confirmă: 'Perfect, te voi suna înapoi în [callback_time]!'"`}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Întârziate</p>
                  <p className="text-2xl font-bold text-red-600">{groupedCallbacks.overdue.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Programate</p>
                  <p className="text-2xl font-bold text-blue-600">{groupedCallbacks.upcoming.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completate</p>
                  <p className="text-2xl font-bold text-green-600">{groupedCallbacks.completed.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Eșuate</p>
                  <p className="text-2xl font-bold text-gray-600">{groupedCallbacks.failed.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manual Callback Detection Test */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Testare Manuală Detecție Callback</CardTitle>
            <p className="text-sm text-muted-foreground">
              Testează dacă textul unei conversații conține o cerere de callback
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test_phone">Numărul de Telefon</Label>
                <Input
                  id="test_phone"
                  value={manualTestPhone}
                  onChange={(e) => setManualTestPhone(e.target.value)}
                  placeholder="+37379416481"
                />
              </div>
              <div>
                <Label htmlFor="test_name">Numele Contactului</Label>
                <Input
                  id="test_name"
                  value={manualTestName}
                  onChange={(e) => setManualTestName(e.target.value)}
                  placeholder="Test Manual"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="test_text">Textul Conversației</Label>
              <Textarea
                id="test_text"
                value={manualTestText}
                onChange={(e) => setManualTestText(e.target.value)}
                placeholder="De ex: 'telefoneaza-ma peste 5 minute va rog'"
                rows={4}
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={handleManualTest}
                disabled={manualDetectionMutation.isPending}
                className="w-full"
              >
                {manualDetectionMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Se testează...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Testează Detecția de Callback
                  </>
                )}
              </Button>
              
              <Button 
                onClick={async () => {
                  try {
                    const { data, error } = await supabase.functions.invoke('check-scheduled-tasks');
                    
                    if (error) {
                      console.error('Error checking scheduled tasks:', error);
                      toast({
                        title: "Eroare",
                        description: error.message || "Eroare la verificarea task-urilor programate",
                        variant: "destructive"
                      });
                      return;
                    }

                    queryClient.invalidateQueries({ queryKey: ['callback-requests', user.id] });
                    
                    toast({
                      title: "Verificare Task-uri",
                      description: data.message || "Task-uri verificate cu succes",
                      variant: data.executedTasks > 0 ? "default" : "destructive"
                    });
                  } catch (error) {
                    console.error('Error:', error);
                    toast({
                      title: "Eroare",
                      description: "Eroare la verificarea task-urilor programate",
                      variant: "destructive"
                    });
                  }
                }}
                variant="secondary"
                className="w-full"
              >
                <Clock className="h-4 w-4 mr-2" />
                Verifică și Execută Task-uri Programate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Callback Lists */}
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Se încarcă callback-urile...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overdue Callbacks */}
            {groupedCallbacks.overdue.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Callback-uri Întârziate ({groupedCallbacks.overdue.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedCallbacks.overdue.map(renderCallbackCard)}
                </div>
              </div>
            )}

            {/* Upcoming Callbacks */}
            {groupedCallbacks.upcoming.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-blue-600 mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Callback-uri Programate ({groupedCallbacks.upcoming.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedCallbacks.upcoming.map(renderCallbackCard)}
                </div>
              </div>
            )}

            {/* Completed Callbacks */}
            {groupedCallbacks.completed.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Callback-uri Completate ({groupedCallbacks.completed.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedCallbacks.completed.slice(0, 6).map(renderCallbackCard)}
                </div>
              </div>
            )}

            {filteredCallbacks.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <PhoneCall className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nu există callback-uri</h3>
                  <p className="text-muted-foreground">
                    Nu ai niciun callback programat în acest moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Edit Callback Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editează Callback</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client_name">Numele Clientului</Label>
                <Input
                  id="client_name"
                  value={editForm.client_name}
                  onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone_number">Numărul de Telefon</Label>
                <Input
                  id="phone_number"
                  value={editForm.phone_number}
                  onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="scheduled_datetime">Data și Ora</Label>
                <Input
                  id="scheduled_datetime"
                  type="datetime-local"
                  value={editForm.scheduled_datetime}
                  onChange={(e) => setEditForm({ ...editForm, scheduled_datetime: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="priority">Prioritate</Label>
                <Select 
                  value={editForm.priority} 
                  onValueChange={(value) => setEditForm({ ...editForm, priority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Mică</SelectItem>
                    <SelectItem value="medium">Medie</SelectItem>
                    <SelectItem value="high">Mare</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="callback_reason">Motivul Callback-ului</Label>
                <Input
                  id="callback_reason"
                  value={editForm.callback_reason}
                  onChange={(e) => setEditForm({ ...editForm, callback_reason: e.target.value })}
                  placeholder="De ex: întrebare despre produs, programare întâlnire"
                />
              </div>

              <div>
                <Label htmlFor="description">Descriere</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Note</Label>
                <Textarea
                  id="notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpdateCallback}
                  disabled={updateCallbackMutation.isPending}
                  className="flex-1"
                >
                  {updateCallbackMutation.isPending ? 'Se salvează...' : 'Salvează'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  Anulează
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CallbackScheduler;