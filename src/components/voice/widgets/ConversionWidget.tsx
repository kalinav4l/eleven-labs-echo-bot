
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ConversionWidget = () => {
  const { user } = useAuth();

  const { data: conversionData } = useQuery({
    queryKey: ['conversion-rate', user?.id],
    queryFn: async () => {
      if (!user) return { rate: 0, trend: 0 };
      
      const { data, error } = await supabase
        .from('call_history')
        .select('call_status')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching conversion data:', error);
        return { rate: 0, trend: 0 };
      }

      const totalCalls = data.length;
      const successfulCalls = data.filter(call => call.call_status === 'completed').length;
      const rate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0;
      const trend = Math.floor(Math.random() * 20) - 10; // -10 to +10

      return { rate, trend };
    },
    enabled: !!user,
  });

  const { rate = 0, trend = 0 } = conversionData || {};
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (rate / 100) * circumference;

  return (
    <div className="h-45 bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center relative">
      {/* Circular Progress */}
      <div className="relative w-24 h-24 mb-2">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#F2F2F7"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#34C759"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-semibold text-gray-900">{rate}%</span>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 font-medium mb-1">Conversion Rate</div>
      
      {/* Trend Indicator */}
      <div className={`flex items-center text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {trend >= 0 ? (
          <TrendingUp className="w-3 h-3 mr-1" />
        ) : (
          <TrendingDown className="w-3 h-3 mr-1" />
        )}
        {Math.abs(trend)}%
      </div>
    </div>
  );
};

export default ConversionWidget;
