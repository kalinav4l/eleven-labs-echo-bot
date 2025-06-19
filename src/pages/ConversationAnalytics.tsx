
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useCallHistory } from '@/hooks/useCallHistory';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Play, Pause, Download, Calendar, Filter, X, Clock, Phone, User } from 'lucide-react';

const ConversationAnalytics = () => {
  const [selectedCall, setSelectedCall] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const { callHistory, isLoading } = useCallHistory();

  // Convert call to conversation format for display
  const convertCallToConversation = (call) => {
    let transcript = [];
    
    try {
      const parsedDialog = JSON.parse(call.dialog_json);
      const cleanConversations = parsedDialog?.clean_conversations;
      const dialog = cleanConversations?.dialog || [];
      
      if (Array.isArray(dialog)) {
        transcript = dialog.map((item, index) => ({
          speaker: item.speaker === 'user' ? 'Caller' : 'Assistant',
          text: item.message || '',
          timestamp: `0:${(index * 10).toString().padStart(2, '0')} | 00:0${(index + 1)}`,
          time: index * 10
        }));
      }
    } catch (error) {
      console.error('Error parsing dialog:', error);
    }

    return {
      ...call,
      transcript,
      duration: '57 sec', // Mock duration
      cost: call.cost_usd || 0
    };
  };

  const filteredCalls = callHistory.filter(call => {
    const matchesSearch = call.phone_number.includes(searchTerm) || 
                         call.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (call.summary && call.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const getCallTypeColor = (status) => {
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
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ', ' + date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const selectedConversation = selectedCall ? convertCallToConversation(selectedCall) : null;

  return (
    <DashboardLayout>
      <div className="h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Call Logs</h1>
              <p className="text-sm text-gray-600 mt-1">View and analyze your call history</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Alex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  <SelectItem value="alex">Alex</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Oct 1, 2024 - May 1, 2025</span>
                <Button variant="ghost" size="sm">Select</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Call List */}
          <div className="w-2/3 border-r border-gray-200 flex flex-col">
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Filter summaries..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" 
                />
              </div>
            </div>

            {/* Call List Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase">
                <div className="col-span-2">Assistant Name</div>
                <div className="col-span-1">Call Type</div>
                <div className="col-span-2">Customer Number</div>
                <div className="col-span-1">Cost</div>
                <div className="col-span-1">Duration</div>
                <div className="col-span-2">Start Time</div>
                <div className="col-span-3">Summary</div>
              </div>
            </div>

            {/* Call List */}
            <div className="flex-1 overflow-y-auto">
              {filteredCalls.map((call) => (
                <div 
                  key={call.id} 
                  className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedCall?.id === call.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => setSelectedCall(call)}
                >
                  <div className="grid grid-cols-12 gap-4 items-center text-sm">
                    <div className="col-span-2 font-medium text-gray-900">Alex</div>
                    <div className="col-span-1">
                      <Badge className={getCallTypeColor(call.call_status)}>
                        {call.call_status === 'success' ? 'Inbound' : 'Outbound'}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-gray-600">{call.phone_number}</div>
                    <div className="col-span-1 text-gray-600">${call.cost_usd?.toFixed(4) || '0.0000'}</div>
                    <div className="col-span-1 text-gray-600">57 sec</div>
                    <div className="col-span-2 text-gray-600">{formatDate(call.call_date)}</div>
                    <div className="col-span-3">
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {call.summary || 'No summary available'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredCalls.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Phone className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No calls found matching your filters</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500">0 of 98 row(s) selected.</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Call Details */}
          <div className="w-1/3 flex flex-col">
            {selectedCall ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Details for call started at {formatDate(selectedCall.call_date)}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Call Type: <span className="text-gray-900">Outbound</span></span>
                      <span>Customer Number: <span className="text-gray-900">{selectedCall.phone_number}</span></span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCall(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Audio Waveform */}
                <div className="p-4 border-b border-gray-100">
                  <div className="bg-gray-100 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center h-20">
                      {/* Mock waveform */}
                      <div className="flex items-center space-x-1 h-full">
                        {Array.from({ length: 50 }, (_, i) => (
                          <div 
                            key={i} 
                            className="bg-gray-400 w-1 rounded"
                            style={{ height: `${Math.random() * 60 + 10}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button 
                        size="sm" 
                        className="rounded-full w-8 h-8 p-0"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <span className="text-sm text-gray-600">30</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="transcript" className="flex-1 flex flex-col">
                  <TabsList className="mx-4 grid w-auto grid-cols-3">
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="cost">Call Cost</TabsTrigger>
                  </TabsList>

                  <TabsContent value="transcript" className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {selectedConversation.transcript.map((message, index) => (
                        <div key={index} className="flex space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            message.speaker === 'Assistant' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {message.speaker === 'Assistant' ? 'A' : 'C'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{message.speaker}</span>
                              <span className="text-xs text-gray-500">{message.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-700">{message.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="analysis" className="flex-1 p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Sentiment Analysis</h4>
                        <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm">
                          Overall sentiment: Positive
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Key Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Customer Support</Badge>
                          <Badge variant="secondary">Technical Help</Badge>
                          <Badge variant="secondary">Product Info</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Call Quality</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Response Time</span>
                            <span className="text-green-600">Excellent</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Resolution Rate</span>
                            <span className="text-green-600">High</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="cost" className="flex-1 p-4">
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Cost Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Duration</span>
                            <span>57 seconds</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Rate per minute</span>
                            <span>$0.10</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium border-t pt-2">
                            <span>Total Cost</span>
                            <span>${selectedCall.cost_usd?.toFixed(4) || '0.0000'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Phone className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a call to view details</p>
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
