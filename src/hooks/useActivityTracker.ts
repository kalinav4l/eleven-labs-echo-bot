import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

interface TrackOptions {
  metadata?: Record<string, any>;
  action?: string;
  description?: string;
}

export const useActivityTracker = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Track page views on route changes
  useEffect(() => {
    if (!user) return;

    const insertPageView = async () => {
      try {
        await supabase.from('user_activity_events').insert({
          user_id: user.id,
          event_type: 'page_view',
          page_path: location.pathname + location.search,
          description: document.title,
          metadata: {
            referrer: document.referrer || null,
          },
          user_agent: navigator.userAgent,
        });
      } catch (e) {
        console.warn('Failed to log page_view', e);
      }
    };

    insertPageView();
  }, [location.pathname, location.search, user]);

  // Optional: auto-track clicks on elements with data-activity
  useEffect(() => {
    if (!user) return;

    const handler = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest('[data-activity]') as HTMLElement | null;
      if (!el) return;
      const action = el.getAttribute('data-activity') || 'ui_click';
      const label = el.getAttribute('aria-label') || el.textContent?.trim()?.slice(0, 80) || undefined;

      (async () => {
        try {
          await supabase.from('user_activity_events').insert({
            user_id: user.id,
            event_type: 'ui_click',
            action,
            page_path: location.pathname,
            description: label,
            user_agent: navigator.userAgent,
          });
        } catch (_) {
          // ignore
        }
      })();
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [user, location.pathname]);

  // Manual tracker
  const trackEvent = useCallback(async (
    eventType: string,
    opts: TrackOptions = {}
  ) => {
    if (!user) return;
    try {
      await supabase.from('user_activity_events').insert({
        user_id: user.id,
        event_type: eventType,
        action: opts.action,
        description: opts.description,
        metadata: opts.metadata ?? null,
        page_path: window.location.pathname,
        user_agent: navigator.userAgent,
      });
    } catch (e) {
      console.warn('Failed to log activity', e);
    }
  }, [user]);

  return { trackEvent };
};
