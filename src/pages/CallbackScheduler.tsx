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
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getPriorityColor(callback.priority)}>
                {callback.priority}
              </Badge>
              <Badge variant="outline" className={statusInfo.color}>
                {statusInfo.icon}
                <span className="ml-1">{callback.status}</span>
              </Badge>
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