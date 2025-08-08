import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Phone, CreditCard, MessageSquare, FileText, Clock, TrendingUp, Activity } from 'lucide-react';

interface StatsGridProps {
  totalAgents: number;
  totalCalls: number;
  currentBalance: number;
  totalConversations: number;
  totalCost: number;
  totalTimeFormatted: string;
}

const ModernGlassStatsGrid = ({ 
  totalAgents, 
  totalCalls, 
  currentBalance, 
  totalConversations, 
  totalCost, 
  totalTimeFormatted 
}: StatsGridProps) => {
  const stats = [
    {
      label: 'Agenți Activi',
      value: totalAgents,
      icon: Bot,
      gradient: 'from-blue-400/20 to-cyan-400/20',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      border: 'border-blue-500/20',
    },
    {
      label: 'Apeluri',
      value: totalCalls,
      icon: Phone,
      gradient: 'from-emerald-400/20 to-teal-400/20',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
      border: 'border-emerald-500/20',
    },
    {
      label: 'Sold Curent',
      value: `$${currentBalance.toFixed(2)}`,
      icon: CreditCard,
      gradient: 'from-purple-400/20 to-pink-400/20',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      border: 'border-purple-500/20',
    },
    {
      label: 'Conversații',
      value: totalConversations,
      icon: MessageSquare,
      gradient: 'from-amber-400/20 to-orange-400/20',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
      border: 'border-amber-500/20',
    },
    {
      label: 'Cost Total',
      value: `$${totalCost.toFixed(2)}`,
      icon: FileText,
      gradient: 'from-indigo-400/20 to-blue-400/20',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-500',
      border: 'border-indigo-500/20',
    },
    {
      label: 'Timp Vorbire',
      value: totalTimeFormatted,
      icon: Clock,
      gradient: 'from-rose-400/20 to-red-400/20',
      iconBg: 'bg-gradient-to-br from-rose-500 to-red-500',
      border: 'border-rose-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="group relative animate-fade-in hover-scale"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg" />
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          
          <div className="relative p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider">
                  {stat.label}
                </p>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
              </div>
              
              <div className={`p-3 rounded-xl ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Animated progress bar */}
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${stat.iconBg} rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out`}
                style={{ animationDelay: `${index * 200}ms` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModernGlassStatsGrid;