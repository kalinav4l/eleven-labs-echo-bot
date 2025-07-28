import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';
import { useElevenLabsStats } from '@/hooks/useElevenLabsStats';
import LoadingSpinner from './LoadingSpinner';

const ElevenLabsChart: React.FC = () => {
  const { data: statsData, isLoading, error } = useElevenLabsStats();

  if (isLoading) {
    return (
      <div className="liquid-glass card-3d group overflow-hidden relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl shadow-3d">
        {/* 3D Loading Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-morphing"></div>
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-xl animate-float"></div>
        
        <div className="p-6 border-b border-white/20 relative z-10">
          <h2 className="font-bold text-xl bg-gradient-to-r from-slate-900 via-primary to-secondary bg-clip-text text-transparent flex items-center">
            <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full mr-3 animate-glow-pulse shadow-lg"></div>
            Statistici Apeluri
            <TrendingUp className="w-6 h-6 ml-2 text-primary/70 animate-float" style={{ animationDelay: '1s' }} />
          </h2>
        </div>
        <div className="p-8 flex justify-center items-center h-80 relative z-10">
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-slate-600 font-medium">Se încarcă datele graficului...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !statsData) {
    return (
      <div className="liquid-glass card-3d group overflow-hidden relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl shadow-3d">
        <div className="absolute inset-0 bg-gradient-to-br from-red/5 via-transparent to-orange/5"></div>
        
        <div className="p-6 border-b border-white/20 relative z-10">
          <h2 className="font-bold text-xl bg-gradient-to-r from-slate-900 via-primary to-secondary bg-clip-text text-transparent flex items-center">
            <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full mr-3 animate-pulse"></div>
            Statistici Apeluri
            <BarChart3 className="w-6 h-6 ml-2 text-primary/70" />
          </h2>
        </div>
        <div className="p-8 flex justify-center items-center h-80 relative z-10">
          <div className="text-center">
            <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50" />
            <p className="text-slate-500 font-medium">Nu s-au putut încărca statisticile</p>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="liquid-glass bg-white/95 backdrop-blur-xl border border-white/30 rounded-xl p-4 shadow-3d animate-scale-in">
          <p className="text-sm font-bold bg-gradient-to-r from-slate-900 to-primary bg-clip-text text-transparent mb-3">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-3 mb-2">
              <div 
                className="w-3 h-3 rounded-full shadow-sm animate-glow-pulse" 
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-sm font-medium text-slate-700">
                {entry.name === 'calls' && `Apeluri: ${entry.value}`}
                {entry.name === 'credits' && `Credite: ${entry.value}`}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="liquid-glass card-3d group overflow-hidden relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl shadow-3d hover:shadow-glow transition-all duration-700 animate-scale-in">
      {/* 3D Animated Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-morphing"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/15 to-transparent rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }}></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/15 to-transparent rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      {/* Enhanced Header */}
      <div className="p-6 border-b border-white/20 relative z-10">
        <h2 className="font-bold text-xl bg-gradient-to-r from-slate-900 via-primary to-secondary bg-clip-text text-transparent flex items-center group-hover:scale-105 transition-transform duration-500">
          <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full mr-3 animate-glow-pulse shadow-lg"></div>
          Statistici Apeluri
          <TrendingUp className="w-6 h-6 ml-3 text-primary/70 group-hover:text-primary group-hover:scale-110 transition-all duration-500 animate-float" style={{ animationDelay: '2s' }} />
        </h2>
      </div>
      
      {/* 3D Chart Container */}
      <div className="p-6 relative z-10">
        <div className="h-80 w-full relative">
          {/* 3D Chart Shadow */}
          <div className="absolute inset-2 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl blur-sm transform translate-y-2 translate-x-2 opacity-30"></div>
          
          {/* Main Chart */}
          <div className="relative bg-gradient-to-br from-white/50 to-white/30 rounded-xl p-4 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-colors duration-500">
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
                  stroke="hsl(var(--primary) / 0.1)" 
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--slate-600))' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--slate-600))' }}
                  domain={[0, 'dataMax + 10']}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Enhanced Apeluri Line with 3D Effect */}
                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  filter="drop-shadow(0 4px 8px hsl(var(--primary) / 0.3))"
                  dot={{ 
                    fill: 'hsl(var(--primary))', 
                    strokeWidth: 3, 
                    r: 6,
                    filter: 'drop-shadow(0 2px 4px hsl(var(--primary) / 0.4))',
                  }}
                  activeDot={{ 
                    r: 8, 
                    fill: 'hsl(var(--primary))',
                    stroke: '#ffffff',
                    strokeWidth: 3,
                    filter: 'drop-shadow(0 4px 12px hsl(var(--primary) / 0.6))',
                  }}
                  animationDuration={3000}
                  animationEasing="ease-in-out"
                />
                
                {/* Enhanced Credite Line with 3D Effect */}
                <Line
                  type="monotone"
                  dataKey="credits"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={4}
                  strokeDasharray="8 8"
                  filter="drop-shadow(0 4px 8px hsl(var(--secondary) / 0.3))"
                  dot={{ 
                    fill: 'hsl(var(--secondary))', 
                    strokeWidth: 3, 
                    r: 5,
                    filter: 'drop-shadow(0 2px 4px hsl(var(--secondary) / 0.4))',
                  }}
                  activeDot={{ 
                    r: 7, 
                    fill: 'hsl(var(--secondary))',
                    stroke: '#ffffff',
                    strokeWidth: 3,
                    filter: 'drop-shadow(0 4px 12px hsl(var(--secondary) / 0.6))',
                  }}
                  animationDuration={3500}
                  animationEasing="ease-in-out"
                  animationBegin={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Enhanced 3D Legend */}
        <div className="flex items-center justify-center space-x-8 mt-6 pt-4 border-t border-white/20">
          <div className="flex items-center group cursor-pointer">
            <div className="w-6 h-1 bg-gradient-to-r from-primary to-primary/80 mr-3 rounded-full shadow-sm group-hover:shadow-glow transition-all duration-300 group-hover:scale-110"></div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors duration-300">Apeluri</span>
          </div>
          <div className="flex items-center group cursor-pointer">
            <div className="w-6 h-1 bg-gradient-to-r from-secondary to-secondary/80 mr-3 rounded-full shadow-sm group-hover:shadow-glow transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundImage: 'repeating-linear-gradient(to right, hsl(var(--secondary)) 0, hsl(var(--secondary)) 4px, transparent 4px, transparent 12px)' 
            }}></div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-secondary transition-colors duration-300">Credite</span>
          </div>
        </div>
      </div>
      
      {/* Hover Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-out pointer-events-none"></div>
    </div>
  );
};

export default ElevenLabsChart;