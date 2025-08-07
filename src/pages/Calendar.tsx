import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, Phone, Filter, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useCallbackOperations } from '@/hooks/useCallbacks';
import { CalendarEventModal } from '@/components/CalendarEventModal';
import { CalendarEventDetailsModal } from '@/components/CalendarEventDetailsModal';

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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
    setSelectedDate(date);
    setShowEventModal(true);
  };

  const handleEventClick = (event: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400';
      case 'completed':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 border border-green-400';
      case 'failed':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 border border-red-400';
      case 'overdue':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 border border-orange-400';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30 border border-gray-400';
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
      <div className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Glass Header */}
        <div className="backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg shadow-black/5 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                Calendar Programări
              </h1>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-white/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="h-8 w-8 p-0 rounded-lg hover:bg-black/5 text-gray-700 transition-all duration-200 hover:scale-105"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold text-gray-900 min-w-[140px] text-center px-3">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="h-8 w-8 p-0 rounded-lg hover:bg-black/5 text-gray-700 transition-all duration-200 hover:scale-105"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={goToToday}
                className="text-sm text-gray-700 hover:bg-black/5 backdrop-blur-sm border border-white/30 rounded-lg transition-all duration-200 hover:scale-105"
              >
                Astăzi
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => refetch()}
                className="text-sm text-gray-700 hover:bg-black/5 backdrop-blur-sm border border-white/30 rounded-lg transition-all duration-200 hover:scale-105"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Reîmprospătează
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowEventModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg border-0 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                <Plus className="h-4 w-4 mr-1" />
                Programare Nouă
              </Button>
            </div>
          </div>
        </div>

        {/* Glass Filters */}
        <div className="mx-6 mt-6 mb-4 p-4 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Caută după nume client sau telefon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70 backdrop-blur-sm border-white/40 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-white/70 backdrop-blur-sm border-white/40 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-white/90 border-white/40">
                <SelectItem value="all">Toate</SelectItem>
                <SelectItem value="scheduled">Programate</SelectItem>
                <SelectItem value="completed">Completate</SelectItem>
                <SelectItem value="failed">Eșuate</SelectItem>
                <SelectItem value="overdue">Întârziate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px] bg-white/70 backdrop-blur-sm border-white/40 rounded-xl">
                <SelectValue placeholder="Prioritate" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-white/90 border-white/40">
                <SelectItem value="all">Toate</SelectItem>
                <SelectItem value="high">Înaltă</SelectItem>
                <SelectItem value="medium">Medie</SelectItem>
                <SelectItem value="low">Scăzută</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Glass Calendar Grid */}
        <div className="mx-6 mb-6 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/50 border border-white/30 shadow-2xl">
          <div className="grid grid-cols-7">
            {/* Day headers */}
            {daysOfWeek.map((day) => (
              <div key={day} className="bg-gradient-to-r from-gray-900 to-black text-white px-4 py-3 text-center border-r border-white/10 last:border-r-0">
                <span className="text-xs font-bold uppercase tracking-wider">{day}</span>
              </div>
            ))}
            
            {/* Empty cells at start */}
            {emptyCellsAtStart.map((_, index) => (
              <div key={`empty-${index}`} className="bg-gray-100/30 border-r border-b border-white/20 min-h-[140px] last:border-r-0" />
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((date) => {
              const dayEvents = getEventsForDate(date);
              const isCurrentDay = isToday(date);
              const isCurrentMonth = isSameMonth(date, currentDate);
              
              return (
                <div
                  key={date.toISOString()}
                  className={`backdrop-blur-sm border-r border-b border-white/20 min-h-[140px] p-3 relative cursor-pointer transition-all duration-200 hover:bg-white/40 hover:scale-[1.02] group last:border-r-0 ${
                    !isCurrentMonth ? 'bg-gray-100/20 text-gray-400' : 'bg-white/20'
                  } ${isCurrentDay ? 'bg-blue-50/50 ring-2 ring-blue-500/30' : ''}`}
                  onClick={() => handleCellClick(date)}
                >
                  <div className={`text-sm mb-3 font-bold transition-all duration-200 ${
                    isCurrentDay 
                      ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg shadow-blue-500/30' 
                      : 'text-gray-900 group-hover:text-blue-600'
                  }`}>
                    {format(date, 'd')}
                  </div>
                  
                  <div className="space-y-2">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`relative text-xs p-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl ${getPriorityIndicator(event.priority)} ${getStatusColor(event.status)}`}
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="font-bold text-xs">
                            {format(new Date(event.scheduled_time || event.scheduled_datetime), 'HH:mm')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate font-medium text-xs">{event.client_name}</span>
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-600 p-2 text-center bg-white/40 rounded-lg backdrop-blur-sm border border-white/30 font-medium">
                        +{dayEvents.length - 3} mai multe
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
    </DashboardLayout>
  );
};

export default Calendar;