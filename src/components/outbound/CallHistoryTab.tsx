
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface CallHistoryRecord {
  id: string;
  phone_number: string;
  contact_name: string;
  call_status: 'success' | 'failed' | 'busy' | 'no-answer' | 'unknown';
  summary: string;
  call_date: string;
  cost_usd: number;
}

interface CallHistoryTabProps {
  callHistory: CallHistoryRecord[];
  isLoading: boolean;
}

export const CallHistoryTab: React.FC<CallHistoryTabProps> = ({
  callHistory,
  isLoading,
}) => {
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
              <div key={call.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{call.contact_name}</h3>
                    <p className="text-sm text-gray-600">{call.phone_number}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {call.call_status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        call.call_status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : call.call_status === 'initiated'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {call.call_status === 'success' ? 'Finalizat' : 
                         call.call_status === 'initiated' ? 'Inițiat' : 'Eșuat'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{call.call_date}</p>
                    {call.cost_usd > 0 && (
                      <p className="text-xs text-gray-500">{call.cost_usd} credite</p>
                    )}
                  </div>
                </div>
                {call.summary && (
                  <p className="text-sm text-gray-700 mt-2">{call.summary}</p>
                )}
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
    </Card>
  );
};
