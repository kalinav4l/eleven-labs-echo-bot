import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { 
  Phone, 
  User, 
  Calendar, 
  Clock, 
  Tag, 
  FileText, 
  StickyNote, 
  Edit3, 
  Trash2, 
  Play,
  CheckCircle,
  XCircle,
  AlertCircle 
} from 'lucide-react';
import { useCallbackOperations } from '@/hooks/useCallbacks';
import { CalendarEventModal } from './CalendarEventModal';
import { toast } from 'sonner';

interface CalendarEventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

export const CalendarEventDetailsModal: React.FC<CalendarEventDetailsModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const { deleteCallback, executeCallback } = useCallbackOperations();

  if (!event) return null;

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: 'bg-red-100 text-red-800 border-red-200', label: 'Înaltă', icon: '🔴' };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Medie', icon: '🟡' };
      case 'low':
        return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Scăzută', icon: '🟢' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: priority, icon: '⚪' };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { color: 'bg-blue-100 text-blue-800', label: 'Programat', icon: <Clock className="h-4 w-4" /> };
      case 'completed':
        return { color: 'bg-green-100 text-green-800', label: 'Completat', icon: <CheckCircle className="h-4 w-4" /> };
      case 'failed':
        return { color: 'bg-red-100 text-red-800', label: 'Eșuat', icon: <XCircle className="h-4 w-4" /> };
      case 'overdue':
        return { color: 'bg-orange-100 text-orange-800', label: 'Întârziat', icon: <AlertCircle className="h-4 w-4" /> };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status, icon: <Clock className="h-4 w-4" /> };
    }
  };

  const priorityConfig = getPriorityConfig(event.priority);
  const statusConfig = getStatusConfig(event.status);

  const handleDelete = () => {
    if (window.confirm('Ești sigur că vrei să ștergi această programare?')) {
      deleteCallback.mutate(event.id);
      onClose();
    }
  };

  const handleExecute = () => {
    if (window.confirm('Vrei să execuți această programare acum?')) {
      executeCallback.mutate(event);
      toast.info('Se execută programarea...');
    }
  };

  const scheduledDate = new Date(event.scheduled_time || event.scheduled_datetime);
  const isOverdue = event.status === 'scheduled' && scheduledDate < new Date();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detalii Programare
              </span>
              <div className="flex gap-2">
                <Badge className={statusConfig.color}>
                  {statusConfig.icon}
                  <span className="ml-1">{statusConfig.label}</span>
                </Badge>
                <Badge className={priorityConfig.color}>
                  <span className="mr-1">{priorityConfig.icon}</span>
                  {priorityConfig.label}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Client Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{event.client_name}</p>
                    <p className="text-sm text-gray-500">Client</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{event.phone_number}</p>
                    <p className="text-sm text-gray-500">Telefon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {format(scheduledDate, 'EEEE, d MMMM yyyy', { locale: ro })}
                  </p>
                  <p className="text-sm text-blue-600">
                    {format(scheduledDate, 'HH:mm')}
                    {isOverdue && <span className="ml-2 text-red-600 font-medium">(Întârziat)</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Details */}
            {event.reason && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700">Motiv</span>
                </div>
                <p className="text-gray-900 bg-gray-50 p-3 rounded">{event.reason}</p>
              </div>
            )}

            {event.description && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700">Descriere</span>
                </div>
                <p className="text-gray-900 bg-gray-50 p-3 rounded">{event.description}</p>
              </div>
            )}

            {event.notes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700">Notițe</span>
                </div>
                <p className="text-gray-900 bg-gray-50 p-3 rounded">{event.notes}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-gray-500 border-t pt-3">
              <p>Creat: {format(new Date(event.created_at), 'dd.MM.yyyy HH:mm')}</p>
              <p>Actualizat: {format(new Date(event.updated_at), 'dd.MM.yyyy HH:mm')}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              {event.status === 'scheduled' && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleExecute}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Execută
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEditModal(true)}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Editează
              </Button>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Șterge
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <CalendarEventModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editEvent={event}
      />
    </>
  );
};