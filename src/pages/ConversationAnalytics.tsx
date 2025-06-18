
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ConversationPlayer from '@/components/analytics/ConversationPlayer';
import AnalyticsSidebar from '@/components/analytics/AnalyticsSidebar';
import AIInsightsPanel from '@/components/analytics/AIInsightsPanel';
import FilterControls from '@/components/analytics/FilterControls';
import { useQuery } from '@tanstack/react-query';

const ConversationAnalytics = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isInsightsPanelOpen, setIsInsightsPanelOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '7d',
    agents: [],
    sentiment: [0, 100],
    language: 'all',
    customerType: []
  });

  const { data: conversations } = useQuery({
    queryKey: ['conversations', filters],
    queryFn: async () => {
      // This would connect to your Supabase data
      return [
        {
          id: '1',
          audio_url: '/sample-audio.mp3',
          transcript: [
            { speaker: 'Agent', text: 'Hello! How can I help you today?', timestamp: 0, sentiment: 'positive' },
            { speaker: 'Customer', text: 'I have an issue with my order', timestamp: 3.2, sentiment: 'neutral' }
          ],
          sentiment_data: [0.8, 0.6, 0.4, 0.7, 0.9],
          emotions: { happy: 0.3, frustrated: 0.2, neutral: 0.4, excited: 0.1 },
          keywords: ['order', 'issue', 'help', 'delivery'],
          metrics: {
            talk_time: 145,
            interruptions: 2,
            silence_percent: 15,
            speech_speed: 180
          }
        }
      ];
    }
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Header */}
        <div className="h-20 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Conversation Analytics</h1>
            <p className="text-sm text-gray-600">Transform conversations into actionable insights</p>
          </div>
          <FilterControls filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row">
          {/* Conversation Player - 65% width on desktop */}
          <div className="xl:w-[65%] p-6">
            <ConversationPlayer 
              conversation={selectedConversation || conversations?.[0]}
              onSeek={(time) => console.log('Seek to:', time)}
            />
          </div>

          {/* Analytics Sidebar - 35% width on desktop */}
          <div className="xl:w-[35%] bg-white border-l border-gray-200 p-6">
            <AnalyticsSidebar 
              conversation={selectedConversation || conversations?.[0]}
            />
          </div>
        </div>

        {/* AI Insights Panel */}
        <AIInsightsPanel 
          isOpen={isInsightsPanelOpen}
          onClose={() => setIsInsightsPanelOpen(false)}
          conversation={selectedConversation || conversations?.[0]}
        />
      </div>
    </DashboardLayout>
  );
};

export default ConversationAnalytics;
