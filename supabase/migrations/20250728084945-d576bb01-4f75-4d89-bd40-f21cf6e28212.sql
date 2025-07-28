-- Add columns for tracking callback analysis
ALTER TABLE public.call_history 
ADD COLUMN callback_analyzed BOOLEAN DEFAULT FALSE,
ADD COLUMN last_status_check TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient querying of unanalyzed initiated conversations
CREATE INDEX idx_call_history_callback_analysis 
ON public.call_history (call_status, callback_analyzed, created_at) 
WHERE call_status = 'initiated' AND callback_analyzed = FALSE;

-- Create a function to schedule the cron job for analyzing initiated conversations
SELECT cron.schedule(
  'analyze-initiated-conversations',
  '*/5 * * * *', -- every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://pwfczzxwjfxomqzhhwvj.supabase.co/functions/v1/analyze-initiated-conversations',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZmN6enh3amZ4b21xemhod3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NDI5NDYsImV4cCI6MjA2NDAxODk0Nn0.IgOvpvhe3fW4OnRLN39eVfP5E1hq4lHat0lZH_1jQfs"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);