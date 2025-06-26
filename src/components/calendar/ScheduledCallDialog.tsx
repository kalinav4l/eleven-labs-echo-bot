
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScheduledCall } from '@/hooks/useScheduledCalls';

interface ScheduledCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (callData: any) => void;
  selectedDate?: Date;
  selectedTime?: string;
  editingCall?: ScheduledCall | null;
}

const ScheduledCallDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  selectedDate, 
  selectedTime,
  editingCall 
}: ScheduledCallDialogProps) => {
  const [formData, setFormData] = useState({
    client_name: '',
    phone_number: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    agent_id: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    if (editingCall) {
      const datetime = new Date(editingCall.scheduled_datetime);
      setFormData({
        client_name: editingCall.client_name,
        phone_number: editingCall.phone_number,
        description: editingCall.description || '',
        priority: editingCall.priority,
        agent_id: editingCall.agent_id || '',
        date: datetime.toISOString().split('T')[0],
        time: datetime.toISOString().split('T')[1].slice(0, 5)
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime || '09:00'
      }));
    }
  }, [editingCall, selectedDate, selectedTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const scheduledDatetime = new Date(`${formData.date}T${formData.time}`).toISOString();
    
    const callData = {
      client_name: formData.client_name,
      phone_number: formData.phone_number,
      scheduled_datetime: scheduledDatetime,
      description: formData.description,
      priority: formData.priority,
      agent_id: formData.agent_id || undefined
    };

    if (editingCall) {
      onSave({ id: editingCall.id, ...callData });
    } else {
      onSave(callData);
    }

    // Reset form
    setFormData({
      client_name: '',
      phone_number: '',
      description: '',
      priority: 'medium',
      agent_id: '',
      date: '',
      time: ''
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingCall ? 'Editează Apelul Programat' : 'Programează Apel Nou'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_name">Numele Clientului *</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
              placeholder="Ion Popescu"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Numărul de Telefon *</Label>
            <Input
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
              placeholder="+40 XXX XXX XXX"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Ora *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioritate</Label>
            <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => 
              setFormData(prev => ({ ...prev, priority: value }))
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

          <div className="space-y-2">
            <Label htmlFor="agent_id">ID Agent (opțional)</Label>
            <Input
              id="agent_id"
              value={formData.agent_id}
              onChange={(e) => setFormData(prev => ({ ...prev, agent_id: e.target.value }))}
              placeholder="agent_id_123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descriere</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Follow-up ofertă, primul contact, etc."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Anulează
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              {editingCall ? 'Actualizează' : 'Programează'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduledCallDialog;
