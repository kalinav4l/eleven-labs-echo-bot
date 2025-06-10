
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SuccessRateChart = () => {
  const data = [
    { date: 'May 15', rate: 85 },
    { date: 'May 17', rate: 88 },
    { date: 'May 19', rate: 92 },
    { date: 'May 21', rate: 89 },
    { date: 'May 23', rate: 94 },
    { date: 'May 25', rate: 91 },
    { date: 'May 27', rate: 96 },
    { date: 'May 29', rate: 93 },
    { date: 'May 31', rate: 97 },
    { date: 'Jun 02', rate: 95 },
    { date: 'Jun 04', rate: 98 },
    { date: 'Jun 06', rate: 94 },
    { date: 'Jun 08', rate: 99 },
    { date: 'Jun 10', rate: 96 }
  ];

  return (
    <Card className="bg-[#181A1F] border-[#2A2D35] col-span-2">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <CardTitle className="text-white text-lg font-medium">Overall success rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
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
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2128',
                  border: '1px solid #2A2D35',
                  borderRadius: '8px',
                  color: '#FFFFFF'
                }}
                formatter={(value) => [`${value}%`, 'Success Rate']}
              />
              <Area 
                type="monotone" 
                dataKey="rate" 
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#greenGradient)"
              />
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuccessRateChart;
