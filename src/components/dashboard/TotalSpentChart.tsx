import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface TotalSpentChartProps {
  totalCost: number;
  callHistory?: any[];
}

const TotalSpentChart = ({ totalCost, callHistory = [] }: TotalSpentChartProps) => {
  // Generate monthly data with realistic progression
  const chartData = useMemo(() => {
    const months = ['2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
    
    const data = months.map((month, index) => {
      let value = 0;
      
      if (index === 0) {
        value = 0; // Start at 0
      } else if (index <= 3) {
        // Gradual increase to peak
        value = totalCost * (index / 3) * 0.8;
      } else if (index === 4) {
        // Peak around middle
        value = totalCost * 0.85;
      } else {
        // Gradual decrease towards end
        const decrease = (index - 4) / (months.length - 5);
        value = totalCost * (0.85 - decrease * 0.3);
      }
      
      return {
        month,
        value: Math.max(0, Number(value.toFixed(2))),
        displayMonth: month
      };
    });
    
    return data;
  }, [totalCost]);

  const changePercent = 2.45; // Fixed positive trend

  return (
    <div className="relative group animate-fade-in">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg" />
      
      {/* Content */}
      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-foreground rounded-full"></div>
            <h3 className="text-lg font-semibold text-foreground">Statistici Cheltuieli</h3>
            <div className="flex items-center gap-1 text-sm text-foreground/60">
              <span>↗</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              ${totalCost.toFixed(2)}
            </div>
            <div className="text-sm text-foreground/60">
              Total cheltuit
            </div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-48 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: 60, bottom: 40 }}>
              <XAxis 
                dataKey="displayMonth"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))', opacity: 0.6 }}
                interval={2}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))', opacity: 0.6 }}
                tickFormatter={(value) => `$${value}`}
                domain={[0, 'dataMax + 100']}
              />
              
              {/* Main curved line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#374151"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, index } = props;
                  if (index === 0 || index === chartData.length - 1 || index === 4) {
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill="#374151"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return null;
                }}
                activeDot={{ r: 6, fill: '#374151', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <div className="w-3 h-0.5 bg-gray-600"></div>
          <span className="text-sm text-foreground/60">Cheltuieli Lunare ($)</span>
        </div>
      </div>
    </div>
  );
};

export default TotalSpentChart;