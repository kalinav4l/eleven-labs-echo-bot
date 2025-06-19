
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ConversationPlayer from '@/components/analytics/ConversationPlayer';
import AnalyticsSidebar from '@/components/analytics/AnalyticsSidebar';
import AIInsightsPanel from '@/components/analytics/AIInsightsPanel';
import FilterControls from '@/components/analytics/FilterControls';
import { useCallHistory } from '@/hooks/useCallHistory';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Phone, Clock, User, MessageSquare } from 'lucide-react';

const ConversationAnalytics = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isInsightsPanelOpen, setIsInsightsPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateRange: '7d',
    agents: [],
    sentiment: [0, 100],
    language: 'all',
    customerType: []
  });

  const { callHistory, isLoading } = useCallHistory();

  // Convert call history to conversation format
  const convertCallToConversation = (call) => {
    let dialogData = [];
    let sentimentData = [0.5, 0.6, 0.4, 0.7, 0.8];
    
    try {
      const parsedDialog = JSON.parse(call.dialog_json);
      const cleanConversations = parsedDialog?.clean_conversations;
      const dialog = cleanConversations?.dialog || [];
      
      if (Array.isArray(dialog)) {
        dialogData = dialog.map((item, index) => ({
          speaker: item.speaker === 'user' ? 'Customer' : 'Agent',
          text: item.message || '',
          timestamp: index * 10, // Simulate timestamps
          sentiment: Math.random() > 0.5 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative'
        }));
      }
    } catch (error) {
      console.error('Error parsing dialog:', error);
    }

    return {
      id: call.id,
      phone_number: call.phone_number,
      contact_name: call.contact_name,
      call_date: call.call_date,
      call_status: call.call_status,
      summary: call.summary,
      cost_usd: call.cost_usd,
      audio_url: '/sample-audio.mp3', // Mock audio URL since we don't have actual audio
      transcript: dialogData,
      sentiment_data: sentimentData,
      emotions: { 
        happy: Math.random() * 0.4 + 0.1, 
        frustrated: Math.random() * 0.3 + 0.1, 
        neutral: Math.random() * 0.4 + 0.2, 
        excited: Math.random() * 0.2 + 0.1 
      },
      keywords: ['order', 'help', 'service', 'support'],
      metrics: {
        talk_time: Math.floor(Math.random() * 300) + 60,
        interruptions: Math.floor(Math.random() * 5),
        silence_percent: Math.floor(Math.random() * 20) + 5,
        speech_speed: Math.floor(Math.random() * 50) + 150
      },
      topics: [
        { name: 'Greeting', start: 0, end: 30 },
        { name: 'Issue Discussion', start: 30, end: 120 },
        { name: 'Resolution', start: 120, end: 180 }
      ]
    };
  };

  const filteredCallHistory = callHistory.filter(call => 
    call.phone_number.includes(searchTerm) || 
    call.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <div className="w-3 h-3 bg-green-500 rounded-full" />;
      case 'failed':
        return <div className="w-3 h-3 bg-red-500 rounded-full" />;
      case 'busy':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full" />;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Header */}
        <div className="h-20 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Conversation Analytics</h1>
            <p className="text-sm text-gray-600">Analizează conversațiile și apelurile detaliat</p>
          </div>
          <FilterControls filters={filters} onFiltersChange={setFilters} />
        </div>

        <div className="flex">
          {/* Left: Call History List - 30% */}
          <div className="w-[30%] bg-white border-r border-gray-200 p-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Caută apeluri..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" 
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {filteredCallHistory.map((call) => (
                <Card 
                  key={call.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedConversation?.id === call.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedConversation(convertCallToConversation(call))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(call.call_status)}
                        <span className="font-medium text-sm">{call.contact_name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{call.call_date}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <Phone className="w-3 h-3" />
                      <span>{call.phone_number}</span>
                    </div>
                    
                    {call.summary && (
                      <p className="text-xs text-gray-600 line-clamp-2">{call.summary}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Cost: ${call.cost_usd}</span>
                      <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                        Analizează
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredCallHistory.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nu există apeluri pentru analiză</p>
                </div>
              )}
            </div>
          </div>

          {/* Center: Conversation Player - 45% */}
          <div className="w-[45%] p-6">
            <ConversationPlayer 
              conversation={selectedConversation}
              onSeek={(time) => console.log('Seek to:', time)}
            />
          </div>

          {/* Right: Analytics Sidebar - 25% */}
          <div className="w-[25%] bg-white border-l border-gray-200 p-6">
            <AnalyticsSidebar 
              conversation={selectedConversation}
            />
          </div>
        </div>

        {/* AI Insights Panel */}
        <AIInsightsPanel 
          isOpen={isInsightsPanelOpen}
          onClose={() => setIsInsightsPanelOpen(false)}
          conversation={selectedConversation}
        />
      </div>
    </DashboardLayout>
  );
};

export default ConversationAnalytics;
