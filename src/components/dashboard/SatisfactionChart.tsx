import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface SatisfactionChartProps {
  satisfaction: number;
}

const SatisfactionChart: React.FC<SatisfactionChartProps> = ({ satisfaction }) => {
  const data = [
    { name: 'Satisfied', value: satisfaction },
    { name: 'Remaining', value: 100 - satisfaction }
  ];

  const COLORS = ['#3B82F6', '#1F2937'];

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white">Satisfaction Rate</CardTitle>
        <p className="text-gray-400 text-sm">From all calls</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-center relative">
          <div className="w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{satisfaction}%</div>
              <div className="text-xs text-gray-400">Based on calls</div>
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-4">
          <span>0%</span>
          <span>100%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SatisfactionChart;