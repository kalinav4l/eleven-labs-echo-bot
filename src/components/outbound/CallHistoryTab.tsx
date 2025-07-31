
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, CheckCircle, AlertCircle, Clock, Phone, ExternalLink } from 'lucide-react';
import { ConversationDetailModal } from './ConversationDetailModal';

import { CallHistoryRecord } from '@/hooks/useCallHistory';

interface CallHistoryTabProps {
  callHistory: CallHistoryRecord[];
  isLoading: boolean;
}

export const CallHistoryTab: React.FC<CallHistoryTabProps> = ({
  callHistory,
  isLoading,
}) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCallClick = (conversationId: string | null) => {
    if (conversationId) {
      setSelectedConversationId(conversationId);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedConversationId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Istoric Apeluri
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Se încarcă istoricul...</p>
          </div>
        ) : callHistory.length > 0 ? (
          <div className="space-y-3">
            {callHistory.map((call) => (
              <div 
                key={call.id} 
                className="p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{call.contact_name}</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 truncate">
                        <span className="font-medium">Sunat: </span>{call.phone_number}
                      </p>
                      {call.caller_number && (
                        <p className="text-sm text-blue-600 truncate">
                          <span className="font-medium">De pe: </span>{call.caller_number}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {call.call_status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : call.call_status === 'busy' ? (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    ) : call.call_status === 'initiated' ? (
                      <Phone className="w-4 h-4 text-blue-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      call.call_status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : call.call_status === 'initiated'
                        ? 'bg-blue-100 text-blue-800'
                        : call.call_status === 'busy'
                        ? 'bg-yellow-100 text-yellow-800'
                        : call.call_status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {call.call_status === 'success' ? 'Successful' : 
                       call.call_status === 'initiated' ? 'Initiated' : 
                       call.call_status === 'busy' ? 'Busy' :
                       call.call_status === 'failed' ? 'Error' : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Niciun apel încă</h3>
            <p className="text-gray-600">Apelurile vor apărea aici după ce sunt efectuate.</p>
          </div>
        )}
      </CardContent>

      <ConversationDetailModal
        conversationId={selectedConversationId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </Card>
  );
};
