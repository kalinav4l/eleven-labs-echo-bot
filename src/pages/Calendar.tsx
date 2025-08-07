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
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'overdue':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
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
      <div className="flex-1 min-h-screen bg-zinc-900">
        {/* Notion-style Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-medium text-white flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-zinc-400" />
                Tasks
              </h1>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="h-7 w-7 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-zinc-300 min-w-[120px] text-center px-2">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="h-7 w-7 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={goToToday}
                className="text-sm text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                Today
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowEventModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 h-7"
              >
                New
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-0">
          <div className="bg-zinc-900">
            <div className="grid grid-cols-7 border-l border-zinc-800">
              {/* Day headers */}
              {daysOfWeek.map((day) => (
                <div key={day} className="bg-zinc-900 border-r border-b border-zinc-800 px-3 py-3 text-center">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{day}</span>
                </div>
              ))}
              
              {/* Empty cells at start */}
              {emptyCellsAtStart.map((_, index) => (
                <div key={`empty-${index}`} className="bg-zinc-900 border-r border-b border-zinc-800 min-h-[120px]" />
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((date) => {
                const dayEvents = getEventsForDate(date);
                const isCurrentDay = isToday(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                
                return (
                  <div
                    key={date.toISOString()}
                    className={`border-r border-b border-zinc-800 min-h-[120px] p-2 relative cursor-pointer hover:bg-zinc-800/50 transition-colors ${
                      !isCurrentMonth ? 'bg-zinc-900/50' : 'bg-zinc-900'
                    }`}
                    onClick={() => handleCellClick(date)}
                  >
                    <div className={`text-sm mb-2 ${
                      isCurrentDay 
                        ? 'text-blue-400 font-medium' 
                        : isCurrentMonth ? 'text-zinc-300' : 'text-zinc-600'
                    }`}>
                      {format(date, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 4).map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center gap-2 text-xs px-2 py-1 rounded text-zinc-300 hover:bg-zinc-800 cursor-pointer transition-colors"
                          onClick={(e) => handleEventClick(event, e)}
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            event.status === 'completed' ? 'bg-green-500' : 
                            event.status === 'scheduled' ? 'bg-blue-500' :
                            event.status === 'failed' ? 'bg-red-500' : 'bg-orange-500'
                          }`} />
                          <span className="truncate text-xs">
                            {event.client_name}
                          </span>
                          {event.status === 'completed' && (
                            <Check className="w-3 h-3 text-green-500 flex-shrink-0 ml-auto" />
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 4 && (
                        <div className="text-xs text-zinc-500 px-2">
                          +{dayEvents.length - 4} more
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
    </DashboardLayout>
  );
};

export default Calendar;