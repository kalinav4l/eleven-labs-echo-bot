-- 1) Table for user activity events
CREATE TABLE IF NOT EXISTS public.user_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text,
  event_type text NOT NULL,
  page_path text,
  action text,
  description text,
  metadata jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_activity_events ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can insert their own activity events" ON public.user_activity_events;
CREATE POLICY "Users can insert their own activity events"
ON public.user_activity_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own activity events" ON public.user_activity_events;
CREATE POLICY "Users can view their own activity events"
ON public.user_activity_events
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all activity events" ON public.user_activity_events;
CREATE POLICY "Admins can view all activity events"
ON public.user_activity_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_events_user_time ON public.user_activity_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_events_created_at ON public.user_activity_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_events_event_type ON public.user_activity_events (event_type);

-- Realtime configuration
ALTER TABLE public.user_activity_events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activity_events;

-- Function: top active users in last N hours
CREATE OR REPLACE FUNCTION public.admin_get_top_active_users(period_hours integer DEFAULT 24, limit_count integer DEFAULT 10)
RETURNS TABLE (user_id uuid, event_count bigint, last_event_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT user_id, COUNT(*) AS event_count, MAX(created_at) AS last_event_at
  FROM public.user_activity_events
  WHERE created_at >= now() - make_interval(hours => period_hours)
  GROUP BY user_id
  ORDER BY event_count DESC, last_event_at DESC
  LIMIT limit_count;
$$;

-- Function: get activity for a specific user for last N hours
CREATE OR REPLACE FUNCTION public.admin_get_user_activity(_user_id uuid, since_hours integer DEFAULT 24, limit_count integer DEFAULT 200)
RETURNS SETOF public.user_activity_events
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT *
  FROM public.user_activity_events
  WHERE user_id = _user_id
    AND created_at >= now() - make_interval(hours => since_hours)
  ORDER BY created_at DESC
  LIMIT limit_count;
$$;