
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useElevenLabsStats } from '@/hooks/useElevenLabsStats';
import LoadingSpinner from './LoadingSpinner';

const ElevenLabsChart: React.FC = () => {
  const { data: statsData, isLoading, error } = useElevenLabsStats();

  if (isLoading) {
    return (
      <Card className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 animate-[slideInUp_0.8s_ease-out_0.4s_both]">
        <CardHeader className="p-6 border-b border-gray-200">
          <CardTitle className="font-semibold text-gray-900 text-lg flex items-center">
            <div className="w-2 h-2 bg-gray-900 rounded-full mr-3 animate-pulse" />
            Statistici ElevenLabs
            <TrendingUp className="w-5 h-5 ml-2 text-gray-600" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex justify-center items-center h-80">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error || !statsData) {
    return (
      <Card className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 animate-[slideInUp_0.8s_ease-out_0.4s_both]">
        <CardHeader className="p-6 border-b border-gray-200">
          <CardTitle className="font-semibold text-gray-900 text-lg flex items-center">
            <div className="w-2 h-2 bg-gray-900 rounded-full mr-3 animate-pulse" />
            Statistici ElevenLabs
            <TrendingUp className="w-5 h-5 ml-2 text-gray-600" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex justify-center items-center h-80">
          <p className="text-gray-500">Nu s-au putut încărca statisticile</p>
        </CardContent>
      </Card>
    );
  }

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
              data={statsData}
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
