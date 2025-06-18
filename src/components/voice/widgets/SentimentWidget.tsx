
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

const SentimentWidget = () => {
  const { user } = useAuth();

  const { data: sentimentData } = useQuery({
    queryKey: ['sentiment-data', user?.id],
    queryFn: async () => {
      if (!user) return { percentage: 0, emoji: '😐' };
      
      // Mock sentiment calculation - in real app, this would analyze call transcripts
      const { data, error } = await supabase
        .from('call_history')
        .select('summary')
        .eq('user_id', user.id)
        .not('summary', 'is', null)
        .limit(10);

      if (error) {
        console.error('Error fetching sentiment data:', error);
        return { percentage: 0, emoji: '😐' };
      }

      // Mock positive sentiment percentage
      const positivePercentage = Math.floor(Math.random() * 40) + 60; // 60-100%
      let emoji = '😐';
      
      if (positivePercentage >= 80) emoji = '😊';
      else if (positivePercentage >= 60) emoji = '🙂';
      else if (positivePercentage >= 40) emoji = '😐';
      else emoji = '😞';

      return { percentage: positivePercentage, emoji };
    },
    enabled: !!user,
  });

  const { percentage = 0, emoji = '😐' } = sentimentData || {};

  return (
    <div className="h-45 bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center">
      <div className="text-6xl mb-2 animate-bounce">
        {emoji}
      </div>
      <div className="text-2xl font-semibold text-gray-900 mb-1">
        {percentage}%
      </div>
      <div className="text-sm text-gray-500 font-medium">
        Positive Sentiment
      </div>
    </div>
  );
};

export default SentimentWidget;
