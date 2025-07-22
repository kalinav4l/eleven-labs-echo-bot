import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Phone, MessageSquare, Volume2, Download, CheckCircle, Play, Languages } from 'lucide-react';
import { useConversationById } from '@/hooks/useConversationById';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConversationDetailSidebarProps {
  conversationId: string;
}

export const ConversationDetailSidebar: React.FC<ConversationDetailSidebarProps> = ({ conversationId }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [translatedSummary, setTranslatedSummary] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();
  
  const {
    data: conversation,
    isLoading,
    error
  } = useConversationById(conversationId);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (unixSeconds: number) => {
    return new Date(unixSeconds * 1000).toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to get audio URL from ElevenLabs
  const getAudioUrl = async (conversationId: string) => {
    if (!conversationId) {
      console.error('No conversation ID provided to getAudioUrl');
      return null;
    }
    
    try {
      setIsLoadingAudio(true);
      
      const { data, error } = await supabase.functions.invoke('get-conversation-audio', {
        body: { conversationId },
      });

      if (error) {
        console.error('Error fetching audio:', error);
        toast({
          title: "Eroare la încărcare",
          description: "Nu s-a putut încărca audio-ul",
          variant: "destructive"
        });
        return null;
      }

      if (data?.audioData) {
        const binaryString = atob(data.audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        return audioUrl;
      }

      return null;
    } catch (error) {
      console.error('Error fetching audio:', error);
      toast({
        title: "Eroare la încărcare",
        description: "Nu s-a putut încărca audio-ul",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // Function to auto-translate summary using GPT
  const translateSummary = async (text: string) => {
    if (!text) return text;

    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: {
          text: text,
          targetLanguage: 'ro',
          sourceLanguage: 'auto'
        }
      });

      if (error) {
        console.error('Translation error:', error);
        return text;
      }

      return data?.translatedText || text;
    } catch (error) {
      console.error('Error translating summary:', error);
      return text;
    }
  };

  // Function to download audio
  const downloadAudio = async () => {
    if (!conversationId) return;
    
    try {
      setIsLoadingAudio(true);
      
      const { data, error } = await supabase.functions.invoke('get-conversation-audio', {
        body: { conversationId },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.audioData) {
        const binaryString = atob(data.audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation-${conversationId}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Audio descărcat",
          description: "Fișierul audio a fost descărcat cu succes"
        });
      }
    } catch (error) {
      console.error('Error downloading audio:', error);
      toast({
        title: "Eroare la descărcare",
        description: "Nu s-a putut descărca audio-ul",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // Extract data from conversation object
  const getConversationData = () => {
    if (!conversation) return null;
    
    return {
      startTime: conversation.metadata?.start_time_unix_secs ? formatDate(conversation.metadata.start_time_unix_secs) : 'Nu este disponibil',
      duration: conversation.metadata?.call_duration_secs ? formatDuration(conversation.metadata.call_duration_secs) : '0:00',
      cost: conversation.metadata?.cost || 0,
      status: conversation.status || 'unknown',
      phoneNumber: conversation.metadata?.phone_call?.external_number || 'Nedisponibil',
      agentNumber: conversation.metadata?.phone_call?.agent_number || 'Nedisponibil',
      language: conversation.metadata?.main_language || 'Nedisponibil',
      terminationReason: conversation.metadata?.termination_reason || 'Nedisponibil',
      summary: conversation.analysis?.transcript_summary || 'Nu există rezumat disponibil pentru această conversație.',
      callSuccessful: conversation.analysis?.call_successful || 'unknown',
      transcript: conversation.transcript || []
    };
  };

  const conversationData = getConversationData();

  // Auto-translate summary when conversation loads
  React.useEffect(() => {
    const autoTranslate = async () => {
      if (conversationData?.summary && !translatedSummary) {
        setIsTranslating(true);
        const translated = await translateSummary(conversationData.summary);
        setTranslatedSummary(translated);
        setIsTranslating(false);
      }
    };
    
    autoTranslate();
  }, [conversationData?.summary]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        <span className="text-lg">Se încarcă conversația...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">Eroare la încărcarea conversației</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-lg">Conversația nu a fost găsită</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Detalii Conversație
        </h2>
        <p className="text-sm text-gray-500 mt-1">ID: {conversationId}</p>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-10 bg-gray-50 p-1 rounded-lg">
          <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-white">
            Overview & Detalii
          </TabsTrigger>
          <TabsTrigger value="transcription" className="text-xs data-[state=active]:bg-white">
            Transcription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Rezumat Conversație */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4" />
                Rezumat (tradus automat)
                {isTranslating && <Loader2 className="w-3 h-3 animate-spin ml-2" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p className="text-gray-700 leading-relaxed">
                  {translatedSummary || conversationData?.summary}
                </p>
                {translatedSummary && translatedSummary !== conversationData?.summary && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Text original:</p>
                    <p className="text-gray-600 text-xs italic">
                      {conversationData?.summary}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status & Rezultat */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4" />
                Status & Rezultat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                <span className="font-medium">Status:</span>
                <Badge className="bg-gray-900 text-white px-2 py-0.5 text-xs">
                  {conversationData?.status === 'done' ? 'Finalizat' : 
                   conversationData?.status === 'failed' ? 'Eșuat' : 
                   conversationData?.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                <span className="font-medium">Cost:</span>
                <span className="font-bold">{conversationData?.cost} credite</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                <span className="font-medium">Durată:</span>
                <span className="font-bold">{conversationData?.duration}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                <span className="font-medium">Data:</span>
                <span className="text-xs">{conversationData?.startTime}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                <span className="font-medium">Succes:</span>
                <Badge className={`${conversationData?.callSuccessful === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white text-xs`}>
                  {conversationData?.callSuccessful === 'success' ? 'Succes' : 'Eșuat'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Informații Client & Apel */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4" />
                Informații Client & Apel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">Nr. telefon:</span>
                  <span className="font-bold text-red-600">{conversationData?.phoneNumber}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">Nr. agent:</span>
                  <span>{conversationData?.agentNumber}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">Limbă:</span>
                  <span>{conversationData?.language}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">Tip apel:</span>
                  <Badge className="bg-gray-900 text-white text-xs">
                    {conversation.metadata?.phone_call?.direction === 'outbound' ? 'Outbound' : 'Inbound'}
                  </Badge>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">Motiv încheiere:</span>
                  <span>{conversationData?.terminationReason}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audio Player */}
          {conversation.has_audio && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Volume2 className="w-4 h-4" />
                  Înregistrare Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoadingAudio && (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-xs text-gray-600">Se încarcă...</span>
                    </div>
                  )}
                  
                  {audioUrl && (
                    <audio controls className="w-full" style={{ height: '32px' }}>
                      <source src={audioUrl} type="audio/mpeg" />
                      Browser-ul nu suportă redarea audio.
                    </audio>
                  )}
                  
                  <div className="flex gap-2">
                    {!audioUrl && (
                      <Button
                        onClick={() => getAudioUrl(conversationId)}
                        disabled={isLoadingAudio}
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Încarcă Audio
                      </Button>
                    )}
                    <Button
                      onClick={downloadAudio}
                      disabled={isLoadingAudio}
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Descarcă
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transcription" className="space-y-4 mt-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4" />
                Transcript Complet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {conversationData?.transcript?.length > 0 ? (
                  conversationData.transcript.map((turn: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        turn.role === 'agent'
                          ? 'bg-blue-50 border-l-4 border-blue-400'
                          : 'bg-gray-50 border-l-4 border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs">
                          {turn.role === 'agent' ? '🤖 Agent' : '👤 Utilizator'}
                        </span>
                        {turn.time_in_call_secs && (
                          <span className="text-xs text-gray-500">
                            {formatDuration(turn.time_in_call_secs)}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700">{turn.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Nu există transcript disponibil
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};