
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Phone, User, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { ScheduledCall } from '@/hooks/useScheduledCalls';
import { format, isSameDay, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface CalendarViewProps {
  scheduledCalls: ScheduledCall[];
  onCreateCall: (date: Date, time?: string) => void;
  onEditCall: (call: ScheduledCall) => void;
  onDeleteCall: (id: string) => void;
}

const CalendarView = ({ scheduledCalls, onCreateCall, onEditCall, onDeleteCall }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getCallsForDate = (date: Date) => {
    return scheduledCalls.filter(call => 
      isSameDay(parseISO(call.scheduled_datetime), date)
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Înaltă';
      case 'medium': return 'Medie';
      case 'low': return 'Scăzută';
      default: return 'Necunoscută';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programat';
      case 'completed': return 'Finalizat';
      case 'cancelled': return 'Anulat';
      case 'missed': return 'Ratat';
      default: return 'Necunoscut';
    }
  };

  const todayCalls = getCallsForDate(selectedDate);

  // Generate time slots from 9 AM to 6 PM
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar Section */}
      <Card className="liquid-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            Calendar Apeluri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={ro}
            className="rounded-md border"
            modifiers={{
              hasCalls: (date) => getCallsForDate(date).length > 0
            }}
            modifiersStyles={{
              hasCalls: { 
                backgroundColor: 'rgba(10, 91, 76, 0.1)',
                color: 'rgba(10, 91, 76, 1)',
                fontWeight: 'bold'
              }
            }}
          />
          
          <div className="mt-4">
            <Button 
              onClick={() => onCreateCall(selectedDate)} 
              className="w-full bg-accent hover:bg-accent/90"
            >
              <Phone className="w-4 h-4 mr-2" />
              Programează Apel Nou
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Schedule Section */}
      <Card className="liquid-glass">
        <CardHeader>
          <CardTitle>
            Apeluri pentru {format(selectedDate, 'dd MMMM yyyy', { locale: ro })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {todayCalls.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Phone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nu sunt apeluri programate pentru această zi</p>
                <Button 
                  variant="outline" 
                  onClick={() => onCreateCall(selectedDate)} 
                  className="mt-2"
                >
                  Programează primul apel
                </Button>
              </div>
            ) : (
              todayCalls
                .sort((a, b) => new Date(a.scheduled_datetime).getTime() - new Date(b.scheduled_datetime).getTime())
                .map((call) => (
                  <div key={call.id} className="bg-white/50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-accent" />
                          <span className="font-medium">{call.client_name}</span>
                          <Badge 
                            variant="secondary" 
                            className={`${getPriorityColor(call.priority)} text-white`}
                          >
                            {getPriorityText(call.priority)}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {call.phone_number}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {format(parseISO(call.scheduled_datetime), 'HH:mm')}
                          </div>
                          {call.description && (
                            <div className="flex items-start gap-2 mt-2">
                              <AlertCircle className="w-3 h-3 mt-0.5" />
                              <span className="text-xs">{call.description}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2">
                          <Badge variant={call.status === 'scheduled' ? 'default' : 'secondary'}>
                            {getStatusText(call.status)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditCall(call)}
                          className="p-2"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="p-2">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ești sigur că vrei să ștergi acest apel programat? Această acțiune nu poate fi anulată.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anulează</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => onDeleteCall(call.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Da, șterge
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
