import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Plus, Phone, Users, Eye, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { useBatchCalling } from '@/hooks/useBatchCalling';
import { CreateBatchModal } from '@/components/batch/CreateBatchModal';
import { BatchDetailsModal } from '@/components/batch/BatchDetailsModal';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

const BatchCalling = () => {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  
  const {
    batchCalls,
    isLoading,
    submitBatchCall,
    getBatchDetails,
    cancelBatchCall,
    retryBatchCall,
    refetchBatchCalls
  } = useBatchCalling();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Finalizat</Badge>;
      case 'running':
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">În progres</Badge>;
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

  const handleViewDetails = async (batchId: string) => {
    setSelectedBatchId(batchId);
  };

  const handleCancelBatch = async (batchId: string) => {
    await cancelBatchCall(batchId);
    refetchBatchCalls();
  };

  const handleRetryBatch = async (batchId: string) => {
    await retryBatchCall(batchId);
    refetchBatchCalls();
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Apeluri Batch</h1>
              <p className="text-gray-600 mt-2">Gestionează și monitorizează campaniile de apeluri</p>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Lot Nou
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Loturi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{batchCalls?.length || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">În Progres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {batchCalls?.filter(call => call.status === 'running' || call.status === 'in_progress').length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Finalizate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {batchCalls?.filter(call => call.status === 'completed').length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Batch Calls Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Istoricul Loturilor</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : batchCalls?.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nu există loturi de apeluri create încă</p>
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Creează primul lot
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nume Campanie</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID Lot</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Creat</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Destinatari</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchCalls?.map((batch) => (
                        <tr key={batch.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">{batch.call_name || 'Lot de apeluri'}</div>
                          </td>
                          <td className="py-4 px-4">
                            <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {batch.id.slice(0, 8)}...
                            </code>
                          </td>
                          <td className="py-4 px-4 text-gray-600 text-sm">
                            {batch.created_at ? formatDistanceToNow(new Date(batch.created_at), { 
                              addSuffix: true, 
                              locale: ro 
                            }) : 'Necunoscut'}
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(batch.status)}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {batch.total_recipients || 0}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetails(batch.id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              
                              {(batch.status === 'running' || batch.status === 'in_progress') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCancelBatch(batch.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Pause className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {batch.status === 'failed' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRetryBatch(batch.id)}
                                  className="text-amber-600 hover:text-amber-800"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modals */}
          <CreateBatchModal 
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={async (data) => {
              await submitBatchCall(data);
              setIsCreateModalOpen(false);
              refetchBatchCalls();
            }}
          />

          {selectedBatchId && (
            <BatchDetailsModal
              batchId={selectedBatchId}
              isOpen={!!selectedBatchId}
              onClose={() => setSelectedBatchId(null)}
              getBatchDetails={getBatchDetails}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BatchCalling;