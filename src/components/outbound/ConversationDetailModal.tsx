import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Phone, Clock, Calendar, MessageSquare, Volume2, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { useConversationById } from '@/hooks/useConversationById';

interface ConversationDetailModalProps {
  conversationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ConversationDetailModal: React.FC<ConversationDetailModalProps> = ({
  conversationId,
  isOpen,
  onClose,
}) => {
  const { data: conversation, isLoading, error } = useConversationById(conversationId || undefined);

  if (!conversationId) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Detalii Conversație
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Se încarcă conversația...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600">Eroare la încărcarea conversației</p>
          </div>
        )}

        {conversation && (
          <div className="space-y-6">
            {/* Metadata Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Metadata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Data</p>
                    <p className="font-medium">{formatDate(conversation.start_time)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Durata conexiunii</p>
                    <p className="font-medium">{formatDuration(conversation.duration || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Credite (apel)</p>
                    <p className="font-medium">{conversation.cost_analysis?.total_cost || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant={conversation.status === 'completed' ? 'default' : 'secondary'}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {conversation.status === 'completed' ? 'Successful' : conversation.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Section */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="transcription">Transcription</TabsTrigger>
                <TabsTrigger value="client-data">Client data</TabsTrigger>
                <TabsTrigger value="phone-call">Phone call</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      {conversation.analysis?.summary || 'Nu există rezumat disponibil.'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Call status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={conversation.status === 'completed' ? 'default' : 'secondary'}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {conversation.status === 'completed' ? 'Successful' : conversation.status}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Audio Player */}
                {conversation.recording_url && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        Audio Recording
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <audio controls className="flex-1">
                          <source src={conversation.recording_url} type="audio/mpeg" />
                          Browser-ul tău nu suportă elementul audio.
                        </audio>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="transcription" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transcript</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {conversation.transcript?.map((entry: any, index: number) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={entry.role === 'agent' ? 'default' : 'secondary'}>
                              {entry.role === 'agent' ? 'Agent' : 'User'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {entry.timestamp && formatDate(entry.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-700">{entry.content}</p>
                        </div>
                      )) || <p className="text-gray-500">Nu există transcript disponibil.</p>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="client-data" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Număr telefon</p>
                        <p className="font-medium">{conversation.customer_phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Locație</p>
                        <p className="font-medium">{conversation.customer_location || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Conversation ID</p>
                        <p className="font-medium text-xs">{conversationId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="phone-call" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Call Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Tip apel</p>
                        <p className="font-medium">Outbound</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Durata</p>
                        <p className="font-medium">{formatDuration(conversation.duration || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cost total</p>
                        <p className="font-medium">{conversation.cost_analysis?.total_cost || 0} credite</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status final</p>
                        <Badge variant={conversation.status === 'completed' ? 'default' : 'secondary'}>
                          {conversation.status === 'completed' ? 'Successful' : conversation.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};