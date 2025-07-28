import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'sonner';
import { 
  Settings, 
  BarChart3, 
  Activity, 
  Zap, 
  Clock, 
  Users, 
  Phone, 
  Bot, 
  FileText, 
  MessageSquare,
  Palette,
  Layout,
  Sparkles,
  Eye,
  EyeOff,
  RotateCcw,
  Save
} from 'lucide-react';

interface DashboardPreferences {
  enabled_widgets: string[];
  layout_style: 'grid' | 'list' | 'masonry';
  animation_speed: number;
  color_theme: string;
  widget_size: 'small' | 'medium' | 'large';
  auto_refresh: boolean;
  show_animations: boolean;
}

interface Widget {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'stats' | 'charts' | 'activity';
  color: string;
}

const AVAILABLE_WIDGETS: Widget[] = [
  {
    id: 'active-agents',
    name: 'Agenți Activi',
    description: 'Numărul de agenți AI creați și activi',
    icon: Bot,
    category: 'stats',
    color: 'purple'
  },
  {
    id: 'monthly-calls',
    name: 'Apeluri Luna Aceasta',
    description: 'Statistici pentru apelurile din luna curentă',
    icon: Phone,
    category: 'stats',
    color: 'blue'
  },
  {
    id: 'consumed-credits',
    name: 'Credite Consumate',
    description: 'Total credite utilizate pentru servicii',
    icon: Zap,
    category: 'stats',
    color: 'yellow'
  },
  {
    id: 'conversations',
    name: 'Conversații',
    description: 'Numărul total de conversații procesate',
    icon: MessageSquare,
    category: 'stats',
    color: 'green'
  },
  {
    id: 'transcripts',
    name: 'Transcripturi',
    description: 'Transcripturi salvate și procesate',
    icon: FileText,
    category: 'stats',
    color: 'orange'
  },
  {
    id: 'talk-time',
    name: 'Timp Vorbire',
    description: 'Durata totală a apelurilor',
    icon: Clock,
    category: 'stats',
    color: 'teal'
  },
  {
    id: 'elevenlabs-chart',
    name: 'Grafic ElevenLabs',
    description: 'Grafic cu utilizarea serviciilor ElevenLabs',
    icon: BarChart3,
    category: 'charts',
    color: 'indigo'
  },
  {
    id: 'performance-overview',
    name: 'Performanță Generală',
    description: 'Panoul cu metrici generale de performanță',
    icon: Activity,
    category: 'activity',
    color: 'pink'
  },
  {
    id: 'recent-activity',
    name: 'Activitate Recentă',
    description: 'Lista cu acțiunile recente ale utilizatorului',
    icon: Users,
    category: 'activity',
    color: 'cyan'
  }
];

const COLOR_THEMES = [
  { id: 'default', name: 'Default', colors: ['blue', 'purple', 'green'] },
  { id: 'ocean', name: 'Ocean', colors: ['blue', 'teal', 'cyan'] },
  { id: 'sunset', name: 'Sunset', colors: ['orange', 'red', 'pink'] },
  { id: 'forest', name: 'Forest', colors: ['green', 'emerald', 'lime'] },
  { id: 'galaxy', name: 'Galaxy', colors: ['purple', 'indigo', 'violet'] },
  { id: 'professional', name: 'Professional', colors: ['gray', 'slate', 'zinc'] }
];

interface DashboardCustomizerProps {
  onClose: () => void;
  onPreferencesChange: (preferences: DashboardPreferences) => void;
  currentPreferences: DashboardPreferences | null;
}

const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({
  onClose,
  onPreferencesChange,
  currentPreferences
}) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<DashboardPreferences>(
    currentPreferences || {
      enabled_widgets: ['active-agents', 'monthly-calls', 'consumed-credits', 'elevenlabs-chart', 'recent-activity'],
      layout_style: 'grid',
      animation_speed: 1,
      color_theme: 'default',
      widget_size: 'medium',
      auto_refresh: true,
      show_animations: true
    }
  );
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'widgets' | 'layout' | 'theme'>('widgets');

  const handleWidgetToggle = (widgetId: string) => {
    setPreferences(prev => ({
      ...prev,
      enabled_widgets: prev.enabled_widgets.includes(widgetId)
        ? prev.enabled_widgets.filter(id => id !== widgetId)
        : [...prev.enabled_widgets, widgetId]
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_dashboard_preferences')
        .upsert({
          user_id: user.id,
          preferences: preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      onPreferencesChange(preferences);
      toast.success('Preferințele au fost salvate cu succes!');
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Eroare la salvarea preferințelor');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultPrefs: DashboardPreferences = {
      enabled_widgets: ['active-agents', 'monthly-calls', 'consumed-credits', 'elevenlabs-chart', 'recent-activity'],
      layout_style: 'grid',
      animation_speed: 1,
      color_theme: 'default',
      widget_size: 'medium',
      auto_refresh: true,
      show_animations: true
    };
    setPreferences(defaultPrefs);
    toast.info('Preferințele au fost resetate la valorile implicite');
  };

  const getWidgetsByCategory = (category: string) => {
    return AVAILABLE_WIDGETS.filter(widget => widget.category === category);
  };

  const renderWidgetCard = (widget: Widget) => {
    const isEnabled = preferences.enabled_widgets.includes(widget.id);
    const IconComponent = widget.icon;

    return (
      <div
        key={widget.id}
        className={`relative p-4 border rounded-xl transition-all duration-300 cursor-pointer group ${
          isEnabled 
            ? 'border-primary bg-primary/5 shadow-sm' 
            : 'border-border bg-card hover:border-primary/50'
        }`}
        onClick={() => handleWidgetToggle(widget.id)}
      >
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${
            isEnabled ? `bg-${widget.color}-500 text-white` : `bg-${widget.color}-100 text-${widget.color}-600`
          } transition-all duration-300 group-hover:scale-110`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-foreground truncate">
                {widget.name}
              </h4>
              <div className="ml-2">
                {isEnabled ? (
                  <Eye className="w-4 h-4 text-primary" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {widget.description}
            </p>
          </div>
        </div>
        {isEnabled && (
          <div className="absolute top-2 right-2">
            <Badge variant="default" className="text-xs">
              Activ
            </Badge>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto liquid-glass animate-scale-in">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center">
            <Settings className="w-5 h-5 mr-2 text-primary" />
            Personalizează Dashboard-ul
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Anulează
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="w-3 h-3 mr-1" />
              {saving ? 'Se salvează...' : 'Salvează'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
          {[
            { id: 'widgets', label: 'Widgeturi', icon: Layout },
            { id: 'layout', label: 'Layout', icon: BarChart3 },
            { id: 'theme', label: 'Temă', icon: Palette }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Widgets Tab */}
        {activeTab === 'widgets' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Selectează widgeturile pentru dashboard
              </h3>
              <Badge variant="secondary" className="text-xs">
                {preferences.enabled_widgets.length} din {AVAILABLE_WIDGETS.length} active
              </Badge>
            </div>

            {/* Statistics Widgets */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-primary" />
                Statistici
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {getWidgetsByCategory('stats').map(renderWidgetCard)}
              </div>
            </div>

            {/* Charts Widgets */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-primary" />
                Grafice
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {getWidgetsByCategory('charts').map(renderWidgetCard)}
              </div>
            </div>

            {/* Activity Widgets */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2 text-primary" />
                Activitate
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {getWidgetsByCategory('activity').map(renderWidgetCard)}
              </div>
            </div>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground">
              Configurează layout-ul dashboard-ului
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Layout Style */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Stilul layout-ului
                </label>
                <Select
                  value={preferences.layout_style}
                  onValueChange={(value: 'grid' | 'list' | 'masonry') =>
                    setPreferences(prev => ({ ...prev, layout_style: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid (Rețea)</SelectItem>
                    <SelectItem value="list">Listă</SelectItem>
                    <SelectItem value="masonry">Masonry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Widget Size */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Dimensiunea widgeturilor
                </label>
                <Select
                  value={preferences.widget_size}
                  onValueChange={(value: 'small' | 'medium' | 'large') =>
                    setPreferences(prev => ({ ...prev, widget_size: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Mică</SelectItem>
                    <SelectItem value="medium">Medie</SelectItem>
                    <SelectItem value="large">Mare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Animation Speed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Viteza animațiilor
                </label>
                <Badge variant="outline" className="text-xs">
                  {preferences.animation_speed}x
                </Badge>
              </div>
              <Slider
                value={[preferences.animation_speed]}
                onValueChange={([value]) =>
                  setPreferences(prev => ({ ...prev, animation_speed: value }))
                }
                max={3}
                min={0.5}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Lent (0.5x)</span>
                <span>Normal (1x)</span>
                <span>Rapid (3x)</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Afișează animații
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Activează/dezactivează animațiile pentru widgeturi
                  </p>
                </div>
                <Switch
                  checked={preferences.show_animations}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, show_animations: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Actualizare automatică
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Actualizează automat datele la fiecare 30 de secunde
                  </p>
                </div>
                <Switch
                  checked={preferences.auto_refresh}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, auto_refresh: checked }))
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === 'theme' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground">
              Personalizează tema vizuală
            </h3>

            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">
                Schemă de culori
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COLOR_THEMES.map(theme => (
                  <div
                    key={theme.id}
                    onClick={() =>
                      setPreferences(prev => ({ ...prev, color_theme: theme.id }))
                    }
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 ${
                      preferences.color_theme === theme.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex space-x-1">
                        {theme.colors.map(color => (
                          <div
                            key={color}
                            className={`w-3 h-3 rounded-full bg-${color}-500`}
                          />
                        ))}
                      </div>
                      {preferences.color_theme === theme.id && (
                        <Sparkles className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <h4 className="font-medium text-sm text-foreground">
                      {theme.name}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCustomizer;