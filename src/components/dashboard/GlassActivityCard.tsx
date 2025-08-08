import React from 'react';
import { Activity, Bot, Phone, MessageSquare, Clock } from 'lucide-react';

interface ActivityItem {
  action: string;
  time: string;
  icon: React.ElementType;
}

interface GlassActivityProps {
  activities: ActivityItem[];
}

const GlassActivityCard = ({ activities }: GlassActivityProps) => {
  const getIconGradient = (IconComponent: React.ElementType) => {
    if (IconComponent === Bot) return 'from-blue-500 to-cyan-500';
    if (IconComponent === Phone) return 'from-emerald-500 to-teal-500';
    if (IconComponent === MessageSquare) return 'from-purple-500 to-pink-500';
    return 'from-gray-500 to-gray-600';
  };

  return (
    <div className="relative group animate-fade-in">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg" />
      
      {/* Content */}
      <div className="relative p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Activitate Recentă</h3>
        </div>
        
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/10 hover:bg-white/30 transition-all duration-300 group/item"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${getIconGradient(activity.icon)} shadow-md group-hover/item:scale-110 transition-transform duration-300`}>
                  <activity.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover/item:text-primary transition-colors">
                    {activity.action}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-foreground/40" />
                    <p className="text-xs text-foreground/60">
                      {activity.time}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-muted/30 to-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nu există activitate recentă
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlassActivityCard;