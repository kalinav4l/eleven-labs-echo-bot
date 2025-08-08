import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DollarSign, Calendar, TrendingDown, TrendingUp } from 'lucide-react';

interface ExpenseStatsProps {
  callHistory?: any[];
  totalCost: number;
}

const ExpenseStatsChart = ({ callHistory = [], totalCost }: ExpenseStatsProps) => {
  // Generate monthly expense data
  const monthlyData = useMemo(() => {
    const months = [
      'Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun',
      'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'
    ];
    
    // Create mock data based on actual total cost
    const currentMonth = new Date().getMonth();
    const data = months.map((month, index) => {
      let callCosts = 0;
      let smsCosts = 0;
      
      if (index <= currentMonth) {
        // Distribute total cost across months with some variation
        const baseCost = totalCost / (currentMonth + 1);
        const variation = Math.random() * 0.4 + 0.8; // 80% to 120% variation
        callCosts = baseCost * variation * 0.7; // 70% for calls
        smsCosts = baseCost * variation * 0.3; // 30% for SMS
      }
      
      return {
        month,
        callCosts: Number(callCosts.toFixed(2)),
        smsCosts: Number(smsCosts.toFixed(2)),
        total: Number((callCosts + smsCosts).toFixed(2))
      };
    });
    
    return data;
  }, [callHistory, totalCost]);

  const currentYear = new Date().getFullYear();
  const previousMonth = monthlyData[Math.max(0, new Date().getMonth() - 1)];
  const currentMonthData = monthlyData[new Date().getMonth()];
  const trend = currentMonthData.total > previousMonth.total ? 'up' : 'down';
  const trendPercentage = previousMonth.total > 0 
    ? Math.abs(((currentMonthData.total - previousMonth.total) / previousMonth.total) * 100)
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-lg border border-white/20 shadow-lg">
          <p className="font-medium text-foreground">{label} {currentYear}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Apeluri: ${payload[0]?.value || 0}
            </p>
            <p className="text-sm text-pink-600">
              <span className="inline-block w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
              SMS: ${payload[1]?.value || 0}
            </p>
            <p className="text-sm font-medium text-foreground border-t pt-1">
              Total: ${((payload[0]?.value || 0) + (payload[1]?.value || 0)).toFixed(2)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative group animate-fade-in">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg" />
      
      {/* Content */}
      <div className="relative p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Statistici Cheltuieli</h3>
          </div>
          
          {/* Year selector */}
          <div className="flex items-center gap-2 text-sm text-foreground/60">
            <Calendar className="w-4 h-4" />
            <span>{currentYear}</span>
          </div>
        </div>
        
        {/* Trend indicator */}
        <div className="flex items-center gap-4 p-3 bg-white/20 rounded-lg">
          <div className="flex items-center gap-2">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-red-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-500" />
            )}
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
              {trendPercentage.toFixed(1)}% față de luna trecută
            </span>
          </div>
          <div className="text-sm text-foreground/60">
            Total luna aceasta: ${currentMonthData.total}
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Call costs bars (blue) */}
              <Bar 
                dataKey="callCosts" 
                stackId="costs"
                fill="#3B82F6"
                radius={[0, 0, 2, 2]}
                opacity={0.8}
              />
              
              {/* SMS costs bars (pink) */}
              <Bar 
                dataKey="smsCosts" 
                stackId="costs"
                fill="#EC4899"
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm opacity-80"></div>
            <span className="text-xs text-foreground/70">Apeluri</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-500 rounded-sm opacity-80"></div>
            <span className="text-xs text-foreground/70">SMS</span>
          </div>
        </div>
        
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">
              ${totalCost.toFixed(2)}
            </div>
            <div className="text-xs text-foreground/60">Total Anul</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">
              ${(totalCost / Math.max(1, new Date().getMonth() + 1)).toFixed(2)}
            </div>
            <div className="text-xs text-foreground/60">Media Lunară</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">
              ${currentMonthData.total}
            </div>
            <div className="text-xs text-foreground/60">Luna Curentă</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseStatsChart;