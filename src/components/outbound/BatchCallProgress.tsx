
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, Clock, PhoneCall, Mic, AlertCircle } from 'lucide-react';

interface CallStatus {
  contactId: string;
  contactName: string;
  status: 'waiting' | 'calling' | 'talking' | 'completed' | 'failed' | 'no-answer' | 'busy';
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
        return <PhoneCall className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'talking':
        return <Mic className="w-4 h-4 text-green-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
      case 'no-answer':
      case 'busy':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'În așteptare';
      case 'calling':
        return 'Se apelează...';
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
      default:
        return 'Necunoscut';
    }
  };

  return (
    <div className="space-y-4 mb-4">
      <div className="flex items-center justify-between text-sm">
        <span>Progres: {currentProgress} / {totalCalls}</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      
      {/* Current Status */}
      {currentCallStatus && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-blue-800">{currentCallStatus}</span>
          </div>
        </div>
      )}

      {/* Detailed Call Statuses */}
      {callStatuses.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Status Detaliat Apeluri:</h4>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {callStatuses.map(callStatus => (
              <div key={callStatus.contactId} className="flex items-center justify-between p-2 bg-white border rounded text-sm">
                <div className="flex items-center gap-2">
                  {getStatusIcon(callStatus.status)}
                  <span className="font-medium">{callStatus.contactName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    callStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
                    callStatus.status === 'talking' ? 'bg-blue-100 text-blue-800' :
                    callStatus.status === 'calling' ? 'bg-yellow-100 text-yellow-800' :
                    callStatus.status === 'failed' ? 'bg-red-100 text-red-800' :
                    callStatus.status === 'no-answer' ? 'bg-gray-100 text-gray-800' :
                    callStatus.status === 'busy' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusText(callStatus.status)}
                  </span>
                  {callStatus.duration && (
                    <span className="text-xs text-gray-600">{callStatus.duration}s</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-800 font-medium">
            Monitorizare API ElevenLabs Activă
          </p>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Verificare status la 5 secunde. Următorul apel începe doar după confirmarea finalizării celui curent.
        </p>
      </div>
    </div>
  );
};
