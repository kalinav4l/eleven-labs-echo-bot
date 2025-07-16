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
      <DialogContent className="max-w-7xl max-h-[90vh] w-[95vw] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <MessageSquare className="w-6 h-6 text-primary" />
            Detalii Conversație
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] pr-2">

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
          <div className="space-y-8">
            {/* Header Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Data & Ora</p>
                    <p className="text-lg font-bold text-blue-900">{formatDate(conversation.start_time)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Durată</p>
                    <p className="text-lg font-bold text-green-900">{formatDuration(conversation.duration || 0)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Credite</p>
                    <p className="text-lg font-bold text-purple-900">{conversation.cost_analysis?.total_cost || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600 font-medium">Status</p>
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-3 py-1">
                      {conversation.status === 'completed' ? 'Successful' : conversation.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>

            {/* Interactive Tabs Section */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-14 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="overview" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <MessageSquare className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="transcription" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <Volume2 className="w-4 h-4" />
                  Transcription
                </TabsTrigger>
                <TabsTrigger value="client-data" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <Phone className="w-4 h-4" />
                  Client data
                </TabsTrigger>
                <TabsTrigger value="phone-call" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <Calendar className="w-4 h-4" />
                  Phone call
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Summary Card */}
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-gray-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        Rezumat Conversație
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-700 leading-relaxed">
                          {conversation.analysis?.summary || 'Nu există rezumat disponibil pentru această conversație.'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Call Analysis Card */}
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Status & Rezultat
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="font-medium">Status apel:</span>
                        <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1">
                          {conversation.status === 'completed' ? 'Finalizat cu succes' : conversation.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="font-medium">Cost total:</span>
                        <span className="text-lg font-bold text-blue-600">{conversation.cost_analysis?.total_cost || 0} credite</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Audio Player */}
                {conversation.recording_url && (
                  <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Volume2 className="w-5 h-5 text-purple-600" />
                        Înregistrare Audio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white p-6 rounded-lg border border-purple-200">
                        <div className="flex flex-col space-y-4">
                          <audio controls className="w-full" style={{ height: '40px' }}>
                            <source src={conversation.recording_url} type="audio/mpeg" />
                            Browser-ul tău nu suportă elementul audio.
                          </audio>
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" className="hover:bg-purple-50">
                              <Download className="w-4 h-4 mr-2" />
                              Descarcă Audio
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="transcription" className="space-y-6 mt-6">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                      Transcript Complet al Conversației
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white rounded-lg border border-emerald-200 p-2">
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {conversation.transcript && conversation.transcript.length > 0 ? (
                          conversation.transcript.map((entry: any, index: number) => {
                            // Handle different possible data structures from ElevenLabs
                            const role = entry.role || entry.speaker || entry.type || 'unknown';
                            const content = entry.content || entry.text || entry.message || '';
                            const timestamp = entry.timestamp || entry.time || entry.created_at;
                            
                            return (
                              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                                role === 'agent' || role === 'assistant' || role === 'ai'
                                  ? 'border-blue-500 bg-blue-50 ml-0 mr-8' 
                                  : 'border-green-500 bg-green-50 ml-8 mr-0'
                              }`}>
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge className={
                                    role === 'agent' || role === 'assistant' || role === 'ai'
                                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                                      : 'bg-green-500 hover:bg-green-600 text-white'
                                  }>
                                    {role === 'agent' || role === 'assistant' || role === 'ai' ? '🤖 Agent AI' : '👤 Client'}
                                  </Badge>
                                  {timestamp && (
                                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                      {typeof timestamp === 'string' ? formatDate(timestamp) : new Date(timestamp).toLocaleTimeString()}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-800 leading-relaxed font-medium">
                                  {content || 'Mesaj fără conținut'}
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8">
                            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">Nu există transcript disponibil pentru această conversație.</p>
                            {/* Debug info */}
                            <div className="mt-4 text-xs text-gray-400">
                              <p>Structura datelor: {JSON.stringify(conversation.transcript || 'No transcript', null, 2)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="client-data" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-amber-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Phone className="w-5 h-5 text-orange-600" />
                        Informații Client
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Număr telefon:</span>
                          <span className="text-lg font-bold text-orange-700">{conversation.customer_phone || 'Nedisponibil'}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Locație:</span>
                          <span className="font-medium text-gray-800">{conversation.customer_location || 'Nedisponibilă'}</span>
                        </div>
                        <div className="mt-4 p-3 bg-gray-50 rounded border">
                          <span className="text-xs font-medium text-gray-600 block mb-1">Conversation ID:</span>
                          <code className="text-xs text-gray-800 break-all">{conversationId}</code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-purple-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        Detalii Suplimentare
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white p-4 rounded-lg border border-indigo-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Tip interacțiune:</span>
                          <Badge className="bg-indigo-500 text-white">Apel vocal</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Canal:</span>
                          <span className="font-medium">Outbound Call</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Agent ID:</span>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{conversation.agent_id || 'N/A'}</code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="phone-call" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Call Details */}
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-cyan-50 to-blue-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Phone className="w-5 h-5 text-cyan-600" />
                        Detalii Apel
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-cyan-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Tip apel:</span>
                          <Badge className="bg-cyan-500 text-white">Outbound</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Durata:</span>
                          <span className="text-lg font-bold text-cyan-700">{formatDuration(conversation.duration || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Status:</span>
                          <Badge className="bg-green-500 text-white">
                            {conversation.status === 'completed' ? 'Finalizat' : conversation.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cost Analysis */}
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="w-5 h-5 text-green-600" />
                        Analiză Costuri
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white p-4 rounded-lg border border-green-200 space-y-3">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-700 mb-1">
                            {conversation.cost_analysis?.total_cost || 0}
                          </div>
                          <div className="text-sm text-gray-600">Credite Consumate</div>
                        </div>
                        <div className="pt-3 border-t border-green-200">
                          <div className="text-xs text-gray-500 text-center">
                            Cost pe minut: ~{Math.round((conversation.cost_analysis?.total_cost || 0) / ((conversation.duration || 1) / 60))} credite
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Technical Info */}
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-violet-50 to-purple-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="w-5 h-5 text-violet-600" />
                        Info Tehnică
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white p-4 rounded-lg border border-violet-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">Start:</span>
                          <span className="text-xs text-gray-800">{formatDate(conversation.start_time)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">Provider:</span>
                          <span className="text-xs">ElevenLabs</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">Encoding:</span>
                          <span className="text-xs">MP3 Audio</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};