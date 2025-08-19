import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useVoiceStats } from '@/hooks/useVoiceStats';
import LoadingSpinner from './LoadingSpinner';

const VoiceChart: React.FC = () => {
  const { stats, loading } = useVoiceStats();

  if (loading) {
    return (
      <Card className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 animate-[slideInUp_0.8s_ease-out_0.4s_both]">
        <CardHeader className="p-6 border-b border-gray-200">
          <CardTitle className="font-semibold text-gray-900 text-lg flex items-center">
            <div className="w-2 h-2 bg-gray-900 rounded-full mr-3 animate-pulse" />
            Statistici Cheltuieli
            <TrendingUp className="w-5 h-5 ml-2 text-gray-600" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex justify-center items-center h-80">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 animate-[slideInUp_0.8s_ease-out_0.4s_both]">
        <CardHeader className="p-6 border-b border-gray-200">
          <CardTitle className="font-semibold text-gray-900 text-lg flex items-center">
            <div className="w-2 h-2 bg-gray-900 rounded-full mr-3 animate-pulse" />
            Statistici Cheltuieli
            <TrendingUp className="w-5 h-5 ml-2 text-gray-600" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex justify-center items-center h-80">
          <p className="text-gray-500">Nu s-au putut încărca statisticile</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare monochrome, professional data with a simple moving average (window=3)
  const chartData = stats.monthlyData.map((item, idx, arr) => {
    const start = Math.max(0, idx - 2);
    const slice = arr.slice(start, idx + 1);
    const avg = slice.reduce((s, it) => s + it.amount, 0) / slice.length;
    return {
      month: item.month,
      amount: item.amount,
      avg: Number(avg.toFixed(2))
    };
  });

  // Formatters to ensure logical, consistent labels
  const currencyFmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const formatXAxis = (val: any) => {
    const s = String(val);
    // ISO YYYY-MM or YYYY/MM
    if (/^\d{4}[-\/]\d{2}$/.test(s)) {
      const [y, m] = s.split(/[-\/]/);
      const d = new Date(Number(y), Number(m) - 1, 1);
      return d.toLocaleString('ro-RO', { month: 'short' });
    }
    // Numeric with potential zero padding -> take last 2 as month
    if (/^\d+$/.test(s)) {
      const m = Number(s.slice(-2));
      if (m >= 1 && m <= 12) {
        return new Date(2000, m - 1, 1).toLocaleString('ro-RO', { month: 'short' });
      }
    }
    return s;
  };

  const niceMax = (x: number) => {
    if (!isFinite(x) || x <= 0) return 1;
    const exp = Math.floor(Math.log10(x));
    const magnitude = Math.pow(10, exp);
    const norm = x / magnitude;
    let niceNorm = 1;
    if (norm <= 1) niceNorm = 1;
    else if (norm <= 2) niceNorm = 2;
    else if (norm <= 5) niceNorm = 5;
    else niceNorm = 10;
    return niceNorm * magnitude;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-md p-3 shadow-sm">
          <p className="text-xs font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-gray-700 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-gray-700" />
              {entry.dataKey === 'amount' ? (
                <>Cheltuieli: ${Number(entry.value).toFixed(2)}</>
              ) : (
                <>Medie mobilă: ${Number(entry.value).toFixed(2)}</>
              )}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-gray-200 rounded-xl bg-white shadow-sm">
      <CardHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="font-semibold text-gray-900 text-lg flex items-center">
            <div className="w-2 h-2 bg-gray-900 rounded-full mr-3" />
            Statistici cheltuieli
            <TrendingUp className="w-5 h-5 ml-2 text-gray-700" />
          </CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">${stats.totalSpend.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Total cheltuit</div>
          </div>
        </div>
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
                stroke="#e5e7eb" 
                horizontal={true}
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                interval="preserveStartEnd"
                tickFormatter={formatXAxis}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                domain={[0, (dataMax: number) => niceMax(dataMax * 1.1)]}
                tickCount={5}
                tickFormatter={(value: number) => currencyFmt.format(Number(value) || 0)}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Amount Line (primary, near-black) */}
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#111827"
                strokeWidth={2.5}
                dot={{ 
                  fill: '#111827', 
                  stroke: '#111827',
                  strokeWidth: 1.5, 
                  r: 3.5
                }}
                activeDot={{ 
                  r: 6, 
                  fill: '#111827',
                  stroke: '#ffffff',
                  strokeWidth: 2
                }}
                animationDuration={2000}
                animationEasing="ease-in-out"
              />

              {/* Moving Average Line (secondary, lighter gray, dashed) */}
              <Line
                type="monotone"
                dataKey="avg"
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={true}
                animationDuration={2000}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center text-gray-700 text-xs">
            <span className="inline-block w-5 h-0.5 bg-gray-900 mr-2" /> Cheltuieli lunare ($)
          </div>
          <div className="flex items-center text-gray-600 text-xs">
            <span className="inline-block w-5 h-0.5 bg-gray-400 mr-2" style={{ borderTopStyle: 'dashed' }} /> Medie mobilă
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceChart;