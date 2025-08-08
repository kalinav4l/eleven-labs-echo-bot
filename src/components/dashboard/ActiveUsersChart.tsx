import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

interface ActiveUsersChartProps {
  dailyData: Array<{ day: string; calls: number; conversations: number; agents: number; cost: number }>;
}

const ActiveUsersChart: React.FC<ActiveUsersChartProps> = ({ dailyData }) => {
  const totalUsers = dailyData.reduce((sum, day) => sum + day.calls, 0);
  const totalConversations = dailyData.reduce((sum, day) => sum + day.conversations, 0);
  const totalCost = dailyData.reduce((sum, day) => sum + day.cost, 0);
  const totalAgents = dailyData.reduce((sum, day) => sum + day.agents, 0);

  const weekGrowth = dailyData.length > 6 
    ? ((dailyData[6]?.calls || 0) - (dailyData[0]?.calls || 0)) / (dailyData[0]?.calls || 1) * 100
    : 0;

  const stats = [
    { label: 'Calls', value: totalUsers.toLocaleString(), color: 'text-blue-500' },
    { label: 'Conversations', value: `${(totalConversations / 1000).toFixed(1)}k`, color: 'text-blue-500' },
    { label: 'Cost', value: `$${totalCost.toFixed(0)}`, color: 'text-blue-500' },
    { label: 'Agents', value: totalAgents.toString(), color: 'text-blue-500' }
  ];

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white">Active Usage</CardTitle>
        <p className="text-emerald-500 text-sm">(+{weekGrowth.toFixed(0)}%) than last week</p>
      </CardHeader>
      <CardContent>
        <div className="h-32 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <Bar dataKey="calls" fill="#3B82F6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${stat.color.replace('text-', 'bg-')}`}></div>
              <span className="text-sm text-gray-400">{stat.label}</span>
              <span className="text-sm font-semibold text-white ml-auto">{stat.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveUsersChart;