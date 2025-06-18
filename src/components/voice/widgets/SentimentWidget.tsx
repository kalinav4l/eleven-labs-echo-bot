
import React, { useEffect, useState } from 'react';

interface SentimentWidgetProps {
  data: any;
  onRefresh: () => void;
}

const SentimentWidget = ({ data }: SentimentWidgetProps) => {
  const [sentiment, setSentiment] = useState({ emoji: '😊', percentage: 85, label: 'Positive' });

  useEffect(() => {
    // Calculate sentiment from call history
    const calls = data?.recentCalls || [];
    const positiveCalls = calls.filter((call: any) => 
      call.summary?.includes('satisfied') || call.summary?.includes('happy')
    ).length;
    
    const percentage = calls.length > 0 ? Math.round((positiveCalls / calls.length) * 100) : 85;
    
    let emoji = '😊';
    let label = 'Positive';
    
    if (percentage < 30) {
      emoji = '😔';
      label = 'Negative';
    } else if (percentage < 70) {
      emoji = '😐';
      label = 'Neutral';
    }
    
    setSentiment({ emoji, percentage, label });
  }, [data]);

  const getBgColor = () => {
    if (sentiment.percentage < 30) return 'bg-red-50 border-red-200';
    if (sentiment.percentage < 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  return (
    <div className={`h-full rounded-2xl p-6 border-2 transition-colors duration-500 ${getBgColor()}`}>
      <div className="flex flex-col justify-center items-center h-full">
        <div className="text-6xl mb-3 animate-bounce">
          {sentiment.emoji}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {sentiment.percentage}%
        </div>
        <div className="text-sm font-medium text-gray-600">
          {sentiment.label} Sentiment
        </div>
      </div>
    </div>
  );
};

export default SentimentWidget;
