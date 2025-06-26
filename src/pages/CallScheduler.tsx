
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, Phone, User, Plus, Edit, Trash2 } from 'lucide-react';
import { format, isToday, isTomorrow, startOfDay, endOfDay, addDays } from 'date-fns';
import { ro } from 'date-fns/locale';

interface ScheduledCall {
  id: string;
  clientName: string;
  phoneNumber: string;
  scheduledDateTime: Date;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
}

const CallScheduler = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDialog, setShowDialog] = useState(false);
  const [editingCall, setEditingCall] = useState<ScheduledCall | null>(null);
  const [calls, setCalls] = useState<ScheduledCall[]>([
    {
      id: '1',
      clientName: 'Ion Popescu',
      phoneNumber: '+40722123456',
      scheduledDateTime: new Date(2025, 0, 26, 14, 30),
      description: 'Follow-up pentru oferta de asigurări',
      priority: 'high',
      status: 'scheduled'
    },
    {
      id: '2',
      clientName: 'Maria Ionescu',
      phoneNumber: '+40733987654',
      scheduledDateTime: new Date(2025, 0, 27, 10, 0),
      description: 'Primul contact - prezentare servicii',
      priority: 'medium',
      status: 'scheduled'
    }
  ]);

  const [formData, setFormData] = useState({
    clientName: '',
    phoneNumber: '',
    scheduledDateTime: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const resetForm = () => {
    setFormData({
      clientName: '',
      phoneNumber: '',
      scheduledDateTime: '',
      description: '',
      priority: 'medium'
    });
    setEditingCall(null);
  };

  const handleSubmit = () => {
    if (!formData.clientName || !formData.phoneNumber || !formData.scheduledDateTime) {
      return;
    }

    const newCall: ScheduledCall = {
      id: editingCall?.id || Date.now().toString(),
      clientName: formData.clientName,
      phoneNumber: formData.phoneNumber,
      scheduledDateTime: new Date(formData.scheduledDateTime),
      description: formData.description,
      priority: formData.priority,
      status: 'scheduled'
    };

    if (editingCall) {
      setCalls(calls.map(call => call.id === editingCall.id ? newCall : call));
    } else {
      setCalls([...calls, newCall]);
    }

    setShowDialog(false);
    resetForm();
  };

  const handleEdit = (call: ScheduledCall) => {
    setEditingCall(call);
    setFormData({
      clientName: call.clientName,
      phoneNumber: call.phoneNumber,
      scheduledDateTime: format(call.scheduledDateTime, "yyyy-MM-dd'T'HH:mm"),
      description: call.description,
      priority: call.priority
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    setCalls(calls.filter(call => call.id !== id));
  };

  const getCallsForDate = (date: Date) => {
    return calls.filter(call => 
      format(call.scheduledDateTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getTodaysCalls = () => {
    return calls.filter(call => isToday(call.scheduledDateTime));
  };

  const getUpcomingCalls = () => {
    const today = startOfDay(new Date());
    const nextWeek = endOfDay(addDays(today, 7));
    return calls.filter(call => 
      call.scheduledDateTime >= today && 
      call.scheduledDateTime <= nextWeek &&
      call.status === 'scheduled'
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'missed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar Apeluri</h1>
            <p className="text-gray-600">Programează și gestionează apelurile agenților</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-[#0A5B4C] hover:bg-[#0A5B4C]/90">
            <Plus className="h-4 w-4 mr-2" />
            Apel Nou
          </Button>
        </div>

        {/* Statistici */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Programate</p>
                  <p className="text-2xl font-bold text-gray-900">{calls.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Azi</p>
                  <p className="text-2xl font-bold text-gray-900">{getTodaysCalls().length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Următoarele 7 zile</p>
                  <p className="text-2xl font-bold text-gray-900">{getUpcomingCalls().length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Prioritate Înaltă</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {calls.filter(call => call.priority === 'high').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={ro}
                  className="rounded-md border"
                />
                
                {/* Apeluri pentru data selectată */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Apeluri pentru {format(selectedDate, 'dd MMMM yyyy', { locale: ro })}
                  </h3>
                  <div className="space-y-3">
                    {getCallsForDate(selectedDate).map((call) => (
                      <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{call.clientName}</h4>
                            <Badge className={getPriorityColor(call.priority)}>
                              {call.priority}
                            </Badge>
                            <Badge className={getStatusColor(call.status)}>
                              {call.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{call.phoneNumber}</p>
                          <p className="text-sm text-gray-600">
                            {format(call.scheduledDateTime, 'HH:mm')} - {call.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(call)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(call.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {getCallsForDate(selectedDate).length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        Nu există apeluri programate pentru această zi
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar cu apeluri viitoare */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Apeluri Viitoare</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getUpcomingCalls().slice(0, 10).map((call) => (
                  <div key={call.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{call.clientName}</h4>
                      <Badge className={getPriorityColor(call.priority)} size="sm">
                        {call.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{call.phoneNumber}</p>
                    <p className="text-xs text-gray-600">
                      {isToday(call.scheduledDateTime) 
                        ? `Azi la ${format(call.scheduledDateTime, 'HH:mm')}`
                        : isTomorrow(call.scheduledDateTime)
                        ? `Mâine la ${format(call.scheduledDateTime, 'HH:mm')}`
                        : format(call.scheduledDateTime, 'dd MMM, HH:mm', { locale: ro })
                      }
                    </p>
                  </div>
                ))}
                {getUpcomingCalls().length === 0 && (
                  <p className="text-gray-500 text-center py-4 text-sm">
                    Nu există apeluri programate
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog pentru adăugare/editare apel */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCall ? 'Editează Apelul' : 'Programează Apel Nou'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientName">Numele Clientului</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Ex: Ion Popescu"
                />
              </div>
              
              <div>
                <Label htmlFor="phoneNumber">Număr de Telefon</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Ex: +40722123456"
                />
              </div>
              
              <div>
                <Label htmlFor="scheduledDateTime">Data și Ora</Label>
                <Input
                  id="scheduledDateTime"
                  type="datetime-local"
                  value={formData.scheduledDateTime}
                  onChange={(e) => setFormData({ ...formData, scheduledDateTime: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="priority">Prioritate</Label>
                <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setFormData({ ...formData, priority: value })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Scăzută</SelectItem>
                    <SelectItem value="medium">Medie</SelectItem>
                    <SelectItem value="high">Înaltă</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Descriere</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Follow-up pentru oferta de asigurări"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}>
                  Anulează
                </Button>
                <Button onClick={handleSubmit} className="bg-[#0A5B4C] hover:bg-[#0A5B4C]/90">
                  {editingCall ? 'Actualizează' : 'Salvează'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CallScheduler;
