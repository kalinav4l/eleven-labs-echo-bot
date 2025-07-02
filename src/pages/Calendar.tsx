import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CalendarIcon, Clock, Phone, Plus, ChevronLeft, ChevronRight, Users, 
  CheckCircle, AlertCircle, Trash2, Bot, Zap, Sparkles, Target, 
  PhoneCall, MessageSquare, Settings, Wand2, Lightbulb,
  BrainCircuit, Network, Globe, TrendingUp, Calendar as CalendarDays
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CalendarAITaskDialog from '@/components/CalendarAITaskDialog';
import IntelligentCampaignCreator from '@/components/IntelligentCampaignCreator';

interface ScheduledCall {
  id: string;
  client_name: string;
  phone_number: string;
  scheduled_datetime: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
  notes: string;
  agent_id?: string;
  agent_phone_number?: string;
  task_type?: 'call' | 'campaign' | 'follow_up' | 'smart_outreach';
  campaign_id?: string;
  auto_generated?: boolean;
}

const Calendar = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAITaskDialogOpen, setIsAITaskDialogOpen] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [showIntelligentCreator, setShowIntelligentCreator] = useState(false);

  const [formData, setFormData] = useState({
    client_name: '',
    phone_number: '',
    scheduled_datetime: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
    agent_id: '',
    task_type: 'call' as 'call' | 'campaign' | 'follow_up' | 'smart_outreach'
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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

  // Fetch scheduled calls and tasks
  const { data: scheduledCalls = [], isLoading } = useQuery({
    queryKey: ['scheduled-calls', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_calls')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_datetime', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(call => ({
        ...call,
        priority: call.priority as 'low' | 'medium' | 'high',
        status: call.status as 'scheduled' | 'completed' | 'cancelled' | 'in_progress'
      })) as ScheduledCall[];
    },
    enabled: !!user,
  });

  // Fetch call history for intelligent analysis
  const { data: callHistory = [] } = useQuery({
    queryKey: ['call-history', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('call_history')
        .select('*')
        .eq('user_id', user.id)
        .order('call_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Create call mutation
  const createCallMutation = useMutation({
    mutationFn: async (callData: Omit<ScheduledCall, 'id'>) => {
      const { data, error } = await supabase
        .from('scheduled_calls')
        .insert({
          user_id: user.id,
          client_name: callData.client_name,
          phone_number: callData.phone_number,
          scheduled_datetime: callData.scheduled_datetime,
          description: callData.description,
          priority: callData.priority,
          status: 'scheduled',
          notes: callData.notes,
          agent_id: callData.agent_id,
          task_type: callData.task_type
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-calls', user.id] });
      toast({
        title: "Task creat cu succes!",
        description: "Taskul a fost programat în calendar.",
      });
      setFormData({
        client_name: '',
        phone_number: '',
        scheduled_datetime: '',
        description: '',
        priority: 'medium',
        notes: '',
        agent_id: '',
        task_type: 'call'
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut crea taskul.",
        variant: "destructive",
      });
    },
  });

  // Delete call mutation
  const deleteCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      const { error } = await supabase
        .from('scheduled_calls')
        .delete()
        .eq('id', callId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-calls', user.id] });
      toast({
        title: "Task șters",
        description: "Taskul a fost șters din calendar.",
      });
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge taskul.",
        variant: "destructive",
      });
    },
  });

  // Execute scheduled call using the corrected edge function
  const executeCallMutation = useMutation({
    mutationFn: async ({ agentId, phoneNumber }: { agentId: string; phoneNumber: string }) => {
      console.log('Executing call with:', { agentId, phoneNumber });
      
      const { data, error } = await supabase.functions.invoke('initiate-scheduled-call', {
        body: {
          agent_id: agentId,
          phone_number: phoneNumber
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Call initiation failed');
      }

      if (!data?.success) {
        console.error('Call initiation failed:', data);
        throw new Error(data?.error || 'Call initiation failed');
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('Call initiated successfully:', data);
      toast({
        title: "Apel inițiat cu succes!",
        description: `Conversația ${data.conversationId} a fost inițiată.`,
      });
    },
    onError: (error) => {
      console.error('Call execution error:', error);
      toast({
        title: "Eroare la inițierea apelului",
        description: error.message || "Nu s-a putut iniția apelul.",
        variant: "destructive",
      });
    },
  });

  // Handle campaigns created by intelligent creator
  const handleCampaignsCreated = (campaigns: any[]) => {
    campaigns.forEach(async (campaign) => {
      await createSmartTask({
        type: campaign.type,
        title: campaign.title,
        description: campaign.description,
        priority: campaign.priority,
        agent_instruction: campaign.messageTemplate,
        scheduled_time: campaign.scheduledTime
      });
    });
    
    setShowIntelligentCreator(false);
    queryClient.invalidateQueries({ queryKey: ['scheduled-calls', user.id] });
  };

  // Create Smart Task
  const createSmartTask = async (suggestion: any) => {
    const { error } = await supabase
      .from('scheduled_calls')
      .insert({
        user_id: user.id,
        client_name: `AI Task: ${suggestion.title}`,
        phone_number: 'Multiple',
        scheduled_datetime: suggestion.scheduled_time.toISOString(),
        description: suggestion.description,
        priority: suggestion.priority,
        status: 'scheduled',
        notes: suggestion.agent_instruction,
        task_type: 'smart_outreach',
        auto_generated: true
      });

    if (error) throw error;
  };

  // Process AI Instructions
  const handleCreateAITask = async (instruction: string, agentId?: string) => {
    setIsProcessingAI(true);
    try {
      const parsedTasks = await parseAndCreateTasks(instruction, agentId);
      
      for (const task of parsedTasks) {
        await createTaskFromInstruction(task);
      }

      queryClient.invalidateQueries({ queryKey: ['scheduled-calls', user.id] });
      
      toast({
        title: "🤖 Instrucțiuni Procesate!",
        description: `Am creat ${parsedTasks.length} taskuri bazate pe instrucțiunile tale.`,
      });
    } catch (error) {
      console.error('AI task creation error:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut procesa instrucțiunile AI.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Parse AI Instructions
  const parseAndCreateTasks = async (instruction: string, agentId?: string) => {
    const tasks = [];
    
    if (instruction.toLowerCase().includes('sună') || instruction.toLowerCase().includes('apelează')) {
      const phoneRegex = /(\+?\d{8,15})/g;
      const phones = instruction.match(phoneRegex) || [];
      
      for (const phone of phones) {
        tasks.push({
          type: 'call',
          phone_number: phone,
          instruction: instruction,
          agent_id: agentId,
          scheduled_time: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000)
        });
      }
    }

    if (instruction.toLowerCase().includes('campanie') || instruction.toLowerCase().includes('reducere')) {
      tasks.push({
        type: 'campaign',
        instruction: instruction,
        agent_id: agentId,
        scheduled_time: new Date(Date.now() + 60 * 60 * 1000)
      });
    }

    return tasks;
  };

  // Create Task from Instruction
  const createTaskFromInstruction = async (task: any) => {
    const { error } = await supabase
      .from('scheduled_calls')
      .insert({
        user_id: user.id,
        client_name: task.phone_number || 'AI Generated Task',
        phone_number: task.phone_number || 'Multiple',
        scheduled_datetime: task.scheduled_time.toISOString(),
        description: `AI Task: ${task.instruction.substring(0, 100)}...`,
        priority: 'medium',
        status: 'scheduled',
        notes: task.instruction,
        task_type: task.type,
        agent_id: task.agent_id,
        auto_generated: true
      });

    if (error) throw error;
  };

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Get calendar days
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  // Get calls for a specific date
  const getCallsForDate = (date: Date) => {
    return scheduledCalls.filter(call => {
      const callDate = new Date(call.scheduled_datetime);
      return callDate.toDateString() === date.toDateString();
    });
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Get task type icon
  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'campaign': return <Target className="h-3 w-3" />;
      case 'smart_outreach': return <BrainCircuit className="h-3 w-3" />;
      case 'follow_up': return <MessageSquare className="h-3 w-3" />;
      default: return <Phone className="h-3 w-3" />;
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const currentTime = new Date();
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    
    const selectedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    setFormData(prev => ({ ...prev, scheduled_datetime: selectedDateTime }));
    setIsDialogOpen(true);
  };

  const handleDeleteCall = (callId: string) => {
    deleteCallMutation.mutate(callId);
  };

  const handleExecuteCall = (call: ScheduledCall) => {
    if (!call.agent_id || !call.phone_number) {
      toast({
        title: "Eroare",
        description: "Agent ID sau numărul de telefon lipsesc.",
        variant: "destructive",
      });
      return;
    }

    executeCallMutation.mutate({
      agentId: call.agent_id,
      phoneNumber: call.phone_number
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name || !formData.phone_number || !formData.scheduled_datetime) {
      toast({
        title: "Eroare",
        description: "Te rog completează toate câmpurile obligatorii.",
        variant: "destructive",
      });
      return;
    }

    createCallMutation.mutate(formData as Omit<ScheduledCall, 'id'>);
  };

  const calendarDays = getCalendarDays();
  const todayCalls = getCallsForDate(new Date());
  const weekCalls = scheduledCalls.filter(call => {
    const callDate = new Date(call.scheduled_datetime);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return callDate >= today && callDate <= weekFromNow;
  });

  if (showIntelligentCreator) {
    return (
      <TooltipProvider>
        <DashboardLayout>
          <div className="p-6 bg-white min-h-screen">
            <div className="mb-6">
              <Button
                onClick={() => setShowIntelligentCreator(false)}
                variant="outline"
                className="mb-4"
              >
                ← Înapoi la Calendar
              </Button>
            </div>
            <IntelligentCampaignCreator
              onCampaignCreated={handleCampaignsCreated}
              userAgents={userAgents}
              callHistory={callHistory}
            />
          </div>
        </DashboardLayout>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="p-6 bg-white min-h-screen">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Calendar Inteligent AI
                </h1>
                <p className="text-gray-600">Gestionează agenți, campanii și taskuri automatizate</p>
              </div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setShowIntelligentCreator(true)}
                    disabled={isProcessingAI}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isProcessingAI ? (
                      <>
                        <Lightbulb className="h-4 w-4 mr-2 animate-pulse" />
                        Generez...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        ✨ Buton Fermecat
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-medium">Butonul Fermecat - Funcția Unică!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Analizează automat toate contactele, conversațiile și contextul pentru a crea 
                    campanii inteligente personalizate și taskuri optimizate pentru fiecare contact. 
                    Folosește RAG, MCP și AI avansat pentru a genera strategic planuri de contact.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Programate</p>
                    <p className="text-2xl font-semibold text-gray-900">{scheduledCalls.length}</p>
                  </div>
                  <CalendarDays className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Azi</p>
                    <p className="text-2xl font-semibold text-gray-900">{todayCalls.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Campanii Active</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {scheduledCalls.filter(call => call.task_type === 'campaign').length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">AI Tasks</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {scheduledCalls.filter(call => call.auto_generated).length}
                    </p>
                  </div>
                  <BrainCircuit className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Finalizate</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {scheduledCalls.filter(call => call.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Programează Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Programează un Task Nou</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client_name">Numele Clientului</Label>
                      <Input
                        id="client_name"
                        value={formData.client_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                        placeholder="Ex: Ion Popescu"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone_number">Numărul de Telefon</Label>
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                        placeholder="Ex: +373xxxxxxxx"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduled_datetime">Data și Ora</Label>
                      <Input
                        id="scheduled_datetime"
                        type="datetime-local"
                        value={formData.scheduled_datetime}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduled_datetime: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Prioritate</Label>
                      <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Scăzută</SelectItem>
                          <SelectItem value="medium">Medie</SelectItem>
                          <SelectItem value="high">Ridicată</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="agent_id">Agent AI</Label>
                      <Select value={formData.agent_id} onValueChange={(value) => setFormData(prev => ({ ...prev, agent_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează un agent" />
                        </SelectTrigger>
                        <SelectContent>
                          {userAgents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.agent_id}>
                              {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="task_type">Tipul Taskului</Label>
                      <Select value={formData.task_type} onValueChange={(value: 'call' | 'campaign' | 'follow_up' | 'smart_outreach') => setFormData(prev => ({ ...prev, task_type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="call">Apel Simplu</SelectItem>
                          <SelectItem value="follow_up">Follow-up</SelectItem>
                          <SelectItem value="campaign">Campanie</SelectItem>
                          <SelectItem value="smart_outreach">Outreach Inteligent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descriere</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrierea taskului..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Note pentru Agent</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Instrucțiuni speciale pentru agent..."
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Anulează
                    </Button>
                    <Button type="submit" disabled={createCallMutation.isPending}>
                      {createCallMutation.isPending ? 'Se creează...' : 'Creează Task'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={() => setIsAITaskDialogOpen(true)}
              variant="outline"
            >
              <Bot className="h-4 w-4 mr-2" />
              Instrucțiuni AI
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-xl text-gray-900">
                    {currentDate.toLocaleDateString('ro-RO', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousMonth}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextMonth}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                      const isToday = day.toDateString() === new Date().toDateString();
                      const callsForDay = getCallsForDate(day);
                      
                      return (
                        <div
                          key={index}
                          onClick={() => handleDateClick(day)}
                          className={`
                            p-2 min-h-[80px] border rounded-lg cursor-pointer transition-all duration-200
                            ${isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                            ${isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}
                          `}
                        >
                          <div className="text-sm font-medium mb-1">{day.getDate()}</div>
                          <div className="space-y-1">
                            {callsForDay.slice(0, 2).map((call, callIndex) => (
                              <div
                                key={callIndex}
                                className={`text-xs p-1 rounded-md flex items-center gap-1 ${
                                  call.auto_generated 
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                                    : call.task_type === 'campaign'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {getTaskTypeIcon(call.task_type || 'call')}
                                <span className="truncate">{call.client_name}</span>
                                {call.auto_generated && <Sparkles className="h-2 w-2" />}
                              </div>
                            ))}
                            {callsForDay.length > 2 && (
                              <div className="text-xs text-gray-500 font-medium">
                                +{callsForDay.length - 2} mai mult
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-gray-600" />
                    Timeline Inteligent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weekCalls.slice(0, 10).map((call) => (
                      <div
                        key={call.id}
                        className={`p-3 border rounded-lg space-y-2 transition-all duration-200 hover:bg-gray-50 ${
                          call.auto_generated ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getTaskTypeIcon(call.task_type || 'call')}
                            <h4 className="font-medium text-sm">{call.client_name}</h4>
                            {call.auto_generated && (
                              <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                                <Sparkles className="h-2 w-2 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(call.priority)}>
                              {call.priority === 'high' ? 'Ridicată' : 
                               call.priority === 'medium' ? 'Medie' : 'Scăzută'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCall(call.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(call.status)}>
                            {call.status === 'scheduled' ? 'Programat' :
                             call.status === 'completed' ? 'Finalizat' :
                             call.status === 'in_progress' ? 'În progres' :
                             'Anulat'}
                          </Badge>
                          
                          {call.status === 'scheduled' && call.agent_id && call.phone_number && (
                            <Button
                              size="sm"
                              onClick={() => handleExecuteCall(call)}
                              disabled={executeCallMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white h-6 px-2 text-xs"
                            >
                              <PhoneCall className="h-3 w-3 mr-1" />
                              {executeCallMutation.isPending ? 'Sună...' : 'Sună Acum'}
                            </Button>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {call.phone_number}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(call.scheduled_datetime).toLocaleDateString('ro-RO', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        
                        {call.description && (
                          <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded-md">
                            {call.description}
                          </p>
                        )}
                      </div>
                    ))}
                    
                    {weekCalls.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nu ai taskuri programate</p>
                        <p className="text-xs mt-1">Folosește butonul fermecat pentru a genera automat!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <CalendarAITaskDialog
            isOpen={isAITaskDialogOpen}
            onClose={() => setIsAITaskDialogOpen(false)}
            onCreateTask={handleCreateAITask}
            userAgents={userAgents}
            isProcessing={isProcessingAI}
          />
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
};

export default Calendar;
