
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useConversationById } from '@/hooks/useConversationById';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Play, Pause, Download, Calendar, Filter, X, Clock, Phone, User, Activity, Zap, TrendingUp, Headphones, Volume2, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ConversationAnalytics = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [selectedCall, setSelectedCall] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);

  const { callHistory, isLoading: callHistoryLoading } = useCallHistory();
  const { data: elevenLabsData, isLoading: conversationLoading, error: conversationError } = useConversationById(conversationId);

  // Auto-select conversation if ID provided in URL
  useEffect(() => {
    if (conversationId && elevenLabsData) {
      // Find the corresponding call in our history
      const correspondingCall = callHistory.find(call => call.elevenlabs_history_id === conversationId);
      if (correspondingCall) {
        setSelectedCall(correspondingCall);
      }
      console.log('Auto-selected conversation from ElevenLabs:', conversationId);
    }
  }, [conversationId, elevenLabsData, callHistory]);

  // Handle error cases
  useEffect(() => {
    if (conversationError) {
      console.error('ElevenLabs conversation error:', conversationError);
      toast({
        title: "Eroare",
        description: "Conversația nu a fost găsită sau nu aveți acces la ea.",
        variant: "destructive"
      });
      navigate('/account/conversation-analytics');
    }
  }, [conversationError, navigate]);

  const handleCallClick = (call) => {
    if (call.elevenlabs_history_id) {
      // Navigate to the specific conversation using ElevenLabs history ID
      navigate(`/account/conversation-analytics/${call.elevenlabs_history_id}`);
    } else {
      // Fallback: just select the call without navigation
      setSelectedCall(call);
    }
  };

  const convertElevenLabsToConversation = (call, elevenLabsData) => {
    let transcript = [];
    
    try {
      // Parse transcript from ElevenLabs data or fallback to our stored data
      if (elevenLabsData?.text) {
        // If ElevenLabs provides structured dialogue, use it
        const lines = elevenLabsData.text.split('\n').filter(line => line.trim());
        transcript = lines.map((line, index) => ({
          speaker: index % 2 === 0 ? 'Kalina' : 'Client',
          text: line,
          timestamp: `0:${(index * 10).toString().padStart(2, '0')}`,
          time: index * 10,
          sentiment: Math.random() > 0.5 ? 'positive' : 'neutral'
        }));
      } else {
        // Fallback to our stored dialog_json
        const parsedDialog = JSON.parse(call.dialog_json);
        const cleanConversations = parsedDialog?.clean_conversations;
        const dialog = cleanConversations?.dialog || [];
        
        if (Array.isArray(dialog)) {
          transcript = dialog.map((item, index) => ({
            speaker: item.speaker === 'user' ? 'Client' : 'Kalina',
            text: item.message || '',
            timestamp: `0:${(index * 10).toString().padStart(2, '0')}`,
            time: index * 10,
            sentiment: Math.random() > 0.5 ? 'positive' : 'neutral'
          }));
        }
      }
    } catch (error) {
      console.error('Error parsing dialog:', error);
    }

    return {
      ...call,
      transcript,
      duration: elevenLabsData?.date_unix ? 
        `${Math.floor((Date.now() / 1000 - elevenLabsData.date_unix) / 60)}m` : 
        '57s',
      cost: call.cost_usd || 0,
      sentiment: 'positive',
      satisfaction: Math.floor(Math.random() * 20) + 80,
      elevenLabsData // Include the raw ElevenLabs data
    };
  };

  const filteredCalls = callHistory.filter(call => {
    const matchesSearch = call.phone_number.includes(searchTerm) || 
                         call.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (call.summary && call.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' }),
      time: date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const selectedConversation = selectedCall ? convertElevenLabsToConversation(selectedCall, elevenLabsData) : null;

  const isLoading = callHistoryLoading || (conversationId && conversationLoading);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
            <p className="mt-2 text-gray-600">Se încarcă conversația...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {conversationId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/account/conversation-analytics')}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {conversationId ? 'Analiza Conversației' : 'Analiză Conversații'}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {conversationId && elevenLabsData ? 
                  `Conversație ElevenLabs ID: ${conversationId}` :
                  'Analizează conversațiile și performanța agenților'
                }
              </p>
            </div>
          </div>
          
          {!conversationId && (
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Caută conversații..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80 bg-white" 
                />
              </div>
              
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="w-32 bg-white">
                  <SelectValue placeholder="Toți Agenții" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toți Agenții</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredCalls.length}</div>
            <div className="text-sm text-gray-600">Total Apeluri</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(filteredCalls.filter(c => c.call_status === 'success').length / filteredCalls.length * 100 || 0)}%
            </div>
            <div className="text-sm text-gray-600">Rata de Succes</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">4.8</div>
            <div className="text-sm text-gray-600">Rating Mediu</div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-320px)] gap-6">
          {/* Left Panel - Call List */}
          <div className="w-1/2 bg-white rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Conversații</h3>
            </div>
            
            <div className="overflow-y-auto h-full">
              {filteredCalls.map((call, index) => {
                const dateInfo = formatDate(call.call_date);
                const isSelected = selectedCall?.id === call.id || 
                                 (conversationId && call.elevenlabs_history_id === conversationId);
                
                return (
                  <div 
                    key={call.id} 
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => handleCallClick(call)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{call.phone_number}</div>
                          <div className="text-sm text-gray-500">{dateInfo.date} • {dateInfo.time}</div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(call.call_status)}>
                        {call.call_status === 'success' ? 'Succes' : 'Eșuat'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                      {call.summary || 'Fără rezumat disponibil'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        57s
                      </span>
                      <span>${call.cost_usd?.toFixed(4) || '0.0000'}</span>
                    </div>
                  </div>
                );
              })}
              
              {filteredCalls.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Nu s-au găsit conversații</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Analytics */}
          <div className="w-1/2 bg-white rounded-lg overflow-hidden">
            {selectedCall ? (
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Analiza Conversației
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setSelectedCall(null);
                      if (conversationId) navigate('/account/conversation-analytics');
                    }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{selectedConversation.satisfaction}%</div>
                      <div className="text-xs text-gray-600">Satisfacție</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{selectedConversation.duration}</div>
                      <div className="text-xs text-gray-600">Durată</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{selectedConversation.sentiment}</div>
                      <div className="text-xs text-gray-600">Sentiment</div>
                    </div>
                  </div>

                  {/* ElevenLabs Data Display */}
                  {elevenLabsData && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-900 mb-2">Date ElevenLabs</div>
                      <div className="text-xs text-blue-700 space-y-1">
                        {elevenLabsData.history_item_id && <div>ID: {elevenLabsData.history_item_id}</div>}
                        {elevenLabsData.date_unix && <div>Data: {new Date(elevenLabsData.date_unix * 1000).toLocaleString()}</div>}
                        {elevenLabsData.character_count_change_from && (
                          <div>Caractere: {elevenLabsData.character_count_change_from} → {elevenLabsData.character_count_change_to}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Audio Waveform */}
                <div className="p-6 border-b border-gray-100">
                  <div className="bg-gray-100 rounded-lg p-6 mb-4">
                    <div className="flex items-center justify-center h-16">
                      <div className="flex items-center space-x-1 h-full">
                        {Array.from({ length: 40 }, (_, i) => (
                          <div 
                            key={i} 
                            className="bg-black w-1 rounded-full transition-all duration-300 hover:bg-gray-700"
                            style={{ height: `${Math.random() * 60 + 20}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button 
                        size="sm" 
                        className="rounded-full w-10 h-10 p-0"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Headphones className="w-4 h-4" />
                        <span>Calitate HD</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="transcript" className="flex-1 flex flex-col">
                  <TabsList className="mx-6 mt-4 grid w-auto grid-cols-3">
                    <TabsTrigger value="transcript">
                      Transcriere
                    </TabsTrigger>
                    <TabsTrigger value="insights">
                      Insights AI
                    </TabsTrigger>
                    <TabsTrigger value="metrics">
                      Metrici
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="transcript" className="flex-1 px-6 pb-6 overflow-y-auto">
                    <div className="space-y-4 mt-4">
                      {selectedConversation.transcript.map((message, index) => (
                        <div key={index} className="flex space-x-3 group">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                            message.speaker === 'Kalina' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {message.speaker === 'Kalina' ? 'K' : 'C'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{message.speaker}</span>
                              <span className="text-xs text-gray-500">{message.timestamp}</span>
                              <div className={`w-2 h-2 rounded-full ${
                                message.sentiment === 'positive' ? 'bg-green-400' : 'bg-yellow-400'
                              }`} />
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{message.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="insights" className="flex-1 px-6 pb-6 overflow-y-auto">
                    <div className="space-y-4 mt-4">
                      <Card className="p-4">
                        <div className="flex items-center mb-3">
                          <Zap className="w-5 h-5 text-black mr-2" />
                          <h4 className="font-semibold text-gray-900">Insights Cheie</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li>• Angajament ridicat pe parcursul conversației</li>
                          <li>• Clientul a arătat interesse pentru funcții premium</li>
                          <li>• Sentiment pozitiv menținut</li>
                          <li>• Rezolvare eficientă a problemei</li>
                        </ul>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="flex items-center mb-3">
                          <TrendingUp className="w-5 h-5 text-black mr-2" />
                          <h4 className="font-semibold text-gray-900">Scorul de Performanță</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Timp de Răspuns</span>
                            <div className="flex items-center">
                              <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                                <div className="w-4/5 h-full bg-black rounded-full"></div>
                              </div>
                              <span className="text-sm text-black font-semibold">95%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Claritate</span>
                            <div className="flex items-center">
                              <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                                <div className="w-full h-full bg-black rounded-full"></div>
                              </div>
                              <span className="text-sm text-black font-semibold">98%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Empatie</span>
                            <div className="flex items-center">
                              <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                                <div className="w-4/5 h-full bg-black rounded-full"></div>
                              </div>
                              <span className="text-sm text-black font-semibold">92%</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="metrics" className="flex-1 px-6 pb-6">
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">${selectedCall.cost_usd?.toFixed(4) || '0.0000'}</div>
                        <div className="text-xs text-gray-600">Cost Total</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">$0.10</div>
                        <div className="text-xs text-gray-600">Pe Minut</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">15</div>
                        <div className="text-xs text-gray-600">Schimburi</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">2.3s</div>
                        <div className="text-xs text-gray-600">Răspuns Mediu</div>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Selectează o Conversație
                  </h3>
                  <p className="text-gray-600">
                    Alege un apel din listă pentru a vedea analiza detaliată
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ConversationAnalytics;
