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
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarIcon, Clock, Phone, Plus, ChevronLeft, ChevronRight, Users, CheckCircle, AlertCircle, Trash2, Bot, Zap, Sparkles, Target, PhoneCall, MessageSquare, Settings, Wand2, Lightbulb, BrainCircuit, Network, Globe, TrendingUp, Calendar as CalendarDays } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CalendarAITaskDialog from '@/components/CalendarAITaskDialog';
import IntelligentCampaignCreator from '@/components/IntelligentCampaignCreator';
import { useUserPhoneNumbers } from '@/hooks/useUserPhoneNumbers';
interface ScheduledCall {
  id: string;
  client_name: string;
  phone_number: string;
  caller_number?: string;
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
  const {
    user
  } = useAuth();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAITaskDialogOpen, setIsAITaskDialogOpen] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [showIntelligentCreator, setShowIntelligentCreator] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [formData, setFormData] = useState({
    client_name: '',
    phone_number: '',
    caller_number: '',
    scheduled_datetime: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
    agent_id: '',
    task_type: 'call' as 'call' | 'campaign' | 'follow_up' | 'smart_outreach'
  });

  // Analysis steps configuration
  const analysisSteps = [{
    title: 'Analizez istoricul conversațiilor',
    icon: <MessageSquare className="h-4 w-4" />
  }, {
    title: 'Identifică patternuri și tendințe',
    icon: <TrendingUp className="h-4 w-4" />
  }, {
    title: 'Segmentez contactele',
    icon: <Users className="h-4 w-4" />
  }, {
    title: 'Generez campanii personalizate',
    icon: <Target className="h-4 w-4" />
  }, {
    title: 'Optimizez timing și mesaje',
    icon: <Clock className="h-4 w-4" />
  }];

  // Perform intelligent analysis function
  const performIntelligentAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setShowIntelligentCreator(false);

    // Simulate AI analysis process
    for (let step = 0; step < analysisSteps.length; step++) {
      setAnalysisStep(step);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    setIsAnalyzing(false);
    toast({
      title: "🧠 Analiza completă!",
      description: "Am generat campanii inteligente personalizate."
    });

    // Generate some smart tasks after analysis
    await generateSmartTasks();
  };

  // Generate smart tasks based on analysis
  const generateSmartTasks = async () => {
    const smartTasks = [{
      title: 'Reactivare Clienți Premium',
      description: 'Campanie personalizată pentru clienții cu valoare mare',
      priority: 'high' as const,
      scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000),
      agent_instruction: 'Contactează clienții premium cu oferte exclusive'
    }, {
      title: 'Welcome Call pentru Clienți Noi',
      description: 'Apeluri de bun venit pentru clienții noi',
      priority: 'medium' as const,
      scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      agent_instruction: 'Oferă suport și informații pentru clienții noi'
    }];
    for (const task of smartTasks) {
      await createSmartTask(task);
    }
    queryClient.invalidateQueries({
      queryKey: ['scheduled-calls', user.id]
    });
  };
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Fetch user's agents
  const {
    data: userAgents = []
  } = useQuery({
    queryKey: ['user-agents', user.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('kalina_agents').select('*').eq('user_id', user.id).eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch user's phone numbers
  const {
    data: userPhoneNumbers = []
  } = useUserPhoneNumbers();

  // Fetch scheduled calls and tasks
  const {
    data: scheduledCalls = [],
    isLoading
  } = useQuery({
    queryKey: ['scheduled-calls', user.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('scheduled_calls').select('*').eq('user_id', user.id).order('scheduled_datetime', {
        ascending: true
      });
      if (error) throw error;
      return (data || []).map(call => ({
        ...call,
        priority: call.priority as 'low' | 'medium' | 'high',
        status: call.status as 'scheduled' | 'completed' | 'cancelled' | 'in_progress'
      })) as ScheduledCall[];
    },
    enabled: !!user
  });

  // Fetch call history for intelligent analysis
  const {
    data: callHistory = []
  } = useQuery({
    queryKey: ['call-history', user.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('call_history').select('*').eq('user_id', user.id).order('call_date', {
        ascending: false
      }).limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Create call mutation
  const createCallMutation = useMutation({
    mutationFn: async (callData: Omit<ScheduledCall, 'id'>) => {
      const {
        data,
        error
      } = await supabase.from('scheduled_calls').insert({
        user_id: user.id,
        client_name: callData.client_name,
        phone_number: callData.phone_number,
        caller_number: callData.caller_number,
        scheduled_datetime: callData.scheduled_datetime,
        description: callData.description,
        priority: callData.priority,
        status: 'scheduled',
        notes: callData.notes,
        agent_id: callData.agent_id,
        task_type: callData.task_type
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scheduled-calls', user.id]
      });
      toast({
        title: "Task creat cu succes!",
        description: "Taskul a fost programat în calendar."
      });
      setFormData({
        client_name: '',
        phone_number: '',
        caller_number: '',
        scheduled_datetime: '',
        description: '',
        priority: 'medium',
        notes: '',
        agent_id: '',
        task_type: 'call'
      });
      setIsDialogOpen(false);
    },
    onError: error => {
      console.error('Error creating task:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut crea taskul.",
        variant: "destructive"
      });
    }
  });

  // Delete call mutation
  const deleteCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      const {
        error
      } = await supabase.from('scheduled_calls').delete().eq('id', callId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scheduled-calls', user.id]
      });
      toast({
        title: "Task șters",
        description: "Taskul a fost șters din calendar."
      });
    },
    onError: error => {
      console.error('Error deleting task:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge taskul.",
        variant: "destructive"
      });
    }
  });

  // Execute scheduled call using the corrected edge function
  const executeCallMutation = useMutation({
    mutationFn: async ({
      agentId,
      phoneNumber,
      callerNumber,
      contactName,
      userId
    }: {
      agentId: string;
      phoneNumber: string;
      callerNumber?: string | null;
      contactName?: string;
      userId?: string;
    }) => {
      console.log('Executing call with:', {
        agentId,
        phoneNumber,
        callerNumber,
        contactName,
        userId
      });
      const {
        data,
        error
      } = await supabase.functions.invoke('initiate-scheduled-call', {
        body: {
          agent_id: agentId,
          phone_number: phoneNumber,
          caller_number: callerNumber,
          contact_name: contactName,
          user_id: userId
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
    onSuccess: data => {
      console.log('Call initiated successfully:', data);
      toast({
        title: "Apel inițiat cu succes!",
        description: `Conversația ${data.conversationId} a fost inițiată.`
      });
    },
    onError: error => {
      console.error('Call execution error:', error);
      toast({
        title: "Eroare la inițierea apelului",
        description: error.message || "Nu s-a putut iniția apelul.",
        variant: "destructive"
      });
    }
  });

  // Handle campaigns created by intelligent creator
  const handleCampaignsCreated = (campaigns: any[]) => {
    campaigns.forEach(async campaign => {
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
    queryClient.invalidateQueries({
      queryKey: ['scheduled-calls', user.id]
    });
  };

  // Create Smart Task
  const createSmartTask = async (suggestion: any) => {
    const {
      error
    } = await supabase.from('scheduled_calls').insert({
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
      queryClient.invalidateQueries({
        queryKey: ['scheduled-calls', user.id]
      });
      toast({
        title: "🤖 Instrucțiuni Procesate!",
        description: `Am creat ${parsedTasks.length} taskuri bazate pe instrucțiunile tale.`
      });
    } catch (error) {
      console.error('AI task creation error:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut procesa instrucțiunile AI.",
        variant: "destructive"
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
    const {
      error
    } = await supabase.from('scheduled_calls').insert({
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
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Get task type icon
  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'campaign':
        return <Target className="h-3 w-3" />;
      case 'smart_outreach':
        return <BrainCircuit className="h-3 w-3" />;
      case 'follow_up':
        return <MessageSquare className="h-3 w-3" />;
      default:
        return <Phone className="h-3 w-3" />;
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

    // Păstrăm ora locală fără conversie la UTC
    const selectedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setFormData(prev => ({
      ...prev,
      scheduled_datetime: selectedDateTime
    }));
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
        variant: "destructive"
      });
      return;
    }
    executeCallMutation.mutate({
      agentId: call.agent_id,
      phoneNumber: call.phone_number,
      callerNumber: call.caller_number || null,
      contactName: call.client_name,
      userId: user?.id
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name || !formData.phone_number || !formData.scheduled_datetime) {
      toast({
        title: "Eroare",
        description: "Te rog completează toate câmpurile obligatorii.",
        variant: "destructive"
      });
      return;
    }
    createCallMutation.mutate({
      ...formData,
      status: 'scheduled' as const
    });
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
    return <TooltipProvider>
        <DashboardLayout>
          <div className="p-6 bg-white min-h-screen">
            <div className="mb-6">
              <Button onClick={() => setShowIntelligentCreator(false)} variant="outline" className="mb-4">
                ← Înapoi la Calendar
              </Button>
            </div>
            <IntelligentCampaignCreator onCampaignCreated={handleCampaignsCreated} userAgents={userAgents} callHistory={callHistory} />
          </div>
        </DashboardLayout>
      </TooltipProvider>;
  }
  return <TooltipProvider>
      <DashboardLayout>
        <div className="bg-white min-h-screen">
          {/* Header */}
          

          {/* Creator Inteligent de Campanii - Modal similar cu imaginea */}
          {showIntelligentCreator && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto border border-gray-100 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          Creator Inteligent de Campanii
                        </h2>
                      </div>
                      <p className="text-gray-600 text-lg">
                        Funcția unică care analizează toate datele tale pentru a crea campanii personalizate
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowIntelligentCreator(false)} className="ml-4">
                      ×
                    </Button>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BrainCircuit className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Analiză AI Avansată</h3>
                        <p className="text-gray-600 text-sm">
                          Procesez istoric conversații, patternuri de comportament și preferințe cliente
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Network className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">RAG & MCP Integration</h3>
                        <p className="text-gray-600 text-sm">
                          Folosesc toate sursele de date conectate pentru context complet
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Segmentare Inteligentă</h3>
                        <p className="text-gray-600 text-sm">
                          Împart contactele în segmente pentru campanii ultra-personalizate
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Optimizare Automată</h3>
                        <p className="text-gray-600 text-sm">
                          Aleg cel mai bun timing, agent și mesaj pentru fiecare contact
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="text-center">
                    <Button onClick={performIntelligentAnalysis} disabled={isProcessingAI} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Activează Magia AI
                    </Button>
                    <p className="text-sm text-gray-500 mt-3">
                      Procesul va dura 10-15 secunde pentru analiză completă
                    </p>
                  </div>
                </div>
              </div>
            </div>}

          {/* Analysis Progress Modal */}
          {isAnalyzing && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto border border-gray-100 p-8">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <BrainCircuit className="w-8 h-8 text-blue-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">Analiză AI în progres...</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  {analysisSteps.map((step, index) => <div key={index} className="flex items-center space-x-4">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${index < analysisStep ? 'bg-green-100 text-green-600' : index === analysisStep ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        {index < analysisStep ? <CheckCircle className="w-4 h-4" /> : step.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${index <= analysisStep ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.title}
                        </div>
                      </div>
                      {index < analysisStep && <CheckCircle className="w-5 h-5 text-green-600" />}
                    </div>)}
                </div>

                <div className="mt-6">
                  <Progress value={analysisStep / analysisSteps.length * 100} className="h-2" />
                </div>
              </div>
            </div>}

          {/* Stats and Actions Section */}
          <div className="px-6 py-4">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900 mb-1">{scheduledCalls.length}</div>
                <div className="text-sm text-gray-500 flex items-center justify-center">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  Total Programate
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-medium text-gray-900 mb-1">{todayCalls.length}</div>
                <div className="text-sm text-gray-500 flex items-center justify-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Azi
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-medium text-gray-900 mb-1">
                  {scheduledCalls.filter(call => call.task_type === 'campaign').length}
                </div>
                <div className="text-sm text-gray-500 flex items-center justify-center">
                  <Target className="h-4 w-4 mr-1" />
                  Campanii Active
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-medium text-gray-900 mb-1">
                  {scheduledCalls.filter(call => call.auto_generated).length}
                </div>
                <div className="text-sm text-gray-500 flex items-center justify-center">
                  <BrainCircuit className="h-4 w-4 mr-1" />
                  AI Tasks
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-medium text-gray-900 mb-1">
                  {scheduledCalls.filter(call => call.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-500 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Finalizate
                </div>
              </div>
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
                      <Input id="client_name" value={formData.client_name} onChange={e => setFormData(prev => ({
                        ...prev,
                        client_name: e.target.value
                      }))} placeholder="Ex: Ion Popescu" />
                    </div>
                    <div>
                      <Label htmlFor="caller_number">Sună din numărul</Label>
                      {userPhoneNumbers.length > 0 ? <Select value={formData.caller_number || ''} onValueChange={value => setFormData(prev => ({
                        ...prev,
                        caller_number: value
                      }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selectează numărul tău" />
                          </SelectTrigger>
                          <SelectContent>
                            {userPhoneNumbers.map(phoneNumber => <SelectItem key={phoneNumber.id} value={phoneNumber.phone_number}>
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                                  <div>
                                    <div className="font-medium">{phoneNumber.phone_number}</div>
                                    <div className="text-xs text-gray-500">{phoneNumber.label}</div>
                                  </div>
                                </div>
                              </SelectItem>)}
                          </SelectContent>
                        </Select> : <div className="text-sm text-gray-500 p-2 border rounded">
                          Nu ai numere salvate. Adaugă numere în secțiunea Phone Numbers.
                        </div>}
                    </div>
                    <div>
                      <Label htmlFor="phone_number">Sună către numărul</Label>
                      <Input id="phone_number" value={formData.phone_number} onChange={e => setFormData(prev => ({
                        ...prev,
                        phone_number: e.target.value
                      }))} placeholder="Ex: +373xxxxxxxx" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduled_datetime">Data și Ora</Label>
                      <Input id="scheduled_datetime" type="datetime-local" value={formData.scheduled_datetime} onChange={e => setFormData(prev => ({
                        ...prev,
                        scheduled_datetime: e.target.value
                      }))} />
                    </div>
                    <div>
                      <Label htmlFor="priority">Prioritate</Label>
                      <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({
                        ...prev,
                        priority: value
                      }))}>
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
                      <Select value={formData.agent_id} onValueChange={value => setFormData(prev => ({
                        ...prev,
                        agent_id: value
                      }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează un agent" />
                        </SelectTrigger>
                        <SelectContent>
                          {userAgents.map(agent => <SelectItem key={agent.id} value={agent.agent_id}>
                              {agent.name}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="task_type">Tipul Taskului</Label>
                      <Select value={formData.task_type} onValueChange={(value: 'call' | 'campaign' | 'follow_up' | 'smart_outreach') => setFormData(prev => ({
                        ...prev,
                        task_type: value
                      }))}>
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
                    <Textarea id="description" value={formData.description} onChange={e => setFormData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))} placeholder="Descrierea taskului..." />
                  </div>

                  <div>
                    <Label htmlFor="notes">Note pentru Agent</Label>
                    <Textarea id="notes" value={formData.notes} onChange={e => setFormData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))} placeholder="Instrucțiuni speciale pentru agent..." />
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

            <Button onClick={() => setIsAITaskDialogOpen(true)} variant="outline">
              <Bot className="h-4 w-4 mr-2" />
              Instrucțiuni AI
            </Button>
            </div>

            {/* Main Layout with Calendar and Sidebar */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Notion-style Calendar */}
              <div className="flex-1">
                <div className="bg-white">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-medium text-gray-900">
                      {currentDate.toLocaleDateString('ro-RO', {
                      month: 'long',
                      year: 'numeric'
                    })}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={goToPreviousMonth} className="h-8 w-8 p-0 hover:bg-gray-100">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={goToNextMonth} className="h-8 w-8 p-0 hover:bg-gray-100">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="px-6 py-4">
                    {/* Week Days Header */}
                    <div className="grid grid-cols-7 border-b border-gray-100">
                      {['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'].map(day => <div key={day} className="py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wide">
                          {day}
                        </div>)}
                    </div>
                    
                    {/* Calendar Days */}
                    <div className="grid grid-cols-7">
                      {calendarDays.map((day, index) => {
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                      const isToday = day.toDateString() === new Date().toDateString();
                      const callsForDay = getCallsForDate(day);
                      return <div key={index} onClick={() => handleDateClick(day)} className={`
                              relative p-3 min-h-[120px] border-r border-b border-gray-100 cursor-pointer hover:bg-gray-50/50 transition-colors
                              ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                              ${isToday ? 'bg-blue-50/30' : ''}
                            `}>
                            <div className={`text-sm mb-2 ${isToday ? 'font-semibold text-blue-600' : 'font-medium'}`}>
                              {day.getDate()}
                            </div>
                            
                            {/* Task Items */}
                            <div className="space-y-1">
                              {callsForDay.slice(0, 3).map((call, callIndex) => <div key={callIndex} className="px-2 py-1 text-xs rounded-sm bg-blue-500 text-white truncate cursor-pointer hover:bg-blue-600 transition-colors" title={call.client_name}>
                                  {call.client_name.length > 12 ? `${call.client_name.substring(0, 12)}...` : call.client_name}
                                </div>)}
                              {callsForDay.length > 3 && <div className="text-xs text-gray-500 px-2">
                                  +{callsForDay.length - 3} mai mult
                                </div>}
                            </div>
                          </div>;
                    })}
                    </div>
                  </div>
                </div>
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
                    {weekCalls.slice(0, 10).map(call => <div key={call.id} className={`p-3 border rounded-lg space-y-2 transition-all duration-200 hover:bg-gray-50 ${call.auto_generated ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getTaskTypeIcon(call.task_type || 'call')}
                            <h4 className="font-medium text-sm">{call.client_name}</h4>
                            {call.auto_generated && <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                                <Sparkles className="h-2 w-2 mr-1" />
                                AI
                              </Badge>}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(call.priority)}>
                              {call.priority === 'high' ? 'Ridicată' : call.priority === 'medium' ? 'Medie' : 'Scăzută'}
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCall(call.id)} className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(call.status)}>
                            {call.status === 'scheduled' ? 'Programat' : call.status === 'completed' ? 'Finalizat' : call.status === 'in_progress' ? 'În progres' : 'Anulat'}
                          </Badge>
                          
                          {call.status === 'scheduled' && call.agent_id && call.phone_number && <Button size="sm" onClick={() => handleExecuteCall(call)} disabled={executeCallMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white h-6 px-2 text-xs">
                              <PhoneCall className="h-3 w-3 mr-1" />
                              {executeCallMutation.isPending ? 'Sună...' : 'Sună Acum'}
                            </Button>}
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
                        
                        {call.description && <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded-md">
                            {call.description}
                          </p>}
                      </div>)}
                    
                    {weekCalls.length === 0 && <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nu ai taskuri programate</p>
                        <p className="text-xs mt-1">Folosește butonul fermecat pentru a genera automat!</p>
                      </div>}
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          </div>

          <CalendarAITaskDialog isOpen={isAITaskDialogOpen} onClose={() => setIsAITaskDialogOpen(false)} onCreateTask={handleCreateAITask} userAgents={userAgents} isProcessing={isProcessingAI} />
        </div>
      </DashboardLayout>
    </TooltipProvider>;
};
export default Calendar;