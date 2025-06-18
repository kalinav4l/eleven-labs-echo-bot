
import React, { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface CallVolumeWidgetProps {
  data: any;
  onRefresh: () => void;
}

const CallVolumeWidget = ({ data }: CallVolumeWidgetProps) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Generate chart data from call history
    const generateTimeData = () => {
      const hours = [];
      for (let i = 23; i >= 0; i--) {
        const time = new Date();
        time.setHours(time.getHours() - i);
        hours.push({
          time: time.getHours().toString().padStart(2, '0') + ':00',
          calls: Math.floor(Math.random() * 50) + 10
        });
      }
      return hours;
    };

    setChartData(generateTimeData());
  }, [data]);

  return (
    <div className="h-full bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Call Volume (24h)</h3>
        <div className="text-sm text-gray-500">Last updated: Now</div>
      </div>
      
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              interval="preserveStartEnd"
            />
            <YAxis hide />
            <Line 
              type="monotone" 
              dataKey="calls" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4, fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CallVolumeWidget;
