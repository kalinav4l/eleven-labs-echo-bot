
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, Clock, PhoneCall, Mic, AlertCircle, Phone } from 'lucide-react';

interface CallStatus {
  contactId: string;
  contactName: string;
  status: 'waiting' | 'calling' | 'ringing' | 'talking' | 'completed' | 'failed' | 'no-answer' | 'busy' | 'rejected' | 'cancelled';
  conversationId?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  cost?: number;
}

interface BatchCallProgressProps {
  currentProgress: number;
  totalCalls: number;
  currentCallStatus: string;
  callStatuses: CallStatus[];
}

export const BatchCallProgress: React.FC<BatchCallProgressProps> = ({
  currentProgress,
  totalCalls,
  currentCallStatus,
  callStatuses,
}) => {
  const progressPercentage = totalCalls > 0 ? (currentProgress / totalCalls) * 100 : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'calling':
        return <Phone className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'ringing':
        return <PhoneCall className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'talking':
        return <Mic className="w-4 h-4 text-green-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'no-answer':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'busy':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'În așteptare';
      case 'calling':
        return 'Se inițiază...';
      case 'ringing':
        return 'Sună...';
      case 'talking':
        return 'În conversație';
      case 'completed':
        return 'Finalizat';
      case 'failed':
        return 'Eșuat';
      case 'no-answer':
        return 'Nu răspunde';
      case 'busy':
        return 'Ocupat';
      case 'rejected':
        return 'Respins';
      case 'cancelled':
        return 'Anulat';
      default:
        return 'Necunoscut';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'talking':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ringing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'calling':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no-answer':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Overall Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium">Progres General:</span>
          <span className="font-mono">{currentProgress} / {totalCalls} ({Math.round(progressPercentage)}%)</span>
        </div>
        <Progress value={progressPercentage} className="h-3 mb-3" />
        
        {/* Current Status */}
        {currentCallStatus && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
            <span className="text-sm font-medium text-blue-800">{currentCallStatus}</span>
          </div>
        )}
      </div>

      {/* Sequential Processing Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-green-800">Procesare Secvențială Activă</h4>
        </div>
        <div className="text-sm text-green-700 space-y-1">
          <p>• Un apel la un moment dat - fără suprapuneri</p>
          <p>• Monitorizare în timp real prin API ElevenLabs</p>
          <p>• Salvare completă a datelor înainte de următorul apel</p>
          <p>• Toate informațiile (transcript, cost, durată) în istoric</p>
        </div>
      </div>

      {/* Detailed Call Statuses */}
      {callStatuses.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Status Detaliat per Contact:</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {callStatuses.map(callStatus => (
              <div 
                key={callStatus.contactId} 
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(callStatus.status)}
                  <div>
                    <span className="font-medium text-gray-900">{callStatus.contactName}</span>
                    {callStatus.conversationId && (
                      <div className="text-xs text-gray-500 font-mono">
                        ID: {callStatus.conversationId.substring(0, 12)}...
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(callStatus.status)}`}>
                    {getStatusText(callStatus.status)}
                  </span>
                  
                  <div className="text-right">
                    {callStatus.duration && (
                      <div className="text-xs text-gray-600">{callStatus.duration}s</div>
                    )}
                    {callStatus.cost && (
                      <div className="text-xs text-gray-600">${callStatus.cost.toFixed(4)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Guarantee */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <h4 className="font-medium text-amber-800">Garanție de Procesare</h4>
        </div>
        <div className="text-sm text-amber-700 space-y-1">
          <p>• Fiecare apel finalizat va fi GARANTAT salvat în "Istoric Apeluri"</p>
          <p>• Procesarea se oprește DOAR după salvarea completă a datelor</p>
          <p>• Statusurile se actualizează în timp real din API ElevenLabs</p>
        </div>
      </div>
    </div>
  );
};
