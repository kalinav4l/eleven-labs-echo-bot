import React from 'react';
import { TrendingUp, Bot } from 'lucide-react';

interface GlassMetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  percentage: number;
  icon: React.ElementType;
  gradient: string;
}

const GlassMetricCard = ({ 
  title, 
  value, 
  subtitle, 
  percentage, 
  icon: Icon, 
  gradient 
}: GlassMetricCardProps) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative group animate-fade-in">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg" />
      
      {/* Content */}
      <div className="relative p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg 
              className="w-32 h-32 transform -rotate-90" 
              viewBox="0 0 120 120"
            >
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                fill="transparent"
                className="opacity-20"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className="stop-primary" />
                  <stop offset="100%" className="stop-secondary" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-foreground">
                {value}
              </div>
              <div className="text-xs text-foreground/60 text-center mt-1">
                {subtitle}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <div className="text-sm text-foreground/70">
            {percentage.toFixed(1)}% progres
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassMetricCard;