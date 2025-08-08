import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CircularProgressChartProps {
  title: string;
  percentage: number;
  value: string;
  subtitle: string;
  color: string;
  icon: React.ElementType;
}

const CircularProgressChart = ({ 
  title, 
  percentage, 
  value, 
  subtitle, 
  color, 
  icon: Icon 
}: CircularProgressChartProps) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="group relative border-0 shadow-lg hover:shadow-xl transition-all duration-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg 
              className="w-32 h-32 transform -rotate-90" 
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                fill="transparent"
                className="opacity-20"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={color}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 8px ${color}30)`
                }}
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-foreground">
                {value}
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {subtitle}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-sm text-muted-foreground">
            {percentage.toFixed(1)}% completare
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CircularProgressChart;