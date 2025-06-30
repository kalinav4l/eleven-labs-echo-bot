
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

interface Campaign {
  id: string;
  name: string;
  description: string;
  agent_id: string;
  target_numbers: string[];
  message_template: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  scheduled_start: string;
  created_at: string;
}

interface SmartTask {
  id: string;
  title: string;
  description: string;
  task_type: 'ai_instruction' | 'campaign' | 'automated_call' | 'intelligent_routing';
  agent_id?: string;
  scheduled_datetime: string;
  conditions: any;
  status: 'pending' | 'active' | 'completed';
  created_by_ai: boolean;
}

const Calendar = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [isAITaskDialogOpen, setIsAITaskDialogOpen] = useState(false);
  const [aiInstructionText, setAIInstructionText] = useState('');
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

  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    agent_id: '',
    target_numbers: '',
    message_template: '',
    scheduled_start: ''
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
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge taskul.",
        variant: "destructive",
      });
    },
  });

  // Magic Button - Intelligent Campaign Creator
  const createIntelligentCampaigns = async () => {
    setShowIntelligentCreator(true);
  };

  // Handle campaigns created by intelligent creator
  const handleCampaignsCreated = (campaigns: any[]) => {
    // Convert campaigns to scheduled calls
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
      // Parse AI instruction and create tasks
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
    // Simulate AI parsing of natural language instructions
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
          scheduled_time: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000) // Random în următoarele 24h
        });
      }
    }

    if (instruction.toLowerCase().includes('campanie') || instruction.toLowerCase().includes('reducere')) {
      tasks.push({
        type: 'campaign',
        instruction: instruction,
        agent_id: agentId,
        scheduled_time: new Date(Date.now() + 60 * 60 * 1000) // În 1 oră
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
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
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

  // Initialize automatic calls for existing scheduled calls
  React.useEffect(() => {
    scheduledCalls.forEach(call => {
      if (call.status === 'scheduled') {
        scheduleAutomaticCall(call);
      }
    });
  }, [scheduledCalls]);

  // Schedule automatic call
  const scheduleAutomaticCall = (call: ScheduledCall) => {
    const now = new Date();
    const callTime = new Date(call.scheduled_datetime);
    const timeUntilCall = callTime.getTime() - now.getTime();

    console.log(`Apel programat pentru ${call.client_name} la ${callTime.toLocaleString('ro-RO')}`);
    console.log(`Timp până la apel: ${Math.round(timeUntilCall / 1000)} secunde`);

    if (timeUntilCall > 0) {
      setTimeout(async () => {
        try {
          console.log(`Inițiere apel pentru ${call.client_name} la ${call.phone_number}`);
          
          // Update call status to in_progress
          await supabase
            .from('scheduled_calls')
            .update({ status: 'in_progress' })
            .eq('id', call.id);

          // Make the actual call using Supabase Edge Function
          if (call.agent_id) {
            await initiateScheduledCall(call);
          }
          
          toast({
            title: "Apel inițiat!",
            description: `Se apelează ${call.client_name} la ${call.phone_number} de pe ${call.agent_phone_number}`,
          });
        } catch (error) {
          console.error('Error initiating scheduled call:', error);
          toast({
            title: "Eroare apel",
            description: "Nu s-a putut iniția apelul programat.",
            variant: "destructive",
          });
        }
      }, timeUntilCall);
    } else {
      console.log('Apelul este programat în trecut, nu se va executa');
    }
  };

  // Function to initiate the actual call - now uses secure backend
  const initiateScheduledCall = async (call: ScheduledCall) => {
    try {
      console.log('Apelare edge function pentru inițierea apelului...');
      
      const { data, error } = await supabase.functions.invoke('initiate-scheduled-call', {
        body: {
          agent_id: call.agent_id,
          phone_number: call.phone_number,
          agent_phone_number_id: call.agent_phone_number // Doar ID-ul, nu valoarea hardcodată
        }
      });

      if (error) {
        console.error('Eroare edge function:', error);
        throw error;
      }

      console.log('Apel inițiat cu succes:', data);

      // Update call status to completed
      await supabase
        .from('scheduled_calls')
        .update({ status: 'completed' })
        .eq('id', call.id);
        
      queryClient.invalidateQueries({ queryKey: ['scheduled-calls', user.id] });
      
    } catch (error) {
      console.error('Error making scheduled call:', error);
      // Update call status to cancelled if failed
      await supabase
        .from('scheduled_calls')
        .update({ status: 'cancelled' })
        .eq('id', call.id);
        
      toast({
        title: "Eroare apel",
        description: "Apelul nu a putut fi inițiat. Verifică configurarea din setări.",
        variant: "destructive",
      });
    }
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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // Fix timezone issue - use the exact date clicked without timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const currentTime = new Date();
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    
    const selectedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    console.log(`Data selectată: ${date.toDateString()}, DateTime format: ${selectedDateTime}`);
    
    setFormData(prev => ({ ...prev, scheduled_datetime: selectedDateTime }));
    setIsDialogOpen(true);
  };

  const handleDeleteCall = (callId: string) => {
    deleteCallMutation.mutate(callId);
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
          <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
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
        <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent mb-2">
                  Calendar Inteligent AI
                </h1>
                <p className="text-slate-600">Gestionează agenți, campanii și taskuri automatizate</p>
              </div>
              
              {/* Magic Button - Butonul Fermecat */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={createIntelligentCampaigns}
                    disabled={isProcessingAI}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Programate</p>
                    <p className="text-2xl font-bold text-slate-900">{scheduledCalls.length}</p>
                  </div>
                  <CalendarDays className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Azi</p>
                    <p className="text-2xl font-bold text-slate-900">{todayCalls.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Campanii Active</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {scheduledCalls.filter(call => call.task_type === 'campaign').length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">AI Tasks</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {scheduledCalls.filter(call => call.auto_generated).length}
                    </p>
                  </div>
                  <BrainCircuit className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Finalizate</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {scheduledCalls.filter(call => call.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Creează un task simplu de apel sau follow-up pentru o anumită dată și oră</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <CalendarAITaskDialog
                  isOpen={isAITaskDialogOpen}
                  onClose={() => setIsAITaskDialogOpen(false)}
                  onCreateTask={handleCreateAITask}
                  userAgents={userAgents}
                  isProcessing={isProcessingAI}
                />
                <Button 
                  onClick={() => setIsAITaskDialogOpen(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Instrucțiuni AI
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Scrie instrucțiuni în limbaj natural pentru agentul AI să creeze taskuri complexe automat</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg">
                  <Target className="h-4 w-4 mr-2" />
                  Creează Campanie
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Lansează campanii de apeluri automate pentru multiple contacte cu mesaje personalizate</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg">
                  <Network className="h-4 w-4 mr-2" />
                  Routing Inteligent
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configurează rutarea inteligentă a apelurilor către agenți specializați pe baza contextului</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enhanced Calendar */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-xl text-slate-900">
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
                      className="hover:bg-slate-100"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextMonth}
                      className="hover:bg-slate-100"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-slate-600">
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
                            ${isCurrentMonth ? 'bg-white hover:bg-slate-50 hover:shadow-md' : 'bg-slate-50 text-slate-400'}
                            ${isToday ? 'bg-blue-50 border-blue-200 shadow-md' : 'border-slate-200'}
                          `}
                        >
                          <div className="text-sm font-medium mb-1">{day.getDate()}</div>
                          <div className="space-y-1">
                            {callsForDay.slice(0, 2).map((call, callIndex) => (
                              <div
                                key={callIndex}
                                className={`text-xs p-1 rounded-md flex items-center gap-1 ${
                                  call.auto_generated 
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                    : call.task_type === 'campaign'
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {getTaskTypeIcon(call.task_type || 'call')}
                                <span className="truncate">{call.client_name}</span>
                                {call.auto_generated && <Sparkles className="h-2 w-2" />}
                              </div>
                            ))}
                            {callsForDay.length > 2 && (
                              <div className="text-xs text-slate-500 font-medium">
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

            {/* Enhanced Sidebar */}
            <div>
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                    Timeline Inteligent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weekCalls.slice(0, 10).map((call) => (
                      <div
                        key={call.id}
                        className={`p-3 border rounded-xl space-y-2 transition-all duration-200 hover:shadow-md ${
                          call.auto_generated ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getTaskTypeIcon(call.task_type || 'call')}
                            <h4 className="font-medium text-sm">{call.client_name}</h4>
                            {call.auto_generated && (
                              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
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
                        </div>
                        
                        <div className="text-xs text-slate-600 space-y-1">
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
                          <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-md">
                            {call.description}
                          </p>
                        )}
                      </div>
                    ))}
                    
                    {weekCalls.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
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
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
};

export default Calendar;
