import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CheckCircle, 
  Clock, 
  PhoneCall, 
  Mic, 
  AlertCircle, 
  Phone, 
  Pause, 
  Play, 
  Square,
  Timer,
  TrendingUp,
  Activity
} from 'lucide-react';

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

interface EnhancedBatchProgressProps {
  currentProgress: number;
  totalCalls: number;
  currentCallStatus: string;
  callStatuses: CallStatus[];
  isProcessing: boolean;
  isPaused: boolean;
  isStopped: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  startTime?: Date;
}

export const EnhancedBatchProgress: React.FC<EnhancedBatchProgressProps> = ({
  currentProgress,
  totalCalls,
  currentCallStatus,
  callStatuses,
  isProcessing,
  isPaused,
  isStopped,
  onPause,
  onResume,
  onStop,
  startTime,
}) => {
  const progressPercentage = totalCalls > 0 ? (currentProgress / totalCalls) * 100 : 0;
  
  // Calculez statistici
  const completedCalls = callStatuses.filter(call => call.status === 'completed').length;
  const failedCalls = callStatuses.filter(call => call.status === 'failed').length;
  const inProgressCalls = callStatuses.filter(call => 
    ['calling', 'in-progress', 'processing'].includes(call.status)
  ).length;
  
  const totalDuration = callStatuses
    .filter(call => call.duration)
    .reduce((sum, call) => sum + (call.duration || 0), 0);
  
  const totalCost = callStatuses
    .filter(call => call.cost)
    .reduce((sum, call) => sum + (call.cost || 0), 0);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getElapsedTime = () => {
    if (!startTime) return 'N/A';
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    return formatDuration(elapsed);
  };

  const getEstimatedTimeRemaining = () => {
    if (!startTime || currentProgress === 0) return 'N/A';
    
    const now = new Date();
    const elapsed = (now.getTime() - startTime.getTime()) / 1000;
    const averageTimePerCall = elapsed / currentProgress;
    const remainingCalls = totalCalls - currentProgress;
    const estimatedRemaining = Math.floor(averageTimePerCall * remainingCalls);
    
    return formatDuration(estimatedRemaining);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'calling':
        return <Phone className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'in-progress':
        return <Mic className="w-4 h-4 text-green-600 animate-pulse" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'calling':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progres Principal și Statistici */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Progres Campanie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progres:</span>
              <span className="font-mono text-lg">
                {currentProgress} / {totalCalls} ({Math.round(progressPercentage)}%)
              </span>
            </div>
            <Progress value={progressPercentage} className="h-4" />
            
            {/* Butoane de Control */}
            {isProcessing && (
              <div className="flex gap-2 pt-2">
                {!isPaused && !isStopped && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPause}
                    className="flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Pauză
                  </Button>
                )}
                
                {isPaused && !isStopped && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onResume}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Continuă
                  </Button>
                )}
                
                {!isStopped && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onStop}
                    className="flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Oprește
                  </Button>
                )}
              </div>
            )}
            
            {/* Status Curent */}
            {currentCallStatus && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                {isPaused ? (
                  <Pause className="w-4 h-4 text-orange-600 flex-shrink-0" />
                ) : isStopped ? (
                  <Square className="w-4 h-4 text-red-600 flex-shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                )}
                <span className="text-sm font-medium">{currentCallStatus}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistici Rapide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Statistici
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Completate:</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {completedCalls}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Eșuate:</span>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {failedCalls}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">În progres:</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {inProgressCalls}
              </Badge>
            </div>
            
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Timp total:</span>
                <span className="font-mono">{formatDuration(totalDuration)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Cost total:</span>
                <span className="font-mono">${totalCost.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Timp scurs:</span>
                <span className="font-mono">{getElapsedTime()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Estimat rămas:</span>
                <span className="font-mono">{getEstimatedTimeRemaining()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Detaliat per Contact */}
      {callStatuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5" />
              Status Detaliat Apeluri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {callStatuses.map(callStatus => (
                <div 
                  key={callStatus.contactId} 
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getStatusIcon(callStatus.status)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{callStatus.contactName}</p>
                      {callStatus.conversationId && (
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          ID: {callStatus.conversationId.substring(0, 12)}...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(callStatus.status)}`}
                    >
                      {getStatusText(callStatus.status)}
                    </Badge>
                    
                    <div className="text-right min-w-0">
                      {callStatus.duration !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          <Timer className="w-3 h-3 inline mr-1" />
                          {callStatus.duration}s
                        </div>
                      )}
                      {callStatus.cost !== undefined && (
                        <div className="text-xs text-muted-foreground font-mono">
                          ${callStatus.cost.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};