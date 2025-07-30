import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Phone, User, Tag } from 'lucide-react';
import { cn } from '@/utils/utils';
import { useCallbackOperations } from '@/hooks/useCallbacks';
import { useUserAgents } from '@/hooks/useUserAgents';
import { toast } from 'sonner';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  editEvent?: any;
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  editEvent
}) => {
  const [eventData, setEventData] = useState({
    client_name: editEvent?.client_name || '',
    phone_number: editEvent?.phone_number || '',
    scheduled_time: editEvent ? new Date(editEvent.scheduled_time) : selectedDate || new Date(),
    priority: editEvent?.priority || 'medium',
    reason: editEvent?.reason || '',
    description: editEvent?.description || '',
    notes: editEvent?.notes || '',
    agent_id: editEvent?.agent_id || '',
    time: editEvent ? format(new Date(editEvent.scheduled_time), 'HH:mm') : '10:00'
  });

  const { createCallback, updateCallback } = useCallbackOperations();
  const { data: agents = [] } = useUserAgents();

  const handleSubmit = () => {
    if (!eventData.client_name || !eventData.phone_number) {
      toast.error('Numele clientului și numărul de telefon sunt obligatorii');
      return;
    }

    const [hours, minutes] = eventData.time.split(':');
    const scheduledDateTime = new Date(eventData.scheduled_time);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

    const callbackData = {
      client_name: eventData.client_name,
      phone_number: eventData.phone_number,
      scheduled_time: scheduledDateTime.toISOString(),
      priority: eventData.priority as 'low' | 'medium' | 'high',
      reason: eventData.reason,
      description: eventData.description,
      notes: eventData.notes,
      agent_id: eventData.agent_id,
      status: 'scheduled' as const
    };

    if (editEvent) {
      updateCallback.mutate({ id: editEvent.id, ...callbackData });
    } else {
      createCallback(callbackData);
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {editEvent ? 'Editează Programarea' : 'Programare Nouă'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Client Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nume Client
              </Label>
              <Input
                id="client_name"
                value={eventData.client_name}
                onChange={(e) => setEventData({ ...eventData, client_name: e.target.value })}
                placeholder="Ion Popescu"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone_number" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefon
              </Label>
              <Input
                id="phone_number"
                value={eventData.phone_number}
                onChange={(e) => setEventData({ ...eventData, phone_number: e.target.value })}
                placeholder="+40723456789"
                className="mt-1"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Data
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !eventData.scheduled_time && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventData.scheduled_time ? format(eventData.scheduled_time, "PPP") : "Selectează data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={eventData.scheduled_time}
                    onSelect={(date) => date && setEventData({ ...eventData, scheduled_time: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Ora
              </Label>
              <Input
                id="time"
                type="time"
                value={eventData.time}
                onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Priority and Agent */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Prioritate
              </Label>
              <Select value={eventData.priority} onValueChange={(value) => setEventData({ ...eventData, priority: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Scăzută
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Medie
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Înaltă
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Agent</Label>
              <Select value={eventData.agent_id} onValueChange={(value) => setEventData({ ...eventData, agent_id: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selectează agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.agent_id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Motiv</Label>
            <Input
              id="reason"
              value={eventData.reason}
              onChange={(e) => setEventData({ ...eventData, reason: e.target.value })}
              placeholder="De ce este necesară această programare?"
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descriere</Label>
            <Textarea
              id="description"
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              placeholder="Detalii despre programare..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notițe</Label>
            <Textarea
              id="notes"
              value={eventData.notes}
              onChange={(e) => setEventData({ ...eventData, notes: e.target.value })}
              placeholder="Notițe suplimentare..."
              className="mt-1"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Anulează
          </Button>
          <Button onClick={handleSubmit}>
            {editEvent ? 'Actualizează' : 'Programează'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};