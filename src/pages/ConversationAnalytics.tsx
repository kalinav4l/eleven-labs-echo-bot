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
import { Search, Play, Pause, Download, Clock, Phone, X, ArrowLeft, Headphones } from 'lucide-react';
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
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
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
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-3 text-gray-600 text-sm">Loading conversation...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              {conversationId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/account/conversation-analytics')}
                  className="text-gray-600 hover:text-gray-900 p-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  Conversation Analytics
                </h1>
                <p className="text-gray-600 text-sm">
                  Analyze conversations and agent performance
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
                    className="pl-10 w-80 bg-white border-gray-200 text-sm" 
                  />
                </div>
                
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="w-40 bg-white border-gray-200 text-sm">
                    <SelectValue placeholder="All Agents" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all">All Agents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{filteredCalls.length}</div>
              <div className="text-sm text-gray-600">Total Calls</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {Math.round(filteredCalls.filter(c => c.call_status === 'success').length / filteredCalls.length * 100 || 0)}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">4.8</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-8">
            {/* Left Panel - Conversations */}
            <div className="w-1/2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conversations</h3>
              
              <div className="space-y-3">
                {filteredCalls.map((call, index) => {
                  const dateInfo = formatDate(call.call_date);
                  const isSelected = selectedCall?.id === call.id || 
                                   (conversationId && call.elevenlabs_history_id === conversationId);
                  
                  return (
                    <div 
                      key={call.id} 
                      className={`p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors ${
                        isSelected ? 'border-gray-900 bg-gray-50' : 'bg-white'
                      }`}
                      onClick={() => handleCallClick(call)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Phone className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{call.phone_number}</div>
                            <div className="text-xs text-gray-500">{dateInfo.date} • {dateInfo.time}</div>
                          </div>
                        </div>
                        <Badge className={`text-xs px-2 py-1 rounded-full ${getStatusColor(call.call_status)}`}>
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
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Phone className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No conversations found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Analysis */}
            <div className="w-1/2">
              {selectedCall ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Conversation Analysis</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedCall(null);
                        if (conversationId) navigate('/account/conversation-analytics');
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{selectedConversation?.satisfaction || 85}%</div>
                      <div className="text-xs text-gray-600">Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">57s</div>
                      <div className="text-xs text-gray-600">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">positive</div>
                      <div className="text-xs text-gray-600">Sentiment</div>
                    </div>
                  </div>

                  {/* Audio Waveform */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-center h-16 mb-4">
                      <div className="flex items-center space-x-1 h-full">
                        {Array.from({ length: 40 }, (_, i) => (
                          <div 
                            key={i} 
                            className="bg-gray-900 w-0.5 rounded-full transition-all duration-300"
                            style={{ height: `${Math.random() * 60 + 20}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button 
                          size="sm" 
                          className="rounded-full w-8 h-8 p-0 bg-gray-900 hover:bg-gray-800"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </Button>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Headphones className="w-3 h-3" />
                          <span>HD Quality</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs text-gray-600 hover:text-gray-900">
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Content Tabs */}
                  <Tabs defaultValue="transcript" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
                      <TabsTrigger value="transcript" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Transcript
                      </TabsTrigger>
                      <TabsTrigger value="insights" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        AI Insights
                      </TabsTrigger>
                      <TabsTrigger value="metrics" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Metrics
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="transcript" className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedConversation?.transcript?.map((message, index) => (
                        <div key={index} className="flex space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            message.speaker === 'Kalina' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {message.speaker === 'Kalina' ? 'K' : 'C'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-xs text-gray-900">{message.speaker}</span>
                              <span className="text-xs text-gray-500">{message.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{message.text}</p>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-sm text-gray-900 mb-3">Key Insights</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• High engagement throughout conversation</li>
                          <li>• Customer showed interest in premium features</li>
                          <li>• Positive sentiment maintained</li>
                          <li>• Efficient problem resolution</li>
                        </ul>
                      </div>
                    </TabsContent>

                    <TabsContent value="metrics" className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border border-gray-200 rounded-lg">
                        <div className="text-lg font-bold text-gray-900 mb-1">${selectedCall.cost_usd?.toFixed(4) || '0.0000'}</div>
                        <div className="text-xs text-gray-600">Total Cost</div>
                      </div>
                      <div className="text-center p-3 border border-gray-200 rounded-lg">
                        <div className="text-lg font-bold text-gray-900 mb-1">15</div>
                        <div className="text-xs text-gray-600">Exchanges</div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Phone className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Select a Conversation
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Choose a call from the list to view detailed analysis
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ConversationAnalytics;
