
import React from 'react';
import { RefreshCw, Clock, CheckCircle } from 'lucide-react';
import { useSelectiveRefresh } from '@/hooks/useSelectiveRefresh';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';

export const ConversationRefreshIndicator = () => {
  const { recentConversations, refreshConversations, lastRefreshTime } = useSelectiveRefresh();

  const formatLastRefresh = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          Ultima actualizare: {formatLastRefresh(lastRefreshTime)}
        </span>
      </div>
      
      {recentConversations.length > 0 && (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600">
            {recentConversations.length} conversații noi
          </span>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={refreshConversations}
        className="ml-auto"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Actualizează
      </Button>
    </div>
  );
};
