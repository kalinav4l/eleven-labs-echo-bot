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
        return { color: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg shadow-red-500/30', label: 'Înaltă', icon: '🔴' };
      case 'medium':
        return { color: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg shadow-yellow-500/30', label: 'Medie', icon: '🟡' };
      case 'low':
        return { color: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg shadow-green-500/30', label: 'Scăzută', icon: '🟢' };
      default:
        return { color: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-lg shadow-gray-500/30', label: priority, icon: '⚪' };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-500/30', label: 'Programat', icon: <Clock className="h-4 w-4" /> };
      case 'completed':
        return { color: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg shadow-green-500/30', label: 'Completat', icon: <CheckCircle className="h-4 w-4" /> };
      case 'failed':
        return { color: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg shadow-red-500/30', label: 'Eșuat', icon: <XCircle className="h-4 w-4" /> };
      case 'overdue':
        return { color: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg shadow-orange-500/30', label: 'Întârziat', icon: <AlertCircle className="h-4 w-4" /> };
      default:
        return { color: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-lg shadow-gray-500/30', label: status, icon: <Clock className="h-4 w-4" /> };
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

          <div className="space-y-6 pt-4">
            {/* Client Info */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 shadow-lg">
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg"></div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Informații Client
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">{event.client_name}</p>
                    <p className="text-sm text-gray-500 font-medium">Client</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">{event.phone_number}</p>
                    <p className="text-sm text-gray-500 font-medium">Telefon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Info */}
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200 shadow-lg">
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg"></div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Programare
              </h3>
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">
                    {format(scheduledDate, 'EEEE, d MMMM yyyy', { locale: ro })}
                  </p>
                  <p className="text-blue-600 font-bold text-xl">
                    {format(scheduledDate, 'HH:mm')}
                    {isOverdue && <span className="ml-2 text-red-600 font-bold text-sm">(Întârziat)</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Details */}
            {event.reason && (
              <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200 shadow-lg">
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full shadow-lg"></div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-yellow-600" />
                  Motiv
                </h3>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-yellow-100">
                  <p className="text-gray-900 font-medium leading-relaxed">{event.reason}</p>
                </div>
              </div>
            )}

            {event.description && (
              <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 shadow-lg">
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg"></div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Descriere
                </h3>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-green-100">
                  <p className="text-gray-900 font-medium leading-relaxed">{event.description}</p>
                </div>
              </div>
            )}

            {event.notes && (
              <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200 shadow-lg">
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full shadow-lg"></div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <StickyNote className="h-5 w-5 text-purple-600" />
                  Notițe
                </h3>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                  <p className="text-gray-900 font-medium leading-relaxed">{event.notes}</p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="text-sm text-gray-500 border-t pt-4 bg-gray-50 p-4 rounded-xl">
              <div className="flex justify-between">
                <span className="font-medium">Creat: {format(new Date(event.created_at), 'dd.MM.yyyy HH:mm')}</span>
                <span className="font-medium">Actualizat: {format(new Date(event.updated_at), 'dd.MM.yyyy HH:mm')}</span>
              </div>
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