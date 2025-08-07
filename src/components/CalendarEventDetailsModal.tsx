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
          color: 'bg-gray-100 text-gray-700 border border-gray-200', 
          label: 'Înaltă', 
          icon: <AlertCircle className="h-4 w-4" />
        };
      case 'medium':
        return { 
          color: 'bg-gray-100 text-gray-700 border border-gray-200', 
          label: 'Medie', 
          icon: <Clock className="h-4 w-4" />
        };
      case 'low':
        return { 
          color: 'bg-gray-100 text-gray-700 border border-gray-200', 
          label: 'Scăzută', 
          icon: <CheckCircle className="h-4 w-4" />
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-700 border border-gray-200', 
          label: priority, 
          icon: <Clock className="h-4 w-4" />
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { 
          color: 'bg-gray-100 text-gray-700 border border-gray-200', 
          label: 'Programat', 
          icon: <Clock className="h-4 w-4" />
        };
      case 'completed':
        return { 
          color: 'bg-gray-100 text-gray-700 border border-gray-200', 
          label: 'Completat', 
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'failed':
        return { 
          color: 'bg-gray-100 text-gray-700 border border-gray-200', 
          label: 'Eșuat', 
          icon: <XCircle className="h-4 w-4" />
        };
      case 'overdue':
        return { 
          color: 'bg-gray-100 text-gray-700 border border-gray-200', 
          label: 'Întârziat', 
          icon: <AlertCircle className="h-4 w-4" />
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-700 border border-gray-200', 
          label: status, 
          icon: <Clock className="h-4 w-4" />
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
        <SheetContent side="right" className="w-[50vw] max-w-none bg-white border-l border-gray-200 overflow-y-auto p-0">
          <div className="h-full">
            <SheetHeader className="border-b border-gray-200 p-6 bg-white sticky top-0 z-20">
              <SheetTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  Detalii Programare
                </span>
                <div className="flex gap-2">
                  <Badge className={`${statusConfig.color} rounded-md px-2 py-1 text-xs font-medium`}>
                    {statusConfig.icon}
                    <span className="ml-1">{statusConfig.label}</span>
                  </Badge>
                  <Badge className={`${priorityConfig.color} rounded-md px-2 py-1 text-xs font-medium`}>
                    {priorityConfig.icon}
                    <span className="ml-1">{priorityConfig.label}</span>
                  </Badge>
                </div>
              </SheetTitle>
            </SheetHeader>

            <div className="p-6 space-y-8">
              {/* Client Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informații Client
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-white rounded-md border border-gray-200">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{event.client_name}</p>
                      <p className="text-sm text-gray-500">Nume client</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-white rounded-md border border-gray-200">
                      <Phone className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{event.phone_number}</p>
                      <p className="text-sm text-gray-500">Număr telefon</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Programare
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-md border border-gray-200">
                      <Calendar className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(scheduledDate, "EEEE, d MMMM yyyy", { locale: ro })}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {format(scheduledDate, "HH:mm")}
                        {isOverdue && <span className="ml-2 text-gray-500 text-sm font-normal">(Întârziat)</span>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Sections */}
              {event.reason && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Motiv
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 leading-relaxed">{event.reason}</p>
                  </div>
                </div>
              )}

              {event.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descriere
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 leading-relaxed">{event.description}</p>
                  </div>
                </div>
              )}

              {event.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                    <StickyNote className="h-4 w-4" />
                    Notițe
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 leading-relaxed">{event.notes}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Creat: {format(new Date(event.created_at), "dd.MM.yyyy HH:mm")}</span>
                  <span>Actualizat: {format(new Date(event.updated_at), "dd.MM.yyyy HH:mm")}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <div className="flex gap-2">
                  {event.status === 'scheduled' && (
                    <Button
                      size="sm"
                      onClick={handleExecute}
                      className="bg-gray-900 text-white hover:bg-gray-800"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Execută
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowEditModal(true)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editează
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Șterge
                </Button>
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