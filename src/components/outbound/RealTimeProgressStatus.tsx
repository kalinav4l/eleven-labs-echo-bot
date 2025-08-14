import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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

interface RealTimeProgressStatusProps {
  currentProgress: number;
  totalCalls: number;
  currentCallStatus: string;
  callStatuses: CallStatus[];
  startTime?: Date;
  isProcessing: boolean;
}

export const RealTimeProgressStatus: React.FC<RealTimeProgressStatusProps> = ({
  currentProgress,
  totalCalls,
  currentCallStatus,
  callStatuses,
  startTime,
  isProcessing
}) => {
  const progressPercentage = totalCalls > 0 ? (currentProgress / totalCalls) * 100 : 0;
  
  const stats = {
    completed: callStatuses.filter(c => c.status === 'completed').length,
    failed: callStatuses.filter(c => c.status === 'failed').length,
    processing: callStatuses.filter(c => c.status === 'calling' || c.status === 'in-progress' || c.status === 'processing').length,
    waiting: callStatuses.filter(c => c.status === 'waiting').length,
  };

  const getElapsedTime = () => {
    if (!startTime) return '00:00';
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: CallStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'calling':
      case 'in-progress':
      case 'processing':
        return <Phone className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'waiting':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: CallStatus['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Finalizat</Badge>;
      case 'failed':
        return <Badge variant="destructive">Eșuat</Badge>;
      case 'calling':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Sună</Badge>;
      case 'in-progress':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">În progres</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Procesează</Badge>;
      case 'waiting':
        return <Badge variant="outline">Așteaptă</Badge>;
      default:
        return <Badge variant="outline">Necunoscut</Badge>;
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          Progres Campanie în Timp Real
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar și Status */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progres: {currentProgress}/{totalCalls}</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Current Status */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-900">{currentCallStatus}</div>
          {isProcessing && startTime && (
            <div className="text-xs text-blue-700 mt-1">
              Timp scurs: {getElapsedTime()}
            </div>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="text-lg font-bold text-green-800">{stats.completed}</div>
            <div className="text-xs text-green-600">Finalizate</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="text-lg font-bold text-red-800">{stats.failed}</div>
            <div className="text-xs text-red-600">Eșuate</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="text-lg font-bold text-blue-800">{stats.processing}</div>
            <div className="text-xs text-blue-600">Actuale</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-800">{stats.waiting}</div>
            <div className="text-xs text-gray-600">În așteptare</div>
          </div>
        </div>

        {/* Recent Call Statuses */}
        {callStatuses.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Status Apeluri Recente:</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {callStatuses.slice(-5).reverse().map((call) => (
                <div key={call.contactId} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  {getStatusIcon(call.status)}
                  <span className="text-sm font-medium flex-1">{call.contactName}</span>
                  {getStatusBadge(call.status)}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};