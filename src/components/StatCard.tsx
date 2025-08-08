
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  isLoading?: boolean;
  delay?: number;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  isLoading = false,
  delay = 0,
  className = ""
}) => {
  return (
    <div 
      className={`group relative overflow-hidden p-6 border border-white/20 rounded-xl bg-white/10 backdrop-blur-md hover:border-white/30 transition-all duration-500 hover:shadow-lg transform hover:scale-105 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Loading shimmer effect */}
      {isLoading && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite]" />
      )}
      
      <div className="relative flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-xs text-white/70 font-medium tracking-wide uppercase animate-fade-in">
            {label}
          </p>
          <div className="flex items-baseline space-x-1">
            {isLoading ? (
              <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-white animate-[countUp_1s_ease-out]">
                {value}
              </p>
            )}
          </div>
        </div>
        
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
            {isLoading ? (
              <div className="w-6 h-6 bg-white/30 rounded animate-pulse" />
            ) : (
              <Icon className="w-6 h-6 text-white group-hover:text-white transition-colors duration-300" />
            )}
          </div>
          
          {/* Animated ring */}
          <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover:opacity-100 animate-[ping_1s_ease-out_infinite] group-hover:animate-[pulse_2s_ease-in-out_infinite]" />
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-white to-white/60 w-0 group-hover:w-full transition-all duration-500" />
    </div>
  );
};

export default StatCard;
