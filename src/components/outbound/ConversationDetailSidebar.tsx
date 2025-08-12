import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Phone, MessageSquare, Volume2, Download, CheckCircle, Play, Languages, Search } from 'lucide-react';
import { useConversationById } from '@/hooks/useConversationById';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AnalyticsSidebar from '@/components/analytics/AnalyticsSidebar';
import { useConversationAnalyticsCache } from '@/hooks/useConversationAnalyticsCache';
interface ConversationDetailSidebarProps {
  conversationId: string;
}
export const ConversationDetailSidebar: React.FC<ConversationDetailSidebarProps> = ({
  conversationId
}) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [translatedSummary, setTranslatedSummary] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAnalyzingCallback, setIsAnalyzingCallback] = useState(false);
  const {
    toast
  } = useToast();
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
      const {
        data,
        error
      } = await supabase.functions.invoke('get-conversation-audio', {
        body: {
          conversationId
        }
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
        const audioBlob = new Blob([bytes], {
          type: 'audio/mpeg'
        });
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
      const {
        data,
        error
      } = await supabase.functions.invoke('translate-text', {
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

  // Function to analyze conversation for callback intent
  const analyzeForCallback = async () => {
    if (!conversationId || !conversationData?.transcript) return;
    
    try {
      setIsAnalyzingCallback(true);
      
      // Construct transcript text
      const transcriptText = conversationData.transcript
        .map((entry: any) => `${entry.role}: ${entry.message}`)
        .join('\n');

      // Call detect-callback-intent function
      const { data, error } = await supabase.functions.invoke('detect-callback-intent', {
        body: {
          text: transcriptText,
          conversationId: conversationId,
          phoneNumber: conversationData.phoneNumber,
          contactName: 'Client',
          agentId: conversation.agent_id,
          userId: conversation.user_id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.callbackDetected) {
        toast({
          title: "Callback detectat!",
          description: "S-a creat automat o programare pentru acest client.",
        });
      } else {
        toast({
          title: "Niciun callback detectat",
          description: "Nu s-a găsit nicio solicitare de reprogramare în transcript.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error analyzing callback:', error);
      toast({
        title: "Eroare la analiză",
        description: "Nu s-a putut analiza conversația pentru callback.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzingCallback(false);
    }
  };

  // Function to download audio
  const downloadAudio = async () => {
    if (!conversationId) return;
    try {
      setIsLoadingAudio(true);
      const {
        data,
        error
      } = await supabase.functions.invoke('get-conversation-audio', {
        body: {
          conversationId
        }
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
        const audioBlob = new Blob([bytes], {
          type: 'audio/mpeg'
        });
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

  const { cachedConversations, refreshConversation } = useConversationAnalyticsCache();
  React.useEffect(() => {
    if (conversationId) {
      // Load and cache analytics for this conversation
      refreshConversation.mutateAsync(conversationId).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);
  const cached = cachedConversations.find(c => c.conversation_id === conversationId);
  const analyticsData = cached?.analysis || null;

  console.log('ConversationDetailSidebar - isLoading:', isLoading, 'error:', error, 'conversation:', conversation);
  if (isLoading) {
    return <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        <span className="text-lg">Se încarcă conversația...</span>
      </div>;
  }
  if (error) {
    return <div className="text-center py-12">
        <div className="text-red-600 text-lg">Eroare la încărcarea conversației</div>
      </div>;
  }
  if (!conversation) {
    return <div className="text-center py-12">
        <div className="text-gray-600 text-lg">Conversația nu a fost găsită</div>
      </div>;
  }
  return <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Detalii Conversație
        </h2>
        <p className="text-sm text-gray-500 mt-1">ID: {conversationId}</p>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full flex-1 flex flex-col min-h-0">
        <div className="border-b bg-white flex-shrink-0">
          <TabsList className="h-auto bg-transparent p-0 w-full justify-start gap-8 px-6">
            <TabsTrigger value="overview" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent rounded-none px-0 py-3 text-sm font-medium data-[state=active]:shadow-none">
              Overview & Detalii
            </TabsTrigger>
            <TabsTrigger value="transcription" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent rounded-none px-0 py-3 text-sm font-medium data-[state=active]:shadow-none">
              Transcription
            </TabsTrigger>
            {/* New Analytics tab */}
            <TabsTrigger value="analytics" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent rounded-none px-0 py-3 text-sm font-medium data-[state=active]:shadow-none">
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Existing contents */}
        <TabsContent value="overview" className="space-y-4 mt-4 p-6">
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
                {translatedSummary && translatedSummary !== conversationData?.summary && <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Text original:</p>
                    <p className="text-gray-600 text-xs italic">
                      {conversationData?.summary}
                    </p>
                  </div>}
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
                  {conversationData?.status === 'done' ? 'Finalizat' : conversationData?.status === 'failed' ? 'Eșuat' : conversationData?.status}
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

          {/* Callback Analysis for Initiated Conversations */}
          {conversationData?.status === 'initiated' && conversationData?.transcript?.length > 0 && (
            <Card className="shadow-sm border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-orange-800">
                  <Search className="w-4 h-4" />
                  Detectare Callback Automat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-xs text-orange-700">
                    Această conversație are statusul "⚡ Initiated". Analizează transcriptul pentru a detecta 
                    dacă clientul vrea să revină pentru o programare.
                  </p>
                  
                  <Button 
                    onClick={analyzeForCallback} 
                    disabled={isAnalyzingCallback}
                    size="sm" 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isAnalyzingCallback ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Analizează...
                      </>
                    ) : (
                      <>
                        <Search className="w-3 h-3 mr-2" />
                        Detectează Callback
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audio Player */}
          {conversation.has_audio && <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Volume2 className="w-4 h-4" />
                  Înregistrare Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoadingAudio && <div className="flex items-center justify-center py-2">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-xs text-gray-600">Se încarcă...</span>
                    </div>}
                  
                  {audioUrl && <audio controls className="w-full" style={{
                height: '32px'
              }}>
                      <source src={audioUrl} type="audio/mpeg" />
                      Browser-ul nu suportă redarea audio.
                    </audio>}
                  
                  <div className="flex gap-2">
                    {!audioUrl && <Button onClick={() => getAudioUrl(conversationId)} disabled={isLoadingAudio} size="sm" variant="outline" className="flex-1 text-xs">
                        <Play className="w-3 h-3 mr-1" />
                        Încarcă Audio
                      </Button>}
                    <Button onClick={downloadAudio} disabled={isLoadingAudio} size="sm" variant="outline" className="flex-1 text-xs">
                      <Download className="w-3 h-3 mr-1" />
                      Descarcă
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>}
        </TabsContent>

        <TabsContent value="transcription" className="flex-1 flex flex-col min-h-0">
          <div className="p-6 pb-0 flex-shrink-0">
            <h3 className="text-lg font-semibold mb-4">Transcript Complet</h3>
          </div>
          
          {/* Container dedicat pentru transcript cu scroll - FIXED HEIGHT */}
          <div className="flex-1 mx-6 mb-6 rounded-lg border min-h-0 bg-white">
            <div className="h-full overflow-y-auto p-4 space-y-4">
              {conversationData?.transcript?.length > 0 ? conversationData.transcript.map((turn: any, index: number) => <div key={index} className="flex items-start space-x-3">
                    {/* Avatar pentru agent (stânga) */}
                    {turn.role === 'agent' && <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-black text-sm font-medium">A</span>
                      </div>}
                    
                    {/* Message bubble */}
                    <div className={`flex-1 ${turn.role === 'user' ? 'flex justify-end' : ''}`}>
                      <div className={`max-w-[80%] ${turn.role === 'agent' ? 'bg-white text-black rounded-2xl rounded-bl-md border border-gray-300' : 'bg-black text-white rounded-2xl rounded-br-md ml-auto'} px-4 py-3 relative`}>
                        <p className="text-sm leading-relaxed">{turn.message}</p>
                        
                        {/* Timestamp */}
                        <div className={`text-xs mt-1 ${turn.role === 'agent' ? 'text-gray-500 text-right' : 'text-gray-300 text-left'}`}>
                          {turn.time_in_call_secs !== undefined && formatDuration(turn.time_in_call_secs)}
                        </div>
                        
                        {/* LLM și RAG info pentru mesajele agentului */}
                        {turn.role === 'agent' && (turn.llm_usage || turn.rag_retrieval_info) && <div className="flex gap-1 mt-2">
                            {turn.llm_usage && <span className="text-xs bg-gray-100 text-black px-2 py-1 rounded border">
                                LLM {turn.llm_usage.model_usage ? Object.keys(turn.llm_usage.model_usage)[0]?.split('-')[0] : ''}
                              </span>}
                            {turn.rag_retrieval_info && <span className="text-xs bg-gray-200 text-black px-2 py-1 rounded border">
                                RAG {Math.round(turn.rag_retrieval_info.rag_latency_secs * 1000)}ms
                              </span>}
                          </div>}
                      </div>
                    </div>
                    
                    {/* Avatar pentru user (dreapta) */}
                    {turn.role === 'user' && <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">U</span>
                      </div>}
                  </div>) : <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nu există transcript disponibil pentru această conversație.</p>
                </div>}
            </div>
          </div>
        </TabsContent>
        {/* Analytics content */}
        <TabsContent value="analytics" className="space-y-4 mt-4 p-6">
          {analyticsData ? (
            <AnalyticsSidebar conversation={analyticsData} />
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-gray-600">Se încarcă analytics din ElevenLabs...</span>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>;
};