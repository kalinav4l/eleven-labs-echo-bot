import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertCircle, Users } from 'lucide-react';

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

interface BatchStatusPanelProps {
  isProcessing: boolean;
  currentProgress: number;
  totalCalls: number;
  callStatuses: CallStatus[];
  startTime?: Date;
}

export const BatchStatusPanel: React.FC<BatchStatusPanelProps> = ({
  isProcessing,
  currentProgress,
  totalCalls,
  callStatuses,
  startTime,
}) => {
  const completedCalls = callStatuses.filter(call => call.status === 'completed').length;
  const failedCalls = callStatuses.filter(call => call.status === 'failed').length;
  const progressPercentage = totalCalls > 0 ? (currentProgress / totalCalls) * 100 : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'waiting': 'secondary',
      'calling': 'default',
      'in-progress': 'default',
      'processing': 'default',
      'completed': 'default',
      'failed': 'destructive',
    } as const;

    const labels = {
      'waiting': 'În Așteptare',
      'calling': 'Sună',
      'in-progress': 'În Progres',
      'processing': 'Procesează',
      'completed': 'Finalizat',
      'failed': 'Eșuat',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className="text-xs">
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (!isProcessing && callStatuses.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-blue-100 bg-blue-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Status Batch</span>
          </div>
          <Badge variant={isProcessing ? "default" : "secondary"}>
            {isProcessing ? "În Progres" : "Finalizat"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{totalCalls}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{currentProgress}</div>
            <div className="text-xs text-gray-500">Procesate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{completedCalls}</div>
            <div className="text-xs text-gray-500">Reușite</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{failedCalls}</div>
            <div className="text-xs text-gray-500">Eșuate</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progres</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Time Info */}
        {startTime && (
          <div className="text-xs text-gray-500 flex items-center space-x-2">
            <Clock className="w-3 h-3" />
            <span>Început la: {startTime.toLocaleTimeString()}</span>
          </div>
        )}

        {/* Call Recipients Table */}
        {callStatuses.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Destinatari Apeluri</h4>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-medium">Contact</th>
                    <th className="text-left p-2 font-medium">Status</th>
                    <th className="text-left p-2 font-medium">Durată</th>
                  </tr>
                </thead>
                <tbody>
                  {callStatuses.map((call) => (
                    <tr key={call.contactId} className="border-t border-gray-100">
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(call.status)}
                          <span className="truncate">{call.contactName}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        {getStatusBadge(call.status)}
                      </td>
                      <td className="p-2 text-gray-500">
                        {call.duration ? `${call.duration}s` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};