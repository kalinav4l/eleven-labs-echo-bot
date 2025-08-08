import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, ReferenceDot } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface TotalSpentChartProps {
  totalCost: number;
  callHistory?: any[];
}

const TotalSpentChart = ({ totalCost, callHistory = [] }: TotalSpentChartProps) => {
  // Generate smooth spending progression data
  const chartData = useMemo(() => {
    const dataPoints = 12;
    const data = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const progress = i / (dataPoints - 1);
      // Create a smooth progressive curve that ends at totalCost
      const baseValue = totalCost * 0.6; // Starting point at 60% of total
      const growth = (totalCost - baseValue) * progress;
      const noise = Math.sin(i * 0.5) * (totalCost * 0.05); // Small fluctuations
      const value = Math.max(0, baseValue + growth + noise);
      
      data.push({
        index: i,
        value: Number(value.toFixed(2))
      });
    }
    
    return data;
  }, [totalCost]);

  const currentValue = chartData[chartData.length - 1]?.value || totalCost;
  const previousValue = chartData[chartData.length - 2]?.value || totalCost * 0.9;
  const changePercent = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
  const isPositive = changePercent >= 0;

  // Calculate Y-axis range
  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));
  const range = maxValue - minValue;
  const yAxisMin = Math.max(0, minValue - range * 0.1);
  const yAxisMax = maxValue + range * 0.1;

  return (
    <div className="relative group animate-fade-in">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg" />
      
      {/* Content */}
      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Total Cheltuit</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`} />
            <span className={`text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        
        {/* Total amount */}
        <div className="space-y-1">
          <div className="text-4xl font-bold text-foreground">
            ${totalCost.toFixed(1)}
          </div>
          <div className="text-sm text-foreground/60">
            Total Spent
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-32 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              
              <YAxis hide domain={[yAxisMin, yAxisMax]} />
              
              {/* Main line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={false}
                fill="url(#areaGradient)"
                fillOpacity={1}
              />
              
              {/* End point dot */}
              <ReferenceDot
                x={chartData.length - 1}
                y={currentValue}
                r={6}
                fill="#8B5CF6"
                stroke="#ffffff"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Current value badge */}
        <div className="flex justify-end">
          <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full shadow-lg">
            ${currentValue.toFixed(2)}
          </div>
        </div>
        
        {/* Y-axis labels overlay */}
        <div className="absolute right-2 top-20 bottom-16 flex flex-col justify-between text-xs text-foreground/40 pointer-events-none">
          <span>${yAxisMax.toFixed(0)}</span>
          <span>${((yAxisMax + yAxisMin) / 2).toFixed(0)}</span>
          <span>${yAxisMin.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};

export default TotalSpentChart;