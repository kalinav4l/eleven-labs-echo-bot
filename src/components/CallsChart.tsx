
import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CallsChart = () => {
  const data = [
    { date: 'May 15', calls: 20 },
    { date: 'May 17', calls: 25 },
    { date: 'May 19', calls: 30 },
    { date: 'May 21', calls: 22 },
    { date: 'May 23', calls: 28 },
    { date: 'May 25', calls: 35 },
    { date: 'May 27', calls: 32 },
    { date: 'May 29', calls: 45 },
    { date: 'May 31', calls: 40 },
    { date: 'Jun 02', calls: 55 },
    { date: 'Jun 04', calls: 48 },
    { date: 'Jun 06', calls: 52 },
    { date: 'Jun 08', calls: 65 },
    { date: 'Jun 10', calls: 58 }
  ];

  return (
    <Card className="bg-[#181A1F] border-[#2A2D35] col-span-2">
      <CardHeader>
        <CardTitle className="text-white text-lg font-medium">Call Volume</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2128',
                  border: '1px solid #2A2D35',
                  borderRadius: '8px',
                  color: '#FFFFFF'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="calls" 
                stroke="#FFFFFF" 
                strokeWidth={2}
                dot={{ fill: '#FFFFFF', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#FFFFFF' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallsChart;
