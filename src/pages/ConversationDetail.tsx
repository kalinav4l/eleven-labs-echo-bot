import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Phone, MessageSquare, Volume2, Download, CheckCircle, ArrowLeft } from 'lucide-react';
import { useConversationById } from '@/hooks/useConversationById';

const ConversationDetail = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  
  const {
    data: conversation,
    isLoading,
    error
  } = useConversationById(conversationId || undefined);

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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/account/conversation-analytics')}
            className="elevenlabs-button-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la Conversații
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Detalii Conversație
          </h1>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span className="text-lg">Se încarcă conversația...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg">Eroare la încărcarea conversației</div>
          </div>
        )}

        {conversation && (
          <div className="space-y-6">
            {/* Tabs Section */}
            <Tabs defaultValue="transcription" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-12 bg-gray-50 p-1 rounded-xl no-border">
                <TabsTrigger value="overview" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm elevenlabs-button-secondary">
                  <MessageSquare className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="transcription" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm elevenlabs-button-secondary">
                  <Volume2 className="w-4 h-4" />
                  Transcription
                </TabsTrigger>
                <TabsTrigger value="client-data" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm elevenlabs-button-secondary">
                  <Phone className="w-4 h-4" />
                  Client data
                </TabsTrigger>
                <TabsTrigger value="phone-call" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm elevenlabs-button-secondary">
                  <Phone className="w-4 h-4" />
                  Phone call
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Summary Card */}
                  <Card className="elevenlabs-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                        <MessageSquare className="w-5 h-5" />
                        Rezumat Conversație
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-gray-700 leading-relaxed">
                          {conversation.analysis?.summary || 'Nu există rezumat disponibil pentru această conversație.'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Call Analysis Card */}
                  <Card className="elevenlabs-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                        <CheckCircle className="w-5 h-5" />
                        Status & Rezultat
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="font-medium">Status apel:</span>
                        <Badge className="status-badge bg-gray-900 text-white px-3 py-1">
                          {conversation.status === 'completed' ? 'Finalizat cu succes' : conversation.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="font-medium">Cost total:</span>
                        <span className="text-lg font-bold text-gray-900">{conversation.cost_analysis?.total_cost || 0} credite</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Audio Player */}
                {conversation.recording_url && (
                  <Card className="elevenlabs-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                        <Volume2 className="w-5 h-5" />
                        Înregistrare Audio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white p-6 rounded-lg border">
                        <div className="flex flex-col space-y-4">
                          <audio controls className="w-full" style={{ height: '40px' }}>
                            <source src={conversation.recording_url} type="audio/mpeg" />
                            Browser-ul tău nu suportă elementul audio.
                          </audio>
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" className="elevenlabs-button-secondary">
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
                <Card className="elevenlabs-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                      <MessageSquare className="w-5 h-5" />
                      Transcript Complet al Conversației
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white rounded-lg border p-4">
                      <div className="max-h-[600px] overflow-y-auto">
                        {conversation.transcript && conversation.transcript.length > 0 ? (
                          <div className="space-y-4">
                            {conversation.transcript.map((entry: any, index: number) => {
                              const role = entry.role || entry.speaker || entry.type || 'unknown';
                              const content = entry.content || entry.text || entry.message || '';
                              const timestamp = entry.timestamp || entry.time || entry.created_at;
                              const timeDisplay = timestamp ? 
                                (typeof timestamp === 'string' ? new Date(timestamp).toLocaleTimeString() : new Date(timestamp).toLocaleTimeString())
                                : `00:${String(index * 5).padStart(2, '0')}`;
                              const speakerName = role === 'agent' || role === 'assistant' || role === 'ai' ? 'Agent AI' : 'User';
                              
                              return (
                                <div key={index} className="py-3 border-b border-gray-100 last:border-b-0">
                                  <div className="flex gap-4">
                                    <div className="text-sm text-gray-500 font-mono w-16 flex-shrink-0 mt-1">
                                      {timeDisplay}
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900 mb-2">
                                        {speakerName}
                                      </div>
                                      <div className="text-sm text-gray-700 leading-relaxed">
                                        {content || 'Mesaj fără conținut'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Nu există transcript disponibil pentru această conversație.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="client-data" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="elevenlabs-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                        <Phone className="w-5 h-5" />
                        Informații Client
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Număr telefon:</span>
                          <span className="text-lg font-bold text-red-600">{conversation.customer_phone || 'Nedisponibil'}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Locație:</span>
                          <span className="font-medium text-gray-800">{conversation.customer_location || 'Nedisponibilă'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="elevenlabs-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                        <MessageSquare className="w-5 h-5" />
                        Detalii Suplimentare
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white p-4 rounded-lg border space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Tip interacțiune:</span>
                          <Badge className="status-badge bg-gray-900 text-white">Apel vocal</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Canal:</span>
                          <span className="font-medium">Outbound Call</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="phone-call" className="space-y-6 mt-6">
                <Card className="elevenlabs-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                      <Phone className="w-5 h-5" />
                      Detalii Apel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Tip apel:</span>
                        <Badge className="status-badge bg-gray-900 text-white">Outbound</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Durata:</span>
                        <span className="text-lg font-bold text-gray-900">{formatDuration(conversation.duration || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Status:</span>
                        <Badge className="status-badge bg-gray-900 text-white">
                          {conversation.status === 'completed' ? 'Finalizat' : conversation.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ConversationDetail;