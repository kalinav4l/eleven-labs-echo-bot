import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Phone, CreditCard, MessageSquare, FileText, Clock } from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';

interface StatsGridProps {
  totalAgents: number;
  totalCalls: number;
  currentBalance: number;
  totalConversations: number;
  totalCost: number;
  totalTimeFormatted: string;
}

const ModernStatsGrid = ({ 
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
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Apeluri',
      value: totalCalls,
      icon: Phone,
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Sold Curent',
      value: `$${currentBalance.toFixed(2)}`,
      icon: CreditCard,
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Conversații',
      value: totalConversations,
      icon: MessageSquare,
      gradient: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Cost Total',
      value: `$${totalCost.toFixed(2)}`,
      icon: FileText,
      gradient: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Timp Vorbire',
      value: totalTimeFormatted,
      icon: Clock,
      gradient: 'from-teal-500 to-green-500',
      bgColor: 'bg-teal-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={index}
          className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
          style={{ 
            animationDelay: `${index * 100}ms`,
            background: `linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)`
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </p>
                <div className="text-2xl font-bold text-foreground">
                  {typeof stat.value === 'number' ? (
                    <AnimatedCounter target={stat.value} />
                  ) : (
                    stat.value
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Decorative gradient overlay */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full -mr-16 -mt-16 group-hover:opacity-10 transition-opacity duration-500`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ModernStatsGrid;