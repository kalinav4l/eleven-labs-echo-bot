import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Phone, 
  BarChart3, 
  Activity, 
  Zap, 
  Clock, 
  Users, 
  FileText, 
  MessageSquare,
  Settings,
  Grid3X3,
  List,
  Maximize2,
  LucideIcon
} from 'lucide-react';
import { DashboardPreferences } from '@/hooks/useDashboardPreferences';
import StatCard from '@/components/StatCard';
import ElevenLabsChart from '@/components/ElevenLabsChart';
import AnimatedCounter from '@/components/AnimatedCounter';

interface CustomizableDashboardProps {
  preferences: DashboardPreferences;
  onOpenCustomizer: () => void;
  // Data props - you can customize these based on your needs
  totalAgents: number;
  totalCalls: number;
  totalConsumedCredits: number;
  totalConversations: number;
  totalTranscripts: number;
  totalTimeFormatted: string;
  recentActivity: Array<{
    action: string;
    time: string;
    icon: LucideIcon;
  }>;
  quickStats: Array<{
    label: string;
    value: string;
    icon: LucideIcon;
    color: string;
  }>;
}

const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({
  preferences,
  onOpenCustomizer,
  totalAgents,
  totalCalls,
  totalConsumedCredits,
  totalConversations,
  totalTranscripts,
  totalTimeFormatted,
  recentActivity,
  quickStats
}) => {
  const getLayoutClass = () => {
    switch (preferences.layout_style) {
      case 'list':
        return 'grid grid-cols-1 gap-4';
      case 'masonry':
        return 'columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  const getSizeClass = () => {
    switch (preferences.widget_size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const getAnimationDuration = () => {
    return `${1 / preferences.animation_speed}s`;
  };

  const shouldShowWidget = (widgetId: string) => {
    return preferences.enabled_widgets.includes(widgetId);
  };

  const renderWidget = (id: string, content: React.ReactNode, className?: string) => {
    if (!shouldShowWidget(id)) return null;

    const animationStyle = preferences.show_animations ? {
      animationDuration: getAnimationDuration(),
    } : {};

    return (
      <div 
        key={id}
        className={`${className || ''} ${preferences.show_animations ? 'animate-fade-in hover-scale' : ''} ${getSizeClass()}`}
        style={animationStyle}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Customization Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Dashboard Personalizat</h2>
          <p className="text-muted-foreground">
            Layout: {preferences.layout_style} • 
            Animații: {preferences.show_animations ? 'Activate' : 'Dezactivate'} • 
            Viteza: {preferences.animation_speed}x
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {preferences.enabled_widgets.length} widgeturi active
          </Badge>
          <Button
            onClick={onOpenCustomizer}
            variant="outline"
            size="sm"
            className="hover:scale-105 transition-transform duration-200"
          >
            <Settings className="w-4 h-4 mr-2" />
            Personalizează
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className={getLayoutClass()}>
        {quickStats.map((stat, index) => 
          renderWidget(
            `stat-${index}`,
            <StatCard 
              label={stat.label} 
              value={stat.value} 
              icon={stat.icon} 
              delay={preferences.show_animations ? index * 100 : 0}
              className="transition-all duration-300 hover:shadow-lg"
            />,
            preferences.layout_style === 'masonry' ? 'break-inside-avoid' : ''
          )
        )}
      </div>

      {/* Main Widgets */}
      <div className={`${preferences.layout_style === 'list' ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'}`}>
        {/* Performance Overview Widget */}
        {renderWidget(
          'performance-overview',
          <Card className="liquid-glass hover:shadow-lg transition-all duration-300">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                Performanță Generală
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-white rounded-xl border border-blue-100/50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Credite Consumate</p>
                    <p className="text-xs text-muted-foreground">Total utilizate</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">
                    <AnimatedCounter target={totalConsumedCredits} />
                  </p>
                  <p className="text-xs text-muted-foreground">credite</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-white rounded-xl border border-green-100/50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Timp Total Vorbire</p>
                    <p className="text-xs text-muted-foreground">Toate apelurile</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">{totalTimeFormatted}</p>
                  <p className="text-xs text-muted-foreground">minute</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/50 to-white rounded-xl border border-purple-100/50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Agenți Activi</p>
                    <p className="text-xs text-muted-foreground">În utilizare</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">
                    <AnimatedCounter target={totalAgents} />
                  </p>
                  <p className="text-xs text-muted-foreground">agenți</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity Widget */}
        {renderWidget(
          'recent-activity',
          <Card className="liquid-glass hover:shadow-lg transition-all duration-300">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Activitate Recentă
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const IconComponent = activity.icon;
                    return (
                      <div 
                        key={index} 
                        className="flex items-center space-x-4 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors duration-200"
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {activity.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nu există activitate recentă</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ElevenLabs Chart Widget */}
      {renderWidget(
        'elevenlabs-chart',
        <div className="col-span-full">
          <ElevenLabsChart />
        </div>
      )}
    </div>
  );
};

export default CustomizableDashboard;