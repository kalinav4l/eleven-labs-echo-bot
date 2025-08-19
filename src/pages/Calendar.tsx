import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, Phone, Filter, Search, RefreshCw, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useCallbackOperations } from '@/hooks/useCallbacks';
import { CalendarEventModal } from '@/components/CalendarEventModal';
import { CalendarEventDetailsModal } from '@/components/CalendarEventDetailsModal';
import { DayDetailSidebar } from '@/components/DayDetailSidebar';

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDayDetailSidebar, setShowDayDetailSidebar] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const { callbacks, refetch, isLoading } = useCallbackOperations();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const monthNames = [
    "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
    "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
  ];

  const daysOfWeek = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];

  // Generate calendar days using date-fns
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  // Get all days including empty cells for the grid
  const firstDayOfWeek = startOfMonth(currentDate).getDay();
  const emptyCellsAtStart = Array(firstDayOfWeek).fill(null);
  
  const getEventsForDate = (date: Date) => {
    return callbacks.filter(callback => {
      const callbackDate = new Date(callback.scheduled_time || callback.scheduled_datetime);
      return isSameDay(callbackDate, date);
    }).filter(callback => {
      // Apply filters
      const matchesSearch = !searchTerm || 
        callback.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        callback.phone_number.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || callback.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || callback.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleCellClick = (date: Date) => {
    const eventsForDate = getEventsForDate(date);
    setSelectedDate(date);
    
    // If there are events, show sidebar, otherwise show new event modal
    if (eventsForDate.length > 0) {
      setShowDayDetailSidebar(true);
    } else {
      setShowEventModal(true);
    }
  };

  const handleEventClick = (event: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'overdue':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-red-400 before:rounded-l-lg';
      case 'medium':
        return 'before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-yellow-400 before:rounded-l-lg';
      case 'low':
        return 'before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-green-400 before:rounded-l-lg';
      default:
        return 'before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-gray-400 before:rounded-l-lg';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 min-h-screen bg-white">
        {/* Header cu efect liquid glass */}
        <div className="bg-white/80 backdrop-blur-lg border-0 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                Calendar Programări
              </h1>
              
              {/* Navigator Lună/An */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="h-8 w-8 p-0 rounded-xl hover:bg-white/60 text-gray-600 transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-gray-900 min-w-[140px] text-center px-3">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="h-8 w-8 p-0 rounded-xl hover:bg-white/60 text-gray-600 transition-all duration-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Butoane de Acțiune Rapidă */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={goToToday}
                className="text-sm text-gray-600 hover:bg-white/60 rounded-xl transition-all duration-200"
              >
                Astăzi
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => refetch()}
                className="text-sm text-gray-600 hover:bg-white/60 rounded-xl transition-all duration-200"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Reîmprospătează
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowEventModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Programare Nouă
              </Button>
            </div>
          </div>
        </div>

        {/* Filtre și Căutare cu liquid glass */}
        <div className="bg-white/60 backdrop-blur-lg px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Caută după nume client sau telefon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 rounded-xl bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] border-0 rounded-xl bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white/90 backdrop-blur-lg border-0 rounded-xl z-50">
                <SelectItem value="all">Toate</SelectItem>
                <SelectItem value="scheduled">Programate</SelectItem>
                <SelectItem value="completed">Completate</SelectItem>
                <SelectItem value="failed">Eșuate</SelectItem>
                <SelectItem value="overdue">Întârziate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px] border-0 rounded-xl bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="Prioritate" />
              </SelectTrigger>
              <SelectContent className="bg-white/90 backdrop-blur-lg border-0 rounded-xl z-50">
                <SelectItem value="all">Toate</SelectItem>
                <SelectItem value="high">Înaltă</SelectItem>
                <SelectItem value="medium">Medie</SelectItem>
                <SelectItem value="low">Scăzută</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grila Calendarului cu liquid glass */}
        <div className="p-6">
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl overflow-hidden">
            <div className="grid grid-cols-7 gap-0">
              {/* Zilele săptămânii */}
              {daysOfWeek.map((day) => (
                <div key={day} className="bg-white/50 backdrop-blur-sm px-4 py-3 text-center">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">{day}</span>
                </div>
              ))}
              
              {/* Celule goale la început */}
              {emptyCellsAtStart.map((_, index) => (
                <div key={`empty-${index}`} className="bg-white min-h-[120px]" />
              ))}
              
              {/* Zilele calendarului */}
              {calendarDays.map((date) => {
                const dayEvents = getEventsForDate(date);
                const isCurrentDay = isToday(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                
                return (
                  <div
                    key={date.toISOString()}
                    className={`min-h-[120px] p-3 relative cursor-pointer transition-all duration-300 hover:bg-gray-50 ${
                      !isCurrentMonth ? 'bg-white text-gray-400' : 'bg-white'
                    }`}
                    onClick={() => handleCellClick(date)}
                  >
                    {/* Ziua curentă evidențiată */}
                    <div className={`text-sm mb-3 font-medium ${
                      isCurrentDay 
                        ? 'text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold' 
                        : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {format(date, 'd')}
                    </div>
                    
                    {/* Programările ca indicatori compacți */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 4).map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center gap-2 text-xs cursor-pointer transition-all duration-200 hover:bg-gray-50 p-1 rounded group"
                          onClick={(e) => handleEventClick(event, e)}
                        >
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)} flex-shrink-0`} />
                          <span className="font-medium text-gray-700 text-xs">
                            {format(new Date(event.scheduled_time || event.scheduled_datetime), 'HH:mm')}
                          </span>
                          <span className="text-xs text-gray-600 truncate">
                            {event.client_name || 'Unknown'}
                          </span>
                        </div>
                      ))}
                      {dayEvents.length > 4 && (
                        <div 
                          className="text-xs text-blue-600 p-1 text-center hover:bg-blue-50 rounded cursor-pointer font-medium transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(date);
                            setShowDayDetailSidebar(true);
                          }}
                        >
                          +{dayEvents.length - 4} mai multe
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CalendarEventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedDate(null);
        }}
        selectedDate={selectedDate}
      />

      <CalendarEventDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />

      <DayDetailSidebar
        isOpen={showDayDetailSidebar}
        onClose={() => {
          setShowDayDetailSidebar(false);
          setSelectedDate(null);
        }}
        selectedDate={selectedDate}
        events={selectedDate ? getEventsForDate(selectedDate) : []}
      />
    </DashboardLayout>
  );
};

export default Calendar;