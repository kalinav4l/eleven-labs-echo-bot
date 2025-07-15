import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, Clock, PhoneCall, Mic, AlertCircle, Phone } from 'lucide-react';

interface CallStatus {
  contactId: string;
  contactName: string;
  status: 'waiting' | 'calling' | 'in-progress' | 'processing' | 'completed' | 'failed';
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
        return <Phone className="w-4 h-4 text-gray-600 animate-pulse" />;
      case 'in-progress':
        return <Mic className="w-4 h-4 text-gray-700 animate-pulse" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-gray-800" />;
      case 'failed':
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
        return 'Se inițiază...';
      case 'in-progress':
        return 'În conversație';
      case 'processing':
        return 'Se procesează';
      case 'completed':
        return 'Finalizat';
      case 'failed':
        return 'Eșuat';
      default:
        return 'Necunoscut';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in-progress':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'processing':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'calling':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
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
          <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin text-gray-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-800">{currentCallStatus}</span>
          </div>
        )}
      </div>

      {/* Optimized Processing Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-gray-600" />
          <h4 className="font-medium text-gray-800">Procesare Optimizată Activă</h4>
        </div>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• Inițiere apel → Așteptare 30s → Verificare conversații noi la fiecare 25s</p>
          <p>• Monitorizare inteligentă prin lista conversațiilor agentului</p>
          <p>• Detectare automată a conversațiilor noi (nu în istoric)</p>
          <p>• Salvare garantată a tuturor datelor găsite</p>
          <p>• Timeout optimizat la 2.5 minute per apel pentru eficiență maximă</p>
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

      {/* Optimized Processing Guarantee */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-gray-600" />
          <h4 className="font-medium text-gray-800">Garanție Procesare Optimizată</h4>
        </div>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• <strong>Detectare inteligentă:</strong> Monitorizează toate conversațiile agentului</p>
          <p>• <strong>Salvare garantată:</strong> Orice conversație găsită se salvează imediat</p>
          <p>• <strong>Eficiență maximă:</strong> Timeout optimizat la 2.5 minute per apel</p>
          <p>• <strong>Exactitate:</strong> Funcționează identic cu logica ElevenLabs</p>
        </div>
      </div>
    </div>
  );
};
