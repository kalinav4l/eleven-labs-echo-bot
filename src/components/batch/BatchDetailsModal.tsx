import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { BatchCallDetails } from '@/hooks/useBatchCalling';

interface BatchDetailsModalProps {
  batchId: string;
  isOpen: boolean;
  onClose: () => void;
  getBatchDetails: (batchId: string) => Promise<BatchCallDetails | null>;
}

export const BatchDetailsModal: React.FC<BatchDetailsModalProps> = ({
  batchId,
  isOpen,
  onClose,
  getBatchDetails
}) => {
  const [details, setDetails] = useState<BatchCallDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getBatchDetails(batchId);
      setDetails(data);
    } catch (error) {
      console.error('Error fetching batch details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && batchId) {
      fetchDetails();
    }
  }, [isOpen, batchId]);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'running':
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Finalizat</Badge>;
      case 'running':
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">În progres</Badge>;
      case 'failed':
        return <Badge variant="destructive">Eșuat</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Anulat</Badge>;
      case 'pending':
        return <Badge variant="outline">În așteptare</Badge>;
      default:
        return <Badge variant="outline">{status || 'Necunoscut'}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Detalii Lot de Apeluri
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Nume Campanie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold text-white">{details.call_name}</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {getStatusBadge(details.status)}
                </CardContent>
              </Card>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Total Destinatari
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{details.total_recipients}</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finalizate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{details.completed_calls}</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    Eșuate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">{details.failed_calls}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recipients List */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Detalii Apeluri</CardTitle>
              </CardHeader>
              <CardContent>
                {details.recipients && details.recipients.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {details.recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(recipient.status)}
                          <div>
                            <div className="font-medium text-white">{recipient.phone_number}</div>
                            {recipient.conversation_id && (
                              <div className="text-sm text-gray-400">
                                ID: {recipient.conversation_id.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(recipient.status)}
                          {recipient.error && (
                            <div className="text-sm text-red-400 mt-1">{recipient.error}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    Nu sunt disponibile detalii despre apeluri
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Informații Tehnice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Batch ID:</span>
                    <div className="font-mono text-white bg-gray-700 px-2 py-1 rounded mt-1">
                      {details.id}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Agent ID:</span>
                    <div className="font-mono text-white bg-gray-700 px-2 py-1 rounded mt-1">
                      {details.agent_id}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Data Creării:</span>
                    <div className="text-white mt-1">
                      {new Date(details.created_at).toLocaleString('ro-RO')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Nu s-au găsit detalii pentru acest lot
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};