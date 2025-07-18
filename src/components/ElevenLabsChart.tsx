
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface ElevenLabsChartProps {
  data?: Array<{
    date: string;
    calls: number;
    credits: number;
    duration: number;
  }>;
}

const ElevenLabsChart: React.FC<ElevenLabsChartProps> = ({ data }) => {
  // Sample data if none provided
  const defaultData = [
    { date: 'Jun 18', calls: 0, credits: 0, duration: 0 },
    { date: 'Jun 19', calls: 0, credits: 0, duration: 0 },
    { date: 'Jun 20', calls: 0, credits: 0, duration: 0 },
    { date: 'Jun 21', calls: 0, credits: 0, duration: 0 },
    { date: 'Jun 22', calls: 0, credits: 0, duration: 0 },
    { date: 'Jun 23', calls: 0, credits: 0, duration: 0 },
    { date: 'Jun 24', calls: 2, credits: 15, duration: 5 },
    { date: 'Jun 25', calls: 0, credits: 0, duration: 0 },
    { date: 'Jun 26', calls: 4, credits: 33, duration: 12 },
    { date: 'Jun 27', calls: 0, credits: 0, duration: 0 },
    { date: 'Jun 28', calls: 6, credits: 45, duration: 18 },
    { date: 'Jun 29', calls: 3, credits: 25, duration: 8 },
    { date: 'Jun 30', calls: 8, credits: 65, duration: 25 },
    { date: 'Jul 01', calls: 5, credits: 42, duration: 15 },
    { date: 'Jul 02', calls: 12, credits: 95, duration: 35 },
    { date: 'Jul 03', calls: 7, credits: 58, duration: 22 },
    { date: 'Jul 04', calls: 9, credits: 72, duration: 28 },
    { date: 'Jul 05', calls: 15, credits: 120, duration: 45 },
    { date: 'Jul 06', calls: 4, credits: 35, duration: 12 },
    { date: 'Jul 07', calls: 11, credits: 88, duration: 32 },
    { date: 'Jul 08', calls: 18, credits: 145, duration: 52 },
    { date: 'Jul 09', calls: 6, credits: 48, duration: 18 },
    { date: 'Jul 10', calls: 22, credits: 175, duration: 68 },
    { date: 'Jul 11', calls: 13, credits: 105, duration: 38 },
    { date: 'Jul 12', calls: 25, credits: 200, duration: 75 },
    { date: 'Jul 13', calls: 19, credits: 152, duration: 58 },
    { date: 'Jul 14', calls: 31, credits: 248, duration: 92 },
    { date: 'Jul 15', calls: 28, credits: 225, duration: 85 },
    { date: 'Jul 16', calls: 35, credits: 280, duration: 105 },
  ];

  const chartData = data || defaultData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-gray-600">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
              {entry.name === 'calls' && `Apeluri: ${entry.value}`}
              {entry.name === 'credits' && `Credite: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 animate-[slideInUp_0.8s_ease-out_0.4s_both]">
      <CardHeader className="p-6 border-b border-gray-200">
        <CardTitle className="font-semibold text-gray-900 text-lg flex items-center">
          <div className="w-2 h-2 bg-gray-900 rounded-full mr-3 animate-pulse" />
          Statistici ElevenLabs
          <TrendingUp className="w-5 h-5 ml-2 text-gray-600" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f3f4f6" 
                horizontal={true}
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                domain={[0, 'dataMax + 10']}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Apeluri Line */}
              <Line
                type="monotone"
                dataKey="calls"
                stroke="#374151"
                strokeWidth={2}
                dot={{ 
                  fill: '#374151', 
                  strokeWidth: 2, 
                  r: 4,
                  className: 'animate-pulse'
                }}
                activeDot={{ 
                  r: 6, 
                  fill: '#111827',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                  className: 'animate-bounce'
                }}
                animationDuration={2000}
                animationEasing="ease-in-out"
              />
              
              {/* Credite Line */}
              <Line
                type="monotone"
                dataKey="credits"
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ 
                  fill: '#6b7280', 
                  strokeWidth: 2, 
                  r: 3,
                  className: 'animate-pulse'
                }}
                activeDot={{ 
                  r: 5, 
                  fill: '#374151',
                  stroke: '#ffffff',
                  strokeWidth: 2
                }}
                animationDuration={2500}
                animationEasing="ease-in-out"
                animationBegin={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda */}
        <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-gray-800 mr-2"></div>
            <span className="text-xs text-gray-600">Apeluri</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-gray-500 mr-2" style={{ backgroundImage: 'repeating-linear-gradient(to right, #6b7280 0, #6b7280 3px, transparent 3px, transparent 8px)' }}></div>
            <span className="text-xs text-gray-600">Credite</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElevenLabsChart;
