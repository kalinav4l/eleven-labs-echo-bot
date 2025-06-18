
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const CallVolumeWidget = () => {
  const { user } = useAuth();

  const { data: volumeData = [] } = useQuery({
    queryKey: ['call-volume', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('call_history')
        .select('call_date')
        .eq('user_id', user.id)
        .gte('call_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error fetching call volume:', error);
        return [];
      }

      // Group calls by hour
      const hourlyData = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date();
        hour.setHours(hour.getHours() - (23 - i), 0, 0, 0);
        return {
          time: hour.getHours().toString().padStart(2, '0') + ':00',
          calls: 0
        };
      });

      data.forEach(call => {
        const callHour = new Date(call.call_date).getHours();
        const dataIndex = hourlyData.findIndex(item => 
          parseInt(item.time.split(':')[0]) === callHour
        );
        if (dataIndex !== -1) {
          hourlyData[dataIndex].calls++;
        }
      });

      return hourlyData;
    },
    enabled: !!user,
  });

  return (
    <div className="h-45 bg-white rounded-2xl border border-gray-100 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Call Volume</h3>
        <p className="text-sm text-gray-500">Last 24 hours</p>
      </div>
      
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={volumeData}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
            />
            <YAxis hide />
            <Line
              type="monotone"
              dataKey="calls"
              stroke="#007AFF"
              strokeWidth={3}
              dot={false}
              fill="url(#gradient)"
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#007AFF" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CallVolumeWidget;
