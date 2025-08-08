import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
  monthlyData: Array<{ month: string; amount: number }>;
}

const SalesChart: React.FC<SalesChartProps> = ({ monthlyData }) => {
  const currentYear = new Date().getFullYear();
  const growth = monthlyData.length > 1 
    ? ((monthlyData[monthlyData.length - 1]?.amount || 0) - (monthlyData[0]?.amount || 0)) / (monthlyData[0]?.amount || 1) * 100
    : 0;

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white">Spending Overview</CardTitle>
        <p className="text-emerald-500 text-sm">(+{growth.toFixed(1)}%) more in {currentYear}</p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
              />
              <YAxis hide />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#colorGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-4">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;