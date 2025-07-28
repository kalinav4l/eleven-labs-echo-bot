import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';

export interface DashboardPreferences {
  enabled_widgets: string[];
  layout_style: 'grid' | 'list' | 'masonry';
  animation_speed: number;
  color_theme: string;
  widget_size: 'small' | 'medium' | 'large';
  auto_refresh: boolean;
  show_animations: boolean;
}

const defaultPreferences: DashboardPreferences = {
  enabled_widgets: ['active-agents', 'monthly-calls', 'consumed-credits', 'elevenlabs-chart', 'recent-activity'],
  layout_style: 'grid',
  animation_speed: 1,
  color_theme: 'default',
  widget_size: 'medium',
  auto_refresh: true,
  show_animations: true
};

export const useDashboardPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<DashboardPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPreferences();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem(`dashboard_preferences_${user?.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = (newPreferences: DashboardPreferences) => {
    setPreferences(newPreferences);
    if (user) {
      try {
        localStorage.setItem(`dashboard_preferences_${user.id}`, JSON.stringify(newPreferences));
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    }
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    if (user) {
      try {
        localStorage.removeItem(`dashboard_preferences_${user.id}`);
      } catch (error) {
        console.error('Error resetting preferences:', error);
      }
    }
  };

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    loading
  };
};