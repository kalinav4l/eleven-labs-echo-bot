import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useActiveAgents } from '@/hooks/useActiveAgents';
import { Loader2, Phone, Mic, Clock, Activity, User } from 'lucide-react';

export const ActiveAgentsPanel: React.FC = () => {
  const { activeAgents, isLoading } = useActiveAgents();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'calling':
        return <Phone className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'in_conversation':
        return <Mic className="w-4 h-4 text-green-600 animate-pulse" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'calling':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_conversation':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'calling':
        return 'Inițiază apel';
      case 'in_conversation':
        return 'În conversație';
      case 'processing':
        return 'Procesează';
      case 'idle':
        return 'Inactiv';
      default:
        return 'Necunoscut';
    }
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
    
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Agenți Activi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Agenți Activi
          {activeAgents.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activeAgents.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeAgents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nu există agenți activi în acest moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAgents.map(agent => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg bg-background hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(agent.status)}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {agent.agentName}
                    </p>
                    {agent.currentContactName && (
                      <p className="text-xs text-muted-foreground truncate">
                        → {agent.currentContactName}
                      </p>
                    )}
                    {agent.currentPhoneNumber && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {agent.currentPhoneNumber}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(agent.status)}`}
                  >
                    {getStatusText(agent.status)}
                  </Badge>
                  
                  {agent.callStartedAt && agent.status !== 'idle' && (
                    <div className="text-xs text-muted-foreground font-mono">
                      {formatDuration(agent.callStartedAt)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};