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
      case 'urgent': return 'bg-red-600 text-white border-red-600';
      case 'high': return 'bg-orange-600 text-white border-orange-600';
      case 'medium': return 'bg-yellow-600 text-white border-yellow-600';
      case 'low': return 'bg-green-600 text-white border-green-600';
      default: return 'bg-gray-600 text-white border-gray-600';
    }
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { 
          color: 'bg-green-600 text-white border-green-600',
          icon: <CheckCircle2 className="h-3 w-3" />
        };
      case 'in_progress':
        return { 
          color: 'bg-blue-600 text-white border-blue-600',
          icon: <RefreshCw className="h-3 w-3 animate-spin" />
        };
      case 'failed':
      case 'cancelled':
        return { 
          color: 'bg-red-600 text-white border-red-600',
          icon: <XCircle className="h-3 w-3" />
        };
      default:
        return { 
          color: 'bg-gray-600 text-white border-gray-600',
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

  const renderNotionTable = () => {
    const allCallbacks = [...groupedCallbacks.overdue, ...groupedCallbacks.upcoming, ...groupedCallbacks.completed];
    
    if (allCallbacks.length === 0) return null;

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
          <div className="col-span-3">Nume Client</div>
          <div className="col-span-2">Telefon</div>
          <div className="col-span-2">Data & Ora</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Prioritate</div>
          <div className="col-span-3">Acțiuni</div>
        </div>
        
        {/* Table Rows */}
        {allCallbacks.map((callback) => {
          const isOverdue = new Date(callback.scheduled_datetime) < new Date() && callback.status === 'scheduled';
          const statusEmoji = callback.status === 'completed' ? '✅' : 
                             callback.status === 'failed' ? '❌' :
                             isOverdue ? '🔴' : '🕐';
          const priorityEmoji = callback.priority === 'urgent' ? '🔴' :
                               callback.priority === 'high' ? '🟠' :
                               callback.priority === 'medium' ? '🟡' : '🟢';
          
          return (
            <div key={callback.id} className="grid grid-cols-12 gap-4 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
              <div className="col-span-3 font-medium text-gray-900 truncate">
                {callback.client_name}
              </div>
              <div className="col-span-2 text-gray-600 text-sm">
                {callback.phone_number}
              </div>
              <div className="col-span-2 text-gray-600 text-sm">
                {format(new Date(callback.scheduled_datetime), 'dd MMM, HH:mm', { locale: ro })}
              </div>
              <div className="col-span-1 text-sm">
                <span className="flex items-center gap-1">
                  {statusEmoji}
                  <span className="capitalize">{callback.status}</span>
                </span>
              </div>
              <div className="col-span-1 text-sm">
                <span className="flex items-center gap-1">
                  {priorityEmoji}
                  <span className="capitalize">{callback.priority}</span>
                </span>
              </div>
              <div className="col-span-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditCallback(callback)}
                  disabled={callback.status === 'completed'}
                  className="h-8 px-3 text-xs border-gray-300 hover:border-gray-400"
                >
                  Editează
                </Button>
                
                {callback.status === 'scheduled' && (
                  <Button
                    size="sm"
                    onClick={() => executeCallbackMutation.mutate(callback)}
                    disabled={executeCallbackMutation.isPending}
                    className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                  >
                    Sună
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteCallbackMutation.mutate(callback.id)}
                  disabled={deleteCallbackMutation.isPending}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
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
      <div className="max-w-7xl mx-auto p-6 space-y-6 bg-white min-h-screen">
        {/* Header - Notion style */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">📞 Programări Callback</h1>
              <p className="text-gray-600">
                Gestionează contactele care au cerut să fie sunați înapoi
              </p>
            </div>
            
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 border-gray-300">
                  <SelectValue placeholder="Filtrează status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📋 Toate</SelectItem>
                  <SelectItem value="scheduled">🕐 Programate</SelectItem>
                  <SelectItem value="completed">✅ Completate</SelectItem>
                  <SelectItem value="failed">❌ Eșuate</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36 border-gray-300">
                  <SelectValue placeholder="Filtrează prioritate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📊 Toate</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                  <SelectItem value="high">🟠 Mare</SelectItem>
                  <SelectItem value="medium">🟡 Medie</SelectItem>
                  <SelectItem value="low">🟢 Mică</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Quick Stats - Notion style */}
          <div className="flex gap-8 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-red-500">●</span>
              <span>{groupedCallbacks.overdue.length} întârziate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">●</span>
              <span>{groupedCallbacks.upcoming.length} programate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">●</span>
              <span>{groupedCallbacks.completed.length} completate</span>
            </div>
          </div>
        </div>

        {/* Notion-style Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-500 mt-3">Se încarcă callback-urile...</p>
          </div>
        ) : filteredCallbacks.length === 0 ? (
          <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
            <PhoneCall className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nu există callback-uri</h3>
            <p className="text-gray-600">
              Nu ai niciun callback programat în acest moment.
            </p>
          </div>
        ) : (
          renderNotionTable()
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