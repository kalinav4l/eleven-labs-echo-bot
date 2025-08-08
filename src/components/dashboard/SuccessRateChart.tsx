import React from 'react';
import { TrendingUp } from 'lucide-react';

interface SuccessRateChartProps {
  successfulCalls: number;
  totalCalls: number;
}

const SuccessRateChart = ({ successfulCalls, totalCalls }: SuccessRateChartProps) => {
  const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0;
  const failedCalls = totalCalls - successfulCalls;
  const pendingCalls = Math.max(0, totalCalls * 0.1); // 10% pending calls simulation
  
  // Calculate angles for each segment
  const successAngle = (successfulCalls / totalCalls) * 360;
  const failAngle = (failedCalls / totalCalls) * 360;
  const pendingAngle = (pendingCalls / totalCalls) * 360;
  
  const radius = 50;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Calculate stroke dash arrays for each segment
  const successLength = (successAngle / 360) * circumference;
  const failLength = (failAngle / 360) * circumference;
  const pendingLength = (pendingAngle / 360) * circumference;
  
  return (
    <div className="relative group animate-fade-in">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg" />
      
      {/* Content */}
      <div className="relative p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Rata de Succes</h3>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            {/* Donut Chart */}
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r={normalizedRadius}
                fill="transparent"
                stroke="hsl(var(--muted))"
                strokeWidth={strokeWidth}
                opacity="0.1"
              />
              
              {/* Success segment (Purple) */}
              <circle
                cx="60"
                cy="60"
                r={normalizedRadius}
                fill="transparent"
                stroke="#8B5CF6"
                strokeWidth={strokeWidth}
                strokeDasharray={`${successLength} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 8px #8B5CF630)'
                }}
              />
              
              {/* Failed segment (Pink/Red) */}
              <circle
                cx="60"
                cy="60"
                r={normalizedRadius}
                fill="transparent"
                stroke="#EF4444"
                strokeWidth={strokeWidth}
                strokeDasharray={`${failLength} ${circumference}`}
                strokeDashoffset={-successLength}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 8px #EF444430)',
                  animationDelay: '0.3s'
                }}
              />
              
              {/* Pending segment (Orange) */}
              <circle
                cx="60"
                cy="60"
                r={normalizedRadius}
                fill="transparent"
                stroke="#F59E0B"
                strokeWidth={strokeWidth}
                strokeDasharray={`${pendingLength} ${circumference}`}
                strokeDashoffset={-(successLength + failLength)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 8px #F59E0B30)',
                  animationDelay: '0.6s'
                }}
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-foreground">
                {successfulCalls}
              </div>
              <div className="text-sm text-foreground/60">
                Apeluri
              </div>
              <div className="text-lg font-semibold text-emerald-600 mt-1">
                ({successRate}%)
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs text-foreground/70">Reușite</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-foreground/70">Eșuate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs text-foreground/70">În așteptare</span>
          </div>
        </div>
        
        {/* Progress indicators */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground/60">Apeluri Reușite</span>
            <span className="font-medium text-foreground">{successfulCalls}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground/60">Total Apeluri</span>
            <span className="font-medium text-foreground">{totalCalls}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground/60">Rata de Succes</span>
            <span className="font-medium text-emerald-600">{successRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessRateChart;