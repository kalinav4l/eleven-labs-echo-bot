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
          color: 'bg-gradient-to-r from-red-500/80 to-pink-600/80 backdrop-blur-sm border border-red-300/30 text-white shadow-lg shadow-red-500/25', 
          label: 'Înaltă', 
          icon: <AlertCircle className="h-4 w-4" />,
          glow: 'shadow-red-500/50'
        };
      case 'medium':
        return { 
          color: 'bg-gradient-to-r from-amber-500/80 to-orange-600/80 backdrop-blur-sm border border-amber-300/30 text-white shadow-lg shadow-amber-500/25', 
          label: 'Medie', 
          icon: <Clock className="h-4 w-4" />,
          glow: 'shadow-amber-500/50'
        };
      case 'low':
        return { 
          color: 'bg-gradient-to-r from-emerald-500/80 to-green-600/80 backdrop-blur-sm border border-emerald-300/30 text-white shadow-lg shadow-emerald-500/25', 
          label: 'Scăzută', 
          icon: <CheckCircle className="h-4 w-4" />,
          glow: 'shadow-emerald-500/50'
        };
      default:
        return { 
          color: 'bg-gradient-to-r from-gray-500/80 to-slate-600/80 backdrop-blur-sm border border-gray-300/30 text-white shadow-lg shadow-gray-500/25', 
          label: priority, 
          icon: <Clock className="h-4 w-4" />,
          glow: 'shadow-gray-500/50'
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { 
          color: 'bg-gradient-to-r from-blue-500/80 to-cyan-600/80 backdrop-blur-sm border border-blue-300/30 text-white shadow-lg shadow-blue-500/25', 
          label: 'Programat', 
          icon: <Clock className="h-4 w-4" />,
          glow: 'shadow-blue-500/50'
        };
      case 'completed':
        return { 
          color: 'bg-gradient-to-r from-green-500/80 to-emerald-600/80 backdrop-blur-sm border border-green-300/30 text-white shadow-lg shadow-green-500/25', 
          label: 'Completat', 
          icon: <CheckCircle className="h-4 w-4" />,
          glow: 'shadow-green-500/50'
        };
      case 'failed':
        return { 
          color: 'bg-gradient-to-r from-red-500/80 to-rose-600/80 backdrop-blur-sm border border-red-300/30 text-white shadow-lg shadow-red-500/25', 
          label: 'Eșuat', 
          icon: <XCircle className="h-4 w-4" />,
          glow: 'shadow-red-500/50'
        };
      case 'overdue':
        return { 
          color: 'bg-gradient-to-r from-orange-500/80 to-red-600/80 backdrop-blur-sm border border-orange-300/30 text-white shadow-lg shadow-orange-500/25', 
          label: 'Întârziat', 
          icon: <AlertCircle className="h-4 w-4" />,
          glow: 'shadow-orange-500/50'
        };
      default:
        return { 
          color: 'bg-gradient-to-r from-gray-500/80 to-slate-600/80 backdrop-blur-sm border border-gray-300/30 text-white shadow-lg shadow-gray-500/25', 
          label: status, 
          icon: <Clock className="h-4 w-4" />,
          glow: 'shadow-gray-500/50'
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
        <SheetContent side="right" className="w-[50vw] max-w-none bg-white/95 backdrop-blur-xl border-l border-white/30 shadow-2xl overflow-y-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          <div className="relative z-10 h-full">
            <SheetHeader className="border-b border-white/20 pb-6 sticky top-0 bg-white/80 backdrop-blur-sm z-20">
              <SheetTitle className="flex items-center justify-between text-2xl font-bold text-gray-900">
                <span className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500/80 to-purple-600/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Detalii Programare
                  </span>
                </span>
                <div className="flex gap-3">
                  <Badge className={`${statusConfig.color} rounded-full px-4 py-2`}>
                    {statusConfig.icon}
                    <span className="ml-2 font-semibold">{statusConfig.label}</span>
                  </Badge>
                  <Badge className={`${priorityConfig.color} rounded-full px-4 py-2`}>
                    {priorityConfig.icon}
                    <span className="ml-2 font-semibold">{priorityConfig.label}</span>
                  </Badge>
                </div>
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-8 pt-8">
              {/* Client Info */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-3xl"></div>
                <div className="relative bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02]">
                  <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-xl"></div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500/80 to-purple-600/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    Informații Client
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center gap-6 p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="p-4 bg-gradient-to-br from-blue-500/60 to-cyan-600/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-inner">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-xl mb-1">{event.client_name}</p>
                        <p className="text-gray-600 font-medium">Nume client</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="p-4 bg-gradient-to-br from-emerald-500/60 to-green-600/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-inner">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-xl mb-1">{event.phone_number}</p>
                        <p className="text-gray-600 font-medium">Număr telefon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 backdrop-blur-sm rounded-3xl"></div>
                <div className="relative bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-[1.02]">
                  <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-xl"></div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-500/80 to-blue-600/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    Programare
                  </h3>
                  <div className="p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-gradient-to-br from-indigo-500/60 to-purple-600/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-inner">
                        <Calendar className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-xl mb-2">
                          {format(scheduledDate, "EEEE, d MMMM yyyy", { locale: ro })}
                        </p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {format(scheduledDate, "HH:mm")}
                          {isOverdue && <span className="ml-3 text-red-500 font-bold text-lg">(Întârziat)</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Sections */}
              {event.reason && (
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-3xl"></div>
                  <div className="relative bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-full blur-xl"></div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-amber-500/80 to-orange-600/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                        <Tag className="h-5 w-5 text-white" />
                      </div>
                      Motiv
                    </h3>
                    <div className="p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                      <p className="text-gray-900 font-medium leading-relaxed text-lg">{event.reason}</p>
                    </div>
                  </div>
                </div>
              )}

              {event.description && (
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 backdrop-blur-sm rounded-3xl"></div>
                  <div className="relative bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-full blur-xl"></div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-emerald-500/80 to-green-600/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      Descriere
                    </h3>
                    <div className="p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                      <p className="text-gray-900 font-medium leading-relaxed text-lg">{event.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {event.notes && (
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 backdrop-blur-sm rounded-3xl"></div>
                  <div className="relative bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-xl"></div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500/80 to-pink-600/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                        <StickyNote className="h-5 w-5 text-white" />
                      </div>
                      Notițe
                    </h3>
                    <div className="p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                      <p className="text-gray-900 font-medium leading-relaxed text-lg">{event.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 via-slate-500/10 to-zinc-500/10 backdrop-blur-sm rounded-3xl"></div>
                <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl">
                  <div className="flex justify-between text-sm text-gray-700 font-medium">
                    <span>Creat: {format(new Date(event.created_at), "dd.MM.yyyy HH:mm")}</span>
                    <span>Actualizat: {format(new Date(event.updated_at), "dd.MM.yyyy HH:mm")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-8 border-t border-white/20">
              <div className="flex gap-4">
                {event.status === 'scheduled' && (
                  <Button
                    size="lg"
                    onClick={handleExecute}
                    className="bg-gradient-to-r from-emerald-500/80 to-green-600/80 hover:from-emerald-600/90 hover:to-green-700/90 text-white border border-white/30 backdrop-blur-sm rounded-2xl shadow-lg shadow-emerald-500/25 px-6 py-3 font-semibold transition-all duration-300 hover:scale-105"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Execută
                  </Button>
                )}
                <Button
                  size="lg"
                  onClick={() => setShowEditModal(true)}
                  className="bg-white/30 hover:bg-white/40 text-gray-900 border border-white/40 backdrop-blur-sm rounded-2xl shadow-lg px-6 py-3 font-semibold transition-all duration-300 hover:scale-105"
                >
                  <Edit3 className="h-5 w-5 mr-2" />
                  Editează
                </Button>
              </div>
              <Button
                size="lg"
                onClick={handleDelete}
                className="bg-gradient-to-r from-red-500/80 to-rose-600/80 hover:from-red-600/90 hover:to-rose-700/90 text-white border border-white/30 backdrop-blur-sm rounded-2xl shadow-lg shadow-red-500/25 px-6 py-3 font-semibold transition-all duration-300 hover:scale-105"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Șterge
              </Button>
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