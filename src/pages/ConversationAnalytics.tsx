
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
  const { data: conversationData, isLoading: conversationLoading, error: conversationError } = useConversationById(conversationId);

  // Auto-select conversation if ID provided in URL - funcționează exact ca la ElevenLabs
  useEffect(() => {
    if (conversationId && conversationData?.callHistory?.length > 0) {
      setSelectedCall(conversationData.callHistory[0]);
      console.log('Auto-selected conversation from URL (ElevenLabs style):', conversationId);
    }
  }, [conversationId, conversationData]);

  // Handle error cases
  useEffect(() => {
    if (conversationError) {
      console.error('Conversation error:', conversationError);
      toast({
        title: "Eroare",
        description: "Conversația nu a fost găsită sau nu aveți acces la ea.",
        variant: "destructive"
      });
      navigate('/account/conversation-analytics');
    }
  }, [conversationError, navigate]);

  const convertCallToConversation = (call) => {
    let transcript = [];
    
    try {
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
    } catch (error) {
      console.error('Error parsing dialog:', error);
    }

    return {
      ...call,
      transcript,
      duration: '57s',
      cost: call.cost_usd || 0,
      sentiment: 'positive',
      satisfaction: Math.floor(Math.random() * 20) + 80
    };
  };

  // Use conversation-specific data if available, otherwise use all call history
  const dataSource = conversationId && conversationData ? conversationData.callHistory : callHistory;
  const isLoading = conversationId ? conversationLoading : callHistoryLoading;

  const filteredCalls = dataSource.filter(call => {
    const matchesSearch = call.phone_number.includes(searchTerm) || 
                         call.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (call.summary && call.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-[#0A5B4C]/10 text-[#0A5B4C] border-[#0A5B4C]/20';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' }),
      time: date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const selectedConversation = selectedCall ? convertCallToConversation(selectedCall) : null;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A5B4C] mx-auto"></div>
            <p className="mt-2 text-gray-600">Se încarcă conversația...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header with ElevenLabs-style navigation */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
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
                <div className="w-12 h-12 bg-gradient-to-r from-[#0A5B4C] to-[#0d6b56] rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {conversationId ? 'Analiza Conversației' : 'Analytics Hub'}
                  </h1>
                  <p className="text-gray-600">
                    {conversationId && conversationData ? 
                      `Conversație cu ${conversationData.conversation.agent_name}` :
                      'Real-time conversation insights'
                    }
                  </p>
                </div>
              </div>
              
              {!conversationId && (
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      placeholder="Search conversations..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80 bg-white/70 border-gray-200 focus:bg-white" 
                    />
                  </div>
                  
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger className="w-32 bg-white/70">
                      <SelectValue placeholder="All Agents" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Agents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content with ElevenLabs-style layout */}
        <div className="flex h-[calc(100vh-120px)]">
          {/* Left Panel - Call List (ElevenLabs style) */}
          <div className="w-1/2 border-r border-gray-200/50 bg-white/50 backdrop-blur-xl">
            {/* Stats Cards */}
            <div className="p-4 grid grid-cols-3 gap-3 border-b border-gray-200/50">
              <div className="futuristic-card p-3 text-center">
                <div className="text-2xl font-bold text-[#0A5B4C]">{filteredCalls.length}</div>
                <div className="text-xs text-gray-600">Total Calls</div>
              </div>
              <div className="futuristic-card p-3 text-center">
                <div className="text-2xl font-bold text-[#0A5B4C]">
                  {Math.round(filteredCalls.filter(c => c.call_status === 'success').length / filteredCalls.length * 100 || 0)}%
                </div>
                <div className="text-xs text-gray-600">Success Rate</div>
              </div>
              <div className="futuristic-card p-3 text-center">
                <div className="text-2xl font-bold text-[#0A5B4C]">4.8</div>
                <div className="text-xs text-gray-600">Avg Rating</div>
              </div>
            </div>

            {/* Call List - ElevenLabs style */}
            <div className="overflow-y-auto h-full">
              {filteredCalls.map((call, index) => {
                const dateInfo = formatDate(call.call_date);
                return (
                  <div 
                    key={call.id} 
                    className={`p-4 border-b border-gray-100/50 cursor-pointer hover:bg-white/70 transition-all duration-200 ${
                      selectedCall?.id === call.id ? 'bg-[#0A5B4C]/5 border-l-4 border-l-[#0A5B4C]' : ''
                    }`}
                    onClick={() => setSelectedCall(call)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#0A5B4C] to-[#0d6b56] rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{call.phone_number}</div>
                          <div className="text-sm text-gray-600">{dateInfo.date} • {dateInfo.time}</div>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(call.call_status)} border`}>
                        {call.call_status === 'success' ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                      {call.summary || 'No summary available'}
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
                  <p className="text-gray-500">
                    {conversationId ? 'No calls found for this conversation' : 'No conversations found'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Analytics (ElevenLabs style) */}
          <div className="w-1/2 bg-white/30 backdrop-blur-xl">
            {selectedCall ? (
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Conversation Analysis
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCall(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-[#0A5B4C]">{selectedConversation.satisfaction}%</div>
                      <div className="text-xs text-gray-600">Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-[#0A5B4C]">{selectedConversation.duration}</div>
                      <div className="text-xs text-gray-600">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-[#0A5B4C]">{selectedConversation.sentiment}</div>
                      <div className="text-xs text-gray-600">Sentiment</div>
                    </div>
                  </div>
                </div>

                {/* Audio Waveform - ElevenLabs style */}
                <div className="p-6 border-b border-gray-200/50">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-6 mb-4">
                    <div className="flex items-center justify-center h-16">
                      <div className="flex items-center space-x-1 h-full">
                        {Array.from({ length: 40 }, (_, i) => (
                          <div 
                            key={i} 
                            className="bg-[#0A5B4C] w-1 rounded-full transition-all duration-300 hover:bg-[#0d6b56]"
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
                        className="rounded-full w-10 h-10 p-0 bg-[#0A5B4C] hover:bg-[#0d6b56]"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Headphones className="w-4 h-4" />
                        <span>HD Quality</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[#0A5B4C]">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Content Tabs - ElevenLabs style */}
                <Tabs defaultValue="transcript" className="flex-1 flex flex-col">
                  <TabsList className="mx-6 mt-4 grid w-auto grid-cols-3 bg-gray-100/80">
                    <TabsTrigger value="transcript" className="data-[state=active]:bg-[#0A5B4C] data-[state=active]:text-white">
                      Transcript
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="data-[state=active]:bg-[#0A5B4C] data-[state=active]:text-white">
                      AI Insights
                    </TabsTrigger>
                    <TabsTrigger value="metrics" className="data-[state=active]:bg-[#0A5B4C] data-[state=active]:text-white">
                      Metrics
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="transcript" className="flex-1 px-6 pb-6 overflow-y-auto">
                    <div className="space-y-4 mt-4">
                      {selectedConversation.transcript.map((message, index) => (
                        <div key={index} className="flex space-x-3 group">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                            message.speaker === 'Kalina' ? 'bg-[#0A5B4C] text-white' : 'bg-gray-200 text-gray-700'
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
                      <div className="futuristic-card p-4">
                        <div className="flex items-center mb-3">
                          <Zap className="w-5 h-5 text-[#0A5B4C] mr-2" />
                          <h4 className="font-semibold text-gray-900">Key Insights</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li>• High engagement throughout conversation</li>
                          <li>• Client showed interest in premium features</li>
                          <li>• Positive sentiment maintained</li>
                          <li>• Effective problem resolution</li>
                        </ul>
                      </div>
                      
                      <div className="futuristic-card p-4">
                        <div className="flex items-center mb-3">
                          <TrendingUp className="w-5 h-5 text-[#0A5B4C] mr-2" />
                          <h4 className="font-semibold text-gray-900">Performance Score</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Response Time</span>
                            <div className="flex items-center">
                              <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                                <div className="w-4/5 h-full bg-[#0A5B4C] rounded-full"></div>
                              </div>
                              <span className="text-sm text-[#0A5B4C] font-semibold">95%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Clarity</span>
                            <div className="flex items-center">
                              <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                                <div className="w-full h-full bg-[#0A5B4C] rounded-full"></div>
                              </div>
                              <span className="text-sm text-[#0A5B4C] font-semibold">98%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Empathy</span>
                            <div className="flex items-center">
                              <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                                <div className="w-4/5 h-full bg-[#0A5B4C] rounded-full"></div>
                              </div>
                              <span className="text-sm text-[#0A5B4C] font-semibold">92%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="metrics" className="flex-1 px-6 pb-6">
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="futuristic-card p-4 text-center">
                        <div className="text-2xl font-bold text-[#0A5B4C] mb-1">${selectedCall.cost_usd?.toFixed(4) || '0.0000'}</div>
                        <div className="text-xs text-gray-600">Total Cost</div>
                      </div>
                      <div className="futuristic-card p-4 text-center">
                        <div className="text-2xl font-bold text-[#0A5B4C] mb-1">$0.10</div>
                        <div className="text-xs text-gray-600">Per Minute</div>
                      </div>
                      <div className="futuristic-card p-4 text-center">
                        <div className="text-2xl font-bold text-[#0A5B4C] mb-1">15</div>
                        <div className="text-xs text-gray-600">Exchanges</div>
                      </div>
                      <div className="futuristic-card p-4 text-center">
                        <div className="text-2xl font-bold text-[#0A5B4C] mb-1">2.3s</div>
                        <div className="text-xs text-gray-600">Avg Response</div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#0A5B4C] to-[#0d6b56] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                    <Activity className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {conversationId ? 'Loading Conversation...' : 'Select a Conversation'}
                  </h3>
                  <p className="text-gray-600">
                    {conversationId ? 'Please wait while we load the conversation details' : 'Choose a call from the list to view detailed analytics'}
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
