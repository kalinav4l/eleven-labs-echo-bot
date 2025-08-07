import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
        return { 
          label: 'Înaltă'
        };
      case 'medium':
        return { 
          label: 'Medie'
        };
      case 'low':
        return { 
          label: 'Scăzută'
        };
      default:
        return { 
          label: priority
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { 
          label: 'Programat'
        };
      case 'completed':
        return { 
          label: 'Completat'
        };
      case 'failed':
        return { 
          label: 'Eșuat'
        };
      case 'overdue':
        return { 
          label: 'Întârziat'
        };
      default:
        return { 
          label: status
        };
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
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-[50vw] max-w-none bg-white overflow-y-auto p-0">
          <div className="h-full">
            <SheetHeader className="p-8 bg-white sticky top-0 z-20">
              <SheetTitle className="text-xl font-medium text-gray-900">
                Detalii Programare
              </SheetTitle>
              <div className="flex gap-3 mt-4">
                <span className="text-xs text-gray-500 px-2 py-1">
                  {statusConfig.label}
                </span>
                <span className="text-xs text-gray-500 px-2 py-1">
                  {priorityConfig.label}
                </span>
              </div>
            </SheetHeader>

            <div className="px-8 pb-8 space-y-12">
              {/* Client Info */}
              <div>
                <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-6">
                  Client
                </h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nume</p>
                    <p className="text-gray-900">{event.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Telefon</p>
                    <p className="text-gray-900">{event.phone_number}</p>
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div>
                <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-6">
                  Programare
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-900">
                    {format(scheduledDate, "EEEE, d MMMM yyyy", { locale: ro })}
                  </p>
                  <p className="text-gray-900">
                    {format(scheduledDate, "HH:mm")}
                    {isOverdue && <span className="ml-2 text-gray-500 text-sm">(Întârziat)</span>}
                  </p>
                </div>
              </div>

              {/* Details Sections */}
              {event.reason && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-6">
                    Motiv
                  </h3>
                  <p className="text-gray-900 leading-relaxed">{event.reason}</p>
                </div>
              )}

              {event.description && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-6">
                    Descriere
                  </h3>
                  <p className="text-gray-900 leading-relaxed">{event.description}</p>
                </div>
              )}

              {event.notes && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-6">
                    Notițe
                  </h3>
                  <p className="text-gray-900 leading-relaxed">{event.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="pt-8">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Creat {format(new Date(event.created_at), "dd.MM.yyyy HH:mm")}</span>
                  <span>Actualizat {format(new Date(event.updated_at), "dd.MM.yyyy HH:mm")}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-8">
                <div className="flex gap-3">
                  {event.status === 'scheduled' && (
                    <button
                      onClick={handleExecute}
                      className="text-gray-700 hover:text-gray-900 text-sm"
                    >
                      Execută
                    </button>
                  )}
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="text-gray-700 hover:text-gray-900 text-sm"
                  >
                    Editează
                  </button>
                </div>
                <button
                  onClick={handleDelete}
                  className="text-gray-700 hover:text-gray-900 text-sm"
                >
                  Șterge
                </button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Modal */}
      <CalendarEventModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editEvent={event}
      />
    </>
  );
};