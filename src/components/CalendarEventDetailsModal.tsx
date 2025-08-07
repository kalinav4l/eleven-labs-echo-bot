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
        return { color: 'bg-black text-white border border-gray-200', label: 'Înaltă', icon: <AlertCircle className="h-4 w-4" /> };
      case 'medium':
        return { color: 'bg-gray-600 text-white border border-gray-300', label: 'Medie', icon: <Clock className="h-4 w-4" /> };
      case 'low':
        return { color: 'bg-gray-400 text-white border border-gray-200', label: 'Scăzută', icon: <CheckCircle className="h-4 w-4" /> };
      default:
        return { color: 'bg-gray-500 text-white border border-gray-200', label: priority, icon: <Clock className="h-4 w-4" /> };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { color: 'bg-white text-black border border-gray-300', label: 'Programat', icon: <Clock className="h-4 w-4" /> };
      case 'completed':
        return { color: 'bg-black text-white border border-gray-200', label: 'Completat', icon: <CheckCircle className="h-4 w-4" /> };
      case 'failed':
        return { color: 'bg-gray-600 text-white border border-gray-200', label: 'Eșuat', icon: <XCircle className="h-4 w-4" /> };
      case 'overdue':
        return { color: 'bg-gray-800 text-white border border-gray-200', label: 'Întârziat', icon: <AlertCircle className="h-4 w-4" /> };
      default:
        return { color: 'bg-gray-500 text-white border border-gray-200', label: status, icon: <Clock className="h-4 w-4" /> };
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
        <DialogContent className="sm:max-w-[600px] bg-white border border-gray-200">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="flex items-center justify-between text-xl font-semibold text-black">
              <span className="flex items-center gap-3">
                <div className="p-2 bg-black rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                Detalii Programare
              </span>
              <div className="flex gap-2">
                <Badge className={statusConfig.color}>
                  {statusConfig.icon}
                  <span className="ml-1">{statusConfig.label}</span>
                </Badge>
                <Badge className={priorityConfig.color}>
                  {priorityConfig.icon}
                  <span className="ml-1">{priorityConfig.label}</span>
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-6">
            {/* Client Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-3 border-b border-gray-100 pb-2">
                <div className="p-2 bg-black rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                Informații Client
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="p-2 bg-white border border-gray-200 rounded-lg">
                    <User className="h-5 w-5 text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-black text-lg">{event.client_name}</p>
                    <p className="text-sm text-gray-600">Nume client</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="p-2 bg-white border border-gray-200 rounded-lg">
                    <Phone className="h-5 w-5 text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-black text-lg">{event.phone_number}</p>
                    <p className="text-sm text-gray-600">Număr telefon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-3 border-b border-gray-100 pb-2">
                <div className="p-2 bg-black rounded-lg">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                Programare
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <Calendar className="h-6 w-6 text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-black text-lg">
                      {format(scheduledDate, "EEEE, d MMMM yyyy", { locale: ro })}
                    </p>
                    <p className="text-black font-bold text-xl">
                      {format(scheduledDate, "HH:mm")}
                      {isOverdue && <span className="ml-2 text-gray-600 font-medium text-sm">(Întârziat)</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            {event.reason && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-3 border-b border-gray-100 pb-2">
                  <div className="p-2 bg-black rounded-lg">
                    <Tag className="h-4 w-4 text-white" />
                  </div>
                  Motiv
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-black font-medium leading-relaxed">{event.reason}</p>
                </div>
              </div>
            )}

            {event.description && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-3 border-b border-gray-100 pb-2">
                  <div className="p-2 bg-black rounded-lg">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  Descriere
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-black font-medium leading-relaxed">{event.description}</p>
                </div>
              </div>
            )}

            {event.notes && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-3 border-b border-gray-100 pb-2">
                  <div className="p-2 bg-black rounded-lg">
                    <StickyNote className="h-4 w-4 text-white" />
                  </div>
                  Notițe
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-black font-medium leading-relaxed">{event.notes}</p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span className="font-medium">Creat: {format(new Date(event.created_at), "dd.MM.yyyy HH:mm")}</span>
                <span className="font-medium">Actualizat: {format(new Date(event.updated_at), "dd.MM.yyyy HH:mm")}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              {event.status === 'scheduled' && (
                <Button
                  size="sm"
                  onClick={handleExecute}
                  className="bg-black text-white hover:bg-gray-800 border border-gray-200"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Execută
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEditModal(true)}
                className="border-gray-300 text-black hover:bg-gray-50"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Editează
              </Button>
            </div>
            <Button
              size="sm"
              onClick={handleDelete}
              className="bg-white text-black border border-gray-300 hover:bg-gray-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
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