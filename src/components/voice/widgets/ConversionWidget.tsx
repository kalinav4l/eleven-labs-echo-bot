
import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ConversionWidgetProps {
  data: any;
  onRefresh: () => void;
}

const ConversionWidget = ({ data }: ConversionWidgetProps) => {
  const [conversion, setConversion] = useState({ rate: 68, trend: 'up', change: 5 });

  useEffect(() => {
    // Calculate conversion rate from conversations
    const conversations = data?.conversations || [];
    const successful = conversations.filter((conv: any) => 
      conv.title?.includes('success') || conv.credits_used > 50
    ).length;
    
    const rate = conversations.length > 0 ? Math.round((successful / conversations.length) * 100) : 68;
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    const change = Math.floor(Math.random() * 10) + 1;
    
    setConversion({ rate, trend, change });
  }, [data]);

  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (conversion.rate / 100) * circumference;

  return (
    <div className="h-full bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col justify-center items-center h-full">
        {/* Circular Progress */}
        <div className="relative w-24 h-24 mb-4">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke="#F3F4F6"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke="#10B981"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{conversion.rate}%</span>
          </div>
        </div>
        
        {/* Trend Indicator */}
        <div className={`flex items-center space-x-1 ${
          conversion.trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {conversion.trend === 'up' ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">+{conversion.change}%</span>
        </div>
        
        <div className="text-sm text-gray-600 mt-1">
          Conversion Rate
        </div>
      </div>
    </div>
  );
};

export default ConversionWidget;
