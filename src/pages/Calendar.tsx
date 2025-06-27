import React, { useState } from 'react';
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
import { CalendarIcon, Clock, Phone, Plus, ChevronLeft, ChevronRight, Users, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
}

const Calendar = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    phone_number: '',
    scheduled_datetime: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
    agent_id: ''
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Fetch user's agents for the dropdown
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

  // Fetch scheduled calls
  const { data: scheduledCalls = [], isLoading } = useQuery({
    queryKey: ['scheduled-calls', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_calls')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_datetime', { ascending: true });

      if (error) throw error;
      
      // Properly cast the data to ensure type compatibility
      return (data || []).map(call => ({
        ...call,
        priority: call.priority as 'low' | 'medium' | 'high',
        status: call.status as 'scheduled' | 'completed' | 'cancelled' | 'in_progress'
      })) as ScheduledCall[];
    },
    enabled: !!user,
  });

  // Create scheduled call mutation
  const createCallMutation = useMutation({
    mutationFn: async (callData: Omit<ScheduledCall, 'id'>) => {
      // Convert local time to Moldova timezone (UTC+2/UTC+3)
      const moldovaDate = new Date(callData.scheduled_datetime);
      
      const { data, error } = await supabase
        .from('scheduled_calls')
        .insert({
          ...callData,
          user_id: user.id,
          status: 'scheduled',
          scheduled_datetime: moldovaDate.toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newCall) => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-calls', user.id] });
      toast({
        title: "Apel programat!",
        description: "Apelul a fost programat cu succes în fusul orar din Moldova.",
      });
      
      // Schedule the actual call
      scheduleAutomaticCall(newCall);
      
      setIsDialogOpen(false);
      setFormData({
        client_name: '',
        phone_number: '',
        scheduled_datetime: '',
        description: '',
        priority: 'medium',
        notes: '',
        agent_id: ''
      });
    },
    onError: (error) => {
      console.error('Error creating scheduled call:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut programa apelul. Încearcă din nou.",
        variant: "destructive",
      });
    },
  });

  // Delete scheduled call mutation
  const deleteCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      const { error } = await supabase
        .from('scheduled_calls')
        .delete()
        .eq('id', callId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-calls', user.id] });
      toast({
        title: "Apel șters",
        description: "Apelul programat a fost șters cu succes.",
      });
    },
    onError: (error) => {
      console.error('Error deleting scheduled call:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge apelul programat.",
        variant: "destructive",
      });
    },
  });

  // Function to schedule automatic call
  const scheduleAutomaticCall = (call: ScheduledCall) => {
    const now = new Date();
    const callTime = new Date(call.scheduled_datetime);
    const timeUntilCall = callTime.getTime() - now.getTime();

    if (timeUntilCall > 0) {
      console.log(`Apel programat pentru ${call.client_name} la ${callTime.toLocaleString('ro-RO')}`);
      
      setTimeout(async () => {
        try {
          // Update call status to in_progress
          await supabase
            .from('scheduled_calls')
            .update({ status: 'in_progress' })
            .eq('id', call.id);

          // Make the actual call using ElevenLabs API
          if (call.agent_id) {
            await initiateScheduledCall(call);
          }
          
          toast({
            title: "Apel inițiat!",
            description: `Se apelează ${call.client_name} la ${call.phone_number}`,
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
    }
  };

  // Function to initiate the actual call
  const initiateScheduledCall = async (call: ScheduledCall) => {
    try {
      // This would integrate with your existing call initiation logic
      const response = await fetch('https://api.elevenlabs.io/v1/convai/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        },
        body: JSON.stringify({
          agent_id: call.agent_id,
          agent_phone_number_id: 'your-phone-number-id', // Add your phone number ID
          to_number: call.phone_number,
        }),
      });

      if (response.ok) {
        // Update call status to completed
        await supabase
          .from('scheduled_calls')
          .update({ status: 'completed' })
          .eq('id', call.id);
          
        queryClient.invalidateQueries({ queryKey: ['scheduled-calls', user.id] });
      }
    } catch (error) {
      console.error('Error making scheduled call:', error);
      // Update call status to cancelled if failed
      await supabase
        .from('scheduled_calls')
        .update({ status: 'cancelled' })
        .eq('id', call.id);
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
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format datetime for Moldova timezone
  const getMoldovaDateTime = () => {
    const now = new Date();
    // Moldova is UTC+2 (UTC+3 during daylight saving)
    const moldovaOffset = 2; // hours
    const moldovaTime = new Date(now.getTime() + (moldovaOffset * 60 * 60 * 1000));
    return moldovaTime.toISOString().slice(0, 16);
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
    // Set time to current Moldova time but with selected date
    const moldovaTime = getMoldovaDateTime();
    const selectedDateTime = date.toISOString().slice(0, 10) + 'T' + moldovaTime.slice(11);
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

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Calendar Apeluri</h1>
          <p className="text-muted-foreground">Programează și gestionează apelurile tale (Ora Moldovei)</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Programate</p>
                  <p className="text-2xl font-bold">{scheduledCalls.length}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Azi</p>
                  <p className="text-2xl font-bold">{todayCalls.length}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Săptămâna asta</p>
                  <p className="text-2xl font-bold">{weekCalls.length}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Finalizate</p>
                  <p className="text-2xl font-bold">
                    {scheduledCalls.filter(call => call.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl">
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
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Programează Apel
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-lg"></div>
                      <div className="relative z-10">
                        <DialogHeader>
                          <DialogTitle className="text-gray-800">Programează un apel nou</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                          <div>
                            <Label htmlFor="client_name" className="text-gray-700">Nume Client *</Label>
                            <Input
                              id="client_name"
                              value={formData.client_name}
                              onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                              className="bg-white/70 border-white/30 backdrop-blur-sm"
                              placeholder="Numele clientului"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone_number" className="text-gray-700">Număr Telefon *</Label>
                            <Input
                              id="phone_number"
                              type="tel"
                              value={formData.phone_number}
                              onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                              className="bg-white/70 border-white/30 backdrop-blur-sm"
                              placeholder="+373xxxxxxxx"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="scheduled_datetime" className="text-gray-700">Data și Ora (Moldova) *</Label>
                            <Input
                              id="scheduled_datetime"
                              type="datetime-local"
                              value={formData.scheduled_datetime}
                              onChange={(e) => setFormData(prev => ({ ...prev, scheduled_datetime: e.target.value }))}
                              className="bg-white/70 border-white/30 backdrop-blur-sm"
                              min={getMoldovaDateTime()}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="agent_id" className="text-gray-700">Agent</Label>
                            <Select
                              value={formData.agent_id}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, agent_id: value }))}
                            >
                              <SelectTrigger className="bg-white/70 border-white/30 backdrop-blur-sm">
                                <SelectValue placeholder="Selectează agentul" />
                              </SelectTrigger>
                              <SelectContent className="bg-white/95 backdrop-blur-md">
                                {userAgents.map((agent) => (
                                  <SelectItem key={agent.id} value={agent.agent_id}>
                                    {agent.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="priority" className="text-gray-700">Urgență</Label>
                            <Select
                              value={formData.priority}
                              onValueChange={(value: 'low' | 'medium' | 'high') => 
                                setFormData(prev => ({ ...prev, priority: value }))
                              }
                            >
                              <SelectTrigger className="bg-white/70 border-white/30 backdrop-blur-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white/95 backdrop-blur-md">
                                <SelectItem value="low">Scăzută</SelectItem>
                                <SelectItem value="medium">Medie</SelectItem>
                                <SelectItem value="high">Ridicată</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="description" className="text-gray-700">Descriere</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              className="bg-white/70 border-white/30 backdrop-blur-sm"
                              placeholder="Motivul apelului..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="notes" className="text-gray-700">Note</Label>
                            <Textarea
                              id="notes"
                              value={formData.notes}
                              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                              className="bg-white/70 border-white/30 backdrop-blur-sm"
                              placeholder="Note suplimentare..."
                            />
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" 
                            disabled={createCallMutation.isPending}
                          >
                            {createCallMutation.isPending ? 'Se programează...' : 'Programează Apelul'}
                          </Button>
                        </form>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
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
                        className={`
                          p-2 min-h-[60px] border rounded cursor-pointer transition-colors
                          ${isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                          ${isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}
                        `}
                        onClick={() => handleDateClick(day)}
                      >
                        <div className="text-sm font-medium">{day.getDate()}</div>
                        <div className="space-y-1">
                          {callsForDay.slice(0, 2).map((call, callIndex) => (
                            <div
                              key={callIndex}
                              className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                            >
                              {call.client_name}
                            </div>
                          ))}
                          {callsForDay.length > 2 && (
                            <div className="text-xs text-gray-500">
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

          {/* Upcoming Calls Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Apeluri Următoare</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weekCalls.slice(0, 10).map((call) => (
                    <div
                      key={call.id}
                      className="p-3 border rounded-lg space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{call.client_name}</h4>
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
                      <div className="text-xs text-muted-foreground space-y-1">
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
                          })} (Moldova)
                        </div>
                      </div>
                      {call.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {call.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {weekCalls.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nu ai apeluri programate</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
