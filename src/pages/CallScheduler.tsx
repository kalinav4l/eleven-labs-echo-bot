
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import CalendarView from '@/components/calendar/CalendarView';
import ScheduledCallDialog from '@/components/calendar/ScheduledCallDialog';
import { useScheduledCalls, ScheduledCall } from '@/hooks/useScheduledCalls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Phone, Search, Filter } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns';
import { ro } from 'date-fns/locale';

const CallScheduler = () => {
  const { user } = useAuth();
  const { 
    scheduledCalls, 
    isLoading, 
    createScheduledCall, 
    updateScheduledCall, 
    deleteScheduledCall 
  } = useScheduledCalls();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [editingCall, setEditingCall] = useState<ScheduledCall | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleCreateCall = (date: Date, time?: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setEditingCall(null);
    setIsDialogOpen(true);
  };

  const handleEditCall = (call: ScheduledCall) => {
    setEditingCall(call);
    setIsDialogOpen(true);
  };

  const handleSaveCall = async (callData: any) => {
    try {
      if (editingCall) {
        await updateScheduledCall.mutateAsync(callData);
      } else {
        await createScheduledCall.mutateAsync(callData);
      }
    } catch (error) {
      console.error('Error saving call:', error);
    }
  };

  const handleDeleteCall = async (id: string) => {
    try {
      await deleteScheduledCall.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting call:', error);
    }
  };

  // Filter calls based on search term
  const filteredCalls = scheduledCalls.filter(call =>
    call.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.phone_number.includes(searchTerm) ||
    (call.description && call.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get upcoming calls (next 7 days)
  const upcomingCalls = filteredCalls
    .filter(call => {
      const callDate = parseISO(call.scheduled_datetime);
      const today = new Date();
      const weekFromNow = addDays(today, 7);
      return callDate >= today && callDate <= weekFromNow && call.status === 'scheduled';
    })
    .sort((a, b) => new Date(a.scheduled_datetime).getTime() - new Date(b.scheduled_datetime).getTime());

  const getCallDateLabel = (datetime: string) => {
    const date = parseISO(datetime);
    if (isToday(date)) return 'Azi';
    if (isTomorrow(date)) return 'Mâine';
    return format(date, 'dd MMM', { locale: ro });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 my-[60px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Calendar Apeluri</h1>
            <p className="text-muted-foreground">Programează și gestionează apelurile tale</p>
          </div>
          <Button onClick={() => handleCreateCall(new Date())} className="bg-accent hover:bg-accent/90">
            <Phone className="w-4 h-4 mr-2" />
            Apel Nou
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="liquid-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Programate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {scheduledCalls.filter(c => c.status === 'scheduled').length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Azi</p>
                  <p className="text-2xl font-bold text-foreground">
                    {scheduledCalls.filter(c => isToday(parseISO(c.scheduled_datetime)) && c.status === 'scheduled').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Finalizate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {scheduledCalls.filter(c => c.status === 'completed').length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Prioritate Înaltă</p>
                  <p className="text-2xl font-bold text-foreground">
                    {scheduledCalls.filter(c => c.priority === 'high' && c.status === 'scheduled').length}
                  </p>
                </div>
                <Filter className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Calendar View */}
          <div className="xl:col-span-2">
            <CalendarView
              scheduledCalls={scheduledCalls}
              onCreateCall={handleCreateCall}
              onEditCall={handleEditCall}
              onDeleteCall={handleDeleteCall}
            />
          </div>

          {/* Upcoming Calls Sidebar */}
          <div className="space-y-6">
            <Card className="liquid-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Apeluri Viitoare
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Caută apeluri..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {upcomingCalls.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Phone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nu sunt apeluri programate</p>
                    </div>
                  ) : (
                    upcomingCalls.map((call) => (
                      <div key={call.id} className="bg-white/50 rounded-lg p-3 border border-gray-200 hover:bg-white/80 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm truncate">{call.client_name}</span>
                              <Badge 
                                variant="secondary" 
                                className={`${getPriorityColor(call.priority)} text-white text-xs`}
                              >
                                {call.priority === 'high' ? 'H' : call.priority === 'medium' ? 'M' : 'L'}
                              </Badge>
                            </div>
                            
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{getCallDateLabel(call.scheduled_datetime)}</span>
                                <span>{format(parseISO(call.scheduled_datetime), 'HH:mm')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span className="truncate">{call.phone_number}</span>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCall(call)}
                            className="p-1 h-6 w-6"
                          >
                            <Phone className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog for creating/editing calls */}
        <ScheduledCallDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSaveCall}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          editingCall={editingCall}
        />
      </div>
    </DashboardLayout>
  );
};

export default CallScheduler;
