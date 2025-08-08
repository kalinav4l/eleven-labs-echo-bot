import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Bot, Phone, MessageSquare } from 'lucide-react';

interface ActivityItem {
  action: string;
  time: string;
  icon: React.ElementType;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  const getIconColor = (IconComponent: React.ElementType) => {
    if (IconComponent === Bot) return 'text-blue-500 bg-blue-100';
    if (IconComponent === Phone) return 'text-green-500 bg-green-100';
    if (IconComponent === MessageSquare) return 'text-purple-500 bg-purple-100';
    return 'text-gray-500 bg-gray-100';
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activitate Recentă
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <div className={`p-2 rounded-lg ${getIconColor(activity.icon)} transition-transform group-hover:scale-110`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                Nu există activitate recentă
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;